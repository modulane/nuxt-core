<template>
  <span
    class="nc-icon"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
    :data-flip-rtl="flipRtl || undefined"
  >
    <slot />
  </span>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    // The icon's meaning, when no text says it; unset, it is decorative
    label?: string
    // Mirrors it in right-to-left languages, for icons that point somewhere
    flipRtl?: boolean
  }>(),
  { flipRtl: false },
)
</script>
