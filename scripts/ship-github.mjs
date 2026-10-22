// Ship-it — tout ce qui parle à GitHub (via gh) : PR, labels, reviewers, nettoyage des branches mergées.
import { config } from './ship-config.mjs';
import { statusEntries } from './ship-git.mjs';
import { c, ghJson, git, gitTry, info, warn } from './ship-utils.mjs';

// Dernière PR (toutes états confondus) pour une branche.
export const prFor = (branch) => ghJson('pr', 'view', branch, '--json', 'number,url,state,headRefOid');
export const openPrFor = (branch) => {
  const pr = prFor(branch);
  return pr?.state === 'OPEN' ? pr : null;
};

let me;
export const viewer = () => (me ??= ghJson('api', 'user')?.login ?? '');

// Reviewers (ship.config.json) : "auto" = les autres collaborateurs du repo, sinon la liste fixe. Jamais soi-même.
export const reviewers = () => {
  const wanted = config().reviewers;
  const logins = wanted === 'auto' ? ghJson('api', 'repos/{owner}/{repo}/collaborators', '--jq', '[.[].login]') ?? [] : wanted;
  return logins.filter((l) => l !== viewer());
};

// Labels (ship.config.json) existant dans le repo, choisis selon le type ; « ui » si des .vue changent.
export const labelsFor = (plan, files) => {
  const { labels } = config();
  const existing = new Set((ghJson('label', 'list', '--limit', '200', '--json', 'name') ?? []).map((l) => l.name));
  const wanted = [labels[plan.type], files.some((f) => f.endsWith('.vue')) && labels.ui];
  return [...new Set(wanted.filter((l) => l && existing.has(l)))];
};

// Branche courante dont la PR est mergée → retour sur la base à jour + suppression de la branche.
// Les modifications non commitées voyagent avec (stash si nécessaire).
export const leaveMergedBranch = (base, branch) => {
  const pr = prFor(branch);
  if (pr?.state !== 'MERGED') return false;
  info(`PR #${pr.number} de ${c.cyan(branch)} mergée — retour sur ${base} à jour.`);

  const dirty = statusEntries().length > 0;
  if (dirty && !gitTry('stash', 'push', '--include-untracked', '-m', `ship-it: depuis ${branch}`).ok) {
    warn('Impossible de mettre tes modifications de côté — on reste sur la branche.');
    return false;
  }
  git('switch', base);
  if (!gitTry('merge', '--ff-only', '--quiet', `origin/${base}`).ok) {
    warn(`Ta ${base} locale a divergé d'origin/${base} — non mise à jour (aucun commit touché).`);
  }
  if (dirty && !gitTry('stash', 'pop').ok) {
    warn('Tes modifications sont en conflit avec la nouvelle base : elles restent dans « git stash list » (rien n\'est perdu).');
  }
  // Squash merge → git branch -d refuse : on vérifie nous-mêmes que la branche n'a rien de plus que la PR.
  const tip = gitTry('rev-parse', branch).out;
  if (tip === pr.headRefOid || gitTry('merge-base', '--is-ancestor', branch, pr.headRefOid).ok) {
    git('branch', '-D', branch);
    info(`Branche locale ${branch} supprimée.`);
  } else {
    warn(`${branch} contient des commits ajoutés après le merge — branche conservée.`);
  }
  return true;
};

// Autres branches locales dont la PR est mergée et qui n'ont rien de plus : supprimées sans bruit.
export const pruneMergedBranches = (base, keep) => {
  const merged = ghJson('pr', 'list', '--author', '@me', '--state', 'merged', '--limit', '50', '--json', 'headRefName,headRefOid') ?? [];
  const local = new Set(git('for-each-ref', '--format=%(refname:short)', 'refs/heads').split('\n'));
  const pruned = [];
  for (const { headRefName, headRefOid } of merged) {
    if (!local.has(headRefName) || headRefName === base || headRefName === keep) continue;
    if (!gitTry('merge-base', '--is-ancestor', headRefName, headRefOid).ok) continue;
    if (gitTry('branch', '-D', headRefName).ok) pruned.push(headRefName);
  }
  if (pruned.length) info(`Branches mergées nettoyées : ${pruned.join(', ')}`);
};

// CI : résumé de statusCheckRollup → { ok, failed, pending }.
export const checksOf = (rollup = []) => {
  const out = { ok: 0, failed: 0, pending: 0 };
  for (const ck of rollup) {
    const state = (ck.conclusion || ck.state || ck.status || '').toUpperCase();
    if (['SUCCESS', 'NEUTRAL', 'SKIPPED'].includes(state)) out.ok++;
    else if (['FAILURE', 'ERROR', 'CANCELLED', 'TIMED_OUT', 'ACTION_REQUIRED', 'STARTUP_FAILURE'].includes(state)) out.failed++;
    else out.pending++;
  }
  return out;
};
