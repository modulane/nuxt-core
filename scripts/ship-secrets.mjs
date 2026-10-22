// Ship-it — scan de secrets sur les lignes AJOUTÉES (commitées ou non) avant commit / push.
import { config, globToRegExp } from './ship-config.mjs';

const RULES = [
  ['clé privée', /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP |ENCRYPTED )?PRIVATE KEY( BLOCK)?-----/],
  ['token GitHub', /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{60,})\b/],
  ['clé AWS', /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/],
  ['clé Anthropic', /\bsk-ant-[A-Za-z0-9_-]{20,}/],
  ['clé OpenAI', /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}/],
  ['clé Groq', /\bgsk_[A-Za-z0-9]{20,}/],
  ['clé Google', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['clé Stripe', /\b(?:sk|rk)_live_[0-9a-zA-Z]{20,}/],
  ['token Slack', /\bxox[abprs]-[0-9A-Za-z-]{10,}/],
  ['token npm', /\bnpm_[A-Za-z0-9]{36}\b/],
  ['URL avec mot de passe', /\b[a-z][a-z0-9+.-]*:\/\/[^\s:/@]+:[^\s:/@]{6,}@[^\s]+/i],
  // Affectation générique : MISTRAL_API_KEY=…, apiKey: "…", password = '…'
  ['affectation de secret', /\b[\w.-]*(?:api[_-]?key|secret|token|passw(?:or)?d|private[_-]?key|access[_-]?key)[\w.-]*["']?\s*[:=]\s*["']?([^\s"'`,;)]{16,})/i],
];

// Valeurs manifestement factices ou indirectes : pas des secrets.
const PLACEHOLDER = /\$\{|\$\(|process\.env|import\.meta\.env|secrets\.|useRuntimeConfig|<[^>]+>|^x{6,}|example|placeholder|your[_-]?|changeme|dummy|\*{4,}|^\.{3}/i;

const SENSITIVE_FILE = /(^|\/)(\.env(\.[\w-]+)?|id_(rsa|ed25519|ecdsa)|[^/]+\.(pem|p12|pfx|key|keystore)|\.npmrc|credentials(\.json)?)$/i;
const SAFE_FILE = /(^|\/)\.env\.example$|(^|\/)(yarn\.lock|package-lock\.json|pnpm-lock\.yaml)$|^scripts\/ship-secrets\.mjs$/;

// Pour la règle générique : un vrai secret mélange lettres et chiffres et n'est pas du code
// (config.public.apiKey, useToken(), MY_CONSTANT_NAME…).
const looksRandom = (v) => /\d/.test(v) && /[A-Za-z]/.test(v)
  && !/^[A-Za-z_$][\w$]*(\.[\w$]+)+$/.test(v) && !/\(/.test(v) && !/^[A-Z0-9_]+$/.test(v);

const mask =(s) => (s.length <= 8 ? '****' : `${s.slice(0, 4)}…${s.slice(-2)} (${s.length} car.)`);

// entries : celles de collectChanges → [{ path, line, rule, preview }]
export const scanSecrets = (entries) => {
  const findings = [];
  const ignored = config().secrets.ignorePaths.map(globToRegExp);
  for (const e of entries) {
    if (SAFE_FILE.test(e.path) || e.status === 'D' || ignored.some((re) => re.test(e.path))) continue;
    if (SENSITIVE_FILE.test(e.path)) findings.push({ path: e.path, line: 0, rule: 'fichier sensible', preview: 'fichier entier' });
    for (const { line, text } of e.added) {
      for (const [rule, re] of RULES) {
        const m = text.match(re);
        if (!m) continue;
        const value = m[1] ?? m[0];
        if (PLACEHOLDER.test(value)) continue;
        if (rule === 'affectation de secret' && !looksRandom(value)) continue;
        findings.push({ path: e.path, line, rule, preview: mask(value) });
        break; // une alerte par ligne suffit
      }
    }
  }
  return findings;
};
