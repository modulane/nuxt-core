# Using Nuxt Core in a site

Nuxt Core is a set of [Nuxt layers](https://nuxt.com/docs/guide/going-further/layers) in one package. A site installs the package once, then extends the parts it wants: the unstyled primitives, the design system, or both. This guide is for sites built on Nuxt Core. To work on Nuxt Core itself, see [getting-started.md](getting-started.md).

## Requirements

- Nuxt 4.5.2 or later, the `peerDependencies` range in `package.json`
- A Node.js version that Nuxt supports, listed in [getting-started.md](getting-started.md#requirements)
- Read access to [modulane/nuxt-core](https://github.com/modulane/nuxt-core) on GitHub, while the repository is private

## Installation

Nuxt Core is released as Git tags and GitHub releases, not on the npm registry. Install a release tag; the [releases page](https://github.com/modulane/nuxt-core/releases) lists them. With `v0.1.0` as the example:

```bash
# Yarn
yarn add @modulane/nuxt-core@github:modulane/nuxt-core#v0.1.0

# npm
npm install github:modulane/nuxt-core#v0.1.0

# pnpm
pnpm add github:modulane/nuxt-core#v0.1.0
```

The package manager installs the layers' own dependencies, such as `sass`, with it. With pnpm, which does not hoist dependencies, also add `sass` to the site: Vite looks for it from the site's root.

To update, install a newer tag the same way. The [release notes](https://github.com/modulane/nuxt-core/releases) list what changed, and a major version lists what breaks.

## Choosing the parts

Extend one entry point in the site's `nuxt.config.ts`. [architecture.md](architecture.md#the-parts) explains what each part contains.

| The site wants                                                  | `extends`                            |
| --------------------------------------------------------------- | ------------------------------------ |
| The components, styled by the design system                     | `['@modulane/nuxt-core']`            |
| The components, styled its own way                              | `['@modulane/nuxt-core/primitives']` |
| The design system, with its own or another library's components | `['@modulane/nuxt-core/design']`     |

```ts
export default defineNuxtConfig({
  extends: ['@modulane/nuxt-core'],
})
```

The site keeps its own `app.vue`, pages, `public/` files and configuration. No part provides them.

## Primitives with your own styling

The primitives render accessible markup with no CSS. Style them through their hooks, listed per component in [components.md](components.md):

```css
.nc-button {
  padding: 0.5rem 1rem;
}

.nc-button[data-variant='secondary'] {
  background: transparent;
}

.nc-button:disabled {
  opacity: 0.5;
}
```

Classes set on a primitive land on its root element, so utility-first CSS works without a stylesheet:

```vue
<BaseButton class="rounded bg-teal-700 px-4 py-2 text-white">Save</BaseButton>
```

## The design system with other components

The design system styles the page (tokens, reset, typography, layout classes such as `.nc-container`) and the primitives' hooks. With other components, use its tokens directly: the CSS custom properties, such as `var(--color-primary)` or `var(--space-4)`, work in any stylesheet, and a component library that reads CSS variables can be pointed at them.

To use the SCSS breakpoints and mixins, import them through the design layer's alias:

```vue
<style lang="scss">
@use '#layers/nuxt-core-design/app/assets/scss/abstracts/variables' as *;
@use '#layers/nuxt-core-design/app/assets/scss/abstracts/mixins' as *;

.hero {
  @include respond-to($breakpoint-md) {
    padding: var(--space-8);
  }
}
</style>
```

## Overriding

**Styles.** All of the design system's CSS sits in `nuxt-core` [cascade layers](architecture.md#the-cascade), so any rule in the site wins over it, whatever the specificity or load order. To change a token, redefine it:

```css
:root {
  --color-primary: #0f766e;
}
```

**Files.** A file in the site with the same name as a file in a layer replaces it: the site's file wins.

- **Component:** `app/components/base/Container.vue` in the site replaces `<BaseContainer>` everywhere, including inside the layers' own components.
- **Layout:** `app/layouts/default.vue` in the site replaces the default layout.
- **Composable:** a composable of the same name in the site's `app/composables/` replaces the layer's.
- **Configuration:** the site's `nuxt.config.ts` takes precedence over the layers'.
