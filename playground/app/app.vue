<template>
  <NuxtRouteAnnouncer />

  <!-- The default layout, with its skip link, header, main area and footer -->
  <NuxtLayout sticky-header>
    <template #header>
      <BaseContainer class="header">
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
        <FormSwitch v-model="isDark" class="header__switch"
          >Dark mode</FormSwitch
        >
      </BaseContainer>
    </template>

    <BaseContainer>
      <section class="intro" aria-labelledby="intro-title">
        <h1 id="intro-title">The design system, rendered by itself</h1>
        <p class="muted">
          This app extends <code>@modulane/nuxt-core</code> exactly as a site
          does. Each sample below is drawn with the design tokens and the Sass
          helpers, so a change to either shows up here first.
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
          Hover and press a button to see its shades. The second button of each
          row is disabled, faded with <code>--opacity-disabled</code>.
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

        <h3 class="subheading">Container</h3>
        <p class="muted">
          <code>--container-max-width</code> limits the width of
          <code>.nc-container</code>, which holds this page: widen the window
          past it to see the margins grow.
        </p>

        <h3 class="subheading">Grid</h3>
        <!-- A one-column grid spaces the samples, each a grid of its own -->
        <BaseGrid :gap="4">
          <p class="muted">
            <code>&lt;BaseGrid :columns="{ sm: 2, lg: 4 }"&gt;</code>: one
            column on phones, two from <code>sm</code>, four from
            <code>lg</code>.
          </p>
          <BaseGrid as="ul" :columns="{ sm: 2, lg: 4 }" role="list">
            <li v-for="item in 8" :key="item" class="card">
              <code>{{ item }}</code>
            </li>
          </BaseGrid>

          <p class="muted">
            <code>&lt;BaseGrid fit min-column-width="10rem" :gap="3"&gt;</code>:
            as many columns of at least 10rem as fit, without breakpoints.
          </p>
          <BaseGrid as="ul" fit min-column-width="10rem" :gap="3" role="list">
            <li v-for="item in 8" :key="item" class="card">
              <code>{{ item }}</code>
            </li>
          </BaseGrid>
        </BaseGrid>

        <h3 class="subheading">Stack and cluster</h3>
        <BaseStack :gap="{ base: 3, md: 6 }">
          <p class="muted">
            <code>&lt;BaseStack :gap="{ base: 3, md: 6 }"&gt;</code> spaces
            these blocks <code>--space-3</code> apart on phones and
            <code>--space-6</code> from <code>md</code>.
          </p>
          <BaseCluster as="ul" :gap="2" role="list" aria-label="Sample tags">
            <li v-for="tag in tags" :key="tag" class="chip tag">{{ tag }}</li>
          </BaseCluster>
          <BaseCluster justify="between" class="card">
            <code>&lt;BaseCluster justify="between"&gt;</code>
            <span class="muted">spreads its items to both ends</span>
          </BaseCluster>
        </BaseStack>
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
        <p class="muted">
          Hover or focus a row to play its duration, with
          <code>--ease-standard</code>. With reduced motion, the dot jumps
          instead.
        </p>
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
          Functions and mixins from <code>@use '#nuxt-core/scss'</code>. Sass
          compiles them to plain CSS, so none of them reach the browser. Each
          card below shows one; the playground's own styles use the others:
          <code>hover</code>, <code>disabled</code> and
          <code>transition()</code> on the interaction buttons,
          <code>focus-ring</code> in Borders, <code>reduced-motion</code> in
          Motion, <code>reset-list</code> and <code>reset-button</code>
          throughout.
        </p>
        <ul class="grid">
          <li class="card">
            <span class="breakpoint-now" />
            <code>respond-to()</code>
          </li>
          <li class="card">
            <!-- The same breakpoints from JavaScript; "below sm" until hydrated -->
            <span class="breakpoint-label">{{
              activeBreakpoint ? `${activeBreakpoint} and up` : 'below sm'
            }}</span>
            <code>useBreakpoints()</code>
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
        id="accessibility"
        class="section"
        aria-labelledby="accessibility-title"
      >
        <h2 id="accessibility-title">Accessibility</h2>
        <p class="muted">
          Emulate these settings in the browser's developer tools (in Chrome,
          the Rendering panel) and watch the page follow them. Press Tab from
          the top of the page to show the skip link.
        </p>

        <h3 class="subheading">This browser's settings, live</h3>
        <ul class="stack">
          <li v-for="media in mediaFeatures" :key="media.query" class="row">
            <span class="row__label">{{ media.name }}</span>
            <span class="status" :data-status="settingOf(media.query)">{{
              settingLabelOf(media.query)
            }}</span>
            <span class="muted">{{ media.effect }}</span>
          </li>
        </ul>

        <h3 class="subheading">Switch states</h3>
        <p class="muted">
          In forced colours, the thumb, the on state and the disabled state stay
          visible. With reduced motion, the thumb moves without a transition.
        </p>
        <ul class="grid">
          <li class="card">
            <FormSwitch v-model="switches.off">Off</FormSwitch>
            <code>aria-checked="false"</code>
          </li>
          <li class="card">
            <FormSwitch v-model="switches.on">On</FormSwitch>
            <code>aria-checked="true"</code>
          </li>
          <li class="card">
            <FormSwitch v-model="switches.disabledOff" disabled
              >Disabled, off</FormSwitch
            >
            <code>disabled, aria-checked="false"</code>
          </li>
          <li class="card">
            <FormSwitch v-model="switches.disabledOn" disabled
              >Disabled, on</FormSwitch
            >
            <code>disabled, aria-checked="true"</code>
          </li>
        </ul>
      </section>

      <section id="browsers" class="section" aria-labelledby="browsers-title">
        <h2 id="browsers-title">Browser support</h2>
        <p class="muted">
          The CSS build target, set in
          <code>layers/design/nuxt.config.ts</code>: Baseline widely available.
        </p>
        <table class="table">
          <thead>
            <tr>
              <th scope="col">Browser</th>
              <th scope="col">From version</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="target in browserTargets" :key="target.browser">
              <td>{{ target.browser }}</td>
              <td>{{ target.version }}</td>
            </tr>
          </tbody>
        </table>

        <h3 class="subheading">This browser</h3>
        <p class="muted">
          The CSS features the design system relies on, checked live. An
          enhancement is ignored where it is missing.
        </p>
        <ul class="stack">
          <li v-for="feature in cssFeatures" :key="feature.name" class="row">
            <span class="row__label">{{ feature.name }}</span>
            <span
              class="status"
              :data-status="
                supported[feature.name] === false && !feature.required
                  ? 'optional'
                  : statusOf(feature.name)
              "
              >{{ labelOf(feature.name) }}</span
            >
            <span class="muted">{{
              feature.required ? 'Required' : 'Enhancement'
            }}</span>
          </li>
        </ul>
      </section>

      <section
        id="components"
        class="section"
        aria-labelledby="components-title"
      >
        <h2 id="components-title">Components</h2>

        <h3 class="subheading">Buttons</h3>
        <p class="muted">
          Hover, press and tab to them. The loading one keeps focus and ignores
          clicks; in forced colours, the outline and the disabled state stay
          visible.
        </p>
        <BaseStack :gap="3">
          <BaseCluster :gap="2">
            <BaseButton>Primary</BaseButton>
            <BaseButton variant="secondary">Secondary</BaseButton>
            <BaseButton disabled>Disabled</BaseButton>
            <BaseButton :loading="loading" @click="clicks++">
              Clicked {{ clicks }} times
            </BaseButton>
            <BaseButton variant="secondary" @click="loading = !loading">
              {{ loading ? 'Stop loading' : 'Start loading' }}
            </BaseButton>
          </BaseCluster>
          <BaseCluster :gap="2">
            <BaseButton size="sm">Small</BaseButton>
            <BaseButton size="md">Medium</BaseButton>
            <BaseButton size="lg">
              <template #start>
                <BaseIcon
                  ><svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" /></svg
                ></BaseIcon>
              </template>
              Large, with an icon
            </BaseButton>
          </BaseCluster>
        </BaseStack>

        <pre class="usage"><code>{{ buttonSnippet }}</code></pre>

        <h3 class="subheading">Links</h3>
        <BaseCluster :gap="6">
          <BaseLink to="#colours">An internal link</BaseLink>
          <BaseLink to="https://nuxt.com">An external link</BaseLink>
          <BaseLink to="https://github.com/modulane/nuxt-core" new-tab>
            A link in a new tab
          </BaseLink>
        </BaseCluster>

        <pre class="usage"><code>{{ linkSnippet }}</code></pre>

        <h3 class="subheading">Cards</h3>
        <BaseGrid as="ul" :columns="{ md: 3 }" :gap="4" role="list">
          <BaseCard as="li">
            <template #header><h4>A plain card</h4></template>
            <p>A header and a body, nothing else.</p>
          </BaseCard>
          <BaseCard as="li">
            <template #media>
              <BaseImage
                src="/sample.svg"
                alt=""
                width="1200"
                height="800"
                ratio="16 / 9"
              />
            </template>
            <template #header><h4>With media</h4></template>
            <p>The image comes after the title in the markup, and on top.</p>
          </BaseCard>
          <BaseCard as="li" to="#components">
            <template #header><h4>A linked card</h4></template>
            <p>Click anywhere: the title is the link.</p>
            <template #footer>
              <BaseButton size="sm" variant="secondary" @click="clicks++">
                Its own button
              </BaseButton>
            </template>
          </BaseCard>
        </BaseGrid>

        <pre class="usage"><code>{{ cardSnippet }}</code></pre>

        <h3 class="subheading">Badges</h3>
        <BaseCluster :gap="2">
          <BaseBadge>Neutral</BaseBadge>
          <BaseBadge v-for="status in statuses" :key="status" :status="status">
            {{ status }}
          </BaseBadge>
        </BaseCluster>

        <pre class="usage"><code>{{ badgeSnippet }}</code></pre>

        <h3 class="subheading">Icons</h3>
        <BaseCluster :gap="6">
          <span>
            <BaseIcon
              ><svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M5 12h14M13 6l6 6-6 6" /></svg
            ></BaseIcon>
            Beside text, decorative
          </span>
          <span class="icon-large">
            <BaseIcon label="Next"
              ><svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M5 12h14M13 6l6 6-6 6" /></svg
            ></BaseIcon>
            Follows the font size
          </span>
          <span dir="rtl">
            <BaseIcon flip-rtl
              ><svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M5 12h14M13 6l6 6-6 6" /></svg
            ></BaseIcon>
            يمين إلى يسار
          </span>
        </BaseCluster>

        <pre class="usage"><code>{{ iconSnippet }}</code></pre>

        <h3 class="subheading">Dividers</h3>
        <BaseStack :gap="3">
          <p>Above a horizontal divider.</p>
          <BaseDivider />
          <BaseCluster :gap="3">
            <span>Share</span>
            <BaseDivider orientation="vertical" decorative />
            <span>Print</span>
          </BaseCluster>
        </BaseStack>

        <pre class="usage"><code>{{ dividerSnippet }}</code></pre>

        <h3 class="subheading">Avatars</h3>
        <BaseCluster :gap="3">
          <BaseAvatar name="Ada Lovelace" size="sm" />
          <BaseAvatar name="Grace Hopper" />
          <BaseAvatar name="Alan Turing" size="lg" />
          <BaseAvatar name="Margaret Hamilton" src="/sample.svg" size="lg" />
          <BaseAvatar name="Broken Image" src="/missing.jpg" size="lg" />
        </BaseCluster>

        <pre class="usage"><code>{{ avatarSnippet }}</code></pre>

        <h3 class="subheading">Loading indicator</h3>
        <p class="muted">With reduced motion, the ring stands still.</p>
        <BaseCluster :gap="6">
          <BaseSpinner />
          <BaseSpinner label="Chargement" />
          <span class="icon-large"><BaseSpinner /></span>
        </BaseCluster>

        <pre class="usage"><code>{{ spinnerSnippet }}</code></pre>

        <h3 class="subheading">Alerts</h3>
        <BaseStack :gap="3">
          <BaseAlert>
            <template #title>Info</template>
            The shop closes at 6 pm today.
          </BaseAlert>
          <BaseAlert status="success">Your message was sent.</BaseAlert>
          <BaseAlert status="warning"
            >Your session ends in 5 minutes.</BaseAlert
          >
          <BaseAlert status="danger">
            <template #title>Error</template>
            The form has two errors.
          </BaseAlert>
          <div>
            <BaseButton variant="secondary" @click="announced = !announced">
              {{ announced ? 'Hide' : 'Show' }} an announced alert
            </BaseButton>
          </div>
          <BaseAlert v-if="announced" status="success" announce>
            Read out by screen readers as it appears.
          </BaseAlert>
        </BaseStack>

        <pre class="usage"><code>{{ alertSnippet }}</code></pre>

        <h3 class="subheading">Images</h3>
        <p class="muted">
          The same image: its own shape, cropped to 16 / 9, and fitted in a
          square. Each reserves its space before it loads.
        </p>
        <BaseGrid :columns="{ md: 3 }" :gap="4">
          <BaseImage
            src="/sample.svg"
            alt="Mountains"
            width="1200"
            height="800"
          />
          <BaseImage
            src="/sample.svg"
            alt="Mountains, cropped"
            width="1200"
            height="800"
            ratio="16 / 9"
          />
          <BaseImage
            src="/sample.svg"
            alt="Mountains, fitted"
            width="1200"
            height="800"
            ratio="1"
            fit="contain"
          />
        </BaseGrid>

        <pre class="usage"><code>{{ imageSnippet }}</code></pre>

        <h3 class="subheading">Inventory</h3>
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

    <template #footer>
      <BaseContainer>
        <p>
          Nuxt Core is open source, under the MIT licence.
          <a href="https://github.com/modulane/nuxt-core">Source on GitHub</a>
        </p>
      </BaseContainer>
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
  title: 'Nuxt Core playground',
  htmlAttrs: { lang: 'en' },
})

