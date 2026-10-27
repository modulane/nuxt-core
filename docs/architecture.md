# Architecture

Nuxt Core is a set of [Nuxt layers](https://nuxt.com/docs/guide/going-further/layers) in one package. A site adds the parts it wants to `extends` in its own `nuxt.config.ts`, as [usage.md](usage.md) shows, and Nuxt merges them into the site: their components, composables, layouts and styles become part of the site, and the site can override any of them.

## The parts

```text
                 @modulane/nuxt-core                 everything: primitives + design
                  ┌────────┴────────┐
@modulane/nuxt-core/primitives   @modulane/nuxt-core/design
  behaviour, markup, accessibility   tokens, global styles, the primitives' styles
  no styles                          no components
```

| Part           | Entry point                      | Provides                                                                                      | Use it with                                                     |
| -------------- | -------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **Primitives** | `@modulane/nuxt-core/primitives` | Accessible, unstyled components and layouts that expose [styling hooks](#the-styling-hooks)   | Your own CSS, Tailwind or any other styling                     |
| **Design**     | `@modulane/nuxt-core/design`     | Design tokens, the global stylesheet, the styles for the primitives' hooks, theme composables | Your own components, or another component library               |
| **Everything** | `@modulane/nuxt-core`            | Both, extended together                                                                       | Nothing else: the primitives arrive styled by the design system |

**The rule that keeps them independent:** neither part imports from the other. The primitives contain no CSS and no design values; the design system contains no components and touches markup only through the hooks. The root layer is nothing but `extends: ['./layers/primitives', './layers/design']`. Every part added later (sections, features, themes, see the [roadmap](../ROADMAP.md)) follows the same rule and becomes its own entry point.

## The styling hooks

The primitives and the design system meet only through a documented contract, so any styling can replace the design system:

- **Class:** the root element of each primitive has the class `nc-<name>`, for example `nc-container` or `nc-button`. Inner parts use `nc-<name>__<part>`.
- **Data attributes:** variants and states are `data-*` attributes, for example `data-variant="secondary"` or `data-loading`. State that HTML or ARIA already expresses (`disabled`, `aria-expanded`, `aria-invalid`) is not duplicated: style it with those selectors.
- **Pass-through:** a class or attribute set on a primitive lands on its root element, so utility classes such as Tailwind's work directly.

[components.md](components.md) lists the hooks of each component.

## The cascade

The design system puts every rule in a `nuxt-core` [cascade layer](https://developer.mozilla.org/docs/Web/CSS/@layer): `nuxt-core.tokens`, `reset`, `base`, `layout`, `components` and `utilities`. CSS outside a layer always wins over CSS inside one, whatever its specificity or load order. A site's own styles therefore override the design system without `!important` or longer selectors. See [styling.md](styling.md#the-cascade).

## Folders

```text
nuxt-core/
├── nuxt.config.ts            The root layer: extends both parts
├── layers/
│   ├── primitives/           The primitives layer
│   │   ├── nuxt.config.ts
│   │   └── app/
│   │       ├── components/   Unstyled components, auto-imported
│   │       └── layouts/      Page layouts
│   └── design/               The design layer
│       ├── nuxt.config.ts    Loads the global stylesheet
│       ├── app/
│       │   ├── assets/scss/  Tokens, global styles, primitive styles, SCSS abstracts
│       │   └── composables/  Theme and breakpoint composables, auto-imported
│       └── shared/types/     Types used by both app/ and server/
├── playground/               The development app, which extends the root layer; not shipped
├── tests/                    Vitest tests; not shipped
└── docs/                     This documentation; not shipped
```

The `files` field of `package.json` ships `layers/` and the root `nuxt.config.ts`; its `exports` field maps the three entry points to their `nuxt.config.ts`. Everything else stays in the repository.

### Inside a layer

Each layer follows the [Nuxt 4 directory structure](https://nuxt.com/docs/guide/directory-structure), and Nuxt scans its folders automatically, as it does the site's:

- **`app/components/`**: each `.vue` file becomes a component that can be used without importing it. The folder path is part of the name: `components/base/Button.vue` is `<BaseButton>`. Components are grouped by purpose: `base/` for basic building blocks, `form/` for form controls, `navigation/` for headers, footers and menus. See [components.md](components.md).
- **`app/composables/`**: each exported function is auto-imported everywhere in the site's `app/`. See [composables.md](composables.md).
- **`app/layouts/`**: `default.vue` wraps every page unless a page picks another layout, such as `auth.vue`. Layouts take effect once a site renders `<NuxtLayout>` and has pages.
- **`app/assets/scss/`**: the global stylesheet and the SCSS abstracts. See [styling.md](styling.md).
- **`shared/types/`**: types needed by both `app/` and `server/`, auto-imported in both. A type used by only one side stays next to the code that uses it.
- **`server/`**: [Nitro](https://nitro.build/) server routes. No layer has any yet; reusable features such as the contact form planned in [roadmap phase 12](../ROADMAP.md#phase-12--reusable-website-features) will come as their own layers.

No layer has an `app.vue`, `pages/` or `public/`: those belong to each site. A page in a layer would add a route to every site, and a file in `public/` would be served by every site.

### `playground/`

A minimal Nuxt app whose `nuxt.config.ts` extends the root layer with `extends: ['..']`, exactly as a site does. `yarn dev` and `yarn build` run it, so development always goes through the same path as a real site. It holds what a site provides itself: `app.vue`, the favicon and `robots.txt` in `public/`, and the `compatibilityDate`.

### `tests/`

Vitest tests. See [testing.md](testing.md).

## Configuration files

| File                                                                      | Purpose                                                                                     |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [`nuxt.config.ts`](../nuxt.config.ts)                                     | The root layer: extends the primitives and design layers                                    |
| [`layers/primitives/nuxt.config.ts`](../layers/primitives/nuxt.config.ts) | The primitives layer: its name                                                              |
| [`layers/design/nuxt.config.ts`](../layers/design/nuxt.config.ts)         | The design layer: its name and the global CSS                                               |
| [`playground/nuxt.config.ts`](../playground/nuxt.config.ts)               | The development app: extends the root layer, strict TypeScript, Nuxt DevTools               |
| [`tsconfig.json`](../tsconfig.json)                                       | Points TypeScript and the editor at the configurations Nuxt generates in `playground/.nuxt` |
| [`playground/tsconfig.json`](../playground/tsconfig.json)                 | The same, for `yarn typecheck`                                                              |
| [`vitest.config.ts`](../vitest.config.ts)                                 | Test runner configuration                                                                   |
| [`.nuxtrc`](../.nuxtrc)                                                   | Records which Nuxt modules were set up with `nuxi module add`                               |
| [`.yarnrc.yml`](../.yarnrc.yml)                                           | Yarn settings: install into `node_modules`, no telemetry                                    |
| [`.prettierrc.json`](../.prettierrc.json)                                 | Formatting rules, shared with the other modulane projects                                   |
| [`.editorconfig`](../.editorconfig)                                       | Indentation, line endings and final newlines for every editor                               |
| [`.releaserc.json`](../.releaserc.json)                                   | semantic-release: GitHub releases from Conventional Commit titles                           |
| [`.github/`](../.github)                                                  | Workflows, issue forms, labels, Dependabot and code owners; see CONTRIBUTING                |

### Layer rules

A layer's `nuxt.config.ts` runs inside every site that extends it, which changes a few rules:

- **Paths resolve from the file, not with `~`.** In a site, `~` points to the site's own `app/`. A layer's config builds its paths with `new URL('./app/…', import.meta.url)`. Each layer's `$meta.name` registers an alias for imports: `#layers/nuxt-core-design/` and `#layers/nuxt-core-primitives/`.
- **Only reusable settings.** Site-level settings such as `compatibilityDate`, DevTools or the site's own modules stay in `playground/nuxt.config.ts`.
- **What sites need at runtime goes in `dependencies`.** `sass` is a dependency because sites compile the design layer's SCSS. Nuxt is a peer dependency: the site provides it. Tooling stays in `devDependencies`.

## Generated folders

`playground/.nuxt/` (types and the dev build) and `playground/.output/` (the production build) are generated, ignored by Git and safe to delete.
