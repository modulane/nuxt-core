import { fileURLToPath } from 'node:url'
import { compileString } from 'sass'
import { describe, expect, it } from 'vitest'

const scss = fileURLToPath(
  new URL('../../layers/design/app/assets/scss', import.meta.url),
)

const compile = (partial: string): string =>
  compileString(`@use '${partial}';`, {
    loadPaths: [scss],
    style: 'compressed',
  }).css

describe('.nc-stack', () => {
  const css = compile('layout/stack')

  it('spaces its children in a column, --space-4 apart by default', () => {
    expect(css).toContain(
      'display:flex;flex-direction:column;gap:var(--stack-gap, var(--space-4))',
    )
  })

  it('resets its settings, so a nested stack does not inherit them', () => {
    expect(css).toMatch(
      /^\.nc-stack\{--stack-gap: initial;--stack-gap-sm: initial;/,
    )
  })

  it('keeps the gap of the breakpoint below until one is set', () => {
    expect(css).toContain(
      '@media(width >= 768px){.nc-stack{gap:var(--stack-gap-md, var(--stack-gap-sm, var(--stack-gap, var(--space-4))))}}',
    )
  })
})

describe('.nc-cluster', () => {
  const css = compile('layout/cluster')

  it('wraps its children in rows, --space-3 apart by default', () => {
    expect(css).toContain(
      'display:flex;flex-wrap:wrap;align-items:center;justify-content:var(--cluster-justify, flex-start);gap:var(--cluster-gap, var(--space-3))',
    )
  })

  it('resets its settings, so a nested cluster does not inherit them', () => {
    expect(css).toMatch(
      /^\.nc-cluster\{--cluster-gap: initial;--cluster-justify: initial;/,
    )
  })

  it('keeps the gap of the breakpoint below until one is set', () => {
    expect(css).toContain(
      '@media(width >= 768px){.nc-cluster{gap:var(--cluster-gap-md, var(--cluster-gap-sm, var(--cluster-gap, var(--space-3))))}}',
    )
  })
})
