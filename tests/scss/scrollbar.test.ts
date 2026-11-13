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

describe('scrollbars', () => {
  const css = compile('base/scrollbar')

  it('colours them on the page and on every element that switches scheme', () => {
    expect(css).toContain(
      ':root,[data-color-scheme]{scrollbar-color:var(--scrollbar-thumb-color) var(--scrollbar-track-color)}',
    )
  })

  it('gives the WebKit fallback only to browsers without scrollbar-color', () => {
    expect(css).toMatch(
      /@supports not \(scrollbar-color: ?auto\)\{::-webkit-scrollbar\{/,
    )
  })
})

describe.each(['dark', 'light'])('the %s scheme', scheme => {
  const css = compile(`schemes/${scheme}`)

  it('sets its own scrollbar colours, so a scoped scheme gets them', () => {
    expect(css).toContain('--scrollbar-thumb-color: var(--color-border-strong)')
    expect(css).toContain('--scrollbar-track-color: transparent')
  })
})
