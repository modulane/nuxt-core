// @vitest-environment nuxt
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { BaseStack } from '#components'

describe('BaseStack', () => {
  it('renders a div with the stack class and no settings by default', async () => {
    const wrapper = await mountSuspended(BaseStack, {
      slots: { default: () => 'Content' },
    })
    const root = wrapper.get('.nc-stack')

    expect(root.element.tagName).toBe('DIV')
    expect(root.attributes('style')).toBeUndefined()
    expect(root.text()).toBe('Content')
  })

  it('renders the element given in as', async () => {
    const wrapper = await mountSuspended(BaseStack, { props: { as: 'ul' } })

    expect(wrapper.get('.nc-stack').element.tagName).toBe('UL')
  })

  it('takes one gap from the spacing scale', async () => {
    const wrapper = await mountSuspended(BaseStack, { props: { gap: 8 } })

    expect(wrapper.get('.nc-stack').attributes('style')).toBe(
      '--stack-gap: var(--space-8);',
    )
  })

  it('takes a gap per breakpoint', async () => {
    const wrapper = await mountSuspended(BaseStack, {
      props: { gap: { base: 4, md: 8, '2xl': 12 } },
    })

    expect(wrapper.get('.nc-stack').attributes('style')).toBe(
      '--stack-gap: var(--space-4); --stack-gap-md: var(--space-8); --stack-gap-2xl: var(--space-12);',
    )
  })

  it('passes classes and attributes through to the root', async () => {
    const wrapper = await mountSuspended(BaseStack, {
      props: { as: 'ul' },
      attrs: { class: 'steps', role: 'list' },
    })
    const root = wrapper.get('.nc-stack')

    expect(root.classes()).toContain('steps')
    expect(root.attributes('role')).toBe('list')
  })
})
