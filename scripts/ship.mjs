#!/usr/bin/env node
// Ship-it — l'agent qui fait tout le GitHub. Usage : yarn ship [--dry] [--no-pr] [--skip-tests]
//   --dry         : pré-vol + gates + plan, sans rien modifier ni pousser
//   --no-pr       : pousse la branche sans ouvrir de PR
//   --skip-tests  : saute la gate test (dépannage ponctuel, signalé dans la PR)
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { availableProviders, generatePlan } from './ship-agent.mjs';
import { config } from './ship-config.mjs';
import { detectPlan, splitGroups } from './ship-detect.mjs';
import {
  collectChanges, count, currentBranch, defaultBase, operationInProgress, remoteBranchExists, statusEntries, syncWithBase, uniqueBranch,
} from './ship-git.mjs';
import { labelsFor, leaveMergedBranch, openPrFor, pruneMergedBranches, reviewers } from './ship-github.mjs';
import { pickIssue } from './ship-issues.mjs';
import { logEvent } from './ship-log.mjs';
import { reviewPlan } from './ship-plan.mjs';
import { scanSecrets } from './ship-secrets.mjs';
import { watchPr } from './ship-watch.mjs';
import {
  ShipError, banner, c, confirm, createPrompter, duration, fail, gh, ghTry, git, gitTry, hasScript, info, run, runAsync,
  runScriptAsync, select, tail, timed, warn,
} from './ship-utils.mjs';

const ARGS = new Set(process.argv.slice(2));
const DRY = ARGS.has('--dry');
const NO_PR = ARGS.has('--no-pr');
const SKIP_TESTS = ARGS.has('--skip-tests');
const STARTED = Date.now();
let delivering = false; // les échecs ne sont journalisés qu'une fois la livraison commencée

const renderBody = (plan, files) => [
  ...(plan.issue ? [`${config().issues.keyword} #${plan.issue.number}`, ''] : []),
  '## Summary',
  plan.summary,
  '',
  '## Review notes',
  `- **Risks**: ${plan.risks}`,
  `- **Accessibility**: ${plan.accessibility}`,
  `- **Breaking changes**: ${plan.breaking}`,
  ...(SKIP_TESTS ? ['- ⚠️ **Tests**: local test gate skipped (`--skip-tests`) — rely on CI'] : []),
  '',
  `<details><summary>${files.length} file(s) changed</summary>`,
  '',
  ...files.map((f) => `- \`${f}\``),
  '',
  '</details>',
  '',
  `<sub>⛵ Shipped with ship-it${plan.source === 'ai' ? ` — AI-assisted plan (${plan.provider})` : ''}</sub>`,
].join('\n');

// ── Étapes ─────────────────────────────────────────────────────────────────
const preflight = async () => {
  banner('pré-vol…');
  if (!process.stdin.isTTY) fail('Ship-it est interactif : lance-le dans un terminal (pas en pipe ni en CI).');
  if (!gitTry('--version').ok) fail('git introuvable — lance « yarn ship:doctor ».');
  process.chdir(git('rev-parse', '--show-toplevel'));
  config(); // valide ship.config.json dès le départ
  if (!ghTry('--version').ok) fail('GitHub CLI (gh) manquant — lance « yarn ship:doctor » pour la marche à suivre.');
  if (!ghTry('auth', 'status').ok) fail('gh non authentifié : tape « gh auth login » (2 min, guidé).');
  if (operationInProgress()) fail('Merge, rebase ou cherry-pick en cours — termine-le (ou annule-le) avant de shipper.');

  const base = config().base ?? defaultBase();
  const fetched = await timed('synchronisation avec origin', async () => runAsync('git', ['fetch', '--quiet', '--prune', 'origin']));
  if (!fetched.ok) fail(`Impossible de joindre origin (${fetched.err.split('\n')[0]}) — « yarn ship:doctor » pour diagnostiquer.`);

  // Branche dont la PR est mergée → retour automatique sur la base à jour, puis ménage.
  let current = currentBranch();
  if (!DRY) {
    if (current && current !== base && leaveMergedBranch(base, current)) current = currentBranch();
    pruneMergedBranches(base, current);
  }
  return { base, current, onBase: !current || current === base };
};

const cleanup = async () => {
  for (const s of config().cleanup.filter(hasScript)) {
    // Fixes mécaniques : un échec ici est rattrapé par les gates.
    await timed(`nettoyage : ${s}`, async () => ({ ok: true, detail: (await runScriptAsync(s)).ok ? '' : 'en échec, voir les gates' }));
  }
};

