// Applies the colour scheme from useTheme() to <html> on every page, on the server
// and in the browser, whether or not the page shows a switch.
export default defineNuxtPlugin(() => {
  const { colorScheme } = useTheme()

  useHead({ htmlAttrs: { 'data-color-scheme': colorScheme } })
})
