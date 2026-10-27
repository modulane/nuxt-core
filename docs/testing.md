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

Tests live in `tests/` and end in `.test.ts`. Name a test file after what it tests, mirroring the source path: the tests for `app/components/base/Button.vue` go in `tests/components/base/Button.test.ts`.

## Current state

- Tests run in a Node.js environment, which is enough for plain TypeScript: composables that do not touch the DOM, and utility functions.
- `tests/example.test.ts` is a placeholder that keeps `yarn test` meaningful until the first real test exists. Delete it then.
- **Component tests are not set up yet.** Rendering components needs the `nuxt` test environment and a DOM implementation such as `happy-dom`. The first pull request that adds a component test sets these up and updates this section.

## What to test

From the [roadmap's testing phase](../ROADMAP.md#phase-9--testing): the goal is to protect what many projects reuse, not to cover every line. For a component, test:

- that it renders with its default props;
- each prop and state (disabled, loading, error);
- user interaction, including the keyboard;
- its accessible name and ARIA attributes.

A bug fix comes with a test that fails without the fix.
