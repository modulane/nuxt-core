# Composables

Every composable in `app/composables/`, and how to document a new one. Composables are auto-imported: call them without an `import`.

## Inventory

| Composable         | File                                | Status | Purpose                                                      |
| ------------------ | ----------------------------------- | ------ | ------------------------------------------------------------ |
| `useBreakpoints()` | `app/composables/useBreakpoints.ts` | Stub   | Reactive access to the [breakpoints](styling.md#breakpoints) |
| `useTheme()`       | `app/composables/useTheme.ts`       | Stub   | Read and switch the [theme](theming.md)                      |

**Stubs** reserve the name and the file, and return an empty `ref()`. Do not use them yet.

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
