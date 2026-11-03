import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    globals: true,
    // Plain TypeScript tests run in Node.js. A test that needs Nuxt or the DOM opts
    // in with a `// @vitest-environment nuxt` comment on its first line.
    environmentOptions: {
      nuxt: {
        // Boots the playground, which extends the layers exactly as a site does
        rootDir: 'playground',
        domEnvironment: 'happy-dom',
      },
    },
    // Used by `yarn coverage`. Only the layers' code counts, not the
    // playground or the tests.
    coverage: {
      provider: 'v8',
      include: ['layers/*/app/**/*.{ts,vue}'],
      reporter: ['text', 'lcov', 'json-summary'],
      thresholds: { lines: 90, statements: 90 },
    },
  },
})
