import { fileURLToPath } from 'node:url'
import { compileString } from 'sass'
import { describe, expect, it } from 'vitest'

const scss = fileURLToPath(
  new URL('../../layers/design/app/assets/scss', import.meta.url),
)

// Compiles a snippet with the abstracts in scope, as a site's stylesheet would
const compile = (source: string): string =>
  compileString(`@use 'abstracts' as *;\n${source}`, {
    loadPaths: [scss],
    style: 'compressed',
  }).css

describe('SCSS abstracts', () => {
  it('emit no CSS of their own', () => {
    expect(compile('')).toBe('')
  })

  describe('breakpoint()', () => {
    it('returns a breakpoint by name, including 2xl', () => {
      expect(compile('a { x: breakpoint(md); y: breakpoint(2xl) }')).toBe(
        'a{x:768px;y:1536px}',
      )
    })

    it('passes a length through', () => {
      expect(compile('a { x: breakpoint(900px) }')).toBe('a{x:900px}')
    })

    it('rejects an unknown name', () => {
      expect(() => compile('a { x: breakpoint(huge) }')).toThrow(
        /Unknown breakpoint `huge`/,
      )
    })
  })

  describe('unit functions', () => {
    it('converts pixels to rem and em', () => {
      expect(compile('a { x: rem(24px); y: rem(24); z: em(24px, 12px) }')).toBe(
        'a{x:1.5rem;y:1.5rem;z:2em}',
      )
    })

    it('rejects a unit other than pixels', () => {
      expect(() => compile('a { x: rem(2em) }')).toThrow(/in pixels/)
    })

    it('strips a unit', () => {
      expect(compile('a { x: strip-unit(12px) }')).toBe('a{x:12}')
    })
  })

  describe('fluid()', () => {
    it('grows from $min at sm to $max at xl', () => {
      expect(compile('a { x: fluid(16px, 24px) }')).toBe(
        'a{x:clamp(1rem,0.5rem + 1.25vw,1.5rem)}',
      )
    })

    it('can shrink as the viewport grows', () => {
      expect(compile('a { x: fluid(48px, 24px, md, lg) }')).toBe(
        'a{x:clamp(1.5rem,7.5rem - 9.375vw,3rem)}',
      )
    })
  })

  it('translucent() mixes a colour with transparent', () => {
    expect(compile('a { x: translucent(var(--color-primary), 30%) }')).toBe(
      'a{x:color-mix(in srgb, var(--color-primary) 30%, transparent)}',
    )
  })

  describe('media query mixins', () => {
    it('respond-to() applies from a breakpoint up', () => {
      expect(compile('a { @include respond-to(md) { x: y } }')).toBe(
        '@media(width >= 768px){a{x:y}}',
      )
    })

    it('respond-below() applies below a breakpoint', () => {
      expect(compile('a { @include respond-below(lg) { x: y } }')).toBe(
        '@media(width < 1024px){a{x:y}}',
      )
    })

    it('respond-between() applies between two breakpoints', () => {
      expect(compile('a { @include respond-between(sm, xl) { x: y } }')).toBe(
        '@media(640px <= width < 1280px){a{x:y}}',
      )
    })

    it('hover() applies only on devices that can hover', () => {
      expect(compile('a { @include hover { x: y } }')).toBe(
        '@media(hover: hover){a:hover{x:y}}',
      )
    })
  })

  it('transition() uses the motion tokens and respects reduced motion', () => {
    expect(
      compile('a { @include transition(color opacity, $duration: fast) }'),
    ).toBe(
      'a{transition-property:color,opacity;transition-duration:var(--duration-fast);transition-timing-function:var(--ease-standard)}' +
        '@media(prefers-reduced-motion: reduce){a{transition:none}}',
    )
  })

  it('visually-hidden-focusable() shows the element while it has focus', () => {
    expect(compile('a { @include visually-hidden-focusable }')).toMatch(
      /^a:not\(:focus,:focus-within\)\{position:absolute;/,
    )
  })
})
