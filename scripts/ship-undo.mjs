#!/usr/bin/env node
// Ship-it undo — annule un ship : remet ses changements en local (non commités), ferme la PR, supprime la branche.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { config } from './ship-config.mjs';
import { currentBranch, defaultBase, operationInProgress, remoteBranchExists, statusEntries } from './ship-git.mjs';
import { logEvent, undoableShips } from './ship-log.mjs';
import {
  ShipError, banner, c, confirm, createPrompter, fail, ghJson, ghTry, git, gitTry, info, run, runAsync, select, timed, warn,
} from './ship-utils.mjs';

const ago = (iso) => {
  const min = Math.round((Date.now() - new Date(iso)) / 60_000);
  return min < 60 ? `il y a ${min} min` : min < 2880 ? `il y a ${Math.round(min / 60)} h` : `il y a ${Math.round(min / 1440)} j`;
};

async function main() {
  if (!process.stdin.isTTY) fail('ship:undo est interactif : lance-le dans un terminal.');
  if (!gitTry('rev-parse', '--show-toplevel').ok) fail('Pas dans un dépôt git.');
  process.chdir(git('rev-parse', '--show-toplevel'));
  if (!ghTry('auth', 'status').ok) fail('gh non authentifié : tape « gh auth login ».');
  if (operationInProgress()) fail('Merge, rebase ou cherry-pick en cours — termine-le avant d\'annuler un ship.');

  banner('undo');
  const base = config().base ?? defaultBase();
  await timed('synchronisation avec origin', () => runAsync('git', ['fetch', '--quiet', '--prune', 'origin']));

  // Journal local → ships dont la PR est encore ouverte (une entrée par PR, la plus récente).
  const seen = new Set();
  const candidates = [];
  for (const ship of undoableShips()) {
    if (seen.has(ship.pr) || candidates.length >= 10) continue;
    seen.add(ship.pr);
    const pr = ghJson('pr', 'view', String(ship.pr), '--json', 'number,state,title,headRefName,url');
    if (pr?.state === 'OPEN') candidates.push({ ...ship, pr });
  }
  if (!candidates.length) fail('Aucun ship annulable : le journal local (.ship/) ne contient pas de PR encore ouverte.');

  const io = createPrompter('Abandon — rien n\'a été modifié.');
  try {
    console.log('');
    const options = candidates.map((s) => `#${s.pr.number} ${s.pr.title} ${c.dim(`(${s.pr.headRefName}, ${ago(s.at)})`)}`);
    const pick = await select(io, 'Quel ship annuler ?', [...options, 'Rien, je me suis trompé']);
    if (pick === candidates.length) return info('Abandon — rien n\'a été modifié.');
    const { pr } = candidates[pick];
    const branch = pr.headRefName;

    console.log(`\n${c.bold('Ce qui va se passer :')}`);
    console.log(`  1. les changements de ${c.cyan(branch)} reviennent sur ${base} en modifications non commitées`);
    console.log(`  2. la PR #${pr.number} est fermée (non mergée), la branche ${branch} supprimée (locale + distante)`);
    console.log(c.dim(`     Filet de sécurité : le patch est d'abord sauvegardé dans .ship/undo-${pr.number}.patch`));
    if (!(await confirm(io.rl, `Annuler le ship #${pr.number} ?`, false))) return info('Abandon — rien n\'a été modifié.');
    io.close();

    // 1. Patch de toute la PR (depuis le point de départ de la branche), sauvegardé avant toute modification.
    const ref = remoteBranchExists(branch) ? `origin/${branch}` : branch;
    const patch = run('git', ['diff', '--binary', `origin/${base}...${ref}`], { raw: true }).out;
    if (!patch.trim()) fail(`La branche ${branch} ne contient aucun changement par rapport à ${base} — rien à restaurer.`);
    if (!existsSync('.ship')) mkdirSync('.ship');
    const patchFile = `.ship/undo-${pr.number}.patch`;
    writeFileSync(patchFile, patch);

    // 2. Travail en cours mis de côté (arbre propre exigé : permet un retour arrière exact), base à jour.
    let stashed = false;
    if (statusEntries().length) {
      stashed = gitTry('stash', 'push', '--include-untracked', '-m', `ship-undo #${pr.number}`).ok;
      if (!stashed || statusEntries().length) fail('Impossible de mettre ton travail en cours de côté (git stash) — rien n\'a été modifié.');
    }
    const restoreStash = () => {
      if (stashed && !gitTry('stash', 'pop').ok) {
        warn('Ton travail en cours est en conflit avec les changements restaurés : il reste dans « git stash list » (rien n\'est perdu).');
      }
    };
    if (currentBranch() !== base) git('switch', base);
    if (!gitTry('merge', '--ff-only', '--quiet', `origin/${base}`).ok) warn(`${base} locale a divergé d'origin — restauration sur l'état local.`);

    // 3. Application du patch (3-way : tolère une base qui a avancé), puis désindexation.
    const applied = await timed('restauration des changements', async () => {
      const r = run('git', ['apply', '--3way', '--whitespace=nowarn'], { input: patch, allowFail: true });
      return { ok: r.ok, detail: r.ok ? '' : 'conflits avec ce qui a changé sur la base depuis' };
    });
    const conflicted = gitTry('diff', '--name-only', '--diff-filter=U').out.split('\n').filter(Boolean);
    gitTry('reset', '--quiet');
    if (!applied.ok) {
      if (conflicted.length) {
        console.log(c.yellow(`\n  Conflits dans : ${conflicted.join(', ')}`));
        const choice = await select(io, 'Que faire ?', [
          'Résoudre les conflits moi-même (marqueurs <<<<<<< dans les fichiers, la PR sera fermée)',
          'Tout remettre comme avant (rien n\'est modifié, la PR reste ouverte)',
        ]);
        io.close();
        if (choice === 1) {
          git('reset', '--hard', '--quiet'); // sûr : l'arbre était propre avant l'application du patch
          git('clean', '-fd', '--quiet');
          restoreStash();
          return info(`Rien n'a été modifié, PR #${pr.number} toujours ouverte. Patch conservé : ${patchFile}`);
        }
      } else {
        git('reset', '--hard', '--quiet');
        git('clean', '-fd', '--quiet');
        restoreStash();
        fail(`Restauration impossible — rien n'a été modifié, la PR n'a PAS été fermée. Patch conservé : ${patchFile}`);
      }
    }

    // 4. Fermeture de la PR + suppression des branches (seulement maintenant que tout est en local).
    const closed = await timed(`fermeture de la PR #${pr.number}`, () => runAsync('gh', [
      'pr', 'close', String(pr.number), '--delete-branch', '--comment', '↩️ Annulée via `yarn ship:undo` — les changements sont revenus en local.',
    ]));
    if (!closed.ok) warn(`PR non fermée (${closed.err.split('\n')[0]}) — ferme-la à la main : gh pr close ${pr.number} --delete-branch`);

    restoreStash();
    logEvent({ type: 'undo', pr: pr.number, branch, base });

    const restored = statusEntries().length;
    console.log(`\n✅ Ship #${pr.number} annulé. ${restored} fichier(s) modifié(s) sur ${c.cyan(base)}, prêts à être retravaillés.`);
    if (conflicted.length) console.log(c.yellow(`   À résoudre (marqueurs <<<<<<<) : ${conflicted.join(', ')}`));
    console.log(c.dim('   Relance « yarn ship » quand c\'est prêt.'));
  } finally {
    io.close();
  }
}

main().catch((e) => {
  console.error(`\n⛔ ${c.red(e instanceof ShipError ? e.message : `Erreur inattendue : ${e.message}`)}`);
  process.exitCode = 1;
});