const gates = async (base) => {
  banner('gates…');
  const testScript = hasScript('test') ? JSON.parse(readFileSync('package.json', 'utf8')).scripts.test : '';
  for (const name of config().gates) {
    if (name === 'test' && SKIP_TESTS) { await timed(name, async () => ({ ok: 'skip', detail: 'sauté (--skip-tests)' })); continue; }
    if (!hasScript(name)) { await timed(name, async () => ({ ok: 'skip', detail: 'script absent, ignoré' })); continue; }
    const extra = name === 'test' && testScript.includes('vitest') ? ['--changed', `origin/${base}`, '--passWithNoTests'] : [];
    let output = '';
    const r = await timed(name, async () => {
      const res = await runScriptAsync(name, extra);
      output = `${res.out}\n${res.err}`;
      return { ok: res.ok };
    });
    if (!r.ok) {
      console.log(tail(output));
      fail(`Gate « ${name} » rouge — corrige puis relance ship.`);
    }
  }
};

const secretsGate = async (io, changes) => {
  const findings = scanSecrets(changes.entries);
  if (!findings.length) { console.log(`  ${c.green('✓')} secrets — rien de suspect`); return true; }
  warn(`${findings.length} secret(s) potentiel(s) dans ce que tu t'apprêtes à pousser :`);
  for (const f of findings.slice(0, 20)) {
    console.log(`   ${c.red('●')} ${f.path}${f.line ? `:${f.line}` : ''} — ${f.rule} ${c.dim(f.preview)}`);
  }
  if (findings.length > 20) console.log(c.dim(`   … +${findings.length - 20}`));
  console.log(c.dim('   Faux positif récurrent ? Ajoute le chemin à secrets.ignorePaths dans ship.config.json.'));
  return confirm(io.rl, 'Ce sont des faux positifs, continuer quand même ?', false);
};

// Plan détecté depuis le diff ; l'IA (optionnelle, Mistral puis Groq) l'affine ; issue liée si pertinente.
const planFor = async (io, changes, { base, current }) => {
  banner('analyse du travail…');
  let plan = detectPlan(changes.entries);
  const ctx = { files: changes.files, diff: changes.diff, touchesPackages: changes.touchesPackages };
  const providers = availableProviders();
  if (providers.length) {
    const r = await timed(`agent IA (${providers.map((p) => p.name).join(' → ')})`, async () => {
      const res = await generatePlan(ctx);
      return { ok: Boolean(res.plan), plan: res.plan, detail: res.plan ? res.plan.provider : res.reason };
    });
    if (r.plan) plan = r.plan;
    else info('Plan détecté automatiquement utilisé.');
  }
  plan.issue = await pickIssue(io, { base, branch: current, entries: changes.entries });

  const regenerate = providers.length
    ? async (previous, feedback) => {
      const r = await generatePlan({ ...ctx, previous, feedback });
      if (!r.plan) warn(`Régénération impossible (${r.reason}) — plan précédent conservé.`);
      return r.plan;
    }
    : null;
  return reviewPlan(io, plan, { currentBranch: current, files: changes.files, regenerate });
};

