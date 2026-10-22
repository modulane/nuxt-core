#!/usr/bin/env node
// Ship-it setup — aligne le repo GitHub sur le workflow ship-it (idempotent : relancer ne change que ce qui manque).
//   Réglages de merge · labels de ship.config.json · formulaires d'issue (Bug / Feature, issues vides bloquées).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { config } from './ship-config.mjs';
import {
  ShipError, banner, c, confirm, createPrompter, fail, ghJson, ghTry, git, gitTry, info, runAsync, timed,
} from './ship-utils.mjs';

// ── Réglages de merge ──────────────────────────────────────────────────────
// Squash seul : 1 PR = 1 commit propre sur main, titre = titre de PR (déjà conventionnel grâce à ship-it).
const MERGE_TARGET = {
  allow_squash_merge: [true, 'merge squash autorisé'],
  allow_merge_commit: [false, 'merge commit désactivé'],
  allow_rebase_merge: [false, 'rebase merge désactivé'],
  squash_merge_commit_title: ['PR_TITLE', 'commit squashé = titre de la PR'],
  squash_merge_commit_message: ['COMMIT_MESSAGES', 'corps du commit = messages des commits (résumé ship-it)'],
  delete_branch_on_merge: [true, 'branche supprimée après merge'],
  allow_update_branch: [true, 'bouton « Update branch » proposé'],
};

// ── Labels ─────────────────────────────────────────────────────────────────
const KNOWN_LABELS = {
  enhancement: ['a2eeef', 'New feature or request'],
  bug: ['d73a4a', 'Something isn\'t working'],
  documentation: ['0075ca', 'Improvements or additions to documentation'],
  accessibility: ['f143ab', 'Barrier affecting people with disabilities'],
};
const colorFor = (name) => {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return (h & 0xffffff).toString(16).padStart(6, '0');
};

