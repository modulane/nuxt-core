// Ship-it — helpers partagés, 100 % Node (Windows / macOS / Linux, sans bash ni jq).
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { emitKeypressEvents } from 'node:readline';
import readline from 'node:readline/promises';
import { stripVTControlCharacters, styleText } from 'node:util';

export const IS_WIN = process.platform === 'win32';

export const c = {
  bold: (s) => styleText('bold', s),
  dim: (s) => styleText('dim', s),
  red: (s) => styleText('red', s),
  green: (s) => styleText('green', s),
  yellow: (s) => styleText('yellow', s),
  cyan: (s) => styleText('cyan', s),
};

export const banner = (msg) => console.log(`\n⛵ ${c.bold('Ship-it')} ${msg}`);
export const info = (msg) => console.log(`ℹ️  ${msg}`);
export const warn = (msg) => console.warn(`⚠️  ${c.yellow(msg)}`);

export class ShipError extends Error {}
export const fail = (msg) => { throw new ShipError(msg); };

// Exécute une commande sans shell (args jamais interprétés). `raw` = ne pas trimmer (sortie -z).
export const run = (cmd, args = [], { allowFail = false, input, stdio = 'pipe', shell = false, raw = false, env } = {}) => {
  const res = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024, input, stdio, shell, env });
  if (res.error) {
    if (allowFail) return { ok: false, out: '', err: res.error.message };
    throw res.error;
  }
  const clean = (s) => (raw ? s ?? '' : (s ?? '').trim());
  const result = { ok: res.status === 0, out: clean(res.stdout), err: clean(res.stderr) };
  if (!result.ok && !allowFail) throw new Error(`${cmd} ${args.join(' ')}\n${result.err || result.out}`);
  return result;
};

// Version asynchrone (même contrat que run, toujours allowFail) : laisse tourner le spinner.
export const runAsync = (cmd, args = [], { shell = false, env } = {}) => new Promise((resolve) => {
  const child = spawn(cmd, args, { shell, env, stdio: ['ignore', 'pipe', 'pipe'] });
  let out = '';
  let err = '';
  child.stdout.on('data', (d) => { out += d; });
  child.stderr.on('data', (d) => { err += d; });
  child.on('error', (e) => resolve({ ok: false, out: '', err: e.message }));
  child.on('close', (code) => resolve({ ok: code === 0, out: out.trim(), err: err.trim() }));
});

export const duration = (ms) => (ms < 1000 ? `${ms} ms` : ms < 60_000 ? `${(ms / 1000).toFixed(1)} s` : `${Math.floor(ms / 60_000)} min ${Math.round((ms % 60_000) / 1000)} s`);

// Spinner + durée autour d'une tâche async. fn → { ok, detail? } ; ok === 'skip' = étape ignorée.
// Console Windows historique (hors Windows Terminal) : spinner ASCII.
const FRAMES = IS_WIN && !process.env.WT_SESSION ? ['|', '/', '-', '\\'] : ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
export const timed = async (label, fn) => {
  const start = Date.now();
  let i = 0;
  const timer = process.stdout.isTTY && setInterval(() => {
    process.stdout.write(`\r\x1b[2K  ${c.cyan(FRAMES[i++ % FRAMES.length])} ${label} ${c.dim(duration(Date.now() - start))}`);
  }, 80);
  let res;
  try {
    res = (await fn()) ?? { ok: true };
  } finally {
    if (timer) { clearInterval(timer); process.stdout.write('\r\x1b[2K'); }
  }
  const icon = res.ok === 'skip' ? c.dim('○') : res.ok ? c.green('✓') : c.red('✗');
  console.log(`  ${icon} ${res.ok === 'skip' ? c.dim(label) : label}${res.detail ? c.dim(` — ${res.detail}`) : ''} ${c.dim(duration(Date.now() - start))}`);
  return res;
};

export const git = (...args) => run('git', args).out;
export const gitTry = (...args) => run('git', args, { allowFail: true });
export const gh = (...args) => run('gh', args).out;
export const ghTry = (...args) => run('gh', args, { allowFail: true });
export const ghJson = (...args) => {
  const r = ghTry(...args);
  try { return r.ok ? JSON.parse(r.out) : null; } catch { return null; }
};

export const LOCKFILE = /(^|\/)(yarn\.lock|package-lock\.json|pnpm-lock\.yaml)$/;

// Gestionnaire de paquets qui a lancé le script (yarn ship / npm run ship / pnpm ship).
export const PM = (process.env.npm_config_user_agent || 'yarn').split('/')[0];

const pkg = () => JSON.parse(readFileSync('package.json', 'utf8'));
export const hasScript = (name) => Boolean(pkg().scripts?.[name]);

