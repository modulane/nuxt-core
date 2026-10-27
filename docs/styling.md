# Styling

Nuxt Core is styled with [Sass](https://sass-lang.com/) (SCSS) and CSS custom properties, without a UI library. Custom properties hold the design values, so they can change at runtime (for [themes](theming.md)); Sass provides the structure and the helpers.

## SCSS architecture

```text
app/assets/scss/
├── main.scss              Entry point, loaded on every page
├── abstracts/             Sass-only helpers; they emit no CSS
│   ├── _variables.scss    Breakpoints
│   ├── _mixins.scss       respond-to()
│   └── _functions.scss    (empty)
├── base/
│   ├── _root.scss         Design tokens on :root
│   ├── _reset.scss        (empty) Browser style reset
│   └── _typography.scss   (empty) Base text styles
├── layout/
│   ├── _container.scss    .container
│   └── _grid.scss         (empty) Grid utilities
├── components/            (empty) Styles shared by several components
└── utilities/
    └── _utilities.scss    (empty) Single-purpose helper classes
```

[`nuxt.config.ts`](../nuxt.config.ts) loads `main.scss` on every page through its `css` option, and `main.scss` `@use`s each partial that emits CSS, in this order: base, layout, utilities. The abstracts are not loaded globally; each stylesheet that needs them imports them itself (see [Breakpoints](#breakpoints)).

Styles that belong to one component stay in that component's `<style lang="scss">` block.

## Design tokens

Defined in [`base/_root.scss`](../app/assets/scss/base/_root.scss) and available everywhere as `var(--name)`.

### Colours

| Token                        | Value     | Use                         |
| ---------------------------- | --------- | --------------------------- |
| `--color-primary`            | `#18181b` | Primary actions and accents |
| `--color-primary-contrast`   | `#ffffff` | Text on `--color-primary`   |
| `--color-secondary`          | `#71717a` | Secondary actions           |
| `--color-secondary-contrast` | `#ffffff` | Text on `--color-secondary` |
| `--color-background`         | `#ffffff` | Page background             |
| `--color-surface`            | `#f4f4f5` | Cards and raised areas      |
| `--color-text`               | `#18181b` | Body text                   |
| `--color-text-muted`         | `#71717a` | Secondary text              |
| `--color-border`             | `#e4e4e7` | Borders and dividers        |

### Spacing

`--space-1` to `--space-20`, on a 0.25rem (4px) scale: the number is the multiple of 4px.

| Token       | Value   | Token        | Value  |
| ----------- | ------- | ------------ | ------ |
| `--space-1` | 0.25rem | `--space-8`  | 2rem   |
| `--space-2` | 0.5rem  | `--space-10` | 2.5rem |
| `--space-3` | 0.75rem | `--space-12` | 3rem   |
| `--space-4` | 1rem    | `--space-16` | 4rem   |
| `--space-5` | 1.25rem | `--space-20` | 5rem   |
| `--space-6` | 1.5rem  |              |        |

### Typography

| Token                   | Value                   |
| ----------------------- | ----------------------- |
| `--font-family-body`    | `system-ui, sans-serif` |
| `--font-family-heading` | `system-ui, sans-serif` |
| `--font-size-sm`        | 0.875rem                |
| `--font-size-md`        | 1rem                    |
| `--font-size-lg`        | 1.125rem                |
| `--font-size-xl`        | 1.25rem                 |
| `--font-size-2xl`       | 1.5rem                  |
| `--font-size-3xl`       | 2rem                    |
| `--font-size-4xl`       | 3rem                    |

### Radius, shadows and motion

| Token               | Value                          |
| ------------------- | ------------------------------ |
| `--radius-sm`       | 0.25rem                        |
| `--radius-md`       | 0.5rem                         |
| `--radius-lg`       | 0.75rem                        |
| `--radius-full`     | 9999px                         |
| `--shadow-sm`       | `0 1px 2px rgb(0 0 0 / 5%)`    |
| `--shadow-md`       | `0 4px 12px rgb(0 0 0 / 10%)`  |
| `--shadow-lg`       | `0 10px 30px rgb(0 0 0 / 15%)` |
| `--duration-fast`   | 150ms                          |
| `--duration-normal` | 250ms                          |
| `--duration-slow`   | 400ms                          |
| `--ease-standard`   | `ease`                         |

## Breakpoints

Breakpoints are Sass variables, because CSS custom properties cannot be used in media queries.

| Variable          | Value  |
| ----------------- | ------ |
| `$breakpoint-sm`  | 640px  |
| `$breakpoint-md`  | 768px  |
| `$breakpoint-lg`  | 1024px |
| `$breakpoint-xl`  | 1280px |
| `$breakpoint-2xl` | 1536px |

The `respond-to()` mixin applies styles from a breakpoint up. Styles are mobile-first, so write the small-screen version first:

```vue
<style lang="scss">
@use '~/assets/scss/abstracts/variables' as *;
@use '~/assets/scss/abstracts/mixins' as *;

.card {
  padding: var(--space-4);

  @include respond-to($breakpoint-md) {
    padding: var(--space-8);
  }
}
</style>
```

## Layout

### `.container`

Centres content and limits its width to 1200px, keeping a `--space-4` margin on each side on small screens. The [`BaseContainer`](components.md) component renders a `<div class="container">`.
