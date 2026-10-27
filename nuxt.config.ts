import { fileURLToPath } from 'node:url'

// Nuxt Core is a Nuxt layer: sites add it to `extends` in their own nuxt.config.
// Paths here resolve from this file, because `~` points to the consuming site.
// https://nuxt.com/docs/guide/going-further/layers
export default defineNuxtConfig({
  $meta: {
    // Registers the `#layers/nuxt-core` alias, used to import SCSS from the layer
    name: 'nuxt-core',
  },

  css: [fileURLToPath(new URL('./app/assets/scss/main.scss', import.meta.url))],
})
