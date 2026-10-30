<template>
  <button
    :type="type"
    class="nc-button"
    :data-variant="variant"
    :data-size="size"
    :data-loading="loading || undefined"
    :aria-disabled="loading || undefined"
    @click="onClick"
  >
    <BaseSpinner v-if="loading" class="nc-button__spinner" decorative />
    <span v-if="$slots.start" class="nc-button__start">
      <slot name="start" />
    </span>
    <span class="nc-button__label"><slot /></span>
    <span v-if="$slots.end" class="nc-button__end"><slot name="end" /></span>
  </button>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    // 'button' by default, so it never submits a form by accident
    type?: 'button' | 'submit' | 'reset'
    variant?: 'primary' | 'secondary'
    size?: 'sm' | 'md' | 'lg'
    // Blocks clicks and shows a spinner, while keeping keyboard focus
    loading?: boolean
  }>(),
  { type: 'button', variant: 'primary', size: 'md', loading: false },
)

const emit = defineEmits<{ click: [event: MouseEvent] }>()

function onClick(event: MouseEvent) {
  if (props.loading) {
    // Also stops a submit button from submitting its form
    event.preventDefault()
    return
  }

  emit('click', event)
}
</script>
