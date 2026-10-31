<template>
  <div
    class="nc-alert"
    :data-status="status"
    :role="announce ? 'alert' : undefined"
  >
    <div v-if="$slots.title" class="nc-alert__title">
      <slot name="title" />
    </div>
    <div class="nc-alert__body"><slot /></div>
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    status?: 'info' | 'success' | 'warning' | 'danger'
    // Read out as soon as it appears: for a message shown after an action
    announce?: boolean
  }>(),
  { status: 'info', announce: false },
)
</script>
