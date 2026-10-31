// @vitest-environment nuxt
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { BaseBadge } from '#components'

describe('BaseBadge', () => {
  it('renders a neutral span with its text', async () => {
    const wrapper = await mountSuspended(BaseBadge, {
      slots: { default: () => 'New' },
    })
    const badge = wrapper.get('.nc-badge')

    expect(badge.element.tagName).toBe('SPAN')
    expect(badge.attributes('data-status')).toBe('neutral')
    expect(badge.text()).toBe('New')
  })

  it.each(['success', 'warning', 'danger', 'info'] as const)(
    'takes the %s status',
    async status => {
      const wrapper = await mountSuspended(BaseBadge, { props: { status } })

      expect(wrapper.get('.nc-badge').attributes('data-status')).toBe(status)
    },
  )

  it('passes classes and attributes through to the span', async () => {
    const wrapper = await mountSuspended(BaseBadge, {
      attrs: { class: 'custom', title: 'Draft' },
    })
    const badge = wrapper.get('.nc-badge')

    expect(badge.classes()).toContain('custom')
    expect(badge.attributes('title')).toBe('Draft')
  })
})
