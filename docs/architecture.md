# Architecture

Nuxt Core is a [Nuxt layer](https://nuxt.com/docs/guide/going-further/layers): a Nuxt project that sites add to `extends` in their own `nuxt.config.ts`, as [usage.md](usage.md) shows. Nuxt then merges the layer into the site: its components, composables, layouts, styles and server routes become part of the site, and the site can override any of them.

The layer follows the [Nuxt 4 directory structure](https://nuxt.com/docs/guide/directory-structure). This guide explains each folder, what belongs in it, and the configuration files at the root.

## Folders

```text
nuxt-core/
├── app/                 The layer: everything that runs in the browser (and on the server for SSR)
│   ├── assets/scss/     Global styles and SCSS abstracts
│   ├── components/      Vue components, auto-imported
│   ├── composables/     Composables, auto-imported
│   └── layouts/         Page layouts
├── server/              The layer: server routes (Nitro); empty for now
├── shared/types/        The layer: types used by both app/ and server/
├── playground/          The development app, which extends the layer; not shipped
├── tests/               Vitest tests; not shipped
└── docs/                This documentation; not shipped
```

The `files` field of `package.json` lists what sites receive: `app/`, `server/`, `shared/` and `nuxt.config.ts`. Everything else stays in the repository.

### `app/`

The Vue application that every site receives. Nuxt scans these folders automatically, in the layer and in the site:

- **`components/`**: each `.vue` file becomes a component that can be used without importing it. The folder path is part of the name: `components/base/Button.vue` is `<BaseButton>`. Components are grouped by purpose: `base/` for basic building blocks, `form/` for form controls, `navigation/` for headers, footers and menus. See [components.md](components.md).
- **`composables/`**: each exported function is auto-imported everywhere in `app/`. See [composables.md](composables.md).
- **`layouts/`**: `default.vue` wraps every page unless a page picks another layout, such as `auth.vue`. Layouts take effect once a site renders `<NuxtLayout>` and has pages.
- **`assets/scss/`**: the global stylesheet and the SCSS abstracts. See [styling.md](styling.md).

The layer has no `app.vue`, `pages/` or `public/`: those belong to each site. A page in the layer would add a route to every site, and a file in `public/` would be served by every site.

### `server/`

[Nitro](https://nitro.build/) server routes: `server/api/hello.get.ts` answers `GET /api/hello`. Every site built on Nuxt Core receives them, so a route belongs here only when it is a reusable feature, such as the contact form planned in [roadmap phase 12](../ROADMAP.md#phase-12--reusable-website-features). The folder is kept empty until then.

### `shared/types/`

Types needed by both `app/` and `server/`, auto-imported in both. A type used by only one side stays next to the code that uses it.

### `playground/`

A minimal Nuxt app whose `nuxt.config.ts` extends the layer with `extends: ['..']`, exactly as a site does. `yarn dev` and `yarn build` run it, so development always goes through the same path as a real site. It holds what a site provides itself: `app.vue`, the favicon and `robots.txt` in `public/`, and the `compatibilityDate`.

### `tests/`

Vitest tests. See [testing.md](testing.md).

## Configuration files

| File                                                        | Purpose                                                                                     |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [`nuxt.config.ts`](../nuxt.config.ts)                       | The layer's configuration: its name and the global CSS. Sites receive it                    |
| [`playground/nuxt.config.ts`](../playground/nuxt.config.ts) | The development app's configuration: extends the layer, strict TypeScript, Nuxt DevTools    |
| [`tsconfig.json`](../tsconfig.json)                         | Points TypeScript and the editor at the configurations Nuxt generates in `playground/.nuxt` |
| [`playground/tsconfig.json`](../playground/tsconfig.json)   | The same, for `yarn typecheck`                                                              |
| [`vitest.config.ts`](../vitest.config.ts)                   | Test runner configuration                                                                   |
| [`.nuxtrc`](../.nuxtrc)                                     | Records which Nuxt modules were set up with `nuxi module add`                               |
| [`.yarnrc.yml`](../.yarnrc.yml)                             | Yarn settings: install into `node_modules`, no telemetry                                    |
| [`.prettierrc.json`](../.prettierrc.json)                   | Formatting rules, shared with the other modulane projects                                   |
| [`.editorconfig`](../.editorconfig)                         | Indentation, line endings and final newlines for every editor                               |
| [`.releaserc.json`](../.releaserc.json)                     | semantic-release: GitHub releases from Conventional Commit titles                           |
| [`.github/`](../.github)                                    | Workflows, issue forms, labels, Dependabot and code owners; see CONTRIBUTING                |

### Layer rules

The layer's `nuxt.config.ts` runs inside every site, which changes a few rules:

- **Paths resolve from the file, not with `~`.** In a site, `~` points to the site's own `app/`. The layer's config builds its paths with `new URL('./app/…', import.meta.url)`, and SCSS imports the layer through the `#layers/nuxt-core/` alias, which `$meta.name` registers.
- **Only reusable settings.** Site-level settings such as `compatibilityDate`, DevTools or the site's own modules stay in `playground/nuxt.config.ts`.
- **What sites need at runtime goes in `dependencies`.** `sass` is a dependency because every site compiles the layer's SCSS. Nuxt is a peer dependency: the site provides it. Tooling stays in `devDependencies`.

## Generated folders

`playground/.nuxt/` (types and the dev build) and `playground/.output/` (the production build) are generated, ignored by Git and safe to delete.
