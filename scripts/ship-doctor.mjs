#!/usr/bin/env node
// Ship-it doctor — vérifie l'environnement (Windows / macOS / Linux) et donne la commande exacte pour corriger.
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22) {
  console.error(`✗ Node ${process.versions.node} — ship-it demande Node 22+.`);
  console.error(process.platform === 'win32' ? '  → winget install OpenJS.NodeJS.LTS' : '  → https://nodejs.org (ou nvm install 22)');
  process.exit(1);
}

const { existsSync, readFileSync } = await import('node:fs');
const { availableProviders } = await import('./ship-agent.mjs');
const { DEFAULTS, config } = await import('./ship-config.mjs');
const { IS_WIN, banner, c, childEnv, envValue, gitTry, ghTry, hasScript, run } = await import('./ship-utils.mjs');

const top = gitTry('rev-parse', '--show-toplevel');
if (top.ok) process.chdir(top.out);

const OS = IS_WIN ? 'win' : process.platform === 'darwin' ? 'mac' : 'linux';
const pick = (fixes) => fixes[OS] ?? fixes.all;
const results = { ok: 0, warn: 0, fail: 0 };

const report = (level, label, detail = '', fix = '') => {
  results[level]++;
  const icon = { ok: c.green('✓'), warn: c.yellow('⚠'), fail: c.red('✗') }[level];
  console.log(`  ${icon} ${label}${detail ? c.dim(` — ${detail}`) : ''}`);
  if (fix && level !== 'ok') console.log(`      → ${c.cyan(fix)}`);
};
const section = (title) => console.log(`\n${c.bold(title)}`);
const version = (s) => (s.match(/(\d+)\.(\d+)/) ?? []).slice(1).map(Number);

banner('doctor');

section('Outils');
report('ok', `Node ${process.versions.node}`, `${major}.${minor} ≥ 22`);

const gitV = gitTry('--version');
if (!gitV.ok) {
  report('fail', 'git', 'introuvable', pick({ win: 'winget install Git.Git', mac: 'xcode-select --install', linux: 'sudo apt install git' }));
} else {
  const [gMaj, gMin] = version(gitV.out);
  if (gMaj > 2 || (gMaj === 2 && gMin >= 30)) report('ok', gitV.out);
  else report('fail', gitV.out, 'git 2.30+ requis', pick({ win: 'winget upgrade Git.Git', mac: 'brew install git', linux: 'sudo apt install git' }));
}

const ghV = ghTry('--version');
if (!ghV.ok) {
  report('fail', 'GitHub CLI (gh)', 'introuvable', pick({ win: 'winget install GitHub.cli (puis rouvre le terminal)', mac: 'brew install gh', linux: 'https://github.com/cli/cli#installation' }));
} else {
  report('ok', ghV.out.split('\n')[0]);
  if (!ghTry('auth', 'status').ok) report('fail', 'gh authentifié', 'non connecté', 'gh auth login');
  else report('ok', 'gh authentifié', ghTry('api', 'user', '--jq', '.login').out);
}

const pkgManager = JSON.parse(readFileSync('package.json', 'utf8')).packageManager ?? '';
const wantedYarn = pkgManager.match(/^yarn@([\d.]+)/)?.[1];
if (wantedYarn) {
  const y = run('yarn --version', [], { shell: true, allowFail: true, env: childEnv() });
  if (!y.ok) report('fail', 'yarn', 'introuvable', IS_WIN ? 'corepack enable (dans un terminal administrateur)' : 'corepack enable');
  else if (y.out !== wantedYarn) report('warn', `yarn ${y.out}`, `le projet attend ${wantedYarn}`, 'corepack enable');
  else report('ok', `yarn ${y.out}`);
}

section('Git');
const name = gitTry('config', 'user.name').out;
const email = gitTry('config', 'user.email').out;
if (name && email) report('ok', 'identité', `${name} <${email}>`);
else report('fail', 'identité git', 'user.name / user.email manquant', 'git config --global user.name "Prénom Nom" && git config --global user.email "toi@exemple.com"');

// gh comme credential helper : une seule authentification (gh auth login) pour git ET GitHub.
const helpers = gitTry('config', '--get-all', 'credential.https://github.com.helper').out;
if (helpers.includes('gh auth git-credential')) report('ok', 'git utilise le token de gh');
else report('warn', 'git n\'utilise pas le token de gh', 'push/fetch peuvent redemander un mot de passe', 'gh auth setup-git');

const remote = gitTry('ls-remote', '--heads', 'origin');
if (remote.ok) report('ok', 'accès à origin');
else if (/could not read Username|Authentication failed|terminal prompts disabled/i.test(remote.err)) {
  report('fail', 'accès à origin', 'identifiants git manquants', 'gh auth setup-git');
} else report('fail', 'accès à origin', remote.err.split('\n')[0] || 'injoignable', 'vérifie ta connexion et l\'URL : git remote -v');

if (IS_WIN) {
  if (gitTry('config', 'core.longpaths').out === 'true') report('ok', 'core.longpaths');
  else report('warn', 'core.longpaths', 'chemins > 260 caractères refusés (node_modules, .yarn)', 'git config --global core.longpaths true');
  const crlf = gitTry('config', 'core.autocrlf').out || '(non défini)';
  if (existsSync('.gitattributes') || crlf === 'true') report('ok', 'fins de ligne', `core.autocrlf = ${crlf}`);
  else report('warn', 'fins de ligne', `core.autocrlf = ${crlf}, pas de .gitattributes : risque de diffs « fichier entier »`, 'git config --global core.autocrlf true');
}

section('Projet');
if (existsSync('.pnp.cjs') || existsSync('node_modules')) report('ok', 'dépendances installées');
else report('fail', 'dépendances', 'non installées', 'yarn install');

let cfg = null;
try {
  cfg = config();
  report('ok', existsSync('ship.config.json') ? 'ship.config.json valide' : 'ship.config.json absent — valeurs par défaut');
} catch (e) {
  report('fail', 'ship.config.json', e.message.replace(/^ship\.config\.json : /, ''), 'corrige le fichier (VS Code l\'autocomplète via son $schema)');
}
const gates = (cfg?.gates ?? DEFAULTS.gates).map((g) => (hasScript(g) ? c.green(g) : c.dim(`${g} (absent)`)));
report('ok', 'gates', gates.join(' · '));

section('IA (optionnelle)');
const providers = availableProviders();
if (envValue('SHIP_AI') === 'off') report('ok', 'IA désactivée', 'SHIP_AI=off');
else if (providers.length) report('ok', 'fournisseurs', providers.map((p) => p.name).join(' → '));
else report('warn', 'aucune clé IA', 'plan détecté automatiquement (suffisant)', 'optionnel : MISTRAL_API_KEY=… ou GROQ_API_KEY=… dans .env.local');
if (existsSync('.env.local') && !gitTry('check-ignore', '-q', '.env.local').ok) {
  report('fail', '.env.local', 'N\'EST PAS ignoré par git — tes clés partiraient sur GitHub', 'ajoute « .env.* » au .gitignore');
}

console.log(`\n${results.fail ? c.red(`✗ ${results.fail} problème(s) bloquant(s)`) : c.green('✓ Prêt à shipper')}${results.warn ? c.yellow(` · ${results.warn} avertissement(s)`) : ''}\n`);
process.exitCode = results.fail ? 1 : 0;
