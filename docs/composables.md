# Composables

Every composable, and how to document a new one. Composables are auto-imported: call them without an `import`.

## Inventory

| Composable         | File                                              | Status | Purpose                                                        |
| ------------------ | ------------------------------------------------- | ------ | -------------------------------------------------------------- |
| `useBreakpoints()` | `layers/design/app/composables/useBreakpoints.ts` | Ready  | Reactive access to the [breakpoints](styling.md#breakpoints)   |
| `useTheme()`       | `layers/design/app/composables/useTheme.ts`       | Ready  | Read and switch the [colour scheme](styling.md#colour-schemes) |

## useBreakpoints

Reports which [breakpoint](styling.md#breakpoints) the window has reached, for layout decisions CSS cannot make: rendering a different component on small screens, or loading less on them. For anything CSS can do, such as hiding, resizing or rearranging, use the [`respond-to()` mixin](styling.md#mixins) instead: it applies before the page's JavaScript runs, so nothing jumps.

```vue
<template>
  <MobileMenu v-if="isBelowMd" />
  <DesktopMenu v-else />
</template>

<script setup lang="ts">
const { isBelow } = useBreakpoints()
const isBelowMd = isBelow('md')
</script>
```

No options.

| Returns     | Type                                               | Description                                                         |
| ----------- | -------------------------------------------------- | ------------------------------------------------------------------- |
| `active`    | `ComputedRef<Breakpoint \| undefined>`             | The widest breakpoint the window reaches, or `undefined` below `sm` |
| `isAtLeast` | `(breakpoint: Breakpoint) => ComputedRef<boolean>` | Whether the window is at least that wide, as `respond-to()`         |
| `isBelow`   | `(breakpoint: Breakpoint) => ComputedRef<boolean>` | Whether the window is narrower, as `respond-below()`                |

`Breakpoint` is `'sm' | 'md' | 'lg' | 'xl' | '2xl'`. The layer also exports `BREAKPOINTS`, their widths in pixels (`{ sm: 640, … }`), which is auto-imported like the composable: for an image's `sizes` attribute, for example. They are the same as the Sass `$breakpoints`, and a test fails if the two drift apart.

Every caller shares one state, and the page listens to one media query per breakpoint, whatever the number of callers.

**SSR:** runs on the server, which cannot know the window's width: there, and in the browser until hydration is over, it reports the smallest screen (`active` is `undefined`, `isBelow('sm')` is true), as mobile-first CSS does. The browser then updates it to the real width, so content that depends on it changes once the page has loaded. That is why CSS is the better tool for what is visible on the first paint.

## useTheme

Reads and switches the [colour scheme](styling.md#colour-schemes), dark or light. Every caller shares one state, and the design layer applies it to `<html>` on every page, so a switch anywhere repaints the whole site. Themes are [planned](theming.md); for now it handles only the colour scheme.

```vue
<template>
  <FormSwitch v-model="isDark">Dark mode</FormSwitch>
</template>

<script setup lang="ts">
const { isDark } = useTheme()
</script>
```

No options.

| Returns             | Type                           | Description                                         |
| ------------------- | ------------------------------ | --------------------------------------------------- |
| `colorScheme`       | `Readonly<Ref<ColorScheme>>`   | The current scheme, `'dark'` (default) or `'light'` |
| `isDark`            | `WritableComputedRef<boolean>` | Whether the scheme is dark; setting it switches     |
| `setColorScheme`    | `(next: ColorScheme) => void`  | Switches to the given scheme                        |
| `toggleColorScheme` | `() => void`                   | Switches to the other scheme                        |

The choice is saved for a year in the `nc-color-scheme` cookie, which the feature needs to work; it does not track the visitor.

**SSR:** runs on the server. It reads the cookie there, so the page is rendered in the visitor's scheme and does not flash on load.

## Documenting a composable

When a composable moves from stub to ready, add a section with this structure, and change its status in the inventory:

````markdown
## useExample

One or two sentences: what it does and when to use it.

```ts
const { value, set } = useExample({ initial: 1 })
```

| Option    | Type     | Default | Description        |
| --------- | -------- | ------- | ------------------ |
| `initial` | `number` | `0`     | The starting value |

| Returns | Type                     | Description        |
| ------- | ------------------------ | ------------------ |
| `value` | `Readonly<Ref<number>>`  | The current value  |
| `set`   | `(next: number) => void` | Replaces the value |

**SSR:** whether it runs on the server, and what it returns there.
````
