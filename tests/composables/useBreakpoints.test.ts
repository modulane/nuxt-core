// @vitest-environment nuxt
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { compileString } from 'sass'
import { beforeAll, describe, expect, it, vi } from 'vitest'

// A stand-in for the browser's media queries, whose width the tests set. happy-dom's
// own never reports that a query that matched from the start stopped matching.
interface FakeQuery {
  minWidth: number
  matches: boolean
  listeners: ((event: { matches: boolean }) => void)[]
}

let width = 1024
const queries: FakeQuery[] = []

const resize = (next: number): void => {
  width = next

  for (const query of queries) {
    const matches = width >= query.minWidth

    if (matches !== query.matches) {
      query.matches = matches
      query.listeners.forEach(listener => listener({ matches }))
    }
  }
}

describe('useBreakpoints', () => {
  // Before the first call, which starts listening for the whole page
  beforeAll(() => {
    vi.spyOn(window, 'matchMedia').mockImplementation(media => {
      const minWidth = Number(/min-width: (\d+)px/.exec(media)?.[1])
      const query: FakeQuery = {
        minWidth,
        matches: width >= minWidth,
        listeners: [],
      }

      queries.push(query)

      return {
        get matches() {
          return query.matches
        },
        addEventListener: (
          _type: string,
          listener: FakeQuery['listeners'][0],
        ) => query.listeners.push(listener),
      } as unknown as MediaQueryList
    })
  })

  it('reports the widest breakpoint the viewport reaches', () => {
    const { active } = useBreakpoints()

    expect(active.value).toBe('lg')

    resize(800)
    expect(active.value).toBe('md')

    resize(1600)
    expect(active.value).toBe('2xl')
  })

  it('reports no breakpoint below the smallest one', () => {
    const { active } = useBreakpoints()

    resize(375)

    expect(active.value).toBeUndefined()
  })

  it('compares the viewport with a breakpoint, as respond-to() does', () => {
    const { isAtLeast, isBelow } = useBreakpoints()
    const atLeastLg = isAtLeast('lg')
    const belowLg = isBelow('lg')

    resize(1023)
    expect(atLeastLg.value).toBe(false)
    expect(belowLg.value).toBe(true)

    resize(1024)
    expect(atLeastLg.value).toBe(true)
    expect(belowLg.value).toBe(false)
  })

  it('listens once, and shares one state between every caller', () => {
    const first = useBreakpoints()
    const second = useBreakpoints()

    resize(700)

    expect(first.active.value).toBe('sm')
    expect(second.active.value).toBe('sm')
    expect(queries).toHaveLength(Object.keys(BREAKPOINTS).length)
  })

  it('uses the same breakpoints as the Sass helpers', () => {
    // From a string: in this environment, URL is happy-dom's, which Node.js rejects
    const scss = resolve(
      dirname(fileURLToPath(import.meta.url)),
      '../../layers/design/app/assets/scss',
    )
    // Prefixed, since a property name cannot start with a digit, as 2xl does
    const declarations = Object.keys(BREAKPOINTS)
      .map(name => `bp-${name}: breakpoint('${name}');`)
      .join('')
    const css = compileString(`@use 'abstracts' as *; a { ${declarations} }`, {
      loadPaths: [scss],
      style: 'compressed',
    }).css
    const fromSass = Object.fromEntries(
      [...css.matchAll(/bp-(\w+):(\d+)px/g)].map(([, name, px]) => [
        name,
        Number(px),
      ]),
    )

    expect(fromSass).toEqual(BREAKPOINTS)
  })
})
