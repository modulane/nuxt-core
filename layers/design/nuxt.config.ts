import { fileURLToPath } from 'node:url'

// The design system: design tokens, global styles, and the styles that bind them to
// the primitives' hooks. Works on its own, with any components.
export default defineNuxtConfig({
  $meta: {
    // Registers the `#layers/nuxt-core-design` alias, used to import the SCSS abstracts
    name: 'nuxt-core-design',
  },

  css: [fileURLToPath(new URL('./app/assets/scss/main.scss', import.meta.url))],
})
