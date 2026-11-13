// The primitives: accessible, unstyled components, composables and layouts.
// They expose class and data-attribute hooks and work with any styling.
export default defineNuxtConfig({
  $meta: {
    name: 'nuxt-core-primitives',
  },

  runtimeConfig: {
    public: {
      nuxtCore: {
        // The URL of an IP geolocation service that useVisitorCountry() asks for
        // the visitor's country, such as https://api.country.is; off when empty.
        // It sends the visitor's IP address to that service: see
        // docs/composables.md#usevisitorcountry. NUXT_PUBLIC_NUXT_CORE_COUNTRY_LOOKUP
        // sets it at runtime.
        countryLookup: '',
      },
    },
  },
})
