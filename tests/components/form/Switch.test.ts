// @vitest-environment nuxt
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { FormSwitch } from '#components'

describe('FormSwitch', () => {
  it('renders an unchecked switch by default', async () => {
    const wrapper = await mountSuspended(FormSwitch)
    const button = wrapper.get('button')

    expect(button.attributes('role')).toBe('switch')
    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('aria-checked')).toBe('false')
    expect(button.classes()).toContain('nc-switch')
  })

  it('takes its accessible name from the default slot', async () => {
    const wrapper = await mountSuspended(FormSwitch, {
      slots: { default: () => 'Dark mode' },
    })

    expect(wrapper.get('.nc-switch__label').text()).toBe('Dark mode')
  })

  it('renders no label part without a slot', async () => {
    const wrapper = await mountSuspended(FormSwitch, {
      attrs: { 'aria-label': 'Dark mode' },
    })

    expect(wrapper.find('.nc-switch__label').exists()).toBe(false)
    expect(wrapper.get('button').attributes('aria-label')).toBe('Dark mode')
  })

  it('reflects v-model in aria-checked', async () => {
    const wrapper = await mountSuspended(FormSwitch, {
      props: { modelValue: true },
    })

    expect(wrapper.get('button').attributes('aria-checked')).toBe('true')
  })

  it('toggles and emits the new value when activated', async () => {
    const wrapper = await mountSuspended(FormSwitch, {
      props: { modelValue: false },
    })

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
  })

  it('passes classes and attributes through to the button', async () => {
    const wrapper = await mountSuspended(FormSwitch, {
      attrs: { class: 'custom', disabled: true },
    })
    const button = wrapper.get('button')

    expect(button.classes()).toContain('custom')
    expect(button.attributes('disabled')).toBeDefined()
  })
})
