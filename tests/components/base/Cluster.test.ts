// @vitest-environment nuxt
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { BaseCluster } from '#components'

describe('BaseCluster', () => {
  it('renders a div with the cluster class and no settings by default', async () => {
    const wrapper = await mountSuspended(BaseCluster, {
      slots: { default: () => 'Content' },
    })
    const root = wrapper.get('.nc-cluster')

    expect(root.element.tagName).toBe('DIV')
    expect(root.attributes('style')).toBeUndefined()
    expect(root.text()).toBe('Content')
  })

  it('renders the element given in as', async () => {
    const wrapper = await mountSuspended(BaseCluster, { props: { as: 'ul' } })

    expect(wrapper.get('.nc-cluster').element.tagName).toBe('UL')
  })

  it('takes a gap per breakpoint from the spacing scale', async () => {
    const wrapper = await mountSuspended(BaseCluster, {
      props: { gap: { base: 2, lg: 4 } },
    })

    expect(wrapper.get('.nc-cluster').attributes('style')).toBe(
      '--cluster-gap: var(--space-2); --cluster-gap-lg: var(--space-4);',
    )
  })

  it.each([
    ['start', 'flex-start'],
    ['center', 'center'],
    ['end', 'flex-end'],
    ['between', 'space-between'],
  ] as const)('justifies its items to %s', async (justify, value) => {
    const wrapper = await mountSuspended(BaseCluster, { props: { justify } })

    expect(wrapper.get('.nc-cluster').attributes('style')).toBe(
      `--cluster-justify: ${value};`,
    )
  })

  it('passes classes and attributes through to the root', async () => {
    const wrapper = await mountSuspended(BaseCluster, {
      attrs: { class: 'tags', 'aria-label': 'Tags' },
    })
    const root = wrapper.get('.nc-cluster')

    expect(root.classes()).toContain('tags')
    expect(root.attributes('aria-label')).toBe('Tags')
  })
})
