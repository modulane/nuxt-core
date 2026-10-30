<template>
  <div
    v-if="decorative"
    class="nc-divider"
    :data-orientation="orientation"
    aria-hidden="true"
  />
  <hr
    v-else
    class="nc-divider"
    :data-orientation="orientation"
    :aria-orientation="orientation === 'vertical' ? 'vertical' : undefined"
  />
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    orientation?: 'horizontal' | 'vertical'
    // A line for the eye only: a <div> that screen readers skip, not an <hr>
    decorative?: boolean
  }>(),
  { orientation: 'horizontal', decorative: false },
)
</script>
