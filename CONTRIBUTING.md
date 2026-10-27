# Contributing

Thank you for helping improve Nuxt Core. This guide covers the development setup, the project layout, the change workflow, how releases are made and the code conventions.

Nuxt Core is a reusable foundation for building Nuxt websites. Contributions should keep it simple, predictable, accessible and reusable across different projects.

## Development setup

Requirements:

- Node.js 22.22.3, 24.15 or 26 and later (the versions Nuxt supports)
- Yarn, through [Corepack](https://github.com/nodejs/corepack). Node.js 24 and earlier include Corepack; on Node.js 25 and later, install it first with `npm install --global corepack`.
- Git

```bash
git clone https://github.com/modulane/nuxt-core.git
cd nuxt-core
corepack enable
yarn install
```

`corepack enable` makes `yarn` run the exact version pinned in the `packageManager` field of `package.json`, whatever Yarn is installed globally. Dependencies are installed in `node_modules` (see [`.yarnrc.yml`](.yarnrc.yml)), and `yarn install` also runs `nuxt prepare`, which generates the types in `.nuxt/`.

| Command           | Purpose                                                 |
| ----------------- | ------------------------------------------------------- |
| `yarn dev`        | Start the development server on <http://localhost:3000> |
| `yarn build`      | Build for production                                    |
| `yarn generate`   | Pre-render the site as static files                     |
| `yarn preview`    | Preview the production build locally                    |
| `yarn test`       | Run the test suite                                      |
| `yarn test:watch` | Run the tests in watch mode                             |
| `yarn typecheck`  | Type-check the project with `vue-tsc`                   |
| `yarn format`     | Format every file with Prettier                         |
| `yarn check`      | Check formatting, types and tests, as CI does           |

Yarn installs a package only once it has been published for at least a day, and does not run the install scripts of dependencies. Both are Yarn defaults, kept on purpose.

## Project layout

Nuxt Core follows the [Nuxt 4 directory structure](https://nuxt.com/docs/guide/directory-structure):

| Folder             | Contents                                                               |
| ------------------ | ---------------------------------------------------------------------- |
| `app/components/`  | Vue components, grouped by folder: `base/`, `form/`, `navigation/`     |
| `app/composables/` | Composables, auto-imported by Nuxt                                     |
| `app/layouts/`     | Page layouts                                                           |
| `app/assets/scss/` | Global styles; `main.scss` is the entry point loaded on every page     |
| `server/`          | Server routes and API endpoints (Nitro)                                |
| `shared/types/`    | Types shared by the app and the server                                 |
| `public/`          | Static files served as they are                                        |
| `tests/`           | Vitest tests                                                           |
| `docs/`            | Documentation of the components, styling and conventions (in progress) |

## Workflow

Every change is made on a short-lived branch and reaches `main` through a pull request:

1. Create a branch named after the change: `feat/base-button`, `fix/modal-close`, `docs/readme`, …
2. Commit and push as often as needed. Nothing is released from a branch.
3. Open a pull request. CI checks formatting, types and tests, and builds the site with Node.js 22, 24 and 26, and a check verifies that the title follows [Conventional Commits](https://www.conventionalcommits.org/). Pull requests that change `.github/` are also audited by [zizmor](https://docs.zizmor.sh/). A final **CI passed** job succeeds only when every CI job has passed. It and the title check are the checks that must pass before a pull request can be merged, so changing the Node.js versions never requires changing the repository rules.
4. Squash-merge it. The pull request title becomes the only commit on `main`.

The pull request title decides what is released, so choose its type carefully:

| Title starts with                                                           | Release                          |
| --------------------------------------------------------------------------- | -------------------------------- |
| `fix:`                                                                      | Patch, for example 0.4.0 → 0.4.1 |
| `feat:`                                                                     | Minor, for example 0.4.0 → 0.5.0 |
| `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `build:`, `ci:`, `chore:` | None                             |

Keep the summary lowercase and in the imperative: `feat: add base button`, not `Feat: Added base button`. Describe the change, not the development process: `feat: add responsive container`, not `worked on container`.

**Do not mark changes as breaking before 1.0.0.** A `!` after the type (`feat!:`) or a `BREAKING CHANGE:` footer makes a major release, which would release 1.0.0 early. Until then, describe incompatible changes in the pull request and release them as `feat:`.

A pull request should represent one coherent change, explain what changed and why when it is not obvious, and include tests for new functionality and regression tests for bug fixes when practical.

### Labels and reviews

The **Pull request labels** workflow labels each pull request from its title, and updates the labels when the title is edited:

| Title type                                      | Kind label      | Release label    |
| ----------------------------------------------- | --------------- | ---------------- |
| `feat:`                                         | `enhancement`   | `release: minor` |
| `fix:`                                          | `bug`           | `release: patch` |
| `docs:`                                         | `documentation` | `release: none`  |
| `ci:`, `build:`                                 | `ci`            | `release: none`  |
| `refactor:`, `perf:`, `test:`, `style:`, others | `maintenance`   | `release: none`  |

A `!` after the type replaces the release label with `release: major`, so a breaking change is visible before it is merged. The workflow also assigns a new pull request to its author, and [`CODEOWNERS`](.github/CODEOWNERS) requests a review from the maintainer.

The labels themselves are defined in [`.github/labels.json`](.github/labels.json). When that file changes on `main`, the **Labels** workflow creates the missing labels and updates the others. It never deletes a label; remove one in the repository settings after taking it out of the file.

## Releases

Releases are fully automated with [semantic-release](https://semantic-release.gitbook.io/). Nuxt Core is not published to npm: a release is a git tag and a GitHub release.

1. A pull request is merged into `main`.
2. The **Release** workflow starts on that commit. Its first job runs the **CI** workflow.
3. If CI succeeds, the release job runs semantic-release in the same run, on the same commit.
4. semantic-release reads the commits since the last release tag. If none of them is a `fix:` or `feat:`, it stops and nothing is released.
5. Otherwise it computes the next version, creates the `vX.Y.Z` git tag and a GitHub release with notes generated from the commits, and comments on the issues and pull requests it includes.

The version in `package.json` is always `0.0.0-development`. The real version exists only in git tags.

The Release workflow can also be started by hand from the Actions tab. It then performs the same steps on the latest commit of `main`. Check **dry-run** to see the next version and its release notes without creating anything.

### Workflow security

The release job can push tags and create releases, so the workflows keep what it runs to a minimum:

- Every action is pinned to a full commit SHA, with its version in a comment. Dependabot proposes updates once a week, only for releases that are at least seven days old. Its pull requests are titled `ci:`, so they never trigger a release.
- Each job asks only for the permissions it needs, and each permission says what it is for.
- The release job runs only on `main`, keeps no git credential on disk, uses no dependency cache, and installs dependencies without running their build scripts.

## Code conventions

Prettier formats every file; run `yarn format` before committing, or let your editor format on save with the extensions recommended in [`.vscode/extensions.json`](.vscode/extensions.json).

### TypeScript

Nuxt Core uses TypeScript in strict mode. Prefer strong, explicit types, and avoid `any` unless there is a legitimate reason to use it.

- Use `interface` for object contracts that may need extension.
- Use `type` for unions, compositions and utility types.
- Put types in `shared/types/` only when the app and the server both use them.

### Vue

Use the Composition API and `<script setup lang="ts">`. Components should have a clear and focused responsibility: prefer small, composable components over large ones that handle unrelated concerns.

### Naming

- Folders are lowercase: `app/components/base/`, `app/components/form/`.
- Component files are PascalCase. Nuxt prefixes the name with the folder, so `app/components/base/Button.vue` is used as `<BaseButton />`, and `app/components/navigation/AppHeader.vue` as `<NavigationAppHeader />`.
- Composables start with `use` and are exported under the same name as their file: `app/composables/useTheme.ts` exports `useTheme`.

### SCSS

- Design tokens are CSS custom properties, defined in `app/assets/scss/base/_root.scss`.
- Sass is used for mixins, functions and organization, with `@use` (not `@import`).
- Styles are mobile-first, with shallow nesting and meaningful class names.
- Avoid `!important` and deeply nested selectors.

### Accessibility

Accessibility is part of the implementation, not an optional enhancement. New components should consider semantic HTML, keyboard navigation, focus management, screen readers, labels and accessible names, ARIA attributes when necessary, and sufficient visual contrast. Interactive components should be usable without a mouse whenever practical.

## What belongs in Nuxt Core

Before adding something, consider: **is this genuinely reusable across multiple projects?** A feature specific to a single website should stay in that website.

- Prefer abstractions that solve recurring problems, not functionality that might be useful someday.
- Keep dependencies to a minimum. Before adding one, check whether Nuxt, Vue, TypeScript or the existing tooling can reasonably do the job.
- Document reusable functionality when its usage is not immediately obvious.

If you are unsure whether something belongs in Nuxt Core, open an issue before implementing a large change.
