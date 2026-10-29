<template>
  <component :is="as" class="nc-cluster" :style="style">
    <slot />
  </component>
</template>

<script lang="ts" setup>
type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'
// The steps of the spacing scale, --space-1 to --space-20
type SpaceStep = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20
type Justify = 'start' | 'center' | 'end' | 'between'

const props = withDefaults(
  defineProps<{
    // The element to render, such as 'ul' for a list of tags
    as?: string
    // A step for every screen, or one per breakpoint: { base: 2, md: 4 }
    gap?: SpaceStep | Partial<Record<'base' | Breakpoint, SpaceStep>>
    // Where the items sit on each line: 'between' spreads them to both ends
    justify?: Justify
  }>(),
  { as: 'div' },
)

const justifyValues: Record<Justify, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
}

const style = computed(() => {
  const style: Record<string, string> = {}
  const gap = typeof props.gap === 'number' ? { base: props.gap } : props.gap

  for (const [breakpoint, step] of Object.entries(gap ?? {})) {
    const name =
      breakpoint === 'base' ? '--cluster-gap' : `--cluster-gap-${breakpoint}`
    style[name] = `var(--space-${step})`
  }

  if (props.justify) style['--cluster-justify'] = justifyValues[props.justify]

  return style
})
</script>
