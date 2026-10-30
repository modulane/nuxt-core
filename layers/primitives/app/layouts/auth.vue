<template>
  <div class="nc-layout nc-layout--auth">
    <a href="#content" class="nc-skip-link">{{ skipLinkLabel }}</a>
    <header v-if="$slots.header" class="nc-layout__header">
      <slot name="header" />
    </header>
    <main id="content" class="nc-layout__main">
      <slot />
    </main>
    <footer v-if="$slots.footer" class="nc-layout__footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script lang="ts" setup>
// The layout for sign-in and sign-up pages: one narrow column, centred
withDefaults(
  defineProps<{
    // The skip link's text, for the site's language
    skipLinkLabel?: string
  }>(),
  { skipLinkLabel: 'Skip to content' },
)
</script>
