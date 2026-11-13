# Testing

Tests use [Vitest](https://vitest.dev/), configured through [`@nuxt/test-utils`](https://nuxt.com/docs/getting-started/testing) in [`vitest.config.ts`](../vitest.config.ts).

## Running the tests

| Command           | What it does                                                     |
| ----------------- | ---------------------------------------------------------------- |
| `yarn test`       | Runs every test once                                             |
| `yarn test:watch` | Reruns the affected tests on every change                        |
| `yarn coverage`   | Runs every test once and reports the code coverage of the layers |
| `yarn check`      | Formatting, lint, type check and tests, as CI does               |

CI runs `yarn check` on every pull request, with Node.js 22, 24 and 26. It also runs `yarn coverage`, which fails when the tests cover less than 90% of the lines or statements in `layers/`. On `main`, the coverage it measures becomes the badge in the README, published to GitHub Pages by [`scripts/generate-coverage-badge.js`](../scripts/generate-coverage-badge.js).

The scripts start Vitest through [`scripts/vitest.js`](../scripts/vitest.js), not with `vitest` directly. On Windows, a terminal can open in `e:\` instead of `E:\`, and Vitest started from there loads itself twice and fails every test with "failed to find the current suite". The script moves to the real path first. Run Vitest through it, or through `yarn test`, rather than with `npx vitest`.

## Where tests live

Tests live in `tests/` and end in `.test.ts`. Name a test file after what it tests, mirroring the source path: the tests for `layers/primitives/app/components/base/Button.vue` go in `tests/components/base/Button.test.ts`.

## Current state

Tests run in Node.js by default, which is enough for plain TypeScript such as utility functions, and for the Sass helpers: [`tests/scss/`](../tests/scss) compiles snippets with `sass` and checks the CSS they produce. A test that needs Nuxt (auto-imports, `useState`, `useCookie`, `useHead`) or renders a component opts in to the `nuxt` environment with a comment on its first line:

```ts
// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { FormSwitch } from '#components'

const wrapper = await mountSuspended(FormSwitch)
```

That environment boots the playground, which extends the layers as a site does, with [happy-dom](https://github.com/capricorn86/happy-dom) as the DOM. Nuxt writes cookies and updates `<head>` after a change, not during it: wait for them with `vi.waitFor()`.

## What to test

From the [roadmap's testing phase](../ROADMAP.md#phase-9--testing): the goal is to protect what many projects reuse, not to cover every line. For a component, test:

- that it renders with its default props;
- each prop and state (disabled, loading, error);
- user interaction, including the keyboard;
- its accessible name and ARIA attributes.

A bug fix comes with a test that fails without the fix.
