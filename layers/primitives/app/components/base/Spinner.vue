<template>
  <span
    class="nc-spinner"
    :role="decorative ? undefined : 'status'"
    :aria-hidden="decorative || undefined"
  >
    <span class="nc-spinner__circle" aria-hidden="true" />
    <span v-if="!decorative" class="nc-spinner__label">{{ label }}</span>
  </span>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    // What screen readers announce, for the site's language
    label?: string
    // Hides it from screen readers, when something else says it is busy
    decorative?: boolean
  }>(),
  { label: 'Loading', decorative: false },
)
</script>
