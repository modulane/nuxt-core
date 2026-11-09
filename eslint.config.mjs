import { createConfigForNuxt } from '@nuxt/eslint-config/flat'
import modulane from '@modulane/eslint-config/nuxt'

// The app folders of the layers and the playground, so that components,
// layouts and pages get the rules meant for them.
export default createConfigForNuxt(
  {
    dirs: {
      src: ['layers/design/app', 'layers/primitives/app', 'playground/app'],
    },
  },
  ...modulane,
)
