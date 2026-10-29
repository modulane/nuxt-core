<template>
  <div class="nc-layout" :data-sticky-header="stickyHeader || undefined">
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
withDefaults(
  defineProps<{
    // The skip link's text, for the site's language
    skipLinkLabel?: string
    // Keeps the header at the top of the window while the page scrolls
    stickyHeader?: boolean
  }>(),
  { skipLinkLabel: 'Skip to content', stickyHeader: false },
)
</script>
