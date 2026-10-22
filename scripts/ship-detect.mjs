// Ship-it — détection déterministe : fichiers + stats du diff → plan proposé (sans IA).
import { branchFor, titleFor } from './ship-agent.mjs';
import { config } from './ship-config.mjs';
import { readText } from './ship-git.mjs';
import { LOCKFILE } from './ship-utils.mjs';

const SUBJECT_MAX = 60;
let codeDirs;
const isCodeDir = (p) => (codeDirs ??= new RegExp(`^(${config().codeDirs.map((d) => d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})/`)).test(p);

// Catégorie d'un fichier → type conventional commit (code = feat/fix/refactor, décidé plus bas).
const categoryOf = (path) => {
  const p = path.toLowerCase();
  if (/(^|\/)(tests?|__tests__)\//.test(p) || /\.(test|spec)\.[cm]?[jt]sx?$/.test(p)) return 'test';
  if (p.endsWith('.md') || p.startsWith('docs/')) return 'docs';
  if (/\.(s?css|sass|less)$/.test(p)) return 'style';
  if (isCodeDir(p) && /\.(vue|[cm]?[jt]sx?)$/.test(p)) return 'code';
  return 'chore';
};

// ── Symboles du diff (titres précis sans IA) ──────────────────────────────
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const uniq = (list) => [...new Set(list.filter(Boolean))];

// Pour un .vue : bloc (script | template | style) de chaque ligne, et lignes situées dans la déclaration des props.
const analyzeFile = (path) => {
  const text = readText(path) ?? '';
  const zones = [];
  const propLines = new Set();
  let zone = path.endsWith('.vue') ? 'other' : 'script';
  let inProps = false;
  text.split(/\r?\n/).forEach((l, idx) => {
    const n = idx + 1;
    if (path.endsWith('.vue')) {
      if (/^\s*<script\b/.test(l)) zone = 'script';
      else if (/^<template\b/.test(l)) zone = 'template';
      else if (/^\s*<style\b/.test(l)) zone = 'style';
    }
    zones[n] = zone;
    if (/defineProps\s*(<\s*\{|\(\s*\{)|interface\s+\w*Props\b[^{]*\{|withDefaults\s*\(/.test(l)) inProps = true;
    else if (inProps && /^\s*\}/.test(l)) inProps = false;
    else if (inProps) propLines.add(n);
    if (/<\/script>|<\/style>|^<\/template>/.test(l)) zone = 'other';
  });
  return { zoneOf: (n) => zones[n] ?? 'other', propLines };
};

const KEY_NAMES = { esc: 'escape', escape: 'escape', enter: 'enter', tab: 'tab', space: 'space', ' ': 'space', arrowup: 'arrow up', arrowdown: 'arrow down', up: 'arrow up', down: 'arrow down' };

const symbolFacts = (entry) => {
  const { zoneOf, propLines } = analyzeFile(entry.path);
  const added = entry.added.map((l) => ({ ...l, zone: zoneOf(l.line) }));
  const script = added.filter((l) => l.zone === 'script');
  const removed = entry.removed.join('\n');
  const isNew = (name) => !new RegExp(`\\b${escapeRe(name)}\\b`).test(removed);
  const matchAll = (lines, re) => uniq(lines.flatMap((l) => [...l.text.matchAll(re)].map((m) => m[1])));

  const props = uniq(script.filter((l) => propLines.has(l.line))
    .map((l) => l.text.match(/^\s*['"]?([A-Za-z_]\w*)['"]?\??\s*:/)?.[1])).filter(isNew);
  const emits = matchAll(script, /(?:\(\s*e\s*:\s*|emit\(\s*)['"]([\w:-]+)['"]/g).filter(isNew);
  const exports = matchAll(script, /^\s*export\s+(?:default\s+)?(?:async\s+)?(?:function\*?|const|let|class|interface|type|enum)\s+(\w+)/g).filter(isNew);
  const keys = uniq([...matchAll(added, /@key(?:down|up|press)\.(\w+)/g), ...matchAll(added, /\bkey\s*===?\s*['"]([^'"]+)['"]/g)]
    .map((k) => KEY_NAMES[k.toLowerCase()] ?? k.toLowerCase()));
  const fixComment = added.map((l) => l.text.match(/(?:\/\/|\/\*+|<!--|#)\s*(?:fix(?:e[sd])?|bug(?:fix)?)\s*[:\-–]\s*(.+?)\s*(?:\*\/|-->)?\s*$/i)?.[1])
    .find(Boolean);
  const styleOnly = entry.path.endsWith('.vue') && added.length > 0 && added.every((l) => l.zone === 'style');
  return { props, emits, exports, keys, fixComment, styleOnly };
};

const plural1 = (list, word) => `${word}${list.length > 1 ? 's' : ''}`;
const listShort = (list) => listJoin(list.length > 3 ? [...list.slice(0, 2), `${list.length - 2} more`] : list);

// Sujet précis pour un fichier de code unique, ou null si rien de plus parlant que le sujet générique.
const preciseSubject = (type, entry, facts, label) => {
  const lower = (s) => s.charAt(0).toLowerCase() + s.slice(1);
  const options = type === 'fix'
    ? [
      facts.fixComment && lower(facts.fixComment.replace(/\.$/, '')),
      facts.keys.length && `handle ${listShort(facts.keys)} ${plural1(facts.keys, 'key')} in ${label}`,
    ]
    : [
      facts.props.length && `add ${listShort(facts.props)} ${plural1(facts.props, 'prop')} to ${label}`,
      facts.emits.length && `add ${listShort(facts.emits)} ${plural1(facts.emits, 'event')} to ${label}`,
      facts.keys.length && `add ${listShort(facts.keys)} key support to ${label}`,
      entry.status !== 'A' && facts.exports.length && `add ${listShort(facts.exports)} to ${label}`,
    ];
  return options.find((s) => s && s.length <= SUBJECT_MAX) ?? null;
};

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/^_/, '').toLowerCase();

// { label, noun } : "button" + "component". noun vide = nom autonome (README, devcontainer…).
// Regroupement : 2 du même noun → "button and card components", 3+ → "3 components".
const describe = (path) => {
  const p = path.toLowerCase();
  const file = path.split('/').pop();
  const stem = file.replace(/\.[^.]+$/, '');
  const k = kebab(stem);
  if (p.startsWith('.github/workflows/')) return { label: k, noun: 'workflow' };
  if (p.startsWith('.github/issue_template/')) return { label: 'issue forms', noun: '' };
  if (/(^|\/)ship\.config(\.schema)?\.json$/.test(p)) return { label: 'ship config', noun: '' };
  if (p.startsWith('.devcontainer/')) return { label: 'devcontainer', noun: '' };
  if (p.endsWith('pull_request_template.md')) return { label: 'pull request template', noun: '' };
  if (p.endsWith('contributing.md')) return { label: 'contributing guide', noun: '' };
  if (p === 'readme.md') return { label: 'README', noun: '' };
  if (p.startsWith('scripts/')) return { label: k, noun: 'script' };
  if (/\/components\//.test(p)) return { label: k, noun: 'component' };
  if (/\/composables\//.test(p)) return { label: stem, noun: 'composable' };
  if (/\/pages\//.test(p)) return { label: k, noun: 'page' };
  if (/\/layouts\//.test(p)) return { label: k, noun: 'layout' };
  if (/\/middleware\//.test(p)) return { label: k, noun: 'middleware' };
  if (p.startsWith('server/api/')) return { label: stem.split('.')[0], noun: 'API endpoint' };
  if (/\/types\//.test(p)) return { label: k, noun: 'types' };
  if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(p)) return { label: k.replace(/\.(test|spec)$/, ''), noun: 'tests' };
  if (/\.(s?css|sass|less)$/.test(p)) return { label: k, noun: 'styles' };
  if (p.endsWith('.md')) return { label: k, noun: 'docs' };
  if (/^(yarn\.lock|package-lock\.json|pnpm-lock\.yaml)$/.test(p)) return { label: 'dependencies', noun: '' };
  return { label: file, noun: '' };
};

const plural = (noun) => (/(s|ware)$/.test(noun) ? noun : `${noun}s`);
const listJoin = (list) => (list.length <= 1 ? list.join('') : `${list.slice(0, -1).join(', ')} and ${list.at(-1)}`);

// Entrées triées par poids → "10 workflows, ship script and devcontainer" (tronqué à max → "… and more").
const phrase = (entries, max = Infinity) => {
  const groups = new Map(); // noun → { labels, weight }
  for (const e of entries) {
    const { label, noun } = describe(e.path);
    const key = noun || `#${label}`;
    if (!groups.has(key)) groups.set(key, { noun, labels: new Set(), weight: 0 });
    const g = groups.get(key);
    g.labels.add(label);
    g.weight += e.add + e.del + 1;
  }
  const items = [...groups.values()].sort((a, b) => b.weight - a.weight).map(({ noun, labels }) => {
    if (!noun) return [...labels][0];
    if (labels.size >= 3) {
      // Préfixe commun sur un mot entier : ship, ship-agent, ship-git… → "16 ship scripts"
      const [first] = labels;
      const prefix = first.split('-')[0];
      const shared = [...labels].every((l) => l === prefix || l.startsWith(`${prefix}-`));
      return `${labels.size} ${shared ? `${prefix} ` : ''}${plural(noun)}`;
    }
    return labels.size === 2 ? `${[...labels].join(' and ')} ${plural(noun)}` : `${[...labels][0]} ${noun}`;
  });
  let kept = items;
  while (kept.length > 1 && listJoin(kept).length > max) kept = kept.slice(0, -1);
  return kept.length < items.length ? `${kept.join(', ')} and more` : listJoin(kept);
};

const VERB = { A: 'add', M: 'update', D: 'remove' };

// Statut qui pèse le plus (en lignes) dans la catégorie dominante → verbe + entrées concernées.
const dominantAction = (entries) => {
  const byStatus = Object.groupBy(entries, (e) => e.status);
  const weight = (list) => list.reduce((n, e) => n + e.add + e.del + 1, 0);
  const status = Object.keys(byStatus).sort((a, b) => weight(byStatus[b]) - weight(byStatus[a]))[0];
  return { verb: VERB[status], subjectEntries: byStatus[status] };
};

// Signaux dans le contenu du diff : nouvelle surface d'API → feat ; vocabulaire de correction → fix.
const API_RE = /\b(defineProps|defineEmits|defineModel|defineSlots|defineExpose|defineNuxtPlugin|defineEventHandler|defineNuxtRouteMiddleware|defineNuxtComponent)\b|^\s*export\s+(default|async\s+function|function|const|let|class|interface|type|enum)\b/;
const FIX_RE = /\b(fix(es|ed)?|bug|regression|workaround|hotfix|prevent(s|ed)?|avoid(s|ed)?|issue\s*#?\d+)\b/i;

const codeType = (main, all, facts) => {
  const score = { feat: 0, fix: 0, refactor: 0 };
  const why = [];
  const bump = (type, n, reason) => { if (n > 0) { score[type] += n; why.push(reason); } };

  const added = main.flatMap((e) => e.added.map((l) => l.text));
  const removed = main.flatMap((e) => e.removed);
  const add = main.reduce((n, e) => n + e.add, 0);
  const del = main.reduce((n, e) => n + e.del, 0);
  const newFiles = main.filter((e) => e.status === 'A').length;
  const netApi = added.filter((t) => API_RE.test(t)).length - removed.filter((t) => API_RE.test(t)).length;
  const fixWords = added.filter((t) => FIX_RE.test(t)).length;
  const newTests = all.some((e) => e.status === 'A' && categoryOf(e.path) === 'test');

  bump('feat', 3 * newFiles, `${newFiles} nouveau(x) fichier(s) de code`);
  bump('feat', 2 * Math.min(netApi, 3), `+${netApi} déclaration(s) exportée(s) / props / handlers`);
  const newSurface = facts.reduce((n, f) => n + f.props.length + f.emits.length, 0);
  bump('feat', 3 * Math.min(newSurface, 3), `${newSurface} nouvelle(s) prop(s) / event(s)`);
  bump('feat', add > 2 * del && add > 20 ? 1 : 0, 'surtout des ajouts');
  bump('fix', 2 * Math.min(fixWords, 3), `vocabulaire de correction (${fixWords} ligne(s) : fix, bug, prevent…)`);
  bump('fix', !newFiles && add + del <= 20 ? 1 : 0, 'petite modification ciblée');
  bump('fix', !newFiles && newTests ? 1 : 0, 'test ajouté sans nouveau code (régression ?)');
  bump('refactor', del > add ? 2 : 0, 'plus de suppressions que d\'ajouts');
  bump('refactor', !newFiles && netApi === 0 && add + del > 20 && Math.abs(add - del) < 0.25 * (add + del) ? 2 : 0,
    'restructuration équilibrée sans nouvelle API');

  // Égalité → feat > fix > refactor ; aucun signal → fix (modification de code existant).
  const type = ['feat', 'fix', 'refactor'].reduce((best, t) => (score[t] > score[best] ? t : best), 'feat');
  return { type: score[type] > 0 ? type : 'fix', why: why.length ? why : ['modification de code existant'] };
};

// Grands sujets pour proposer un split en plusieurs PR.
const TOPIC_LABELS = { app: 'Application (code, styles, tests)', tooling: 'Outillage / CI / config', docs: 'Documentation' };
export const splitGroups = (entries) => {
  const topicOf = (e) => ({ docs: 'docs', chore: 'tooling' }[categoryOf(e.path)] ?? 'app');
  const groups = Object.groupBy(entries, topicOf);
  // Une dépendance ajoutée sert le code qui l'utilise : package.json + lockfile suivent l'application.
  if (groups.app && groups.tooling) {
    const deps = groups.tooling.filter((e) => /(^|\/)package\.json$/.test(e.path) || LOCKFILE.test(e.path));
    groups.app.push(...deps);
    groups.tooling = groups.tooling.filter((e) => !deps.includes(e));
    if (!groups.tooling.length) delete groups.tooling;
  }
  return Object.entries(groups).map(([topic, list]) => ({ topic, label: TOPIC_LABELS[topic], entries: list }));
};

// entries : [{ path, status: 'A'|'M'|'D', add, del, added, removed }]
export const detectPlan = (rawEntries) => {
  // Un lockfile pèse des milliers de lignes générées : il ne doit jamais dicter le titre.
  const entries = rawEntries.map((e) => (LOCKFILE.test(e.path) ? { ...e, add: 0, del: 0 } : e));
  // De la prose fait vite beaucoup de lignes : la doc compte moitié.
  const weight = (list) => list.reduce((n, e) => n + (e.add + e.del + 1) * (categoryOf(e.path) === 'docs' ? 0.5 : 1), 0);
  const groups = Object.groupBy(entries, (e) => categoryOf(e.path));

  // Le code l'emporte toujours ; sinon la catégorie qui pèse le plus de lignes.
  const dominant = groups.code
    ? 'code'
    : Object.keys(groups).sort((a, b) => weight(groups[b]) - weight(groups[a]))[0];
  const main = groups[dominant];

  // Code : on lit les symboles du diff (type + titre précis).
  const facts = dominant === 'code' ? main.map((e) => ({ entry: e, facts: symbolFacts(e) })) : [];
  let type = dominant;
  let why = [`surtout des fichiers « ${dominant} » (${main.length}/${entries.length})`];
  if (dominant === 'code') ({ type, why } = codeType(main, entries, facts.map((f) => f.facts)));

  const { verb, subjectEntries } = dominantAction(main);
  let subject = `${verb} ${phrase(subjectEntries, SUBJECT_MAX - verb.length - 1)}`;

  if (dominant === 'code') {
    if (facts.every((f) => f.facts.styleOnly)) {
      type = 'style';
      subject = `update ${phrase(main, SUBJECT_MAX - 14)} styles`;
      why = ['seuls les blocs <style> des composants changent'];
    } else if (main.length === 1) {
      const [{ entry, facts: f }] = facts;
      const precise = preciseSubject(type, entry, f, phrase([entry]));
      if (precise) subject = precise;
      const found = [
        f.props.length && `props : ${f.props.join(', ')}`,
        f.emits.length && `events : ${f.emits.join(', ')}`,
        f.exports.length && `exports : ${f.exports.join(', ')}`,
        f.keys.length && `touches : ${f.keys.join(', ')}`,
        f.fixComment && `commentaire « ${f.fixComment} »`,
      ].filter(Boolean);
      why = [...why, ...found];
    }
  }

  // Résumé : tout ce qui a changé, toutes catégories confondues.
  const byStatus = Object.groupBy(entries, (e) => e.status);
  const sentence = (s, label) => (byStatus[s] ? `${label} ${phrase(byStatus[s])}.` : '');
  const add = entries.reduce((n, e) => n + e.add, 0);
  const del = entries.reduce((n, e) => n + e.del, 0);
  const summary = [
    sentence('A', 'Adds'), sentence('M', 'Updates'), sentence('D', 'Removes'),
    `${entries.length} file(s) changed (+${add} / -${del}).`,
  ].filter(Boolean).join(' ');

  const has = (re) => entries.some((e) => re.test(e.path));
  const risks = [
    (has(/(^|\/)package\.json$/) || has(LOCKFILE)) && 'dependency or package config changes',
    has(/^\.github\/workflows\//) && 'CI workflow changes',
    has(/^nuxt\.config\.|^tsconfig/) && 'build config changes',
    byStatus.D && `removes ${byStatus.D.length} file(s)`,
  ].filter(Boolean).join(', ') || 'none';
  const removedCode = (byStatus.D ?? []).filter((e) => categoryOf(e.path) === 'code');

  return {
    type,
    title: titleFor(type, subject),
    branch: branchFor(type, subject),
    summary,
    risks,
    accessibility: has(/\.vue$/) ? 'UI components touched — check keyboard, focus and contrast' : 'n/a',
    breaking: removedCode.length ? `possible — removes ${phrase(removedCode)}` : 'none',
    changesetMd: null,
    source: 'detected',
    why,
  };
};
