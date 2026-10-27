# Testing

Tests use [Vitest](https://vitest.dev/), configured through [`@nuxt/test-utils`](https://nuxt.com/docs/getting-started/testing) in [`vitest.config.ts`](../vitest.config.ts).

## Running the tests

| Command           | What it does                                 |
| ----------------- | -------------------------------------------- |
| `yarn test`       | Runs every test once                         |
| `yarn test:watch` | Reruns the affected tests on every change    |
| `yarn check`      | Formatting, type check and tests, as CI does |

CI runs `yarn check` on every pull request, with Node.js 22, 24 and 26.

## Where tests live

Tests live in `tests/` and end in `.test.ts`. Name a test file after what it tests, mirroring the source path: the tests for `layers/primitives/app/components/base/Button.vue` go in `tests/components/base/Button.test.ts`.

## Current state

Tests run in Node.js by default, which is enough for plain TypeScript such as utility functions. A test that needs Nuxt (auto-imports, `useState`, `useCookie`, `useHead`) or renders a component opts in to the `nuxt` environment with a comment on its first line:

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
