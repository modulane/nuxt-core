// @vitest-environment nuxt
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { BaseIcon } from '#components'

const svg = () => h('svg', { viewBox: '0 0 24 24' })

describe('BaseIcon', () => {
  it('is decorative by default, hidden from screen readers', async () => {
    const wrapper = await mountSuspended(BaseIcon, { slots: { default: svg } })
    const root = wrapper.get('span.nc-icon')

    expect(root.attributes('aria-hidden')).toBe('true')
    expect(root.attributes('role')).toBeUndefined()
    expect(root.attributes('aria-label')).toBeUndefined()
    expect(root.find('svg').exists()).toBe(true)
  })

  it('is an image named by its label when meaningful', async () => {
    const wrapper = await mountSuspended(BaseIcon, {
      props: { label: 'Delete' },
      slots: { default: svg },
    })
    const root = wrapper.get('.nc-icon')

    expect(root.attributes('role')).toBe('img')
    expect(root.attributes('aria-label')).toBe('Delete')
    expect(root.attributes('aria-hidden')).toBeUndefined()
  })

  it('marks an icon to mirror in right-to-left languages', async () => {
    const plain = await mountSuspended(BaseIcon)
    const flipped = await mountSuspended(BaseIcon, {
      props: { flipRtl: true },
    })

    expect(plain.get('.nc-icon').attributes('data-flip-rtl')).toBeUndefined()
    expect(flipped.get('.nc-icon').attributes('data-flip-rtl')).toBe('true')
  })

  it('passes classes and attributes through to the span', async () => {
    const wrapper = await mountSuspended(BaseIcon, {
      attrs: { class: 'custom', title: 'Home' },
    })
    const root = wrapper.get('.nc-icon')

    expect(root.classes()).toContain('custom')
    expect(root.attributes('title')).toBe('Home')
  })
})
