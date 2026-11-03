# Getting started

This guide sets up a working copy of Nuxt Core for development. To use Nuxt Core in a site, see [usage.md](usage.md).

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
yarn dev:prepare
```

- `corepack enable` makes `yarn` run the exact version pinned in the `packageManager` field of `package.json`, whatever Yarn is installed globally. Without it, an old global Yarn 1 may run instead and fail.
- Dependencies are installed in `node_modules`, as set in [`.yarnrc.yml`](../.yarnrc.yml).
- `yarn dev:prepare` generates the types in `playground/.nuxt/` that the editor needs. `yarn dev`, `yarn build` and `yarn typecheck` regenerate them on their own. It is not an install script, because sites that install the layer would run it too.
- Yarn installs a package only once it has been published for at least a day, and does not run the install scripts of dependencies. Both are Yarn defaults, kept on purpose.

## Commands

| Command            | Purpose                                           |
| ------------------ | ------------------------------------------------- |
| `yarn dev`         | Start the playground on <http://localhost:3000>   |
| `yarn dev:prepare` | Generate the types in `playground/.nuxt/`         |
| `yarn build`       | Build the playground into `playground/.output/`   |
| `yarn generate`    | Pre-render the playground as static files         |
| `yarn preview`     | Preview the playground's production build         |
| `yarn test`        | Run the test suite once                           |
| `yarn test:watch`  | Run the tests again on every change               |
| `yarn coverage`    | Run the tests once and report their code coverage |
| `yarn typecheck`   | Type-check the project with `vue-tsc`             |
| `yarn format`      | Format every file with Prettier                   |
| `yarn check`       | Check formatting, types and tests, as CI does     |

Run `yarn check` before opening a pull request; CI runs it, then `yarn build`, with Node.js 22, 24 and 26.

## Editor

[`.vscode/extensions.json`](../.vscode/extensions.json) recommends three VS Code extensions: Vue (Official) for `.vue` files, Prettier for formatting and EditorConfig for indentation and line endings. It marks Vetur as unwanted: Vetur is for Vue 2 and does not read the types Nuxt generates, so it reports every auto-import as missing. [`.editorconfig`](../.editorconfig) applies the same rules in other editors.

## Troubleshooting

| Problem                                                       | Fix                                                                                        |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `yarn` prints version 1.x, or `install` rejects the lockfile  | Run `corepack enable`. On Node.js 25 and later, run `npm install --global corepack` first. |
| `The engine "node" is incompatible`                           | Update Node.js to a version listed under [Requirements](#requirements).                    |
| The editor reports missing types for auto-imports             | Run `yarn dev:prepare` to regenerate `playground/.nuxt/`.                                  |
| `Cannot find name 'useTheme'. Vetur(2304)`, or similar        | Disable Vetur and use Vue (Official) instead, then reload the window.                      |
| `yarn install` stops on a package that is less than a day old | Wait a day, or pin the previous version. The delay protects against compromised releases.  |
