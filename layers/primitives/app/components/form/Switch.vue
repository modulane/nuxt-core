<template>
  <button
    type="button"
    role="switch"
    class="nc-switch"
    :aria-checked="model"
    @click="model = !model"
  >
    <span class="nc-switch__track" aria-hidden="true">
      <span class="nc-switch__thumb" />
    </span>
    <span v-if="$slots.default" class="nc-switch__label"><slot /></span>
  </button>
</template>

<script setup lang="ts">
const model = defineModel<boolean>({ default: false })
</script>
