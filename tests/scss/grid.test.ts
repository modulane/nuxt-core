import { fileURLToPath } from 'node:url'
import { compileString } from 'sass'
import { describe, expect, it } from 'vitest'

const scss = fileURLToPath(
  new URL('../../layers/design/app/assets/scss', import.meta.url),
)

const css = compileString(`@use 'layout/grid';`, {
  loadPaths: [scss],
  style: 'compressed',
}).css

describe('.nc-grid', () => {
  it('has one column and a --space-6 gap by default', () => {
    expect(css).toContain(
      'display:grid;grid-template-columns:repeat(var(--grid-columns, 1), minmax(0, 1fr));gap:var(--grid-gap, var(--space-6))',
    )
  })

  it('resets its settings, so a nested grid does not inherit them', () => {
    expect(css).toMatch(
      /^\.nc-grid\{--grid-columns: initial;--grid-gap: initial;--grid-min: initial;--grid-columns-sm: initial;/,
    )
  })

  it('keeps the column count of the breakpoint below until one is set', () => {
    expect(css).toContain(
      '@media(width >= 768px){.nc-grid{grid-template-columns:repeat(var(--grid-columns-md, var(--grid-columns-sm, var(--grid-columns, 1))), minmax(0, 1fr))}}',
    )
  })

  it('has a rule for every breakpoint, smallest first', () => {
    const widths = [...css.matchAll(/@media\(width >= (\d+)px\)/g)].map(
      ([, width]) => Number(width),
    )

    expect(widths).toEqual([640, 768, 1024, 1280, 1536])
  })

  it('fits as many columns as --grid-min allows, after the breakpoints', () => {
    expect(css).toMatch(
      /\.nc-grid--fit\{grid-template-columns:repeat\(auto-fill, minmax\(min\(var\(--grid-min, var\(--grid-min-column-width\)\), 100%\), 1fr\)\)\}$/,
    )
  })
})