const { isDark } = useTheme()
const { active: activeBreakpoint } = useBreakpoints()

const sections = [
  { id: 'colours', title: 'Colours' },
  { id: 'typography', title: 'Typography' },
  { id: 'spacing', title: 'Spacing' },
  { id: 'shape', title: 'Radius and shadows' },
  { id: 'borders', title: 'Borders, focus and layering' },
  { id: 'motion', title: 'Motion' },
  { id: 'sass', title: 'Sass helpers' },
  { id: 'accessibility', title: 'Accessibility' },
  { id: 'browsers', title: 'Browser support' },
  { id: 'components', title: 'Components' },
]

const loading = ref(false)
const clicks = ref(0)
const announced = ref(false)

const switches = reactive({
  off: false,
  on: true,
  disabledOff: false,
  disabledOn: true,
})

// The visitor settings the design system follows
const mediaFeatures = [
  {
    name: 'Forced colours',
    query: '(forced-colors: active)',
    effect: 'System colours; components draw their outline and state with them',
  },
  {
    name: 'Reduced motion',
    query: '(prefers-reduced-motion: reduce)',
    effect: 'Transitions are off',
  },
  {
    name: 'Hover',
    query: '(hover: hover)',
    effect: 'Hover styles apply; a touch screen never shows them',
  },
]

