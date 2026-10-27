# Architecture

Nuxt Core follows the [Nuxt 4 directory structure](https://nuxt.com/docs/guide/directory-structure). This guide explains each folder, what belongs in it, and the configuration files at the root.

## Folders

```text
nuxt-core/
├── app/                 Everything that runs in the browser (and on the server for SSR)
│   ├── app.vue          The root component
│   ├── assets/scss/     Global styles and SCSS abstracts
│   ├── components/      Vue components, auto-imported
│   ├── composables/     Composables, auto-imported
│   └── layouts/         Page layouts
├── server/              Server routes (Nitro); empty for now
├── shared/types/        Types used by both app/ and server/
├── public/              Static files served as they are
├── tests/               Vitest tests
└── docs/                This documentation
```

### `app/`

The Vue application. Nuxt scans these folders automatically:

- **`components/`**: each `.vue` file becomes a component that can be used without importing it. The folder path is part of the name: `components/base/Button.vue` is `<BaseButton>`. Components are grouped by purpose: `base/` for basic building blocks, `form/` for form controls, `navigation/` for headers, footers and menus. See [components.md](components.md).
- **`composables/`**: each exported function is auto-imported everywhere in `app/`. See [composables.md](composables.md).
- **`layouts/`**: `default.vue` wraps every page unless a page picks another layout, such as `auth.vue`. Layouts take effect once the app renders `<NuxtLayout>` and has pages; for now, `app.vue` still shows the Nuxt welcome screen.
- **`assets/scss/`**: the global stylesheet and the SCSS abstracts. See [styling.md](styling.md).

### `server/`

[Nitro](https://nitro.build/) server routes: `server/api/hello.get.ts` answers `GET /api/hello`. Anything in this folder is deployed with every site built on Nuxt Core, so a route belongs here only when it is a reusable feature, such as the contact form planned in [roadmap phase 12](../ROADMAP.md#phase-12--reusable-website-features). The folder is kept empty until then.

### `shared/types/`

Types needed by both `app/` and `server/`, auto-imported in both. A type used by only one side stays next to the code that uses it.

### `public/`

Files served from the site root as they are: `public/favicon.ico` is `/favicon.ico`. Files that should go through the build (hashed names, optimisation) belong in `app/assets/` instead.

### `tests/`

Vitest tests. See [testing.md](testing.md).

## Configuration files

| File                                      | Purpose                                                                      |
| ----------------------------------------- | ---------------------------------------------------------------------------- |
| [`nuxt.config.ts`](../nuxt.config.ts)     | Nuxt configuration: global CSS, strict TypeScript                            |
| [`tsconfig.json`](../tsconfig.json)       | Points TypeScript at the configurations Nuxt generates in `.nuxt/`           |
| [`vitest.config.ts`](../vitest.config.ts) | Test runner configuration                                                    |
| [`.nuxtrc`](../.nuxtrc)                   | Records which Nuxt modules were set up with `nuxi module add`                |
| [`.yarnrc.yml`](../.yarnrc.yml)           | Yarn settings: install into `node_modules`, no telemetry                     |
| [`.prettierrc.json`](../.prettierrc.json) | Formatting rules, shared with the other modulane projects                    |
| [`.editorconfig`](../.editorconfig)       | Indentation, line endings and final newlines for every editor                |
| [`.releaserc.json`](../.releaserc.json)   | semantic-release: GitHub releases from Conventional Commit titles            |
| [`.github/`](../.github)                  | Workflows, issue forms, labels, Dependabot and code owners; see CONTRIBUTING |

## Generated folders

`.nuxt/` (types and the dev build) and `.output/` (the production build) are generated, ignored by Git and safe to delete.
