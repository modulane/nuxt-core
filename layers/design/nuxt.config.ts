import { fileURLToPath } from 'node:url'

// The design system: design tokens, global styles, and the styles that bind them to
// the primitives' hooks. Works on its own, with any components.
export default defineNuxtConfig({
  $meta: {
    // Registers the `#layers/nuxt-core-design` alias
    name: 'nuxt-core-design',
  },

  alias: {
    // The SCSS abstracts (variables, functions, mixins), for any stylesheet of the
    // site: `@use '#nuxt-core/scss' as *;`
    '#nuxt-core/scss': fileURLToPath(
      new URL('./app/assets/scss/abstracts/_index.scss', import.meta.url),
    ),
  },

  css: [fileURLToPath(new URL('./app/assets/scss/main.scss', import.meta.url))],

  vite: {
    build: {
      // The browsers the design system supports: Baseline widely available, see
      // docs/styling.md#browser-support. The CSS minifier lowers newer syntax for them.
      cssTarget: [
        'chrome111',
        'edge111',
        'firefox114',
        'safari16.4',
        'ios16.4',
      ],
    },
  },
})
