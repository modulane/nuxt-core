import type { Ref, WritableComputedRef } from 'vue'

export type ColorScheme = 'dark' | 'light'

export interface UseThemeReturn {
  colorScheme: Readonly<Ref<ColorScheme>>
  isDark: WritableComputedRef<boolean>
  setColorScheme: (next: ColorScheme) => void
  toggleColorScheme: () => void
}

const DEFAULT_COLOR_SCHEME: ColorScheme = 'dark'

// The visitor's choice is kept in a cookie rather than localStorage, so the server
// renders the page in the right scheme and it does not flash on load.
const COOKIE_NAME = 'nc-color-scheme'
const ONE_YEAR = 60 * 60 * 24 * 365

const isColorScheme = (value: unknown): value is ColorScheme =>
  value === 'dark' || value === 'light'

export const useTheme = (): UseThemeReturn => {
  const cookie = useCookie<string | null>(COOKIE_NAME, {
    maxAge: ONE_YEAR,
    sameSite: 'lax',
  })

  // Shared by every caller, so a switch anywhere updates the whole page
  const colorScheme = useState<ColorScheme>(COOKIE_NAME, () =>
    isColorScheme(cookie.value) ? cookie.value : DEFAULT_COLOR_SCHEME,
  )

  const setColorScheme = (next: ColorScheme): void => {
    colorScheme.value = next
    cookie.value = next
  }

  const toggleColorScheme = (): void => {
    setColorScheme(colorScheme.value === 'dark' ? 'light' : 'dark')
  }

  const isDark = computed({
    get: () => colorScheme.value === 'dark',
    set: value => setColorScheme(value ? 'dark' : 'light'),
  })

  return {
    colorScheme: readonly(colorScheme),
    isDark,
    setColorScheme,
    toggleColorScheme,
  }
}
