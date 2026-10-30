// @vitest-environment nuxt
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { BaseAvatar } from '#components'

// happy-dom loads no images: each one is complete with no width, as a broken
// image is in a browser. Give them a width, as a loaded image has.
function loadImages(width = 64) {
  vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(
    width,
  )
}

describe('BaseAvatar', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows the initials without an image, named by the person', async () => {
    const wrapper = await mountSuspended(BaseAvatar, {
      props: { name: 'Ada Lovelace' },
    })
    const root = wrapper.get('.nc-avatar')

    expect(root.attributes('role')).toBe('img')
    expect(root.attributes('aria-label')).toBe('Ada Lovelace')
    expect(root.attributes('data-size')).toBe('md')
    expect(wrapper.get('.nc-avatar__initials').text()).toBe('AL')
    expect(wrapper.find('img').exists()).toBe(false)
  })

  it.each([
    ['Plato', 'P'],
    ['  jean   paul  sartre ', 'JS'],
    ['Émile Zola', 'ÉZ'],
  ])('takes the initials of %j', async (name, initials) => {
    const wrapper = await mountSuspended(BaseAvatar, { props: { name } })

    expect(wrapper.get('.nc-avatar__initials').text()).toBe(initials)
  })

  it('shows the image, with the name on the root only', async () => {
    loadImages()
    const wrapper = await mountSuspended(BaseAvatar, {
      props: { name: 'Ada Lovelace', src: '/ada.jpg' },
    })
    const image = wrapper.get('img.nc-avatar__image')

    expect(image.attributes('src')).toBe('/ada.jpg')
    expect(image.attributes('alt')).toBe('')
    expect(wrapper.find('.nc-avatar__initials').exists()).toBe(false)
  })

  it('falls back to the initials when the image fails, until a new one', async () => {
    loadImages()
    const wrapper = await mountSuspended(BaseAvatar, {
      props: { name: 'Ada Lovelace', src: '/missing.jpg' },
    })

    await wrapper.get('img').trigger('error')

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.get('.nc-avatar__initials').text()).toBe('AL')

    await wrapper.setProps({ src: '/ada.jpg' })

    expect(wrapper.get('img').attributes('src')).toBe('/ada.jpg')
  })

  it('falls back to the initials when the image failed before mounting', async () => {
    loadImages(0)
    const wrapper = await mountSuspended(BaseAvatar, {
      props: { name: 'Ada Lovelace', src: '/missing.jpg' },
    })

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.get('.nc-avatar__initials').text()).toBe('AL')
  })

  it('is hidden from screen readers when decorative', async () => {
    const wrapper = await mountSuspended(BaseAvatar, {
      props: { name: 'Ada Lovelace', decorative: true },
    })
    const root = wrapper.get('.nc-avatar')

    expect(root.attributes('aria-hidden')).toBe('true')
    expect(root.attributes('role')).toBeUndefined()
    expect(root.attributes('aria-label')).toBeUndefined()
  })

  it('takes its size, and passes classes and attributes through', async () => {
    const wrapper = await mountSuspended(BaseAvatar, {
      props: { name: 'Ada Lovelace', size: 'lg' },
      attrs: { class: 'custom', title: 'Author' },
    })
    const root = wrapper.get('.nc-avatar')

    expect(root.attributes('data-size')).toBe('lg')
    expect(root.classes()).toContain('custom')
    expect(root.attributes('title')).toBe('Author')
  })
})
