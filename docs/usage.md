# Using Nuxt Core in a site

Nuxt Core is a [Nuxt layer](https://nuxt.com/docs/guide/going-further/layers). A site installs it as a dependency and adds one line to its `nuxt.config.ts`; Nuxt then merges the layer into the site. This guide is for sites built on Nuxt Core. To work on Nuxt Core itself, see [getting-started.md](getting-started.md).

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

Then extend the layer in the site's `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  extends: ['@modulane/nuxt-core'],
})
```

The package manager installs the layer's own dependencies, such as `sass`, with it. With pnpm, which does not hoist dependencies, also add `sass` to the site: Vite looks for it from the site's root.

To update, install a newer tag the same way. The [release notes](https://github.com/modulane/nuxt-core/releases) list what changed, and a major version lists what breaks.

## What the site receives

| From the layer                                         | In the site                                                                       |
| ------------------------------------------------------ | --------------------------------------------------------------------------------- |
| The global stylesheet: design tokens, `.container`     | Loaded on every page; see [styling.md](styling.md)                                |
| Components in `app/components/`                        | Auto-imported, for example `<BaseContainer>`; see [components.md](components.md)  |
| Composables in `app/composables/`                      | Auto-imported; see [composables.md](composables.md)                               |
| Layouts in `app/layouts/`                              | Available to `<NuxtLayout>`; `default` applies unless a page picks another layout |
| Server routes in `server/` and types in `shared/types` | Merged into the site; none exist yet                                              |

The site keeps its own `app.vue`, pages, `public/` files and configuration. The layer provides none of them.

## Using the design tokens

The CSS custom properties, such as `var(--color-primary)` or `var(--space-4)`, work in any style. To use the SCSS breakpoints and mixins in a site's component, import them through the `#layers/nuxt-core/` alias:

```vue
<style lang="scss">
@use '#layers/nuxt-core/app/assets/scss/abstracts/variables' as *;
@use '#layers/nuxt-core/app/assets/scss/abstracts/mixins' as *;

.hero {
  @include respond-to($breakpoint-md) {
    padding: var(--space-8);
  }
}
</style>
```

## Overriding the layer

A file in the site with the same name as a file in the layer replaces it: the site's file wins.

- **Component:** `app/components/base/Container.vue` in the site replaces `<BaseContainer>` everywhere, including inside the layer's own components.
- **Layout:** `app/layouts/default.vue` in the site replaces the default layout.
- **Composable:** a composable of the same name in the site's `app/composables/` replaces the layer's.
- **Design tokens:** redefine a custom property in the site's own stylesheet, for example `:root { --color-primary: #0f766e; }`.
- **Configuration:** the site's `nuxt.config.ts` takes precedence over the layer's.
