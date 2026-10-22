// Ship-it — lecture et manipulation de l'état git (partagé par ship, status, doctor).
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { git, gitTry, run } from './ship-utils.mjs';

const DIFF_BUDGET = 60_000; // caractères envoyés à l'IA
const QP = ['-c', 'core.quotepath=false'];

export const statusEntries = (paths = []) => {
  const raw = run('git', [...QP, 'status', '--porcelain=v1', '-z', '-uall'], { raw: true }).out;
  const parts = raw.split('\0').filter(Boolean);
  const entries = [];
  for (let i = 0; i < parts.length; i++) {
    const xy = parts[i].slice(0, 2);
    entries.push({ xy, path: parts[i].slice(3) });
    if (xy[0] === 'R' || xy[0] === 'C') i++; // -z : l'ancien chemin suit le nouveau
  }
  return paths.length ? entries.filter((e) => paths.includes(e.path)) : entries;
};

export const count = (range) => Number(gitTry('rev-list', '--count', range).out || 0);
export const mergeBase = (base) => gitTry('merge-base', `origin/${base}`, 'HEAD').out || 'HEAD';
export const currentBranch = () => gitTry('branch', '--show-current').out;
export const defaultBase = () => (gitTry('symbolic-ref', '--short', 'refs/remotes/origin/HEAD').out || 'origin/main').replace(/^origin\//, '');

export const operationInProgress = () => {
  const gitDir = git('rev-parse', '--git-dir');
  return ['MERGE_HEAD', 'rebase-merge', 'rebase-apply', 'CHERRY_PICK_HEAD'].some((f) => existsSync(join(gitDir, f)));
};

export const readText = (path) => {
  try {
    const content = readFileSync(path, 'utf8');
    return content.includes('\0') ? null : content; // binaire → null
  } catch { return null; }
};

// Diff unifié → Map path → { added: [{ line, text }], removed: [text] } (numéros de ligne du nouveau fichier).
export const parseDiff = (text) => {
  const files = new Map();
  let cur = null;
  let line = 0;
  let inHunk = false;
  for (const raw of text.split('\n')) {
    if (raw.startsWith('diff --git ')) { cur = null; inHunk = false; continue; }
    if (!inHunk && raw.startsWith('+++ ')) {
      const p = raw.slice(4).replace(/\t$/, '');
      cur = p === '/dev/null' ? null : p.replace(/^b\//, '');
      if (cur && !files.has(cur)) files.set(cur, { added: [], removed: [] });
      continue;
    }
    const hunk = raw.match(/^@@ -\d+(?:,\d+)? \+(\d+)/);
    if (hunk) { line = Number(hunk[1]); inHunk = true; continue; }
    if (!inHunk) continue;
    if (raw.startsWith('+')) { files.get(cur)?.added.push({ line, text: raw.slice(1) }); line++; }
    else if (raw.startsWith('-')) files.get(cur)?.removed.push(raw.slice(1));
    else if (raw.startsWith(' ')) line++;
  }
  return files;
};

// Tout ce qui diffère de la base (commité ou non), éventuellement restreint à `paths` :
// entries [{ path, status: A|M|D, add, del, added, removed }] + diff brut (tronqué) pour l'IA.
export const collectChanges = (base, paths = []) => {
  const spec = paths.length ? ['--', ...paths] : [];
  const status = statusEntries(paths);
  const from = mergeBase(base);
  const diffArgs = ['diff', '--no-renames', '--no-color', '--no-ext-diff'];
  const z = (...args) => run('git', [...QP, ...diffArgs, '-z', ...args, from, ...spec], { raw: true })
    .out.split('\0').filter(Boolean);

  const byPath = new Map();
  const nameStatus = z('--name-status');
  for (let i = 0; i < nameStatus.length; i += 2) {
    const s = nameStatus[i][0];
    byPath.set(nameStatus[i + 1], { path: nameStatus[i + 1], status: s === 'A' ? 'A' : s === 'D' ? 'D' : 'M', add: 0, del: 0 });
  }
  for (const line of z('--numstat')) {
    const [add, del, path] = line.split('\t');
    if (byPath.has(path)) Object.assign(byPath.get(path), { add: Number(add) || 0, del: Number(del) || 0 });
  }

  const fullDiff = run('git', [...QP, ...diffArgs, from, ...spec], { raw: true }).out;
  const parsed = parseDiff(fullDiff);
  let diff = fullDiff.slice(0, DIFF_BUDGET);

  for (const { path } of status.filter((e) => e.xy === '??')) {
    const text = readText(path);
    const lines = text ? text.split(/\r?\n/) : [];
    byPath.set(path, { path, status: 'A', add: lines.length, del: 0 });
    if (text) {
      parsed.set(path, { added: lines.map((t, i) => ({ line: i + 1, text: t })), removed: [] });
      if (diff.length < DIFF_BUDGET) diff += `\n--- new file: ${path}\n${text.slice(0, 4_000)}`;
    }
  }

  const entries = [...byPath.values()]
    .map((e) => ({ ...e, added: parsed.get(e.path)?.added ?? [], removed: parsed.get(e.path)?.removed ?? [] }))
    .sort((a, b) => a.path.localeCompare(b.path));
  const files = entries.map((e) => e.path);
  return { status, entries, files, diff: diff.slice(0, DIFF_BUDGET), touchesPackages: files.some((f) => f.startsWith('packages/')) };
};

export const uniqueBranch = (name) => {
  const taken = (b) => gitTry('show-ref', '--verify', '--quiet', `refs/heads/${b}`).ok
    || Boolean(gitTry('ls-remote', '--heads', 'origin', b).out);
  let candidate = name;
  for (let i = 2; taken(candidate); i++) candidate = `${name}-${i}`;
  return candidate;
};

export const remoteBranchExists = (branch) => Boolean(gitTry('ls-remote', '--heads', 'origin', branch).out);

// Rebase sur origin/<base> si elle a avancé. → 'up-to-date' | 'rebased' | 'conflict' (rebase annulé, rien de perdu).
export const syncWithBase = (base) => {
  if (count(`HEAD..origin/${base}`) === 0) return 'up-to-date';
  const r = gitTry('rebase', '--autostash', `origin/${base}`);
  if (r.ok) return 'rebased';
  gitTry('rebase', '--abort');
  return 'conflict';
};
