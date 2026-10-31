<template>
  <component
    :is="as"
    class="nc-image"
    :src="src"
    :alt="alt"
    :width="width"
    :height="height"
    :loading="priority ? 'eager' : 'lazy'"
    :fetchpriority="priority ? 'high' : undefined"
    decoding="async"
    :data-fit="ratio ? fit : undefined"
    :style="ratio ? { '--image-ratio': ratio } : undefined"
  />
</template>

<script lang="ts" setup>
import type { Component } from 'vue'

withDefaults(
  defineProps<{
    src: string
    // What the image shows, or '' when it is decoration
    alt: string
    // Its real size, so the browser reserves its space before it loads
    width: number | string
    height: number | string
    // Crops it to this shape, as CSS writes it: '16 / 9'
    ratio?: string
    fit?: 'cover' | 'contain'
    // For the image at the top of a page: loads at once, not lazily
    priority?: boolean
    // The element or component to render, such as NuxtImg from @nuxt/image
    as?: string | Component
  }>(),
  { fit: 'cover', priority: false, as: 'img' },
)
</script>
