// Ship-it — journal local (.ship/history.jsonl, ignoré par git) : diagnostic + source de ship:undo.
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { gitTry } from './ship-utils.mjs';

const DIR = '.ship';
const FILE = `${DIR}/history.jsonl`;

// event : { type: 'ship' | 'fail' | 'undo', ... } — horodaté et signé (git user.name).
export const logEvent = (event) => {
  try {
    if (!existsSync(DIR)) mkdirSync(DIR);
    const entry = { at: new Date().toISOString(), user: gitTry('config', 'user.name').out, ...event };
    appendFileSync(FILE, `${JSON.stringify(entry)}\n`);
  } catch { /* le journal ne doit jamais faire échouer un ship */ }
};

export const readLog = () => {
  if (!existsSync(FILE)) return [];
  return readFileSync(FILE, 'utf8').split('\n').filter(Boolean).flatMap((l) => {
    try { return [JSON.parse(l)]; } catch { return []; }
  });
};

// Ships pas encore annulés, du plus récent au plus ancien.
export const undoableShips = () => {
  const events = readLog();
  const undone = new Set(events.filter((e) => e.type === 'undo').map((e) => e.pr));
  return events.filter((e) => e.type === 'ship' && e.pr && !undone.has(e.pr)).reverse();
};
