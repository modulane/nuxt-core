// @vitest-environment nuxt
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { BaseAlert } from '#components'

describe('BaseAlert', () => {
  it('renders a silent info message by default', async () => {
    const wrapper = await mountSuspended(BaseAlert, {
      slots: { default: () => 'The shop closes at 6 pm today.' },
    })
    const root = wrapper.get('.nc-alert')

    expect(root.attributes('data-status')).toBe('info')
    expect(root.attributes('role')).toBeUndefined()
    expect(wrapper.get('.nc-alert__body').text()).toBe(
      'The shop closes at 6 pm today.',
    )
  })

  it.each(['success', 'warning', 'danger'] as const)(
    'takes the %s status',
    async status => {
      const wrapper = await mountSuspended(BaseAlert, { props: { status } })

      expect(wrapper.get('.nc-alert').attributes('data-status')).toBe(status)
    },
  )

  it('is read out at once when it announces', async () => {
    const wrapper = await mountSuspended(BaseAlert, {
      props: { announce: true },
    })

    expect(wrapper.get('.nc-alert').attributes('role')).toBe('alert')
  })

  it('renders a title only when given', async () => {
    const plain = await mountSuspended(BaseAlert)

    expect(plain.find('.nc-alert__title').exists()).toBe(false)

    const titled = await mountSuspended(BaseAlert, {
      slots: { title: () => 'Message sent' },
    })

    expect(titled.get('.nc-alert__title').text()).toBe('Message sent')
  })

  it('passes classes and attributes through to the root', async () => {
    const wrapper = await mountSuspended(BaseAlert, {
      attrs: { class: 'custom', id: 'form-errors' },
    })
    const root = wrapper.get('.nc-alert')

    expect(root.classes()).toContain('custom')
    expect(root.attributes('id')).toBe('form-errors')
  })
})
