// Cleans text that comes from outside: a form, a URL, an API, a paste. It keeps
// the value tidy and removes what is used to hide or spoof text, but it does
// not make a value safe for every use: the server still checks and escapes what
// it receives, since a request does not have to come from this site, and HTML
// for v-html needs a real HTML sanitizer, such as DOMPurify.

export interface SanitizeOptions {
  // Keeps line breaks and tabs, for a textarea; \r\n and \r become \n
  multiline?: boolean
  // The longest value kept, in characters; an emoji counts as one or more
  maxLength?: number
}

export interface SafeUrlOptions {
  // The schemes allowed, with their colon
  protocols?: string[]
  // Allows a path on the same site: /about, ?page=2, #top
  relative?: boolean
}

// Characters nobody types on purpose: control characters, and the invisible
// ones that hide text or reverse its direction to spoof it (zero-width spaces,
// bidirectional marks and overrides, line and paragraph separators, invisible
// operators). The zero-width joiner and non-joiner stay: emoji and several
// scripts (Persian, Hindi…) need them. Tab, line feed and carriage return are
// handled apart, for `multiline`.
const UNSAFE =
  // eslint-disable-next-line no-control-regex
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u061C\u200B\u200E\u200F\u2028-\u202E\u2060-\u2064\u2066-\u2069\uFEFF\uFFF9-\uFFFB]/gu

// Tag characters are invisible, and can carry hidden text, such as instructions
// for an AI that reads the page. They are kept only in the flags of England,
// Scotland and Wales: a black flag, the region in tags, then a cancel tag.
const TAGS =
  /(\u{1F3F4}[\u{E0030}-\u{E0039}\u{E0061}-\u{E007A}]{1,6}\u{E007F})|[\u{E0000}-\u{E007F}]/gu

// Keys that would change the prototype of the object they are merged into
const POLLUTING_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

// Removes the unsafe characters, and the line breaks unless `multiline`.
// Changes nothing else, so it can run on every keystroke.
const stripUnsafe = (
  value: string,
  { multiline = false }: Pick<SanitizeOptions, 'multiline'> = {},
) => {
  const stripped = value
    .replace(TAGS, (_, flag?: string) => flag ?? '')
    .replace(UNSAFE, '')
  return multiline
    ? stripped.replace(/\r\n?/g, '\n')
    : stripped.replace(/[\t\n\r]/g, '')
}

// The value once finished: without unsafe characters, in the canonical Unicode
// form (NFC, so é is stored the same whichever way it was typed), without outer
// spaces, and cut to `maxLength` without breaking a character in two
const sanitize = (value: string, options: SanitizeOptions = {}) => {
  let clean = stripUnsafe(value, options).normalize('NFC').trim()
  if (options.maxLength !== undefined) {
    const characters = Array.from(clean)
    if (characters.length > options.maxLength) {
      clean = characters.slice(0, options.maxLength).join('').trimEnd()
    }
  }
  return clean
}

// Every string in an object, an array or a mix of both, at any depth, through
// sanitize(); keys too. Keys that would pollute a prototype (__proto__,
// constructor, prototype) are dropped, and so is a reference back to an object
// already being cleaned. Numbers, booleans, null and objects that are not plain
// (a Date, a File) are kept as they are. Use it on a parsed JSON body or a
// form's values before merging them into anything.
const sanitizeDeep = <T>(value: T, options: SanitizeOptions = {}): T => {
  const seen = new WeakSet<object>()

  const clean = (item: unknown): unknown => {
    if (typeof item === 'string') return sanitize(item, options)
    if (typeof item !== 'object' || item === null) return item
    if (seen.has(item)) return undefined

    if (Array.isArray(item)) {
      seen.add(item)
      const result = item.map(clean)
      seen.delete(item)
      return result
    }

    const prototype = Object.getPrototypeOf(item)
    if (prototype !== Object.prototype && prototype !== null) return item

    seen.add(item)
    const result: Record<string, unknown> = {}
    for (const [key, entry] of Object.entries(item)) {
      const cleanKey = sanitize(key)
      if (!cleanKey || POLLUTING_KEYS.has(cleanKey)) continue
      const cleanEntry = clean(entry)
      if (cleanEntry !== undefined || entry === undefined) {
        result[cleanKey] = cleanEntry
      }
    }
    seen.delete(item)
    return result
  }

  return clean(value) as T
}

// Text made safe to put inside HTML built by hand: an email, a string passed
// to innerHTML. Vue templates ({{ }} and attributes) already escape, so they do
// not need it.
const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, character => HTML_ENTITIES[character]!)

// The URL, normalized, when it is safe to put in a link's href or a redirect;
// undefined otherwise. That rules out javascript:, data: and any other scheme
// not in `protocols`; //evil.com and /\evil.com, which browsers read as another
// site; and a user name or password before the host, since
// https://bank.com@evil.com is a common trick to hide where a link goes.
const safeUrl = (
  value: string,
  {
    protocols = ['http:', 'https:', 'mailto:', 'tel:'],
    relative = true,
  }: SafeUrlOptions = {},
) => {
  // Browsers ignore control characters in a URL, so java\tscript: still runs
  const url = stripUnsafe(value).trim()
  if (!url) return undefined

  if (/^[/?#]/.test(url)) {
    return relative && !/^[/\\]{2}/.test(url) ? url : undefined
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return undefined
  }

  if (!protocols.includes(parsed.protocol)) return undefined
  if (parsed.username || parsed.password) return undefined
  return parsed.href
}

// Pure functions with no state: safe to call anywhere, on the server too
export const useSanitize = () => ({
  stripUnsafe,
  sanitize,
  sanitizeDeep,
  escapeHtml,
  safeUrl,
})
