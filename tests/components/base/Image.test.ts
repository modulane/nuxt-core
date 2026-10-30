// @vitest-environment nuxt
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { BaseImage } from '#components'

const image = { src: '/team.jpg', alt: 'The team', width: 1200, height: 800 }

describe('BaseImage', () => {
  it('renders a lazy image with its size, uncropped', async () => {
    const wrapper = await mountSuspended(BaseImage, { props: image })
    const img = wrapper.get('img.nc-image')

    expect(img.attributes()).toMatchObject({
      src: '/team.jpg',
      alt: 'The team',
      width: '1200',
      height: '800',
      loading: 'lazy',
      decoding: 'async',
    })
    expect(img.attributes('fetchpriority')).toBeUndefined()
    expect(img.attributes('data-fit')).toBeUndefined()
    expect(img.attributes('style')).toBeUndefined()
  })

  it('accepts an empty alt for a decorative image', async () => {
    const wrapper = await mountSuspended(BaseImage, {
      props: { ...image, alt: '' },
    })

    expect(wrapper.get('img').attributes('alt')).toBe('')
  })

  it('loads at once and first with priority', async () => {
    const wrapper = await mountSuspended(BaseImage, {
      props: { ...image, priority: true },
    })
    const img = wrapper.get('img')

    expect(img.attributes('loading')).toBe('eager')
    expect(img.attributes('fetchpriority')).toBe('high')
  })

  it('crops to a ratio, covering by default', async () => {
    const wrapper = await mountSuspended(BaseImage, {
      props: { ...image, ratio: '16 / 9' },
    })
    const img = wrapper.get('img')

    expect(img.attributes('style')).toBe('--image-ratio: 16 / 9;')
    expect(img.attributes('data-fit')).toBe('cover')
  })

  it('fits inside the ratio with contain', async () => {
    const wrapper = await mountSuspended(BaseImage, {
      props: { ...image, ratio: '1', fit: 'contain' },
    })

    expect(wrapper.get('img').attributes('data-fit')).toBe('contain')
  })

  it('passes srcset, sizes and classes through', async () => {
    const wrapper = await mountSuspended(BaseImage, {
      props: image,
      attrs: {
        class: 'custom',
        srcset: '/team-600.jpg 600w, /team.jpg 1200w',
        sizes: '100vw',
      },
    })
    const img = wrapper.get('img')

    expect(img.classes()).toContain('custom')
    expect(img.attributes('srcset')).toBe('/team-600.jpg 600w, /team.jpg 1200w')
    expect(img.attributes('sizes')).toBe('100vw')
  })

  it('renders the component given in as, such as NuxtImg', async () => {
    const FakeImg = defineComponent({
      inheritAttrs: false,
      setup:
        (_, { attrs }) =>
        () =>
          h('img', { ...attrs, 'data-fake': '' }),
    })
    const wrapper = await mountSuspended(BaseImage, {
      props: { ...image, as: FakeImg },
    })
    const img = wrapper.get('img')

    expect(img.attributes('data-fake')).toBe('')
    expect(img.classes()).toContain('nc-image')
    expect(img.attributes('loading')).toBe('lazy')
  })
})