// `yarn ship` injecte le runtime PnP dans NODE_OPTIONS : un yarn imbriqué qui en hérite plante
// (« Cannot read properties of undefined (reading '…/.pnp.cjs') »). On le retire pour les sous-commandes.
export const childEnv = () => {
  const env = { ...process.env };
  const opts = (env.NODE_OPTIONS || '')
    .replace(/--require\s+\S*\.pnp\.c?js/g, '')
    .replace(/--experimental-loader\s+\S*\.pnp\.loader\.mjs/g, '')
    .trim();
  if (opts) env.NODE_OPTIONS = opts;
  else delete env.NODE_OPTIONS;
  return env;
};

// Lance un script package.json. Args statiques uniquement (shell requis pour les shims .cmd Windows).
const scriptCommand = (name, extra) => [PM, 'run', name, ...(PM === 'npm' && extra.length ? ['--'] : []), ...extra].join(' ');
export const runScript = (name, extra = []) => run(scriptCommand(name, extra), [], { allowFail: true, shell: true, env: childEnv() });
export const runScriptAsync = (name, extra = []) => runAsync(scriptCommand(name, extra), [], { shell: true, env: childEnv() });

export const tail = (text, n = 40) => text.split('\n').slice(-n).join('\n');

// Lit MISTRAL_API_KEY (et autres) : variable d'env d'abord, sinon .env.local.
export const readEnvLocal = () => {
  if (!existsSync('.env.local')) return {};
  const out = {};
  for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
  return out;
};
export const envValue = (name) => process.env[name] || readEnvLocal()[name] || '';

// Prompts réouvrables : on ferme readline avant git push / gh (prompts d'identifiants, terminal brut)
// et on le rouvre à la question suivante (mode split : plusieurs PR d'affilée).
export const createPrompter = (abortMessage = 'Abandon.') => {
  let rl = null;
  return {
    abortMessage,
    get rl() {
      if (!rl) {
        rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.on('SIGINT', () => { console.log(`\n${abortMessage}`); process.exit(130); });
      }
      return rl;
    },
    close() { rl?.close(); rl = null; },
  };
};

export const confirm = async (rl, question, defaultYes = true) => {
  const a = (await rl.question(`${question} ${defaultYes ? '[O/n]' : '[o/N]'} : `)).trim().toLowerCase();
  return a === '' ? defaultYes : ['o', 'oui', 'y', 'yes'].includes(a);
};

// Question avec valeur pré-remplie modifiable (Enter = garder).
export const prefill = async (rl, label, value = '') => {
  const answer = rl.question(label);
  rl.write(value);
  return (await answer).trim();
};

// Menu aux flèches (↑↓ / j k / chiffres, Entrée). Sans TTY brut : repli sur la saisie d'un numéro.
export const select = async (io, label, options, defaultIndex = 0) => {
  const { stdin, stdout } = process;
  if (!stdin.isTTY || !stdout.isTTY || typeof stdin.setRawMode !== 'function') return choose(io.rl, label, options, defaultIndex);
  io.close(); // readline et le mode brut ne cohabitent pas ; la question suivante le rouvre

  const width = Math.max(20, (stdout.columns || 80) - 4);
  const fit = (s) => (stripVTControlCharacters(s).length > width ? `${stripVTControlCharacters(s).slice(0, width - 1)}…` : s);
  const lines = options.map(fit);
  let i = defaultIndex;
  const render = (first) => {
    if (!first) stdout.write(`\x1b[${lines.length}A`);
    lines.forEach((o, k) => stdout.write(`\x1b[2K${k === i ? `${c.cyan('❯')} ${c.bold(stripVTControlCharacters(o))}` : `  ${o}`}\n`));
  };
  stdout.write(`${c.bold(label)} ${c.dim('↑↓ puis Entrée')}\n\x1b[?25l`);
  render(true);

  emitKeypressEvents(stdin);
  stdin.setRawMode(true);
  stdin.resume();
  return new Promise((resolve) => {
    const cleanup = () => { stdin.off('keypress', onKey); stdin.setRawMode(false); stdin.pause(); stdout.write('\x1b[?25h'); };
    const onKey = (str, key = {}) => {
      if (key.ctrl && key.name === 'c') { cleanup(); console.log(`\n${io.abortMessage ?? 'Abandon.'}`); process.exit(130); }
      if (key.name === 'up' || key.name === 'k') i = (i - 1 + lines.length) % lines.length;
      else if (key.name === 'down' || key.name === 'j') i = (i + 1) % lines.length;
      else if (/^[1-9]$/.test(str ?? '') && Number(str) <= lines.length) i = Number(str) - 1;
      else if (key.name === 'return' || key.name === 'enter') { cleanup(); resolve(i); return; }
      else return;
      render(false);
    };
    stdin.on('keypress', onKey);
  });
};

export const choose = async (rl, label, options, defaultIndex = 0) => {
  options.forEach((o, i) => console.log(`  ${c.cyan(String(i + 1).padStart(2))}  ${o}`));
  while (true) {
    const a = (await rl.question(`${label} [${defaultIndex + 1}] : `)).trim();
    if (a === '') return defaultIndex;
    const n = Number(a);
    if (Number.isInteger(n) && n >= 1 && n <= options.length) return n - 1;
  }
};
