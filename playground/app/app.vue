<template>
  <NuxtRouteAnnouncer />

  <header class="header">
    <BaseContainer class="header__inner">
      <p class="header__title">
        Nuxt Core <span class="header__tag">playground</span>
      </p>
      <nav aria-label="Sections">
        <ul class="nav">
          <li v-for="section in sections" :key="section.id">
            <a :href="`#${section.id}`">{{ section.title }}</a>
          </li>
        </ul>
      </nav>
    </BaseContainer>
  </header>

  <main>
    <BaseContainer>
      <section class="intro" aria-labelledby="intro-title">
        <h1 id="intro-title">The design system, rendered by itself</h1>
        <p class="muted">
          This app extends <code>@modulane/nuxt-core</code> exactly as a site
          does. Every value below comes from a design token, so a change to a
          token shows up here first.
        </p>
      </section>

      <section id="colours" class="section" aria-labelledby="colours-title">
        <h2 id="colours-title">Colours</h2>
        <ul class="grid grid--wide">
          <li v-for="color in colors" :key="color" class="card">
            <span class="swatch" :style="{ background: `var(${color})` }" />
            <code>{{ color }}</code>
          </li>
        </ul>
      </section>

      <section
        id="typography"
        class="section"
        aria-labelledby="typography-title"
      >
        <h2 id="typography-title">Typography</h2>
        <ul class="stack">
          <li v-for="size in fontSizes" :key="size" class="row">
            <code class="row__label">{{ size }}</code>
            <span :style="{ fontSize: `var(${size})` }"
              >Build once, reuse everywhere</span
            >
          </li>
        </ul>
      </section>

      <section id="spacing" class="section" aria-labelledby="spacing-title">
        <h2 id="spacing-title">Spacing</h2>
        <ul class="stack">
          <li v-for="space in spaces" :key="space" class="row">
            <code class="row__label">{{ space }}</code>
            <span class="bar" :style="{ inlineSize: `var(${space})` }" />
          </li>
        </ul>
      </section>

      <section id="shape" class="section" aria-labelledby="shape-title">
        <h2 id="shape-title">Radius and shadows</h2>
        <ul class="grid">
          <li v-for="radius in radii" :key="radius" class="card">
            <span class="shape" :style="{ borderRadius: `var(${radius})` }" />
            <code>{{ radius }}</code>
          </li>
          <li v-for="shadow in shadows" :key="shadow" class="card">
            <span
              class="shape shape--raised"
              :style="{ boxShadow: `var(${shadow})` }"
            />
            <code>{{ shadow }}</code>
          </li>
        </ul>
      </section>

      <section id="motion" class="section" aria-labelledby="motion-title">
        <h2 id="motion-title">Motion</h2>
        <p class="muted">Hover or focus a row to play its duration.</p>
        <ul class="stack">
          <li v-for="duration in durations" :key="duration">
            <button
              type="button"
              class="motion"
              :style="{ '--demo-duration': `var(${duration})` }"
            >
              <code class="row__label">{{ duration }}</code>
              <span class="motion__track"><span class="motion__dot" /></span>
            </button>
          </li>
        </ul>
      </section>

      <section
        id="components"
        class="section"
        aria-labelledby="components-title"
      >
        <h2 id="components-title">Components</h2>
        <table class="table">
          <thead>
            <tr>
              <th scope="col">Component</th>
              <th scope="col">Status</th>
              <th scope="col">Roadmap</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="component in components" :key="component.name">
              <td>
                <code>&lt;{{ component.name }}&gt;</code>
              </td>
              <td>
                <span class="status" :data-status="component.status">{{
                  component.status
                }}</span>
              </td>
              <td>Phase {{ component.phase }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </BaseContainer>
  </main>
</template>

<script setup lang="ts">
useHead({
  title: 'Nuxt Core playground',
  htmlAttrs: { lang: 'en' },
})

const sections = [
  { id: 'colours', title: 'Colours' },
  { id: 'typography', title: 'Typography' },
  { id: 'spacing', title: 'Spacing' },
  { id: 'shape', title: 'Radius and shadows' },
  { id: 'motion', title: 'Motion' },
  { id: 'components', title: 'Components' },
]

// Mirrors layers/design/app/assets/scss/base/_root.scss
const colors = [
  '--color-primary',
  '--color-primary-contrast',
  '--color-secondary',
  '--color-secondary-contrast',
  '--color-background',
  '--color-surface',
  '--color-text',
  '--color-text-muted',
  '--color-border',
]
const fontSizes = ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'].map(
  size => `--font-size-${size}`,
)
const spaces = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20].map(
  step => `--space-${step}`,
)
const radii = ['sm', 'md', 'lg', 'full'].map(size => `--radius-${size}`)
const shadows = ['sm', 'md', 'lg'].map(size => `--shadow-${size}`)
const durations = ['fast', 'normal', 'slow'].map(speed => `--duration-${speed}`)