// Mirrors the cssTarget in layers/design/nuxt.config.ts
const browserTargets = [
  { browser: 'Chrome and Edge', version: '111' },
  { browser: 'Firefox', version: '114' },
  { browser: 'Safari, on macOS and iOS', version: '16.4' },
]

// Mirrors docs/styling.md#browser-support
const cssFeatures = [
  {
    name: 'Cascade layers',
    required: true,
    test: () => 'CSSLayerBlockRule' in window,
  },
  {
    name: 'color-mix()',
    required: true,
    test: () =>
      CSS.supports('color', 'color-mix(in srgb, red 50%, transparent)'),
  },
  {
    name: 'Range media queries',
    required: true,
    test: () => matchMedia('(width >= 0px)').matches,
  },
  {
    name: ':focus-visible',
    required: true,
    test: () => CSS.supports('selector(:focus-visible)'),
  },
  {
    name: 'Logical properties',
    required: true,
    test: () => CSS.supports('margin-inline-start', '0'),
  },
  {
    name: 'dvh units',
    required: true,
    test: () => CSS.supports('height', '1dvh'),
  },
  {
    name: 'Balanced headings',
    required: false,
    test: () => CSS.supports('text-wrap', 'balance'),
  },
]

// Filled in the browser: the server cannot know them, so they start unknown
const supported = ref<Record<string, boolean>>({})

