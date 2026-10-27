// Nuxt Core: the primitives styled by the design system. Each part is also its own
// layer, so a site can extend only the one it needs.
// https://nuxt.com/docs/guide/going-further/layers
export default defineNuxtConfig({
  $meta: {
    name: 'nuxt-core',
  },

  extends: ['./layers/primitives', './layers/design'],
})
