// @vitest-environment nuxt
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { BaseButton } from '#components'

describe('BaseButton', () => {
  it('renders a primary, medium button that submits nothing', async () => {
    const wrapper = await mountSuspended(BaseButton, {
      slots: { default: () => 'Save' },
    })
    const button = wrapper.get('button')

    expect(button.classes()).toContain('nc-button')
    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('data-variant')).toBe('primary')
    expect(button.attributes('data-size')).toBe('md')
    expect(button.attributes('data-loading')).toBeUndefined()
    expect(button.attributes('aria-disabled')).toBeUndefined()
    expect(wrapper.get('.nc-button__label').text()).toBe('Save')
  })

  it('takes its type, variant and size', async () => {
    const wrapper = await mountSuspended(BaseButton, {
      props: { type: 'submit', variant: 'secondary', size: 'lg' },
    })
    const button = wrapper.get('button')

    expect(button.attributes('type')).toBe('submit')
    expect(button.attributes('data-variant')).toBe('secondary')
    expect(button.attributes('data-size')).toBe('lg')
  })

  it('renders the start and end parts only when given', async () => {
    const plain = await mountSuspended(BaseButton)

    expect(plain.find('.nc-button__start').exists()).toBe(false)
    expect(plain.find('.nc-button__end').exists()).toBe(false)

    const full = await mountSuspended(BaseButton, {
      slots: { start: () => '+', default: () => 'Add', end: () => '→' },
    })

    expect(full.get('.nc-button__start').text()).toBe('+')
    expect(full.get('.nc-button__end').text()).toBe('→')
  })

  it('emits click when activated', async () => {
    const wrapper = await mountSuspended(BaseButton)

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('blocks clicks and shows a spinner while loading, keeping focus', async () => {
    const wrapper = await mountSuspended(BaseButton, {
      props: { loading: true },
      slots: { default: () => 'Save' },
    })
    const button = wrapper.get('button')

    await button.trigger('click')

    expect(button.attributes('data-loading')).toBeDefined()
    expect(button.attributes('aria-disabled')).toBe('true')
    expect(button.attributes('disabled')).toBeUndefined()
    expect(wrapper.get('.nc-button__spinner').attributes('aria-hidden')).toBe(
      'true',
    )
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('passes classes and attributes through to the button', async () => {
    const wrapper = await mountSuspended(BaseButton, {
      attrs: { class: 'custom', disabled: true },
    })
    const button = wrapper.get('button')

    expect(button.classes()).toContain('custom')
    expect(button.attributes('disabled')).toBeDefined()
  })
})
