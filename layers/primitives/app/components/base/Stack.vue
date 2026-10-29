<template>
  <component :is="as" class="nc-stack" :style="style">
    <slot />
  </component>
</template>

<script lang="ts" setup>
type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'
// The steps of the spacing scale, --space-1 to --space-20
type SpaceStep = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20

const props = withDefaults(
  defineProps<{
    // The element to render, such as 'ul' for a list
    as?: string
    // A step for every screen, or one per breakpoint: { base: 4, md: 8 }
    gap?: SpaceStep | Partial<Record<'base' | Breakpoint, SpaceStep>>
  }>(),
  { as: 'div' },
)

const style = computed(() => {
  const style: Record<string, string> = {}
  const gap = typeof props.gap === 'number' ? { base: props.gap } : props.gap

  for (const [breakpoint, step] of Object.entries(gap ?? {})) {
    const name =
      breakpoint === 'base' ? '--stack-gap' : `--stack-gap-${breakpoint}`
    style[name] = `var(--space-${step})`
  }

  return style
})
</script>
