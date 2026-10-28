<template>
  <NuxtRouteAnnouncer />

  <a href="#content" class="nc-visually-hidden-focusable skip-link"
    >Skip to content</a
  >

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
      <FormSwitch v-model="isDark" class="header__switch">Dark mode</FormSwitch>
    </BaseContainer>
  </header>

  <main id="content">
    <BaseContainer>
      <section class="intro" aria-labelledby="intro-title">
        <h1 id="intro-title">The design system, rendered by itself</h1>
        <p class="muted">
          This app extends <code>@modulane/nuxt-core</code> exactly as a site
          does. Every value below comes from a design token, so a change to a
          token shows up here first.
        </p>
        <p class="muted">
          To check forced colours (Windows high contrast), emulate them in the
          browser's developer tools: in Chrome, Rendering, then
          <code>forced-colors: active</code>.
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

        <h3 class="subheading">Status colours</h3>
        <ul class="stack">
          <li v-for="status in statuses" :key="status" class="row">
            <code class="row__label">--color-{{ status }}</code>
            <span
              class="chip"
              :style="{
                background: `var(--color-${status})`,
                color: `var(--color-${status}-contrast)`,
              }"
              >{{ status }}</span
            >
            <span :style="{ color: `var(--color-${status})` }"
              >Text in {{ status }} on the background</span
            >
          </li>
        </ul>

        <h3 class="subheading">Interaction states</h3>
        <p class="muted">
          Hover and press a button to see its shades. The last one is disabled.
        </p>
        <ul class="stack">
          <li v-for="action in actions" :key="action" class="row">
            <code class="row__label">--color-{{ action }}</code>
            <button type="button" class="action" :class="`action--${action}`">
              {{ action }}
            </button>
            <button
              type="button"
              class="action"
              :class="`action--${action}`"
              disabled
            >
              Disabled
            </button>
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
          <li v-for="family in fontFamilies" :key="family" class="row">
            <code class="row__label">{{ family }}</code>
            <span :style="{ fontFamily: `var(${family})` }"
              >Build once, reuse everywhere</span
            >
          </li>
          <li v-for="weight in fontWeights" :key="weight" class="row">
            <code class="row__label">{{ weight }}</code>
            <span :style="{ fontWeight: `var(${weight})` }"
              >Build once, reuse everywhere</span
            >
          </li>
          <li v-for="lineHeight in lineHeights" :key="lineHeight" class="row">
            <code class="row__label">{{ lineHeight }}</code>
            <span
              class="row__lines"
              :style="{ lineHeight: `var(${lineHeight})` }"
              >Build once, reuse everywhere. A layer gives every site the same
              foundation, and each site adds only what makes it different.</span
            >
          </li>
        </ul>

        <h3 class="subheading">Base styles, in <code>.nc-flow</code></h3>
        <article class="nc-flow prose">
          <h1>Heading 1</h1>
          <p>
            Body text with a <a href="#typography">link</a>,
            <strong>strong text</strong>, <code>inline code</code>, a
            <kbd>Tab</kbd> key and a <mark>highlight</mark>.
          </p>
          <h2>Heading 2</h2>
          <h3>Heading 3</h3>
          <ul class="prose__list">
            <li>A list keeps its bullets</li>
            <li>Its items are closer together than paragraphs</li>
          </ul>
          <p>
            <small>Small print, for notes and captions.</small>
          </p>
          <blockquote>
            <p>A quotation, set off from the text around it.</p>
          </blockquote>
          <pre><code>const { isDark } = useTheme()</code></pre>
          <figure>
            <blockquote>
              <p>Build once, reuse everywhere.</p>
            </blockquote>
            <figcaption>A figure with its caption</figcaption>
          </figure>
          <table>
            <caption>
              A table, with a caption
            </caption>
            <thead>
              <tr>
                <th scope="col">Breakpoint</th>
                <th scope="col">Width</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>md</code></td>
                <td>768px</td>
              </tr>
              <tr>
                <td><code>lg</code></td>
                <td>1024px</td>
              </tr>
            </tbody>
          </table>
          <dl>
            <dt>Token</dt>
            <dd>A named design value, as a CSS custom property.</dd>
            <dt>Hook</dt>
            <dd>A class or attribute a primitive exposes for styling.</dd>
          </dl>
          <hr />
          <h4>Heading 4</h4>
          <h5>Heading 5</h5>
          <h6>Heading 6</h6>
        </article>
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

      <section id="borders" class="section" aria-labelledby="borders-title">
        <h2 id="borders-title">Borders, focus and layering</h2>
        <ul class="grid">
          <li v-for="width in borderWidths" :key="width" class="card">
            <span class="shape" :style="{ borderWidth: `var(${width})` }" />
            <code>{{ width }}</code>
          </li>
          <li class="card">
            <span class="shape shape--focused" />
            <code>--focus-ring-*</code>
          </li>
          <li class="card">
            <button type="button" class="shape shape--focusable">
              Tab to me
            </button>
            <code>:focus-visible</code>
          </li>
        </ul>

        <h3 class="subheading">Layering</h3>
        <p class="muted">
          The tiles are in reverse order in the markup, so only their
          <code>z-index</code> stacks them.
        </p>
        <ul class="layers">
          <li
            v-for="(layer, index) in [...layers].reverse()"
            :key="layer"
            class="layers__tile"
            :style="{
              zIndex: `var(${layer})`,
              insetInlineStart: `calc(${layers.length - 1 - index} * var(--space-12))`,
              insetBlockStart: `calc(${layers.length - 1 - index} * var(--space-8))`,
            }"
          >
            <code>{{ layer }}</code>
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

      <section id="sass" class="section" aria-labelledby="sass-title">
        <h2 id="sass-title">Sass helpers</h2>
        <p class="muted">
          Functions and mixins from <code>@use '#nuxt-core/scss'</code>. They
          compile to the CSS below; none of them reach the browser.
        </p>
        <ul class="grid">
          <li class="card">
            <span class="breakpoint-now" />
            <code>respond-to()</code>
          </li>
          <li class="card">
            <span class="fluid-text">Grows with the window</span>
            <code>fluid(18px, 32px)</code>
          </li>
          <li class="card">
            <span class="truncated"
              >A single line of text that is far too long for its card</span
            >
            <code>truncate</code>
          </li>
          <li class="card">
            <span class="clamped"
              >Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.</span
            >
            <code>line-clamp(2)</code>
          </li>
          <li class="card">
            <span class="swatch swatch--translucent" />
            <code>translucent()</code>
          </li>
          <li class="card">
            <span class="muted"
              >Press Tab from the top of the page to show the skip link.</span
            >
            <code>visually-hidden-focusable</code>
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

