<template>
  <NuxtLink
    :to="to"
    class="nc-link"
    :data-external="external || undefined"
    :target="newTab ? '_blank' : undefined"
  >
    <slot />
    <span v-if="newTab" class="nc-link__new-tab"> ({{ newTabLabel }})</span>
  </NuxtLink>
</template>

<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router'

const props = withDefaults(
  defineProps<{
    // A path, a full URL or a route object, as NuxtLink takes
    to: RouteLocationRaw
    // Opens in a new tab; NuxtLink adds rel="noopener noreferrer"
    newTab?: boolean
    // What screen readers hear after the text of a new-tab link
    newTabLabel?: string
  }>(),
  { newTab: false, newTabLabel: 'opens in a new tab' },
)

// Another website: http(s) or protocol-relative, not mailto: or tel:
const external = computed(
  () => typeof props.to === 'string' && /^(https?:)?\/\//i.test(props.to),
)
</script>
