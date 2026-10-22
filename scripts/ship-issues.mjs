// Ship-it — lien PR ↔ issue : numéro détecté (branche, commits, diff), sinon menu de tes issues assignées.
import { config } from './ship-config.mjs';
import { c, ghJson, gitTry, select } from './ship-utils.mjs';

const REF = /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?|refs?|issue)\s*:?\s*#(\d+)\b/gi;

const candidates = ({ base, branch, entries }) => {
  const found = new Set();
  const fromBranch = branch?.match(/(?:^|\/)(?:issue-|gh-|#)?(\d+)(?:-|$)/);
  if (fromBranch) found.add(Number(fromBranch[1]));
  const messages = gitTry('log', `origin/${base}..HEAD`, '--format=%B').out;
  const added = entries.flatMap((e) => e.added.map((l) => l.text)).join('\n');
  for (const text of [messages, added]) for (const m of text.matchAll(REF)) found.add(Number(m[1]));
  return [...found];
};

// → { number, title } | null
export const pickIssue = async (io, ctx) => {
  if (!config().issues.link) return null;

  for (const n of candidates(ctx)) {
    const issue = ghJson('issue', 'view', String(n), '--json', 'number,title,state');
    if (issue?.state === 'OPEN') {
      console.log(`\n${c.bold('Issue détectée')} : #${issue.number} ${issue.title}`);
      const i = await select(io, 'Lier cette issue à la PR ?', [`Oui — ${config().issues.keyword} #${issue.number}`, 'Non']);
      return i === 0 ? issue : null;
    }
  }

  const mine = ghJson('issue', 'list', '--assignee', '@me', '--state', 'open', '--limit', '15', '--json', 'number,title') ?? [];
  if (!mine.length) return null;
  console.log('');
  const i = await select(io, 'Cette PR règle une de tes issues ?', ['Aucune', ...mine.map((m) => `#${m.number} ${m.title}`)]);
  return i === 0 ? null : mine[i - 1];
};