const statusOf = (key: string): string => {
  const value = supported.value[key]
  return value === undefined ? 'unknown' : value ? 'yes' : 'no'
}

const labelOf = (key: string): string =>
  ({ unknown: 'Checking…', yes: 'Yes', no: 'No' })[statusOf(key)] ?? ''

// A setting is a choice, not a pass or a fail: on or off, without status colours
const settingOf = (query: string): string =>
  ({ unknown: 'unknown', yes: 'on', no: 'off' })[statusOf(query)] ?? ''

const settingLabelOf = (query: string): string =>
  ({ unknown: 'Checking…', on: 'On', off: 'Off' })[settingOf(query)] ?? ''

// Media queries update live, so emulating a setting shows here at once
const mediaLists: [MediaQueryList, () => void][] = []

onMounted(() => {
  for (const feature of cssFeatures) {
    supported.value[feature.name] = feature.test()
  }

  for (const { query } of mediaFeatures) {
    const list = matchMedia(query)
    const update = () => {
      supported.value[query] = list.matches
    }
    update()
    list.addEventListener('change', update)
    mediaLists.push([list, update])
  }
})

onBeforeUnmount(() => {
  for (const [list, update] of mediaLists) {
    list.removeEventListener('change', update)
  }
})

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
const statuses = ['success', 'warning', 'danger', 'info'] as const
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
const tags = ['tokens', 'layout', 'accessible', 'responsive', 'light', 'nuxt']
const spaces = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20].map(
  step => `--space-${step}`,
)
const radii = ['sm', 'md', 'lg', 'full'].map(size => `--radius-${size}`)
const shadows = ['sm', 'md', 'lg'].map(size => `--shadow-${size}`)
const durations = ['fast', 'normal', 'slow', 'spin'].map(
  speed => `--duration-${speed}`,
)
const borderWidths = ['thin', 'thick'].map(width => `--border-width-${width}`)
const layers = ['dropdown', 'sticky', 'modal', 'notification'].map(
  layer => `--z-${layer}`,
)

