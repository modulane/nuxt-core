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
  },
})
