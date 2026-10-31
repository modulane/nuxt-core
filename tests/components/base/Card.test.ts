// @vitest-environment nuxt
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { BaseCard } from '#components'

const parts = ['header', 'media', 'body', 'footer']

describe('BaseCard', () => {
  it('renders a div with no parts and no link by default', async () => {
    const wrapper = await mountSuspended(BaseCard)
    const root = wrapper.get('.nc-card')

    expect(root.element.tagName).toBe('DIV')
    expect(root.attributes('data-linked')).toBeUndefined()
    expect(root.find('a').exists()).toBe(false)

    for (const part of parts) {
      expect(root.find(`.nc-card__${part}`).exists()).toBe(false)
    }
  })

  it('renders each part from its slot, the header before the media', async () => {
    const wrapper = await mountSuspended(BaseCard, {
      slots: {
        media: () => 'Image',
        header: () => 'Title',
        default: () => 'Text',
        footer: () => 'Actions',
      },
    })
    const classes = Array.from(
      wrapper.get('.nc-card').element.children,
      child => child.className,
    )

    expect(classes).toEqual(parts.map(part => `nc-card__${part}`))
    expect(wrapper.get('.nc-card__body').text()).toBe('Text')
  })

  it('renders the element given in as', async () => {
    const wrapper = await mountSuspended(BaseCard, { props: { as: 'li' } })

    expect(wrapper.get('.nc-card').element.tagName).toBe('LI')
  })

  it('makes the header the link of a linked card', async () => {
    const wrapper = await mountSuspended(BaseCard, {
      props: { to: '/blog/first-post' },
      slots: { header: () => 'First post', default: () => 'Summary' },
    })
    const link = wrapper.get('.nc-card__header a.nc-card__link')

    expect(wrapper.get('.nc-card').attributes('data-linked')).toBe('')
    expect(link.attributes('href')).toBe('/blog/first-post')
    expect(link.text()).toBe('First post')
  })

  it('passes classes and attributes through to the root', async () => {
    const wrapper = await mountSuspended(BaseCard, {
      props: { as: 'article' },
      attrs: { class: 'custom', 'aria-labelledby': 'title' },
    })
    const root = wrapper.get('.nc-card')

    expect(root.classes()).toContain('custom')
    expect(root.attributes('aria-labelledby')).toBe('title')
  })
})