// The code of each component demo, shown under it
const buttonSnippet = `<BaseButton @click="save">Save</BaseButton>
<BaseButton variant="secondary" size="sm">Cancel</BaseButton>
<BaseButton type="submit" :loading="sending">Send</BaseButton>
<BaseButton disabled>Unavailable</BaseButton>
<BaseButton size="lg">
  <template #start><BaseIcon><svg>…</svg></BaseIcon></template>
  Large, with an icon
</BaseButton>`
const linkSnippet = `<BaseLink to="/about">About us</BaseLink>
<BaseLink to="https://nuxt.com">Nuxt</BaseLink>
<BaseLink to="https://github.com/modulane/nuxt-core" new-tab>
  Source
</BaseLink>`
const cardSnippet = `<BaseGrid as="ul" :columns="{ md: 3 }" role="list">
  <BaseCard as="li" :to="post.path">
    <template #media>
      <BaseImage :src="post.image" alt="" width="1200" height="800" ratio="16 / 9" />
    </template>
    <template #header><h3>{{ post.title }}</h3></template>
    <p>{{ post.summary }}</p>
    <template #footer><BaseButton size="sm">Save</BaseButton></template>
  </BaseCard>
</BaseGrid>`
const badgeSnippet = `<BaseBadge>Draft</BaseBadge>
<BaseBadge status="success">In stock</BaseBadge>
<BaseBadge status="danger">Sold out</BaseBadge>`
const iconSnippet = `<!-- Decorative, beside text that says it -->
<BaseIcon><svg viewBox="0 0 24 24" stroke="currentColor">…</svg></BaseIcon>

<!-- Meaningful, alone -->
<BaseIcon label="Next"><svg>…</svg></BaseIcon>

<!-- Mirrored in right-to-left languages -->
<BaseIcon flip-rtl><svg>…</svg></BaseIcon>`
const dividerSnippet = `<BaseDivider />

<BaseCluster>
  <span>Share</span>
  <BaseDivider orientation="vertical" decorative />
  <span>Print</span>
</BaseCluster>`
const avatarSnippet = `<BaseAvatar name="Ada Lovelace" size="sm" />
<BaseAvatar name="Margaret Hamilton" src="/team/margaret.jpg" size="lg" />

<!-- The name is written beside it -->
<BaseAvatar name="Ada Lovelace" decorative /> Ada Lovelace`
const spinnerSnippet = `<BaseSpinner v-if="pending" />
<BaseSpinner label="Chargement" />`
const alertSnippet = `<BaseAlert>
  <template #title>Info</template>
  The shop closes at 6 pm today.
</BaseAlert>

<!-- Read out as it appears, after the visitor's action -->
<BaseAlert v-if="sent" status="success" announce>
  Your message was sent.
</BaseAlert>`
const imageSnippet = `<BaseImage src="/team.jpg" alt="The team" width="1200" height="800" />
<BaseImage src="/team.jpg" alt="The team" width="1200" height="800" ratio="16 / 9" />
<BaseImage src="/logo.png" alt="Logo" width="400" height="400" ratio="1" fit="contain" />

<!-- Above the fold -->
<BaseImage src="/hero.jpg" alt="…" width="1920" height="1080" priority />`

