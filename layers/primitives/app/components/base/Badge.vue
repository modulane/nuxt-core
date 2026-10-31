<template>
  <span class="nc-badge" :data-status="status"><slot /></span>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    status?: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
  }>(),
  { status: 'neutral' },
)
</script>
