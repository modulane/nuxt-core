// @vitest-environment nuxt
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { BaseDivider } from '#components'

describe('BaseDivider', () => {
  it('renders a horizontal <hr>, a separator for screen readers', async () => {
    const wrapper = await mountSuspended(BaseDivider)
    const divider = wrapper.get('.nc-divider')

    expect(divider.element.tagName).toBe('HR')
    expect(divider.attributes('data-orientation')).toBe('horizontal')
    expect(divider.attributes('aria-orientation')).toBeUndefined()
  })

  it('tells screen readers when it is vertical', async () => {
    const wrapper = await mountSuspended(BaseDivider, {
      props: { orientation: 'vertical' },
    })
    const divider = wrapper.get('.nc-divider')

    expect(divider.attributes('aria-orientation')).toBe('vertical')
    expect(divider.attributes('data-orientation')).toBe('vertical')
  })

  it('renders a hidden <div> when decorative', async () => {
    const wrapper = await mountSuspended(BaseDivider, {
      props: { decorative: true },
    })
    const divider = wrapper.get('.nc-divider')

    expect(divider.element.tagName).toBe('DIV')
    expect(divider.attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('hr').exists()).toBe(false)
  })

  it('passes classes and attributes through to the root', async () => {
    const wrapper = await mountSuspended(BaseDivider, {
      attrs: { class: 'custom', id: 'end' },
    })
    const divider = wrapper.get('.nc-divider')

    expect(divider.classes()).toContain('custom')
    expect(divider.attributes('id')).toBe('end')
  })
})