const { isDark } = useTheme()

const sections = [
  { id: 'colours', title: 'Colours' },
  { id: 'typography', title: 'Typography' },
  { id: 'spacing', title: 'Spacing' },
  { id: 'shape', title: 'Radius and shadows' },
  { id: 'borders', title: 'Borders and layering' },
  { id: 'motion', title: 'Motion' },
  { id: 'sass', title: 'Sass helpers' },
  { id: 'components', title: 'Components' },
]

// Mirrors layers/design/app/assets/scss/base/_root.scss and schemes/
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
  '--color-border-strong',
  ...['primary', 'secondary'].flatMap(action => [
    `--color-${action}-hover`,
    `--color-${action}-active`,
  ]),
]
const statuses = ['success', 'warning', 'danger', 'info']
const actions = ['primary', 'secondary']
const fontSizes = ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'].map(
  size => `--font-size-${size}`,
)
const fontFamilies = ['body', 'heading', 'mono'].map(
  family => `--font-family-${family}`,
)
const fontWeights = ['normal', 'medium', 'semibold'].map(
  weight => `--font-weight-${weight}`,
)
const lineHeights = ['tight', 'normal'].map(height => `--line-height-${height}`)
const spaces = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20].map(
  step => `--space-${step}`,
)
const radii = ['sm', 'md', 'lg', 'full'].map(size => `--radius-${size}`)
const shadows = ['sm', 'md', 'lg'].map(size => `--shadow-${size}`)
const durations = ['fast', 'normal', 'slow'].map(speed => `--duration-${speed}`)
const borderWidths = ['thin', 'thick'].map(width => `--border-width-${width}`)
const layers = ['dropdown', 'sticky', 'modal', 'notification'].map(
  layer => `--z-${layer}`,
)

// Mirrors the inventory in docs/components.md
const components = [
  { name: 'BaseContainer', status: 'ready', phase: 3 },
  { name: 'BaseButton', status: 'stub', phase: 4 },
  { name: 'BaseCard', status: 'stub', phase: 4 },
  { name: 'FormInput', status: 'stub', phase: 5 },
  { name: 'FormTextarea', status: 'stub', phase: 5 },
  { name: 'FormSwitch', status: 'ready', phase: 5 },
  { name: 'NavigationAppHeader', status: 'stub', phase: 7 },
  { name: 'NavigationAppFooter', status: 'stub', phase: 7 },
]
</script>

<style lang="scss" scoped>
@use '#nuxt-core/scss' as *;

ul {
  @include reset-list;
}

code {
  font-size: var(--font-size-sm);
}

.muted {
  color: var(--color-text-muted);
}

.skip-link {
  position: fixed;
  inset-block-start: var(--space-2);
  inset-inline-start: var(--space-2);
  z-index: var(--z-notification);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: var(--color-primary-contrast);
}

