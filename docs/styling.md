# Styling

The design system is the [design layer](architecture.md#the-parts), `@modulane/nuxt-core/design`. It is written in [Sass](https://sass-lang.com/) (SCSS) and CSS custom properties, without a UI library, and works with the Nuxt Core primitives or with any other components. Custom properties hold the design values, so they can change at runtime (for [themes](theming.md)); Sass provides the structure and the helpers.

## SCSS architecture

```text
layers/design/app/assets/scss/
├── main.scss              Entry point, loaded on every page
├── abstracts/             Sass-only helpers; they emit no CSS
│   ├── _variables.scss    Breakpoints
│   ├── _mixins.scss       respond-to()
│   └── _functions.scss    (empty)
├── base/
│   ├── _root.scss         Design tokens shared by every colour scheme, on :root
│   ├── _reset.scss        (empty) Browser style reset
│   └── _typography.scss   Page background, text colour and font
├── schemes/               Colour and shadow tokens of each colour scheme
│   ├── _dark.scss         Dark, the default
│   └── _light.scss        Light, with data-color-scheme="light"
├── layout/
│   ├── _container.scss    .nc-container
│   └── _grid.scss         (empty) Grid utilities
├── components/            The styles of each primitive, one partial per component
│   └── _switch.scss       .nc-switch
└── utilities/
    └── _utilities.scss    (empty) Single-purpose helper classes
```

The design layer's [`nuxt.config.ts`](../layers/design/nuxt.config.ts) loads `main.scss` on every page of every site through its `css` option. `main.scss` loads each partial that emits CSS into its [cascade layer](#the-cascade). The abstracts are not loaded globally; each stylesheet that needs them imports them itself (see [Breakpoints](#breakpoints)).

**The primitives have no styles of their own.** The styles of a primitive live here, in `components/_<name>.scss`, and target only its [hooks](architecture.md#the-styling-hooks): the `nc-<name>` class, its `data-*` attributes and its HTML and ARIA states. That keeps the primitives usable with any styling, and the design system usable with any components.

## The cascade

Every rule sits in a `nuxt-core` [cascade layer](https://developer.mozilla.org/docs/Web/CSS/@layer), declared in this order, lowest priority first:

| Layer                  | Contents                      |
| ---------------------- | ----------------------------- |
| `nuxt-core.tokens`     | The design tokens and schemes |
| `nuxt-core.reset`      | The browser reset             |
| `nuxt-core.base`       | Page colours and typography   |
| `nuxt-core.layout`     | `.nc-container` and the grid  |
| `nuxt-core.components` | The styles of the primitives  |
| `nuxt-core.utilities`  | Single-purpose helper classes |

A later layer wins over an earlier one, and CSS outside any layer wins over all of them, whatever its specificity or load order. A site overrides the design system by writing plain CSS, without `!important` or longer selectors.

## Design tokens

Defined in [`base/_root.scss`](../layers/design/app/assets/scss/base/_root.scss) and, for the colours and shadows, in each [colour scheme](#colour-schemes). Available everywhere as `var(--name)`.

### Colour schemes

The design system has two colour schemes, which give the colour and shadow tokens their values. **Dark is the default.** Light is applied by a `data-color-scheme` attribute:

```html
<html data-color-scheme="light"></html>
```

A site sets it with `useHead({ htmlAttrs: { 'data-color-scheme': 'light' } })`. The attribute also works on any element, to show one area in the other scheme, and `data-color-scheme="dark"` forces dark inside a light page. Each scheme also sets [`color-scheme`](https://developer.mozilla.org/docs/Web/CSS/color-scheme), so form controls and scrollbars match.

The design system does not follow the visitor's system preference or offer a switch yet: both come with [`useTheme()`](theming.md).

### Colours

| Token                        | Dark      | Light     | Use                         |
| ---------------------------- | --------- | --------- | --------------------------- |
| `--color-primary`            | `#818cf8` | `#4f46e5` | Primary actions and accents |
| `--color-primary-contrast`   | `#0f172a` | `#ffffff` | Text on `--color-primary`   |
| `--color-secondary`          | `#e2e8f0` | `#1e293b` | Secondary actions           |
| `--color-secondary-contrast` | `#0f172a` | `#ffffff` | Text on `--color-secondary` |
| `--color-background`         | `#0f172a` | `#ffffff` | Page background             |
| `--color-surface`            | `#1e293b` | `#f8fafc` | Cards and raised areas      |
| `--color-text`               | `#f1f5f9` | `#0f172a` | Body text                   |
| `--color-text-muted`         | `#94a3b8` | `#64748b` | Secondary text              |
| `--color-border`             | `#334155` | `#e2e8f0` | Borders and dividers        |

Both schemes pair a slate neutral scale with an indigo accent. In each, every text colour meets WCAG AA (4.5:1) on `--color-background` and `--color-surface`, and each `-contrast` colour meets it on its pair.

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

| Token                   | Value                                                                               |
| ----------------------- | ----------------------------------------------------------------------------------- |
| `--font-family-body`    | `system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif` |
| `--font-family-heading` | Same as `--font-family-body`                                                        |
| `--font-size-sm`        | 0.875rem                                                                            |
| `--font-size-md`        | 1rem                                                                                |
| `--font-size-lg`        | 1.125rem                                                                            |
| `--font-size-xl`        | 1.25rem                                                                             |
| `--font-size-2xl`       | 1.5rem                                                                              |
| `--font-size-3xl`       | 2.25rem                                                                             |
| `--font-size-4xl`       | 3rem                                                                                |

### Radius, shadows and motion

| Token               | Value                               |
| ------------------- | ----------------------------------- |
| `--radius-sm`       | 0.375rem                            |
| `--radius-md`       | 0.625rem                            |
| `--radius-lg`       | 1rem                                |
| `--radius-full`     | 9999px                              |
| `--shadow-sm`       | Set by the colour scheme, see below |
| `--shadow-md`       | Set by the colour scheme, see below |
| `--shadow-lg`       | Set by the colour scheme, see below |
| `--duration-fast`   | 150ms                               |
| `--duration-normal` | 200ms                               |
| `--duration-slow`   | 350ms                               |
| `--ease-standard`   | `cubic-bezier(0.2, 0, 0, 1)`        |

| Token         | Dark                                                       | Light                                                           |
| ------------- | ---------------------------------------------------------- | --------------------------------------------------------------- |
| `--shadow-sm` | `0 1px 2px rgb(0 0 0 / 30%)`                               | `0 1px 2px rgb(15 23 42 / 6%)`                                  |
| `--shadow-md` | `0 1px 3px rgb(0 0 0 / 30%), 0 4px 12px rgb(0 0 0 / 35%)`  | `0 1px 3px rgb(15 23 42 / 6%), 0 4px 12px rgb(15 23 42 / 8%)`   |
| `--shadow-lg` | `0 4px 6px rgb(0 0 0 / 30%), 0 12px 32px rgb(0 0 0 / 45%)` | `0 4px 6px rgb(15 23 42 / 5%), 0 12px 32px rgb(15 23 42 / 12%)` |

The dark shadows are much stronger, or they would not show on a dark background. The light ones are tinted with the hue of `--color-text` rather than pure black, so they belong to the palette.

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
@use '#layers/nuxt-core-design/app/assets/scss/abstracts/variables' as *;
@use '#layers/nuxt-core-design/app/assets/scss/abstracts/mixins' as *;

.card {
  padding: var(--space-4);

  @include respond-to($breakpoint-md) {
    padding: var(--space-8);
  }
}
</style>
```

## Layout

### `.nc-container`

Centres content and limits its width to 1200px, keeping a `--space-4` margin on each side on small screens. The [`BaseContainer`](components.md) component renders a `<div class="nc-container">`. The class is prefixed so that it does not clash with the `.container` of Tailwind or Bootstrap.
