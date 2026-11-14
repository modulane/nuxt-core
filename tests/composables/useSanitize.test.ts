// @vitest-environment nuxt
import { describe, expect, it } from 'vitest'

const { stripUnsafe, sanitize, sanitizeDeep, escapeHtml, safeUrl } =
  useSanitize()

describe('useSanitize', () => {
  describe('stripUnsafe', () => {
    it('removes control characters and invisible spoofing characters', () => {
      expect(stripUnsafe('a\u0000b\u0007c\u007fd\u0085e')).toBe('abcde')
      expect(stripUnsafe('pay\u200Bpal')).toBe('paypal')
      expect(stripUnsafe('file\u202Egnp.exe')).toBe('filegnp.exe')
      expect(stripUnsafe('a\u2066b\u2069c\uFEFFd\u2028e')).toBe('abcde')
    })

    it('keeps the joiners that emoji and scripts need', () => {
      const family = '👨\u200D👩\u200D👧'
      const persian = 'می\u200Cخواهم'
      expect(stripUnsafe(family)).toBe(family)
      expect(stripUnsafe(persian)).toBe(persian)
    })

    it('removes hidden tag text but keeps the flags of England and Wales', () => {
      const hidden = [...'hi'].map(c =>
        String.fromCodePoint(0xe0000 + c.codePointAt(0)!),
      )
      expect(stripUnsafe(`ok${hidden.join('')}`)).toBe('ok')

      const england =
        '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}'
      expect(stripUnsafe(`go ${england}!`)).toBe(`go ${england}!`)
    })

    it('removes line breaks, unless multiline', () => {
      expect(stripUnsafe('a\nb\r\nc\td')).toBe('abcd')
      expect(stripUnsafe('a\nb\r\nc\rd\te', { multiline: true })).toBe(
        'a\nb\nc\nd\te',
      )
    })

    it('leaves ordinary text alone', () => {
      expect(stripUnsafe('  Héllo, wörld! 你好 ')).toBe('  Héllo, wörld! 你好 ')
    })
  })

  describe('sanitize', () => {
    it('strips, normalizes to NFC and trims', () => {
      expect(sanitize('  café\u200B ')).toBe('café')
    })

    it('cuts to maxLength without breaking an emoji in two', () => {
      expect(sanitize('ab😀cd', { maxLength: 3 })).toBe('ab😀')
      expect(sanitize('abc   def', { maxLength: 5 })).toBe('abc')
      expect(sanitize('abc', { maxLength: 5 })).toBe('abc')
    })

    it('keeps inner line breaks when multiline', () => {
      expect(sanitize('\n a\r\nb \n', { multiline: true })).toBe('a\nb')
    })
  })

  describe('sanitizeDeep', () => {
    it('cleans every string of nested objects and arrays, keys too', () => {
      expect(
        sanitizeDeep({
          ' name\u200B ': ' Ada ',
          tags: [' a\u0000 ', 'b'],
          nested: { note: 'x\u202Ey' },
          age: 36,
          admin: false,
          none: null,
        }),
      ).toEqual({
        name: 'Ada',
        tags: ['a', 'b'],
        nested: { note: 'xy' },
        age: 36,
        admin: false,
        none: null,
      })
    })

    it('drops the keys that would pollute a prototype', () => {
      const payload = JSON.parse(
        '{"__proto__": {"admin": true}, "constructor": {"prototype": {"admin": true}}, "ok": 1}',
      )
      const clean = sanitizeDeep(payload)

      expect(clean).toEqual({ ok: 1 })
      expect(Object.keys(clean)).toEqual(['ok'])
      expect(({} as Record<string, unknown>).admin).toBeUndefined()
    })

    it('keeps objects that are not plain, and drops circular references', () => {
      const date = new Date(0)
      const loop: Record<string, unknown> = { name: ' a ' }
      loop.self = loop

      expect(sanitizeDeep({ date }).date).toBe(date)
      expect(sanitizeDeep(loop)).toEqual({ name: 'a' })
    })

    it('passes options down to every string', () => {
      expect(sanitizeDeep(['abcdef'], { maxLength: 2 })).toEqual(['ab'])
    })
  })

  describe('escapeHtml', () => {
    it('escapes the characters that open markup or close an attribute', () => {
      expect(escapeHtml(`<img src=x onerror="alert('x')"> & co`)).toBe(
        '&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt; &amp; co',
      )
    })
  })

  describe('safeUrl', () => {
    it('accepts web, mail and phone links, normalized', () => {
      expect(safeUrl(' https://Example.com/a b ')).toBe(
        'https://example.com/a%20b',
      )
      expect(safeUrl('mailto:ada@example.com')).toBe('mailto:ada@example.com')
      expect(safeUrl('tel:+32470123456')).toBe('tel:+32470123456')
    })

    it('refuses script and data URLs, however they are disguised', () => {
      expect(safeUrl('javascript:alert(1)')).toBeUndefined()
      expect(safeUrl(' JavaScript:alert(1)')).toBeUndefined()
      expect(safeUrl('java\tscript:alert(1)')).toBeUndefined()
      expect(safeUrl('\u0000javascript:alert(1)')).toBeUndefined()
      expect(
        safeUrl('data:text/html,<script>alert(1)</script>'),
      ).toBeUndefined()
      expect(safeUrl('vbscript:msgbox(1)')).toBeUndefined()
    })

    it('refuses a user name or password before the host', () => {
      expect(safeUrl('https://bank.com@evil.com')).toBeUndefined()
      expect(safeUrl('https://user:pass@example.com')).toBeUndefined()
    })

    it('accepts paths on the same site, but not on another one', () => {
      expect(safeUrl('/about')).toBe('/about')
      expect(safeUrl('?page=2')).toBe('?page=2')
      expect(safeUrl('#top')).toBe('#top')
      expect(safeUrl('//evil.com')).toBeUndefined()
      expect(safeUrl('/\\evil.com')).toBeUndefined()
      expect(safeUrl('/about', { relative: false })).toBeUndefined()
    })

    it('takes the allowed schemes as an option', () => {
      expect(
        safeUrl('mailto:a@b.co', { protocols: ['https:'] }),
      ).toBeUndefined()
      expect(safeUrl('ftp://example.com', { protocols: ['ftp:'] })).toBe(
        'ftp://example.com/',
      )
    })

    it('refuses empty and unparseable values', () => {
      expect(safeUrl('')).toBeUndefined()
      expect(safeUrl('   ')).toBeUndefined()
      expect(safeUrl('not a url')).toBeUndefined()
    })
  })
})
