// @vitest-environment nuxt
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { BaseSpinner } from '#components'

describe('BaseSpinner', () => {
  it('renders a status announced as Loading by default', async () => {
    const wrapper = await mountSuspended(BaseSpinner)
    const root = wrapper.get('.nc-spinner')

    expect(root.attributes('role')).toBe('status')
    expect(root.attributes('aria-hidden')).toBeUndefined()
    expect(wrapper.get('.nc-spinner__label').text()).toBe('Loading')
  })

  it('hides the ring from screen readers', async () => {
    const wrapper = await mountSuspended(BaseSpinner)

    expect(wrapper.get('.nc-spinner__circle').attributes('aria-hidden')).toBe(
      'true',
    )
  })

  it('takes the label in the site language', async () => {
    const wrapper = await mountSuspended(BaseSpinner, {
      props: { label: 'Chargement' },
    })

    expect(wrapper.get('.nc-spinner__label').text()).toBe('Chargement')
  })

  it('is hidden from screen readers when decorative', async () => {
    const wrapper = await mountSuspended(BaseSpinner, {
      props: { decorative: true },
    })
    const root = wrapper.get('.nc-spinner')

    expect(root.attributes('role')).toBeUndefined()
    expect(root.attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('.nc-spinner__label').exists()).toBe(false)
  })

  it('passes classes and attributes through to the root', async () => {
    const wrapper = await mountSuspended(BaseSpinner, {
      attrs: { class: 'custom', id: 'wait' },
    })
    const root = wrapper.get('.nc-spinner')

    expect(root.classes()).toContain('custom')
    expect(root.attributes('id')).toBe('wait')
  })
})
