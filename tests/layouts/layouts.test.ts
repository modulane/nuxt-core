// @vitest-environment nuxt
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AuthLayout from '../../layers/primitives/app/layouts/auth.vue'
import DefaultLayout from '../../layers/primitives/app/layouts/default.vue'

describe.each([
  ['default', DefaultLayout],
  ['auth', AuthLayout],
])('the %s layout', (_name, Layout) => {
  it('renders the page in <main>, the skip link target', async () => {
    const wrapper = await mountSuspended(Layout, {
      slots: { default: () => 'Page' },
    })
    const main = wrapper.get('main')

    expect(main.attributes('id')).toBe('content')
    expect(main.text()).toBe('Page')
    expect(wrapper.get('a.nc-skip-link').attributes('href')).toBe('#content')
  })

  it('opens with a skip link, in English by default', async () => {
    const wrapper = await mountSuspended(Layout)
    const first = wrapper.get('.nc-layout').element.firstElementChild

    expect(first?.classList.contains('nc-skip-link')).toBe(true)
    expect(first?.textContent).toBe('Skip to content')
  })

  it('takes the skip link text in the site language', async () => {
    const wrapper = await mountSuspended(Layout, {
      props: { skipLinkLabel: 'Aller au contenu' },
    })

    expect(wrapper.get('.nc-skip-link').text()).toBe('Aller au contenu')
  })

  it('renders a header and a footer only when given', async () => {
    const empty = await mountSuspended(Layout)

    expect(empty.find('header').exists()).toBe(false)
    expect(empty.find('footer').exists()).toBe(false)

    const full = await mountSuspended(Layout, {
      slots: { header: () => 'Logo', footer: () => '© 2026' },
    })

    expect(full.get('header.nc-layout__header').text()).toBe('Logo')
    expect(full.get('footer.nc-layout__footer').text()).toBe('© 2026')
  })
})

describe('the default layout', () => {
  it('marks a sticky header for the design system', async () => {
    const plain = await mountSuspended(DefaultLayout)
    const sticky = await mountSuspended(DefaultLayout, {
      props: { stickyHeader: true },
    })

    expect(
      plain.get('.nc-layout').attributes('data-sticky-header'),
    ).toBeUndefined()
    expect(
      sticky.get('.nc-layout').attributes('data-sticky-header'),
    ).toBeDefined()
  })
})

describe('the auth layout', () => {
  it('has the modifier class that centres its column', async () => {
    const wrapper = await mountSuspended(AuthLayout)

    expect(wrapper.get('.nc-layout').classes()).toContain('nc-layout--auth')
  })
})
