import type { ComputedRef } from 'vue'

export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export interface UseBreakpointsReturn {
  active: ComputedRef<Breakpoint | undefined>
  isAtLeast: (breakpoint: Breakpoint) => ComputedRef<boolean>
  isBelow: (breakpoint: Breakpoint) => ComputedRef<boolean>
}

// The breakpoints in pixels, smallest first. They mirror $breakpoints in
// abstracts/_variables.scss, and a test fails if the two drift apart.
export const BREAKPOINTS: Readonly<Record<Breakpoint, number>> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

const NAMES = Object.keys(BREAKPOINTS) as Breakpoint[]

// The apps that listen to the media queries: each one listens once, whatever the
// number of callers
const listening = new WeakSet<object>()

export const useBreakpoints = (): UseBreakpointsReturn => {
  // Whether the viewport is at least as wide as each breakpoint. The server cannot
  // know the width, so it renders the smallest screen, as mobile-first CSS does.
  const matches = useState<Record<Breakpoint, boolean>>(
    'nc-breakpoints',
    () =>
      Object.fromEntries(NAMES.map(name => [name, false])) as Record<
        Breakpoint,
        boolean
      >,
  )

  const nuxtApp = useNuxtApp()

  if (import.meta.client && !listening.has(nuxtApp)) {
    listening.add(nuxtApp)

    const listen = (): void => {
      for (const name of NAMES) {
        const query = window.matchMedia(`(min-width: ${BREAKPOINTS[name]}px)`)

        matches.value[name] = query.matches
        query.addEventListener('change', event => {
          matches.value[name] = event.matches
        })
      }
    }

    // Reading the width during hydration would make the page differ from the
    // server's HTML, so it waits until hydration is over
    if (nuxtApp.isHydrating) {
      nuxtApp.hooks.hookOnce('app:suspense:resolve', listen)
    } else {
      listen()
    }
  }

  return {
    active: computed(() => NAMES.findLast(name => matches.value[name])),
    isAtLeast: breakpoint => computed(() => matches.value[breakpoint]),
    isBelow: breakpoint => computed(() => !matches.value[breakpoint]),
  }
}
