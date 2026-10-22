// Ship-it agent : diff → plan (type, titre, branche, résumé). Optionnel : le plan détecté sert de base.
// Fournisseurs essayés dans l'ordre, chacun seulement si sa clé existe (env ou .env.local).
import { envValue } from './ship-utils.mjs';

const PROVIDERS = [
  {
    name: 'Mistral',
    keyVar: 'MISTRAL_API_KEY',
    url: 'https://api.mistral.ai/v1/chat/completions',
    model: () => envValue('SHIP_MODEL') || 'mistral-small-latest', // escalade : mistral-medium-latest si qualité insuffisante
  },
  {
    name: 'Groq',
    keyVar: 'GROQ_API_KEY',
    url: 'https://api.groq.com/openai/v1/chat/completions', // compatible OpenAI
    model: () => envValue('GROQ_MODEL') || 'llama-3.3-70b-versatile',
  },
];

export const availableProviders = () => (envValue('SHIP_AI') === 'off' ? [] : PROVIDERS.filter((p) => envValue(p.keyVar)));

// Types autorisés — alignés sur .github/CONTRIBUTING.md.
export const TYPES = {
  feat: 'nouvelle fonctionnalité',
  fix: 'correction de bug',
  refactor: 'restructuration sans changement de comportement',
  test: 'tests',
  docs: 'documentation',
  style: 'styles uniquement',
  chore: 'maintenance, outillage, CI',
};

export const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  .replace(/^(.{0,40})(-.*)?$/, '$1'); // ≤ 40 caractères, coupé sur un mot entier

export const branchFor = (type, subject) => `${type}/${slugify(subject) || 'work'}`;

// "feat: add base button" — sujet en minuscule initiale, ≤ 72 caractères.
export const titleFor = (type, subject) => {
  const s = subject.trim().replace(/\.$/, '');
  return `${type}: ${s.charAt(0).toLowerCase()}${s.slice(1)}`.slice(0, 72);
};

export const subjectOf = (title) => title.replace(/^[a-z]+(\([^)]*\))?!?:\s*/, '');

const SYSTEM = `You are the release agent of a Nuxt 4 project. Classify the developer's work and write the ship plan.
Return ONLY valid JSON, no prose:
{"type":"${Object.keys(TYPES).join('|')}",
 "subject":"<imperative present, ENGLISH, lowercase first letter, no trailing period, under 60 chars>",
 "summary":"<2-4 sentences, english: what changed and why>",
 "risks":"<short, or 'none'>",
 "accessibility":"<WCAG 2.2 impact if UI is touched, else 'n/a'>",
 "breaking":"<short, or 'none'>",
 "changesetMd":"<changeset markdown ONLY if asked below, else null>"}
Types: ${Object.entries(TYPES).map(([k, v]) => `${k} = ${v}`).join('; ')}. CI, tooling and dependency work is "chore".
Pick the type describing the dominant user-facing change. Describe the change, not the development process.
Changeset format when asked: ---\\n"<package name>": patch|minor|major\\n---\\nOne line of english justification.`;

const validate = (p) => {
  if (!p || !Object.hasOwn(TYPES, p.type)) return null;
  if (typeof p.subject !== 'string' || !p.subject.trim() || p.subject.length > 72) return null;
  if (typeof p.summary !== 'string' || !p.summary.trim()) return null;
  return {
    type: p.type,
    title: titleFor(p.type, p.subject),
    branch: branchFor(p.type, p.subject),
    summary: p.summary.trim(),
    risks: p.risks || 'none',
    accessibility: p.accessibility || 'n/a',
    breaking: p.breaking || 'none',
    changesetMd: typeof p.changesetMd === 'string' && p.changesetMd.trim() ? p.changesetMd.trim() : null,
    source: 'ai',
  };
};

const callProvider = async (provider, messages, temperature) => {
  try {
    const res = await fetch(provider.url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${envValue(provider.keyVar)}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: provider.model(), temperature, response_format: { type: 'json_object' }, messages }),
      signal: AbortSignal.timeout(45_000),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      const message = (() => { try { const j = JSON.parse(detail); return j.message ?? j.error?.message; } catch { return detail; } })();
      return { plan: null, reason: `${provider.name} ${res.status}${message ? ` : ${String(message).slice(0, 120)}` : ''}` };
    }
    const data = await res.json();
    const plan = validate(JSON.parse(data.choices[0].message.content));
    return plan ? { plan: { ...plan, provider: provider.name } } : { plan: null, reason: `${provider.name} : réponse invalide` };
  } catch (e) {
    return { plan: null, reason: `${provider.name} : ${e.name === 'TimeoutError' ? 'trop lent' : e.message}` };
  }
};

// → { plan } ou { plan: null, reason } (raisons de tous les fournisseurs essayés)
export const generatePlan = async ({ files, diff, touchesPackages, previous, feedback }) => {
  const providers = availableProviders();
  if (!providers.length) return { plan: null, reason: 'aucune clé IA' };

  const user = [
    `Changed files:\n${files.join('\n')}`,
    touchesPackages ? 'Files under packages/ changed: produce changesetMd.' : 'No package changed: changesetMd must be null.',
    `Diff:\n${diff}`,
  ].join('\n\n');
  const messages = [{ role: 'system', content: SYSTEM }, { role: 'user', content: user }];
  if (previous) {
    messages.push({ role: 'assistant', content: JSON.stringify(previous) });
    messages.push({ role: 'user', content: `Regenerate the plan. Developer feedback: ${feedback || 'try a different wording'}` });
  }

  const reasons = [];
  for (const provider of providers) {
    const r = await callProvider(provider, messages, previous ? 0.6 : 0.2);
    if (r.plan) return r;
    reasons.push(r.reason);
  }
  return { plan: null, reason: reasons.join(' · ') };
};
