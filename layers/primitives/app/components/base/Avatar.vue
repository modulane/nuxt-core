<template>
  <span
    class="nc-avatar"
    :data-size="size"
    :role="decorative ? undefined : 'img'"
    :aria-label="decorative ? undefined : name"
    :aria-hidden="decorative || undefined"
  >
    <img
      v-if="src && !failed"
      ref="image"
      class="nc-avatar__image"
      :src="src"
      alt=""
      @error="failed = true"
    />
    <span v-else class="nc-avatar__initials" aria-hidden="true">{{
      initials
    }}</span>
  </span>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    // The person's name: the accessible name, and the source of the initials
    name: string
    src?: string
    size?: 'sm' | 'md' | 'lg'
    // For when the name is already written beside it
    decorative?: boolean
  }>(),
  { size: 'md', decorative: false },
)

const failed = ref(false)
const image = useTemplateRef<HTMLImageElement>('image')

watch(
  () => props.src,
  () => {
    failed.value = false
  },
)

// With server rendering, the image can fail before Vue listens for the error
onMounted(() => {
  if (image.value?.complete && image.value.naturalWidth === 0) {
    failed.value = true
  }
})

// The first letters of the first and last words. Array.from splits by
// character, so an accented letter or an emoji stays whole.
const initials = computed(() => {
  const words = props.name.trim().split(/\s+/).filter(Boolean)
  const first = Array.from(words[0] ?? '')[0] ?? ''
  const last = words.length > 1 ? (Array.from(words.at(-1) ?? '')[0] ?? '') : ''

  return (first + last).toLocaleUpperCase()
})
</script>
