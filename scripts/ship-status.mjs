#!/usr/bin/env node
// Ship-it status — tes PR ouvertes + celles où ta review est demandée, sans ouvrir GitHub.
import { config } from './ship-config.mjs';
import { count, currentBranch, defaultBase, statusEntries } from './ship-git.mjs';
import { checksOf } from './ship-github.mjs';
import { ShipError, banner, c, fail, ghJson, ghTry, git, gitTry } from './ship-utils.mjs';

const FIELDS = 'number,title,url,headRefName,isDraft,reviewDecision,statusCheckRollup,mergeable,comments,author,updatedAt';

const ago = (iso) => {
  const min = Math.round((Date.now() - new Date(iso)) / 60_000);
  if (min < 60) return `il y a ${min} min`;
  if (min < 48 * 60) return `il y a ${Math.round(min / 60)} h`;
  return `il y a ${Math.round(min / 1440)} j`;
};

const ciLine = (rollup) => {
  const { ok, failed, pending } = checksOf(rollup);
  if (!ok && !failed && !pending) return c.dim('CI —');
  if (failed) return c.red(`CI ✗ ${failed} échec(s)`) + c.dim(` · ${ok} ok${pending ? ` · ${pending} en cours` : ''}`);
  if (pending) return c.yellow(`CI … ${pending} en cours`) + c.dim(` · ${ok} ok`);
  return c.green(`CI ✓ ${ok}`);
};

const REVIEW = {
  APPROVED: () => c.green('approuvée'),
  CHANGES_REQUESTED: () => c.red('changements demandés'),
  REVIEW_REQUIRED: () => c.yellow('review en attente'),
};

const printPr = (pr, { showAuthor = false } = {}) => {
  const draft = pr.isDraft ? c.dim(' [draft]') : '';
  const who = showAuthor ? c.dim(` par ${pr.author.login}`) : '';
  console.log(`\n  ${c.bold(`#${pr.number}`)} ${pr.title}${draft}${who}`);
  const review = REVIEW[pr.reviewDecision]?.() ?? c.dim('pas de review requise');
  const comments = pr.comments?.length ? ` · 💬 ${pr.comments.length}` : '';
  const conflict = pr.mergeable === 'CONFLICTING' ? ` · ${c.red('conflit avec la base')}` : '';
  console.log(`     ${ciLine(pr.statusCheckRollup)} · ${review}${comments}${conflict} · ${c.dim(ago(pr.updatedAt))}`);
  console.log(`     ${c.dim(pr.headRefName)}  ${c.cyan(pr.url)}`);
  // Prochaine action suggérée.
  const { failed } = checksOf(pr.statusCheckRollup);
  if (!showAuthor) {
    if (pr.mergeable === 'CONFLICTING') console.log(`     → ${c.yellow(`git switch ${pr.headRefName} && yarn ship`)} ${c.dim('(rebase automatique)')}`);
    else if (failed) console.log(`     → ${c.yellow(`gh pr checks ${pr.number}`)} ${c.dim('pour voir la CI en échec')}`);
    else if (pr.reviewDecision === 'APPROVED') console.log(`     → ${c.green('prête à merger')}`);
  } else {
    console.log(`     → ${c.yellow(`gh pr checkout ${pr.number}`)} ${c.dim('pour la tester en local')}`);
  }
};

const main = () => {
  if (!gitTry('rev-parse', '--show-toplevel').ok) fail('Pas dans un dépôt git.');
  process.chdir(git('rev-parse', '--show-toplevel'));
  if (!ghTry('auth', 'status').ok) fail('gh non authentifié : tape « gh auth login ».');

  const base = config().base ?? defaultBase();
  gitTry('fetch', '--quiet', 'origin');
  banner('status');

  const branch = currentBranch() || '(HEAD détachée)';
  const dirty = statusEntries().length;
  const behind = count(`HEAD..origin/${base}`);
  console.log(`  local : ${c.cyan(branch)}${dirty ? ` · ${c.yellow(`${dirty} fichier(s) modifié(s)`)}` : c.dim(' · propre')}${behind ? ` · ${c.yellow(`${behind} commit(s) de retard sur ${base}`)}` : ''}`);

  const mine = ghJson('pr', 'list', '--author', '@me', '--state', 'open', '--json', FIELDS) ?? [];
  console.log(`\n${c.bold(`Mes PR ouvertes (${mine.length})`)}`);
  if (!mine.length) console.log(c.dim('  aucune'));
  for (const pr of mine) printPr(pr);

  const toReview = ghJson('pr', 'list', '--search', 'review-requested:@me', '--state', 'open', '--json', FIELDS) ?? [];
  console.log(`\n${c.bold(`À reviewer (${toReview.length})`)}`);
  if (!toReview.length) console.log(c.dim('  rien en attente'));
  for (const pr of toReview) printPr(pr, { showAuthor: true });
  console.log('');
};

try {
  main();
} catch (e) {
  console.error(`\n⛔ ${c.red(e instanceof ShipError ? e.message : `Erreur inattendue : ${e.message}`)}`);
  process.exitCode = 1;
}
