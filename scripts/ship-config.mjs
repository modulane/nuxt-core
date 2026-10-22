// Ship-it — config d'équipe (ship.config.json à la racine, optionnel) : valeurs par défaut + validation.
import { existsSync, readFileSync } from 'node:fs';
import { fail } from './ship-utils.mjs';

export const DEFAULTS = {
  base: null, // null = branche par défaut d'origin
  cleanup: ['format', 'lint:fix'],
  gates: ['lint', 'typecheck', 'test'],
  labels: { feat: 'enhancement', fix: 'bug', docs: 'documentation', ui: 'accessibility' },
  reviewers: 'auto', // "auto" = les autres collaborateurs, ou une liste de logins
  split: true,
  codeDirs: ['app', 'server', 'shared', 'layers', 'modules', 'packages', 'plugins', 'middleware', 'composables', 'components', 'pages', 'layouts', 'utils'],
  issues: { link: true, keyword: 'Closes' },
  secrets: { ignorePaths: [] },
};

const isStrList = (v) => Array.isArray(v) && v.every((s) => typeof s === 'string' && s.trim());

// clé → [prédicat, description attendue pour le message d'erreur]
const CHECKS = {
  base: [(v) => v === null || (typeof v === 'string' && v.trim() !== ''), 'une branche (texte) ou null'],
  cleanup: [isStrList, 'une liste de noms de scripts package.json'],
  gates: [isStrList, 'une liste de noms de scripts package.json'],
  labels: [(v) => typeof v === 'object' && !Array.isArray(v) && Object.values(v).every((l) => typeof l === 'string'),
    'un objet { type: "label" } (clé "ui" = label si des .vue changent)'],
  reviewers: [(v) => v === 'auto' || isStrList(v), '"auto" ou une liste de logins GitHub'],
  split: [(v) => typeof v === 'boolean', 'true ou false'],
  codeDirs: [isStrList, 'une liste de dossiers (ex : ["app", "server"])'],
  issues: [(v) => typeof v.link === 'boolean' && ['Closes', 'Fixes', 'Resolves', 'Refs'].includes(v.keyword),
    '{ "link": true|false, "keyword": "Closes"|"Fixes"|"Resolves"|"Refs" }'],
  secrets: [(v) => Array.isArray(v.ignorePaths) && (v.ignorePaths.length === 0 || isStrList(v.ignorePaths)),
    '{ "ignorePaths": ["chemin/ou/**/glob"] }'],
};

let cached;
export const config = () => {
  if (cached) return cached;
  if (!existsSync('ship.config.json')) return (cached = DEFAULTS);

  let raw;
  try { raw = JSON.parse(readFileSync('ship.config.json', 'utf8')); } catch (e) { fail(`ship.config.json illisible : ${e.message}`); }
  const merged = { ...DEFAULTS };
  for (const [key, value] of Object.entries(raw)) {
    if (key === '$schema') continue;
    if (!(key in CHECKS)) fail(`ship.config.json : clé inconnue « ${key} » (attendu : ${Object.keys(CHECKS).join(', ')}).`);
    const isObject = ['labels', 'issues', 'secrets'].includes(key);
    if (isObject && (typeof value !== 'object' || value === null || Array.isArray(value))) {
      fail(`ship.config.json : « ${key} » doit être ${CHECKS[key][1]}.`);
    }
    const v = isObject ? { ...DEFAULTS[key], ...value } : value;
    const [valid, expected] = CHECKS[key];
    if (!valid(v)) fail(`ship.config.json : « ${key} » doit être ${expected}.`);
    merged[key] = v;
  }
  return (cached = merged);
};

// Glob simple (*, **) → RegExp, pour secrets.ignorePaths.
export const globToRegExp = (glob) => new RegExp(`^${glob
  .replace(/[.+^${}()|[\]\\]/g, '\\$&')
  .replace(/\*\*\/?/g, '\u0000')
  .replace(/\*/g, '[^/]*')
  .replace(/\u0000/g, '.*')}$`);
