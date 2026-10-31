<template>
  <component :is="as" class="nc-card" :data-linked="to ? '' : undefined">
    <!-- The header comes first, so screen readers meet the title first; the
    design system shows the media above it -->
    <div v-if="$slots.header" class="nc-card__header">
      <BaseLink v-if="to" :to="to" class="nc-card__link">
        <slot name="header" />
      </BaseLink>
      <slot v-else name="header" />
    </div>
    <div v-if="$slots.media" class="nc-card__media">
      <slot name="media" />
    </div>
    <div v-if="$slots.default" class="nc-card__body"><slot /></div>
    <div v-if="$slots.footer" class="nc-card__footer">
      <slot name="footer" />
    </div>
  </component>
</template>

<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router'

withDefaults(
  defineProps<{
    // The element to render: 'article' for standalone content, 'li' in a list
    as?: string
    // Makes the whole card one link, named by the header
    to?: RouteLocationRaw
  }>(),
  { as: 'div' },
)
</script>