.header {
  position: sticky;
  inset-block-start: 0;
  z-index: var(--z-sticky);
  padding-block: var(--space-3);
  border-block-end: var(--border-width-thin) solid var(--color-border);
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
    font-weight: var(--font-weight-semibold);
  }

  &__switch {
    font-size: var(--font-size-sm);
  }

  &__tag {
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-full);
    background: var(--color-surface);
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-normal);
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

  > h1 {
    margin-block: 0 var(--space-3);
    font-size: var(--font-size-3xl);
  }

  > p + p {
    margin-block-start: var(--space-2);
  }
}

.section {
  padding-block: var(--space-8);
  border-block-end: var(--border-width-thin) solid var(--color-border);
  // Keeps headings visible below the sticky header when jumping to a section
  scroll-margin-block-start: var(--space-20);

  > h2 {
    margin-block: 0 var(--space-6);
    font-size: var(--font-size-2xl);
  }
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);

  @include respond-to(md) {
    grid-template-columns: repeat(4, 1fr);
  }

  &--wide {
    @include respond-to(lg) {
      grid-template-columns: repeat(5, 1fr);
    }
  }
}

.card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  border: var(--border-width-thin) solid var(--color-border);
  border-radius: var(--radius-md);
}

.swatch {
  block-size: var(--space-16);
  border: var(--border-width-thin) solid var(--color-border);
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

  &__lines {
    max-inline-size: 40ch;
  }
}

.subheading {
  margin-block: var(--space-8) var(--space-4);
  font-size: var(--font-size-lg);
}

.prose {
  max-inline-size: 65ch;
  padding: var(--space-6);
  border: var(--border-width-thin) solid var(--color-border);
  border-radius: var(--radius-lg);

  // Restores what the playground removes from every ul, as a site's content would
  &__list {
    padding-inline-start: var(--space-6);
    list-style: disc;
  }
}

.chip {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
}

// A stand-in for <BaseButton>, until it is styled, to show the interaction tokens
.action {
  padding: var(--space-2) var(--space-4);
  // Transparent, but drawn in forced colours, where the background is dropped
  border: var(--border-width-thin) solid transparent;
  border-radius: var(--radius-md);
  background: var(--action);
  color: var(--action-contrast);
  font: inherit;
  cursor: pointer;

  @include hover {
    background: var(--action-hover);
  }

  &:active {
    background: var(--action-active);
  }

  &:disabled {
    @include disabled;

    background: var(--action);
  }

  @each $action in primary, secondary {
    &--#{$action} {
      --action: var(--color-#{$action});
      --action-contrast: var(--color-#{$action}-contrast);
      --action-hover: var(--color-#{$action}-hover);
      --action-active: var(--color-#{$action}-active);
    }
  }

  @include transition(background-color, $duration: fast);
}

.bar {
  block-size: var(--space-4);
  background: var(--color-primary);
}

.shape {
  block-size: var(--space-16);
  border: var(--border-width-thin) solid var(--color-border);
  background: var(--color-surface);

  &--raised {
    border-color: transparent;
    border-radius: var(--radius-md);
    background: var(--color-background);
  }

  // Shows the ring permanently, as :focus-visible draws it
  &--focused {
    @include focus-ring;
  }

  &--focusable {
    color: var(--color-text-muted);
    font: inherit;
    cursor: pointer;
  }
}

.layers {
  position: relative;
  // Room for the last tile's offset
  block-size: calc(var(--space-16) + 3 * var(--space-8));

  // The label sits in the top strip, which the tile above leaves uncovered
  &__tile {
    position: absolute;
    display: flex;
    align-items: start;
    inline-size: 12rem;
    block-size: var(--space-16);
    padding: var(--space-2);
    border: var(--border-width-thin) solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    box-shadow: var(--shadow-md);
  }
}

.motion {
  @include reset-button;

  display: flex;
  gap: var(--space-4);
  align-items: center;
  inline-size: 100%;
  padding: var(--space-2);
  border-radius: var(--radius-sm);

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

  @include reduced-motion {
    &__dot {
      transition: none;
    }
  }
}

// Names the breakpoint the window is in, with one respond-to() per breakpoint
.breakpoint-now {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);

  &::after {
    content: 'below sm';
  }

  @each $name, $width in $breakpoints {
    @include respond-to($name) {
      &::after {
        content: '#{$name} and up';
      }
    }
  }
}

.fluid-text {
  font-size: fluid(18px, 32px);
  line-height: var(--line-height-tight);
}

.truncated {
  @include truncate;
}

.clamped {
  @include line-clamp(2);
}

.swatch--translucent {
  background: translucent(var(--color-primary), 30%);
}

// The base table styles, full width, with quieter headings
.table {
  inline-size: 100%;

  th {
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-normal);
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
