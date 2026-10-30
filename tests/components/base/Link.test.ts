// @vitest-environment nuxt
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { BaseLink } from '#components'

describe('BaseLink', () => {
  it('renders an internal link with no external marks', async () => {
    const wrapper = await mountSuspended(BaseLink, {
      props: { to: '/about' },
      slots: { default: () => 'About' },
    })
    const link = wrapper.get('a')

    expect(link.classes()).toContain('nc-link')
    expect(link.attributes('href')).toBe('/about')
    expect(link.attributes('data-external')).toBeUndefined()
    expect(link.attributes('target')).toBeUndefined()
    expect(link.text()).toBe('About')
  })

  it('marks a link to another website', async () => {
    const wrapper = await mountSuspended(BaseLink, {
      props: { to: 'https://nuxt.com' },
    })
    const link = wrapper.get('a')

    expect(link.attributes('href')).toBe('https://nuxt.com')
    expect(link.attributes('data-external')).toBeDefined()
  })

  it('does not mark mailto links as external', async () => {
    const wrapper = await mountSuspended(BaseLink, {
      props: { to: 'mailto:hello@example.com' },
    })

    expect(wrapper.get('a').attributes('data-external')).toBeUndefined()
  })

  it('opens a new tab safely, and says so in English by default', async () => {
    const wrapper = await mountSuspended(BaseLink, {
      props: { to: 'https://nuxt.com', newTab: true },
      slots: { default: () => 'Nuxt' },
    })
    const link = wrapper.get('a')

    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toContain('noopener')
    expect(wrapper.get('.nc-link__new-tab').text()).toBe('(opens in a new tab)')
  })

  it('takes the new-tab text in the site language', async () => {
    const wrapper = await mountSuspended(BaseLink, {
      props: {
        to: '/cgv',
        newTab: true,
        newTabLabel: "s'ouvre dans un nouvel onglet",
      },
    })

    expect(wrapper.get('.nc-link__new-tab').text()).toBe(
      "(s'ouvre dans un nouvel onglet)",
    )
  })

  it('passes classes and attributes through to the link', async () => {
    const wrapper = await mountSuspended(BaseLink, {
      props: { to: '/' },
      attrs: { class: 'custom', 'aria-current': 'page' },
    })
    const link = wrapper.get('a')

    expect(link.classes()).toContain('custom')
    expect(link.attributes('aria-current')).toBe('page')
  })
})
