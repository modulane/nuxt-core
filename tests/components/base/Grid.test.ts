// @vitest-environment nuxt
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { BaseGrid } from '#components'

describe('BaseGrid', () => {
  it('renders a div with the grid class and no settings by default', async () => {
    const wrapper = await mountSuspended(BaseGrid, {
      slots: { default: () => 'Content' },
    })
    const root = wrapper.get('.nc-grid')

    expect(root.element.tagName).toBe('DIV')
    expect(root.classes()).not.toContain('nc-grid--fit')
    expect(root.attributes('style')).toBeUndefined()
    expect(root.text()).toBe('Content')
  })

  it('renders the element given in as', async () => {
    const wrapper = await mountSuspended(BaseGrid, { props: { as: 'ul' } })

    expect(wrapper.get('.nc-grid').element.tagName).toBe('UL')
  })

  it('sets one column count for every screen', async () => {
    const wrapper = await mountSuspended(BaseGrid, { props: { columns: 3 } })

    expect(wrapper.get('.nc-grid').attributes('style')).toBe(
      '--grid-columns: 3;',
    )
  })

  it('sets a column count per breakpoint', async () => {
    const wrapper = await mountSuspended(BaseGrid, {
      props: { columns: { base: 1, md: 2, '2xl': 4 } },
    })

    expect(wrapper.get('.nc-grid').attributes('style')).toBe(
      '--grid-columns: 1; --grid-columns-md: 2; --grid-columns-2xl: 4;',
    )
  })

  it('fits columns of a minimum width', async () => {
    const wrapper = await mountSuspended(BaseGrid, {
      props: { fit: true, minColumnWidth: '12rem' },
    })
    const root = wrapper.get('.nc-grid')

    expect(root.classes()).toContain('nc-grid--fit')
    expect(root.attributes('style')).toBe('--grid-min: 12rem;')
  })

  it('takes its gap from the spacing scale', async () => {
    const wrapper = await mountSuspended(BaseGrid, { props: { gap: 8 } })

    expect(wrapper.get('.nc-grid').attributes('style')).toBe(
      '--grid-gap: var(--space-8);',
    )
  })

  it('passes classes and attributes through to the root', async () => {
    const wrapper = await mountSuspended(BaseGrid, {
      props: { as: 'ul' },
      attrs: { class: 'cards', role: 'list' },
    })
    const root = wrapper.get('.nc-grid')

    expect(root.classes()).toContain('cards')
    expect(root.attributes('role')).toBe('list')
  })
})