// Mirrors the inventory in docs/components.md
const components = [
  { name: 'BaseContainer', status: 'ready', phase: 3 },
  { name: 'BaseButton', status: 'stub', phase: 4 },
  { name: 'BaseCard', status: 'stub', phase: 4 },
  { name: 'FormInput', status: 'stub', phase: 5 },
  { name: 'FormTextarea', status: 'stub', phase: 5 },
  { name: 'NavigationAppHeader', status: 'stub', phase: 7 },
  { name: 'NavigationAppFooter', status: 'stub', phase: 7 },
]
</script>

<style lang="scss" scoped>
@use '#layers/nuxt-core-design/app/assets/scss/abstracts/variables' as *;
@use '#layers/nuxt-core-design/app/assets/scss/abstracts/mixins' as *;

ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

code {
  font-size: var(--font-size-sm);
}

.muted {
  color: var(--color-text-muted);
}

.header {
  position: sticky;
  inset-block-start: 0;
  z-index: 1;
  padding-block: var(--space-3);
  border-block-end: 1px solid var(--color-border);
  background: var(--color-background);

  &__inner {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-6);
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    margin: 0;
    font-family: var(--font-family-heading);
    font-weight: 700;
  }

  &__tag {
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-full);
    background: var(--color-surface);
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
    font-weight: 400;
  }
}

.nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);

  a {
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);

    &:hover,
    &:focus-visible {
      color: var(--color-text);
    }
  }
}

.intro {
  padding-block: var(--space-12) var(--space-4);

  h1 {
    margin-block: 0 var(--space-3);
    font-size: var(--font-size-3xl);
  }
}

.section {
  padding-block: var(--space-8);
  border-block-end: 1px solid var(--color-border);
  // Keeps headings visible below the sticky header when jumping to a section
  scroll-margin-block-start: var(--space-20);

  h2 {
    margin-block: 0 var(--space-6);
    font-size: var(--font-size-2xl);
  }
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);

  @include respond-to($breakpoint-md) {
    grid-template-columns: repeat(4, 1fr);
  }

  &--wide {
    @include respond-to($breakpoint-lg) {
      grid-template-columns: repeat(5, 1fr);
    }
  }
}

.card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.swatch {
  block-size: var(--space-16);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.row {
  display: flex;
  gap: var(--space-4);
  align-items: center;

  &__label {
    flex: none;
    inline-size: 9rem;
    color: var(--color-text-muted);
  }
}

.bar {
  block-size: var(--space-4);
  background: var(--color-primary);
}

.shape {
  block-size: var(--space-16);
  border: 1px solid var(--color-border);
  background: var(--color-surface);

  &--raised {
    border-color: transparent;
    border-radius: var(--radius-md);
    background: var(--color-background);
  }
}

.motion {
  display: flex;
  gap: var(--space-4);
  align-items: center;
  inline-size: 100%;
  padding: var(--space-2);
  border: 0;
  border-radius: var(--radius-sm);
  background: none;
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;

  &__track {
    position: relative;
    flex: 1;
    block-size: var(--space-4);
    border-radius: var(--radius-full);
    background: var(--color-surface);
  }

  &__dot {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    inline-size: var(--space-4);
    block-size: var(--space-4);
    border-radius: var(--radius-full);
    background: var(--color-primary);
    transition: inset-inline-start var(--demo-duration) var(--ease-standard);
  }

  &:hover &__dot,
  &:focus-visible &__dot {
    inset-inline-start: calc(100% - var(--space-4));
  }

  @media (prefers-reduced-motion: reduce) {
    &__dot {
      transition: none;
    }
  }
}

.table {
  inline-size: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: var(--space-2) var(--space-3);
    border-block-end: 1px solid var(--color-border);
    text-align: start;
  }

  th {
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
    font-weight: 400;
  }
}

.status {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);

  &[data-status='ready'] {
    background: var(--color-primary);
    color: var(--color-primary-contrast);
  }
}
</style>
