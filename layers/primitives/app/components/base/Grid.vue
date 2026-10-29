<template>
  <component
    :is="as"
    class="nc-grid"
    :class="{ 'nc-grid--fit': fit }"
    :style="style"
  >
    <slot />
  </component>
</template>

<script lang="ts" setup>
type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'
// The steps of the spacing scale, --space-1 to --space-20
type SpaceStep = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20

const props = withDefaults(
  defineProps<{
    // The element to render, such as 'ul' for a list of cards
    as?: string
    // A count for every screen, or one per breakpoint: { base: 1, md: 2, lg: 3 }
    columns?: number | Partial<Record<'base' | Breakpoint, number>>
    // As many columns as fit, each at least minColumnWidth wide
    fit?: boolean
    minColumnWidth?: string
    gap?: SpaceStep
  }>(),
  { as: 'div', fit: false },
)

const style = computed(() => {
  const style: Record<string, string> = {}
  const columns =
    typeof props.columns === 'number' ? { base: props.columns } : props.columns

  for (const [breakpoint, count] of Object.entries(columns ?? {})) {
    const name =
      breakpoint === 'base' ? '--grid-columns' : `--grid-columns-${breakpoint}`
    style[name] = String(count)
  }

  if (props.minColumnWidth) style['--grid-min'] = props.minColumnWidth
  if (props.gap) style['--grid-gap'] = `var(--space-${props.gap})`

  return style
})
</script>
