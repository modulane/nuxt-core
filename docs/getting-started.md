# Getting started

This guide sets up a working copy of Nuxt Core for development.

## Requirements

- **Node.js** 22.22.3 or newer in the 22.x line, 24.15 or newer in the 24.x line, or 26 and later. These are the versions Nuxt supports; `package.json` `engines` records the same range.
- **Yarn**, provided by [Corepack](https://github.com/nodejs/corepack). Node.js 24 and earlier include Corepack. Node.js 25 and later do not, so install it first with `npm install --global corepack`.
- **Git**

## Installation

```bash
git clone https://github.com/modulane/nuxt-core.git
cd nuxt-core
corepack enable
yarn install
```

- `corepack enable` makes `yarn` run the exact version pinned in the `packageManager` field of `package.json`, whatever Yarn is installed globally. Without it, an old global Yarn 1 may run instead and fail.
- Dependencies are installed in `node_modules`, as set in [`.yarnrc.yml`](../.yarnrc.yml).
- `yarn install` also runs `nuxt prepare`, which generates the types in `.nuxt/` that the editor and the type check need.
- Yarn installs a package only once it has been published for at least a day, and does not run the install scripts of dependencies. Both are Yarn defaults, kept on purpose.

## Commands

| Command           | Purpose                                                 |
| ----------------- | ------------------------------------------------------- |
| `yarn dev`        | Start the development server on <http://localhost:3000> |
| `yarn build`      | Build for production into `.output/`                    |
| `yarn generate`   | Pre-render the site as static files                     |
| `yarn preview`    | Preview the production build locally                    |
| `yarn test`       | Run the test suite once                                 |
| `yarn test:watch` | Run the tests again on every change                     |
| `yarn typecheck`  | Type-check the project with `vue-tsc`                   |
| `yarn format`     | Format every file with Prettier                         |
| `yarn check`      | Check formatting, types and tests, as CI does           |

Run `yarn check` before opening a pull request; CI runs it, then `yarn build`, with Node.js 22, 24 and 26.

## Editor

[`.vscode/extensions.json`](../.vscode/extensions.json) recommends three VS Code extensions: Vue (Official) for `.vue` files, Prettier for formatting and EditorConfig for indentation and line endings. [`.editorconfig`](../.editorconfig) applies the same rules in other editors.

## Troubleshooting

| Problem                                                       | Fix                                                                                        |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `yarn` prints version 1.x, or `install` rejects the lockfile  | Run `corepack enable`. On Node.js 25 and later, run `npm install --global corepack` first. |
| `The engine "node" is incompatible`                           | Update Node.js to a version listed under [Requirements](#requirements).                    |
| The editor reports missing types for auto-imports             | Run `yarn install` (or `npx nuxt prepare`) to regenerate `.nuxt/`.                         |
| `yarn install` stops on a package that is less than a day old | Wait a day, or pin the previous version. The delay protects against compromised releases.  |