// ── Formulaires d'issue ────────────────────────────────────────────────────
const roadmapPhases = () => {
  if (!existsSync('ROADMAP.md')) return [];
  return [...readFileSync('ROADMAP.md', 'utf8').matchAll(/^##\s+(Phase\s+\d+\s+[—-]\s+.+?)\s*$/gm)].map((m) => m[1]);
};
const yamlString = (s) => JSON.stringify(s); // une chaîne JSON est une chaîne YAML valide

const issueTemplates = () => {
  const { labels } = config();
  const bugLabel = labels.fix ? `\nlabels: [${yamlString(labels.fix)}]` : '';
  const featLabel = labels.feat ? `\nlabels: [${yamlString(labels.feat)}]` : '';
  const phases = roadmapPhases();
  return {
    '.github/ISSUE_TEMPLATE/config.yml': 'blank_issues_enabled: false\n',
    '.github/ISSUE_TEMPLATE/bug.yml': `name: Bug
description: Something doesn't work as expected${bugLabel}
body:
  - type: textarea
    id: what
    attributes:
      label: What happened?
      description: A clear description of the bug.
    validations:
      required: true
  - type: textarea
    id: steps
    attributes:
      label: Steps to reproduce
      placeholder: |
        1. Go to …
        2. Click on …
        3. See …
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: Expected behavior
    validations:
      required: true
  - type: input
    id: environment
    attributes:
      label: Browser / device
      placeholder: Chrome 140, Windows 11 — or iPhone, Safari
  - type: textarea
    id: screenshots
    attributes:
      label: Screenshots
      description: Drag and drop images here if relevant.
`,
    '.github/ISSUE_TEMPLATE/feature.yml': `name: Feature
description: Propose a new reusable component, section or feature${featLabel}
body:
  - type: textarea
    id: problem
    attributes:
      label: Problem to solve
      description: What recurring need across projects does this address?
    validations:
      required: true
  - type: textarea
    id: proposal
    attributes:
      label: Proposed solution
      description: API, props, behavior, examples.
    validations:
      required: true
  - type: textarea
    id: accessibility
    attributes:
      label: Accessibility
      description: Keyboard navigation, focus management, screen readers, contrast.
${phases.length ? `  - type: dropdown
    id: phase
    attributes:
      label: Roadmap phase
      options:
${phases.map((p) => `        - ${yamlString(p)}`).join('\n')}
        - "Not on the roadmap yet"
` : ''}`,
  };
};

async function main() {
  if (!process.stdin.isTTY) fail('ship:setup est interactif : lance-le dans un terminal.');
  if (!gitTry('rev-parse', '--show-toplevel').ok) fail('Pas dans un dépôt git.');
  process.chdir(git('rev-parse', '--show-toplevel'));
  if (!ghTry('auth', 'status').ok) fail('gh non authentifié : tape « gh auth login ».');

  banner('setup du repo GitHub');
  const repo = ghJson('repo', 'view', '--json', 'nameWithOwner,viewerPermission');
  if (!repo) fail('Impossible de lire le repo via gh — « yarn ship:doctor » pour diagnostiquer.');
  console.log(`  repo : ${c.cyan(repo.nameWithOwner)} ${c.dim(`(ta permission : ${repo.viewerPermission})`)}`);
  const isAdmin = repo.viewerPermission === 'ADMIN';

  const io = createPrompter('Abandon — rien n\'a été modifié.');
  try {
    // 1. Réglages de merge
    console.log(`\n${c.bold('Réglages de merge')}`);
    const current = ghJson('api', `repos/${repo.nameWithOwner}`) ?? {};
    const changes = Object.entries(MERGE_TARGET).filter(([key, [want]]) => current[key] !== want);
    for (const [key, [want, label]] of Object.entries(MERGE_TARGET)) {
      const ok = current[key] === want;
      console.log(`  ${ok ? c.green('✓') : c.yellow('→')} ${label}${ok ? '' : c.dim(` (actuel : ${current[key] ?? '?'})`)}`);
    }
    if (!changes.length) info('Déjà aligné.');
    else if (!isAdmin) info(`Il faut être admin du repo pour les appliquer — demande à un admin de lancer « yarn ship:setup ».`);
    else if (await confirm(io.rl, `Appliquer ces ${changes.length} réglage(s) ?`)) {
      const args = changes.flatMap(([key, [want]]) => (typeof want === 'boolean' ? ['-F', `${key}=${want}`] : ['-f', `${key}=${want}`]));
      const r = await timed('réglages de merge', () => runAsync('gh', ['api', '-X', 'PATCH', `repos/${repo.nameWithOwner}`, ...args]));
      if (!r.ok) console.log(c.red(`    ${r.err.split('\n')[0]}`));
    }

    // 2. Labels utilisés par ship.config.json
    console.log(`\n${c.bold('Labels')} ${c.dim('(ship.config.json → labels)')}`);
    const existing = new Set((ghJson('label', 'list', '--limit', '200', '--json', 'name') ?? []).map((l) => l.name));
    const wanted = [...new Set(Object.values(config().labels))];
    const missing = wanted.filter((l) => !existing.has(l));
    for (const l of wanted) console.log(`  ${existing.has(l) ? c.green('✓') : c.yellow('+')} ${l}`);
    if (!missing.length) info('Tous présents.');
    else if (await confirm(io.rl, `Créer ${missing.length} label(s) manquant(s) ?`)) {
      for (const name of missing) {
        const [color, description] = KNOWN_LABELS[name] ?? [colorFor(name), `Ship-it: ${name}`];
        await timed(`label ${name}`, () => runAsync('gh', ['label', 'create', name, '--color', color, '--description', description]));
      }
    }

    // 3. Formulaires d'issue (fichiers du repo, à livrer ensuite avec yarn ship)
    console.log(`\n${c.bold('Formulaires d\'issue')} ${c.dim('(.github/ISSUE_TEMPLATE/)')}`);
    const templates = issueTemplates();
    const toWrite = Object.entries(templates).filter(([path, content]) => !existsSync(path) || readFileSync(path, 'utf8') !== content);
    for (const [path] of Object.entries(templates)) {
      const state = !existsSync(path) ? c.yellow('+ à créer') : toWrite.some(([p]) => p === path) ? c.yellow('~ différent') : c.green('✓');
      console.log(`  ${state} ${path}`);
    }
    if (!toWrite.length) info('À jour.');
    else if (await confirm(io.rl, `Écrire ${toWrite.length} fichier(s) ?${toWrite.some(([p]) => existsSync(p)) ? ' (les fichiers modifiés à la main seront remplacés)' : ''}`)) {
      mkdirSync('.github/ISSUE_TEMPLATE', { recursive: true });
      for (const [path, content] of toWrite) writeFileSync(path, content);
      info('Formulaires écrits — livre-les avec « yarn ship » pour qu\'ils soient actifs sur GitHub.');
    }

    console.log(`\n${c.green('✓')} Setup terminé. Relance « yarn ship:setup » à tout moment : seul ce qui manque est proposé.`);
  } finally {
    io.close();
  }
}

main().catch((e) => {
  console.error(`\n⛔ ${c.red(e instanceof ShipError ? e.message : `Erreur inattendue : ${e.message}`)}`);
  process.exitCode = 1;
});