// Mirrors the inventory in docs/components.md
const components = [
  { name: 'BaseContainer', status: 'ready', phase: 3 },
  { name: 'BaseGrid', status: 'ready', phase: 3 },
  { name: 'BaseStack', status: 'ready', phase: 3 },
  { name: 'BaseCluster', status: 'ready', phase: 3 },
  { name: 'BaseButton', status: 'ready', phase: 4 },
  { name: 'BaseLink', status: 'ready', phase: 4 },
  { name: 'BaseCard', status: 'ready', phase: 4 },
  { name: 'BaseBadge', status: 'ready', phase: 4 },
  { name: 'BaseIcon', status: 'ready', phase: 4 },
  { name: 'BaseDivider', status: 'ready', phase: 4 },
  { name: 'BaseAvatar', status: 'ready', phase: 4 },
  { name: 'BaseSpinner', status: 'ready', phase: 4 },
  { name: 'BaseAlert', status: 'ready', phase: 4 },
  { name: 'BaseImage', status: 'ready', phase: 4 },
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

.header {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-6);
  align-items: center;
  justify-content: space-between;

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

    &:focus-visible {
      color: var(--color-text);
    }

    @include hover {
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

.icon-large {
  font-size: var(--font-size-2xl);
}

.usage {
  margin-block-start: var(--space-4);
  padding: var(--space-4);
  overflow-x: auto;
  border: var(--border-width-thin) solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-size: var(--font-size-sm);
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

.tag {
  background: var(--color-surface);
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
  // Stacks the tiles among themselves only, so the sample's modal and
  // notification tiles stay under the page's sticky header
  isolation: isolate;
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

.breakpoint-label,
.breakpoint-now {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
}

// Names the breakpoint the window is in, with one respond-to() per breakpoint
.breakpoint-now {
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

  &[data-status='ready'],
  &[data-status='on'] {
    background: var(--color-primary);
    color: var(--color-primary-contrast);
  }

  &[data-status='yes'] {
    background: var(--color-success);
    color: var(--color-success-contrast);
  }

  &[data-status='no'] {
    background: var(--color-danger);
    color: var(--color-danger-contrast);
  }

  // A missing enhancement is not a failure
  &[data-status='optional'] {
    background: var(--color-warning);
    color: var(--color-warning-contrast);
  }
}
</style>
