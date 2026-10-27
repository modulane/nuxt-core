# Composables

Every composable, and how to document a new one. Composables are auto-imported: call them without an `import`.

## Inventory

| Composable         | File                                              | Status | Purpose                                                        |
| ------------------ | ------------------------------------------------- | ------ | -------------------------------------------------------------- |
| `useBreakpoints()` | `layers/design/app/composables/useBreakpoints.ts` | Stub   | Reactive access to the [breakpoints](styling.md#breakpoints)   |
| `useTheme()`       | `layers/design/app/composables/useTheme.ts`       | Ready  | Read and switch the [colour scheme](styling.md#colour-schemes) |

**Stubs** reserve the name and the file, and return an empty `ref()`. Do not use them yet.

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
