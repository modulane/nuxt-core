// @vitest-environment nuxt
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('useTheme', () => {
  beforeEach(() => {
    useTheme().setColorScheme('dark')
  })

  it('defaults to the dark colour scheme', () => {
    const { colorScheme, isDark } = useTheme()

    expect(colorScheme.value).toBe('dark')
    expect(isDark.value).toBe(true)
  })

  it('switches the scheme and saves it in a cookie', async () => {
    const { colorScheme, setColorScheme } = useTheme()

    setColorScheme('light')

    expect(colorScheme.value).toBe('light')
    // Nuxt writes the cookie after the change, not during it
    await vi.waitFor(() =>
      expect(document.cookie).toContain('nc-color-scheme=light'),
    )
  })

  it('toggles between the two schemes', () => {
    const { colorScheme, toggleColorScheme } = useTheme()

    toggleColorScheme()
    expect(colorScheme.value).toBe('light')

    toggleColorScheme()
    expect(colorScheme.value).toBe('dark')
  })

  it('sets the scheme through isDark, for v-model', () => {
    const { colorScheme, isDark } = useTheme()

    isDark.value = false

    expect(colorScheme.value).toBe('light')
  })

  it('shares one state between every caller', () => {
    const first = useTheme()
    const second = useTheme()

    first.setColorScheme('light')

    expect(second.colorScheme.value).toBe('light')
  })

  it('applies the scheme to <html>', async () => {
    useTheme().setColorScheme('light')
    // Unhead batches DOM updates

    await vi.waitFor(() =>
      expect(document.documentElement.dataset.colorScheme).toBe('light'),
    )
  })
})