// Branche → commit → rebase sur la base → push → PR. Retourne { branch, url, pr }.
const deliver = async (io, { base, plan, changes, paths, onBase, current, unpushed, existingPr }) => {
  const branch = onBase ? uniqueBranch(plan.branch) : current;
  const body = renderBody(plan, changes.files);
  const updatePr = existingPr && await confirm(io.rl, `Mettre à jour le titre et la description de la PR #${existingPr.number} ?`, false);

  if (DRY) {
    banner('dry-run — rien n\'est modifié.');
    const pr = NO_PR ? '—' : existingPr ? `#${existingPr.number}${updatePr ? ' (maj titre/description)' : ''}` : 'nouvelle, prête pour review';
    console.log(`  branche : ${branch}${onBase ? ' (nouvelle)' : ''}\n  commit  : ${plan.title}\n  PR      : ${pr}`);
    if (!existingPr && !NO_PR) {
      console.log(`  labels  : ${labelsFor(plan, changes.files).join(', ') || '—'}\n  review  : ${reviewers().join(', ') || '—'}`);
    }
    console.log(`\n${c.dim(body)}`);
    return null;
  }

  banner(`livraison — ${branch}…`);
  delivering = true;
  if (onBase) git('switch', '-c', branch);
  if (changes.touchesPackages && plan.changesetMd && existsSync('.changeset')) {
    writeFileSync(join('.changeset', `ship-${Date.now()}.md`), `${plan.changesetMd}\n`);
    if (paths.length) paths = [...paths, '.changeset'];
  }
  if (statusEntries(paths).length || paths.includes('.changeset')) {
    git('add', '-A', ...(paths.length ? ['--', ...paths] : []));
    const commit = run('git', ['commit', '-F', '-'], { input: `${plan.title}\n\n${plan.summary}\n`, allowFail: true });
    if (!commit.ok) {
      console.log(tail(`${commit.out}\n${commit.err}`));
      fail(`Commit refusé (hook ?). Tu es sur ${branch} : corrige puis relance ship.`);
    }
    console.log(`  ${c.green('✓')} commit ${c.dim(git('rev-parse', '--short', 'HEAD'))} ${plan.title}`);
  }

  // Base qui a avancé → rebase (autostash : les fichiers des autres sujets restent en place).
  const wasPushed = remoteBranchExists(branch);
  const { sync } = await timed(`à jour avec origin/${base}`, async () => {
    const s = syncWithBase(base);
    return { ok: s !== 'conflict', sync: s, detail: { 'up-to-date': 'déjà à jour', rebased: 'rebasée', conflict: 'conflit, rebase annulé' }[s] };
  });
  if (sync === 'conflict') {
    warn(`Conflit avec origin/${base} — ta branche est intacte.`);
    if (!(await confirm(io.rl, 'Pousser quand même ? (la PR signalera le conflit à résoudre)', false))) {
      fail(`Arrêt. Tu es sur ${branch} avec ton commit. Pour résoudre : git rebase origin/${base}, puis relance ship.`);
    }
  }
  io.close(); // git/gh récupèrent le terminal (prompts d'identifiants)

  const pushStart = Date.now();
  const force = sync === 'rebased' && wasPushed ? ['--force-with-lease'] : [];
  if (!run('git', ['push', '--quiet', '-u', ...force, 'origin', branch], { stdio: 'inherit', allowFail: true }).ok) {
    fail(`Push refusé. Tu es sur ${branch}, ton commit est en local : relance ship après correction.`);
  }
  console.log(`  ${c.green('✓')} push${force.length ? ' (force-with-lease)' : ''} ${c.dim(duration(Date.now() - pushStart))}`);

  // Les commits locaux faits sur la base vivent maintenant sur la branche : on réaligne la base.
  if (onBase && current && unpushed > 0) {
    git('branch', '-f', base, `origin/${base}`);
    info(`${base} locale réalignée sur origin/${base} (tes commits sont sur ${branch}).`);
  }

  const commit = git('rev-parse', 'HEAD');
  if (NO_PR) {
    console.log(`\n✅ Branche ${c.cyan(branch)} poussée (pas de PR — --no-pr).`);
    return { branch, url: null, pr: null, commit };
  }

  if (existingPr) {
    if (updatePr) gh('pr', 'edit', String(existingPr.number), '--title', plan.title, '--body', body);
    console.log(`\n✅ PR #${existingPr.number} mise à jour : ${c.cyan(existingPr.url)}`);
    return { branch, url: existingPr.url, pr: existingPr.number, commit, updated: true };
  }

  const labels = labelsFor(plan, changes.files);
  const revs = reviewers();
  const create = (extra) => runAsync('gh', ['pr', 'create', '--base', base, '--head', branch, '--title', plan.title, '--body', body, ...extra]);
  const created = await timed('pull request', async () => {
    let r = await create([...labels.flatMap((l) => ['--label', l]), ...revs.flatMap((u) => ['--reviewer', u])]);
    if (!r.ok && (labels.length || revs.length)) {
      const retry = await create([]);
      if (retry.ok) return { ...retry, detail: `sans labels/reviewers (${(r.err || r.out).split('\n')[0]})` };
      r = retry;
    }
    return { ...r, detail: r.ok ? [labels.join(', '), revs.length && `review : ${revs.join(', ')}`].filter(Boolean).join(' · ') : '' };
  });
  if (!created.ok) fail(`Création de la PR impossible : ${created.err || created.out}\nLa branche ${branch} est poussée — relance ship pour réessayer.`);
  const url = created.out.split('\n').pop();
  console.log(`\n✅ PR prête pour review : ${c.cyan(url)}`);
  return { branch, url, pr: Number(url.match(/\/pull\/(\d+)/)?.[1]) || null, commit };
};

