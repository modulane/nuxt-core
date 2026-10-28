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
│   ├── _reset.scss        Browser style reset
│   └── _typography.scss   Page colours, text, headings, links, code
├── schemes/               Colour and shadow tokens of each colour scheme
│   ├── _dark.scss         Dark, the default
│   └── _light.scss        Light, with data-color-scheme="light"
├── layout/
│   ├── _container.scss    .nc-container
│   └── _grid.scss         (empty) Grid utilities
├── components/            The styles of each primitive, one partial per component
│   └── _switch.scss       .nc-switch
└── utilities/
    └── _utilities.scss    .nc-flow
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

The design layer sets the attribute on `<html>` from [`useTheme()`](composables.md#usetheme), which remembers the visitor's choice in a cookie; a switch is one line, `<FormSwitch v-model="isDark">Dark mode</FormSwitch>`. The attribute also works on any element, to show one area in the other scheme, and `data-color-scheme="dark"` forces dark inside a light page. Each scheme also sets [`color-scheme`](https://developer.mozilla.org/docs/Web/CSS/color-scheme), so form controls and scrollbars match.

The design system does not follow the visitor's system preference (`prefers-color-scheme`) yet.

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
| `--color-border-strong`      | `#718096` | `#7c8aa0` | Outline of form controls    |

Both schemes pair a slate neutral scale with an indigo accent. In each, every text colour meets WCAG AA (4.5:1) on `--color-background` and `--color-surface`, and each `-contrast` colour meets it on its pair.

`--color-border` is for decoration only: dividers, and edges of cards that are already set apart by their background. A boundary the visitor needs to see to use a control (an input, a checkbox, a switch's track) uses `--color-border-strong`, which meets the 3:1 that [WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) asks for on `--color-background` and `--color-surface`.

#### Status colours

For messages and feedback: a form error, a saved notice, a warning. Each has a `-contrast` colour for text on it.

| Token                      | Dark      | Light     | Use                            |
| -------------------------- | --------- | --------- | ------------------------------ |
| `--color-success`          | `#4ade80` | `#15803d` | Something worked               |
| `--color-success-contrast` | `#0f172a` | `#ffffff` | Text on `--color-success`      |
| `--color-warning`          | `#fbbf24` | `#b45309` | Something needs attention      |
| `--color-warning-contrast` | `#0f172a` | `#ffffff` | Text on `--color-warning`      |
| `--color-danger`           | `#f87171` | `#dc2626` | Errors and destructive actions |
| `--color-danger-contrast`  | `#0f172a` | `#ffffff` | Text on `--color-danger`       |
| `--color-info`             | `#38bdf8` | `#0369a1` | Neutral information            |
| `--color-info-contrast`    | `#0f172a` | `#ffffff` | Text on `--color-info`         |

Each status colour also meets WCAG AA as text on `--color-background` and `--color-surface`, so an error message can use it directly. Colour alone does not carry the meaning: a component that shows a status also says it in text or with an icon.

#### Interaction states

Hover and active shades of the action colours. Their `-contrast` colour stays the same.

| Token                      | Dark      | Light     | Use                                   |
| -------------------------- | --------- | --------- | ------------------------------------- |
| `--color-primary-hover`    | `#a5b4fc` | `#4338ca` | `--color-primary` under the pointer   |
| `--color-primary-active`   | `#c7d2fe` | `#3730a3` | `--color-primary` while pressed       |
| `--color-secondary-hover`  | `#f1f5f9` | `#0f172a` | `--color-secondary` under the pointer |
| `--color-secondary-active` | `#f8fafc` | `#020617` | `--color-secondary` while pressed     |
| `--opacity-disabled`       | 0.5       | 0.5       | Opacity of a disabled control         |

Each step moves away from the background: lighter in the dark scheme, darker in the light one. Contrast with the `-contrast` text therefore only grows. A disabled control is faded with `--opacity-disabled` and shows a `not-allowed` cursor; it keeps its colours, so it works for any colour and in both schemes.

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

| Token                    | Value                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| `--font-family-body`     | `system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`              |
| `--font-family-heading`  | Same as `--font-family-body`                                                                     |
| `--font-family-mono`     | `ui-monospace, 'SFMono-Regular', 'Cascadia Code', Menlo, Consolas, 'Liberation Mono', monospace` |
| `--font-size-sm`         | 0.875rem                                                                                         |
| `--font-size-md`         | 1rem                                                                                             |
| `--font-size-lg`         | 1.125rem                                                                                         |
| `--font-size-xl`         | 1.25rem                                                                                          |
| `--font-size-2xl`        | 1.5rem                                                                                           |
| `--font-size-3xl`        | 2.25rem                                                                                          |
| `--font-size-4xl`        | 3rem                                                                                             |
| `--font-weight-normal`   | 400                                                                                              |
| `--font-weight-medium`   | 500                                                                                              |
| `--font-weight-semibold` | 600                                                                                              |
| `--line-height-tight`    | 1.2, for headings and code blocks                                                                |
| `--line-height-normal`   | 1.6, for running text                                                                            |

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

### Layout tokens

| Token                   | Value  | Use                                               |
| ----------------------- | ------ | ------------------------------------------------- |
| `--container-max-width` | 1200px | Maximum width of [`.nc-container`](#nc-container) |

### Borders and focus ring

| Token                  | Value                              | Use                                     |
| ---------------------- | ---------------------------------- | --------------------------------------- |
| `--border-width-thin`  | 1px                                | Borders and dividers                    |
| `--border-width-thick` | 3px                                | Accent rules, such as a blockquote's    |
| `--focus-ring-width`   | 2px                                | Width of the keyboard focus outline     |
| `--focus-ring-offset`  | 2px                                | Gap between the element and its outline |
| `--focus-ring-color`   | `var(--color-primary)`, per scheme | Colour of the keyboard focus outline    |

`--focus-ring-color` is set in each colour scheme rather than on `:root`. A custom property that refers to another is resolved where it is declared, so a ring defined once on `:root` would keep the page's primary inside an area with `data-color-scheme` set.

### Layering

`z-index` values for the parts of a page that overlap others, lowest first:

| Token              | Value | Use                                         |
| ------------------ | ----- | ------------------------------------------- |
| `--z-dropdown`     | 100   | Dropdowns, popovers, tooltips               |
| `--z-sticky`       | 200   | Sticky and fixed headers                    |
| `--z-modal`        | 300   | Modal dialogs and their backdrop            |
| `--z-notification` | 400   | Notifications, which must show over a modal |

A dropdown opened in the page scrolls under the sticky header. A dropdown inside the header is in the header's stacking context, so it still shows over the page. A dialog opened with `showModal()` goes to the browser's top layer and needs none of these.

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

## Base styles

Every page gets them, in the `nuxt-core.reset` and `nuxt-core.base` [cascade layers](#the-cascade), so a site's own CSS overrides any of them.

### Reset

[`base/_reset.scss`](../layers/design/app/assets/scss/base/_reset.scss) removes the browser defaults that get in the way, and nothing else:

- Every element uses `box-sizing: border-box`.
- Headings, paragraphs, lists, `figure`, `blockquote`, `dl` and `dd` have no margin, and `body` has none either. Spacing is set where it is wanted: by [`.nc-flow`](#nc-flow) for running text, and by each component for its own.
- Images, videos, canvases and SVGs are blocks that never overflow their container.
- Form controls inherit the page's font and colour.
- Long words and URLs wrap instead of overflowing.
- `body` fills at least the viewport, and tables collapse their borders.

Lists keep their bullets and padding, only their margins go: removing the bullets is a choice for each list, and some screen readers stop announcing a list without its bullets.

### Typography

[`base/_typography.scss`](../layers/design/app/assets/scss/base/_typography.scss) styles plain HTML with the tokens, so content looks right without classes:

| Element                         | Style                                                                                              |
| ------------------------------- | -------------------------------------------------------------------------------------------------- |
| `body`                          | `--font-family-body`, `--font-size-md`, `--line-height-normal`, the scheme's colours               |
| `h1`–`h6`                       | `--font-family-heading`, `--font-weight-semibold`, `--line-height-tight`, balanced lines           |
| `h1`, `h2`                      | `--font-size-4xl` and `-3xl` from `$breakpoint-md`, one step smaller below it                      |
| `h3` to `h6`                    | `--font-size-2xl`, `-xl`, `-lg` and `-md`                                                          |
| `a`                             | `--color-primary`, underlined; the underline thickens on hover                                     |
| `code`, `kbd`, `samp`, `pre`    | `--font-family-mono`. Inline `code` and `kbd` sit on `--color-surface`; `pre` is a scrolling block |
| List markers                    | `--color-text-muted`                                                                               |
| `blockquote`                    | `--color-text-muted`, with a `--color-primary` rule on its start side                              |
| `strong`, `small`, `hr`, `mark` | Semibold; `--font-size-sm`; a `--color-border` line; a `--color-primary` tint                      |

Text selection is tinted with `--color-primary`, and every focusable element shows the [focus ring](#borders-and-focus-ring) when it is focused with the keyboard. A component that draws its own focus indicator overrides that outline.

### `.nc-flow`

Spaces the children of running text, such as an article or the HTML of a rich-text field, whose margins the reset removes. Each child gets `--space-4` above it; a heading gets `--space-8` above and `--space-3` below, so it groups with the text that follows; list items get `--space-2` between them, so a list still reads as one block. Set `--flow-space` on the element to use one gap for every child instead.

```html
<article class="nc-flow">
  <h2>Title</h2>
  <p>First paragraph.</p>
  <p>Second paragraph.</p>
</article>
```

The class is in the `nuxt-core.utilities` layer and, like every class of the design system, prefixed with `nc-`.

## Layout

### `.nc-container`

Centres content and limits its width to `--container-max-width` (1200px), keeping a `--space-4` margin on each side on small screens. The [`BaseContainer`](components.md) component renders a `<div class="nc-container">`. The class is prefixed so that it does not clash with the `.container` of Tailwind or Bootstrap.