async function main() {
  const { base, current, onBase } = await preflight();

  const initial = collectChanges(base);
  const unpushed = onBase || !gitTry('rev-parse', '--abbrev-ref', '@{u}').ok
    ? count(`origin/${base}..HEAD`)
    : count('@{u}..HEAD');
  const existingPr = onBase ? null : openPrFor(current);
  if (!initial.status.length && unpushed === 0) {
    if (existingPr) info(`PR #${existingPr.number} à jour : ${existingPr.url}`);
    fail('Rien à shipper — arbre de travail propre et tout est poussé.');
  }
  if (onBase && current) info(`Sur ${base} : ship-it créera une branche dédiée.`);
  if (existingPr) info(`Branche ${current} — PR #${existingPr.number} ouverte, elle sera mise à jour.`);

  if (!DRY) await cleanup();
  await gates(base);
  const changes = DRY ? initial : collectChanges(base); // le nettoyage a pu modifier des fichiers

  const io = createPrompter('Abandon — rien n\'a été poussé.');
  try {
    banner('scan de secrets…');
    if (!(await secretsGate(io, changes))) {
      return info('Abandon — retire le secret (fichier → .gitignore, valeur → .env.local), puis relance ship.');
    }

    // Plusieurs sujets indépendants → proposer une PR par sujet (seulement depuis la base, sans commit local).
    let batches = [{ label: null, paths: [] }];
    const groups = config().split && onBase && unpushed === 0 ? splitGroups(changes.entries) : [];
    if (groups.length > 1) {
      console.log(`\n${c.bold('Ce diff mélange plusieurs sujets :')}`);
      for (const g of groups) {
        console.log(`  • ${g.label} — ${g.entries.length} fichier(s) ${c.dim(`→ ${detectPlan(g.entries).title}`)}`);
      }
      console.log('');
      const pick = await select(io, 'Livraison', ['Une seule PR pour tout', `${groups.length} PR séparées (une par sujet)`]);
      if (pick === 1) batches = groups.map((g) => ({ label: g.label, paths: g.entries.map((e) => e.path) }));
    }

    const shipped = [];
    for (const [i, batch] of batches.entries()) {
      if (batches.length > 1) banner(`PR ${i + 1}/${batches.length} — ${batch.label}`);
      const sub = batch.paths.length ? collectChanges(base, batch.paths) : changes;
      const plan = await planFor(io, sub, { base, current: onBase ? null : current });
      if (!plan) {
        info(batches.length > 1 ? 'Sujet ignoré — ses fichiers restent en local.' : 'Abandon — rien n\'a été poussé.');
        continue;
      }
      const result = await deliver(io, { base, plan, changes: sub, paths: batch.paths, onBase, current, unpushed, existingPr });
      if (result) {
        shipped.push(result);
        logEvent({
          type: 'ship', base, branch: result.branch, pr: result.pr, url: result.url, commit: result.commit, title: plan.title,
          files: sub.files, fromBase: onBase, updated: Boolean(result.updated), split: batches.length > 1,
        });
      }
      if (batches.length > 1 && !DRY) git('switch', base); // les fichiers des sujets suivants suivent
    }

    if (shipped.length > 1) {
      console.log(`\n${c.bold(`⛵ ${shipped.length} PR livrées :`)}`);
      for (const s of shipped) console.log(`   ${s.branch} ${c.cyan(s.url ?? '(poussée sans PR)')}`);
    }
    if (shipped.length) {
      console.log(c.dim(`\n   Livré en ${duration(Date.now() - STARTED)}. Merge manuel une fois la review faite.`));
      console.log(c.dim('   « yarn ship:status » pour suivre · « yarn ship:undo » pour annuler.'));
    }
    if (shipped.length === 1 && shipped[0].pr) {
      console.log('');
      if (await confirm(io.rl, 'Surveiller la PR maintenant ? (notifications reviews / commentaires / merge)', false)) {
        io.close();
        await watchPr(shipped[0].pr);
      }
    }
  } finally {
    io.close();
  }
}

main().catch((e) => {
  const message = e instanceof ShipError ? e.message : `Erreur inattendue : ${e.message}`;
  if (delivering) logEvent({ type: 'fail', branch: currentBranch(), error: message });
  console.error(`\n⛔ ${c.red(message)}`);
  process.exitCode = 1;
});
