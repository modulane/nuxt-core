# Components

Every component, and how to document a new one.

The components are the [primitives layer](architecture.md#the-parts), `@modulane/nuxt-core/primitives`: they provide markup, behaviour and accessibility, and no CSS. Each one exposes [styling hooks](architecture.md#the-styling-hooks), listed in its section. The design system styles those hooks; a site that uses only the primitives styles them itself, as [usage.md](usage.md#primitives-with-your-own-styling) shows.

## Inventory

Nuxt registers components with their folder as a prefix, so the name to use in templates is the one in the first column.

| Component               | File                                                        | Status | Purpose                          |
| ----------------------- | ----------------------------------------------------------- | ------ | -------------------------------- |
| `<BaseContainer>`       | `layers/primitives/app/components/base/Container.vue`       | Ready  | Centres content, limits width    |
| `<BaseGrid>`            | `layers/primitives/app/components/base/Grid.vue`            | Ready  | Lays content out in columns      |
| `<BaseStack>`           | `layers/primitives/app/components/base/Stack.vue`           | Ready  | Spaces content vertically        |
| `<BaseCluster>`         | `layers/primitives/app/components/base/Cluster.vue`         | Ready  | Lays content out in a row        |
| `<BaseButton>`          | `layers/primitives/app/components/base/Button.vue`          | Ready  | Triggers an action               |
| `<BaseLink>`            | `layers/primitives/app/components/base/Link.vue`            | Ready  | Goes to another page             |
| `<BaseCard>`            | `layers/primitives/app/components/base/Card.vue`            | Ready  | Groups one piece of content      |
| `<BaseBadge>`           | `layers/primitives/app/components/base/Badge.vue`           | Ready  | A short status or count label    |
| `<BaseIcon>`            | `layers/primitives/app/components/base/Icon.vue`            | Ready  | Sizes and labels an SVG icon     |
| `<BaseDivider>`         | `layers/primitives/app/components/base/Divider.vue`         | Ready  | Separates content                |
| `<BaseAvatar>`          | `layers/primitives/app/components/base/Avatar.vue`          | Ready  | A person's picture or initials   |
| `<BaseSpinner>`         | `layers/primitives/app/components/base/Spinner.vue`         | Ready  | Shows that something is loading  |
| `<BaseAlert>`           | `layers/primitives/app/components/base/Alert.vue`           | Ready  | A static message in a status     |
| `<BaseImage>`           | `layers/primitives/app/components/base/Image.vue`           | Ready  | An image that does not shift     |
| `<FormInput>`           | `layers/primitives/app/components/form/Input.vue`           | Stub   | Text inputs (roadmap phase 5)    |
| `<FormTextarea>`        | `layers/primitives/app/components/form/Textarea.vue`        | Stub   | Multi-line text inputs (phase 5) |
| `<FormSwitch>`          | `layers/primitives/app/components/form/Switch.vue`          | Ready  | On/off toggle                    |
| `<NavigationAppHeader>` | `layers/primitives/app/components/navigation/AppHeader.vue` | Stub   | Site header (roadmap phase 7)    |
| `<NavigationAppFooter>` | `layers/primitives/app/components/navigation/AppFooter.vue` | Stub   | Site footer (roadmap phase 7)    |

**Ready** components have an API documented below. **Stubs** are placeholders that reserve the structure: they render an empty `<div>` and must not be used yet.

## BaseContainer

Centres its content and limits its width, once styled. The design system's rules are in [`.nc-container`](styling.md#nc-container).

```vue
<BaseContainer>
  <h1>Page title</h1>
</BaseContainer>
```

| Slot      | Content               |
| --------- | --------------------- |
| `default` | The content to centre |

No props, no events.

**Hooks:** the root `<div>` has the class `nc-container`.

## BaseGrid

Lays its content out in columns of equal width, one column on the smallest screens. The design system's rules are in [`.nc-grid`](styling.md#nc-grid).

```vue
<BaseGrid as="ul" :columns="{ md: 2, lg: 3 }" role="list">
  <li v-for="post in posts" :key="post.id">…</li>
</BaseGrid>

<BaseGrid fit min-column-width="12rem" :gap="4">…</BaseGrid>
```

| Prop             | Type                                                      | Default | Description                                                                              |
| ---------------- | --------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------- |
| `as`             | `string`                                                  | `'div'` | The element to render, such as `'ul'` for a list of cards                                |
| `columns`        | `number \| { base?, sm?, md?, lg?, xl?, '2xl'?: number }` | 1       | The number of columns on every screen, or from each breakpoint up                        |
| `fit`            | `boolean`                                                 | `false` | Fits as many columns as the width allows instead; ignores `columns`                      |
| `minColumnWidth` | `string`                                                  | 16rem   | The minimum column width with `fit`, as a CSS length                                     |
| `gap`            | `1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 8 \| 10 \| 12 \| 16 \| 20` | 6       | The space between rows and columns, as a step of the [spacing scale](styling.md#spacing) |

| Slot      | Content          |
| --------- | ---------------- |
| `default` | The grid's items |

No events.

**Hooks:** the root element has the class `nc-grid`, and `nc-grid--fit` with `fit`. The props set the custom properties `--grid-columns`, `--grid-columns-<breakpoint>`, `--grid-min` and `--grid-gap` on it, inline; a prop that is not set leaves its property unset.

**Accessibility:** the grid changes only the layout, never the order: keyboard and screen reader users meet the items in the order of the markup. A `<ul>` grid needs `role="list"`, since the design system removes its bullets and Safari stops announcing a list without them.

## BaseStack

Spaces its children vertically, with no margins on them. The design system's rules are in [`.nc-stack`](styling.md#nc-stack). For running text, such as the HTML of a rich-text field, use [`.nc-flow`](styling.md#nc-flow) instead.

```vue
<BaseStack :gap="{ base: 4, md: 8 }">
  <h2>Section title</h2>
  <p>…</p>
</BaseStack>
```

| Prop  | Type                                                   | Default | Description                                                                                    |
| ----- | ------------------------------------------------------ | ------- | ---------------------------------------------------------------------------------------------- |
| `as`  | `string`                                               | `'div'` | The element to render, such as `'ul'` for a list                                               |
| `gap` | step, or `{ base?, sm?, md?, lg?, xl?, '2xl'?: step }` | 4       | The space between the children, as a step of the [spacing scale](styling.md#spacing) (1 to 20) |

| Slot      | Content               |
| --------- | --------------------- |
| `default` | The children to space |

No events.

**Hooks:** the root element has the class `nc-stack`. `gap` sets `--stack-gap` and `--stack-gap-<breakpoint>` on it, inline.

**Accessibility:** a `<ul>` stack needs `role="list"`, since the design system removes its bullets and Safari stops announcing a list without them.

## BaseCluster

Lays its children out in a row that wraps onto more lines when it runs out of room: tags, buttons, footer links. The design system's rules are in [`.nc-cluster`](styling.md#nc-cluster).

```vue
<BaseCluster as="ul" :gap="2" role="list" aria-label="Tags">
  <li v-for="tag in tags" :key="tag">{{ tag }}</li>
</BaseCluster>

<BaseCluster justify="between">
  <p>© 2026</p>
  <a href="/privacy">Privacy</a>
</BaseCluster>
```

| Prop      | Type                                                   | Default   | Description                                                                                    |
| --------- | ------------------------------------------------------ | --------- | ---------------------------------------------------------------------------------------------- |
| `as`      | `string`                                               | `'div'`   | The element to render, such as `'ul'` for a list of tags                                       |
| `gap`     | step, or `{ base?, sm?, md?, lg?, xl?, '2xl'?: step }` | 3         | The space between the children, as a step of the [spacing scale](styling.md#spacing) (1 to 20) |
| `justify` | `'start' \| 'center' \| 'end' \| 'between'`            | `'start'` | Where the items sit on each line; `between` spreads them to both ends                          |

| Slot      | Content                 |
| --------- | ----------------------- |
| `default` | The children to lay out |

No events.

**Hooks:** the root element has the class `nc-cluster`. `gap` sets `--cluster-gap` and `--cluster-gap-<breakpoint>` on it, and `justify` sets `--cluster-justify`, inline.

**Accessibility:** as for `BaseStack`, a `<ul>` cluster needs `role="list"`.

## BaseButton

A `<button>` that triggers an action: submit a form, open a menu, save. To go to another page, use [`BaseLink`](#baselink) instead.

```vue
<BaseButton type="submit" :loading="sending">Send</BaseButton>

<BaseButton variant="secondary" size="sm" @click="cancel">
  <template #start><BaseIcon><svg>…</svg></BaseIcon></template>
  Cancel
</BaseButton>
```

| Prop      | Type                              | Default     | Description                                                     |
| --------- | --------------------------------- | ----------- | --------------------------------------------------------------- |
| `type`    | `'button' \| 'submit' \| 'reset'` | `'button'`  | The button's type; `button`, so it never submits by accident    |
| `variant` | `'primary' \| 'secondary'`        | `'primary'` | The visual style                                                |
| `size`    | `'sm' \| 'md' \| 'lg'`            | `'md'`      | The size                                                        |
| `loading` | `boolean`                         | `false`     | Blocks clicks and shows a spinner, while the button keeps focus |

| Event   | Payload      | When                                  |
| ------- | ------------ | ------------------------------------- |
| `click` | `MouseEvent` | The user activates it, unless loading |

| Slot      | Content                  |
| --------- | ------------------------ |
| `default` | The label                |
| `start`   | An icon before the label |
| `end`     | An icon after the label  |

**Hooks:** the root `<button>` has the class `nc-button`, `data-variant` (`primary`, `secondary`), `data-size` (`sm`, `md`, `lg`) and `data-loading` while loading. Its parts are `nc-button__label`, `nc-button__start`, `nc-button__end` and `nc-button__spinner`. `disabled` falls through to the button.

**Accessibility:** a real `<button>`, so Tab focuses it and Enter or Space activates it. Its accessible name is the label; a button with only an icon needs an `aria-label`. While loading it has `aria-disabled="true"` rather than `disabled`, so it keeps keyboard focus, and its decorative spinner leaves the name unchanged.

## BaseLink

A link to another page, through [`<NuxtLink>`](https://nuxt.com/docs/api/components/nuxt-link): internal routes load without a full page load. Links to other websites are marked with `data-external`. For an action, use [`BaseButton`](#basebutton) instead.

```vue
<BaseLink to="/about">About us</BaseLink>

<BaseLink
  to="https://nuxt.com"
  new-tab
  new-tab-label="s'ouvre dans un nouvel onglet"
>
  Nuxt
</BaseLink>
```

| Prop          | Type               | Default                | Description                                               |
| ------------- | ------------------ | ---------------------- | --------------------------------------------------------- |
| `to`          | `RouteLocationRaw` | Required               | A path, a full URL or a route object, as `NuxtLink` takes |
| `newTab`      | `boolean`          | `false`                | Opens the link in a new tab                               |
| `newTabLabel` | `string`           | `'opens in a new tab'` | What screen readers hear after a new-tab link's text      |

| Slot      | Content       |
| --------- | ------------- |
| `default` | The link text |

No events.

**Hooks:** the root `<a>` has the class `nc-link`, and `data-external` when `to` is an `http(s)://` or `//` URL. A new-tab link has the part `nc-link__new-tab`, the warning in brackets.

**Accessibility:** a real `<a>`; its text is its accessible name, and must make sense on its own (not "click here"). A new tab is opt-in, since opening one unannounced disorients visitors; `newTab` warns screen readers, and the design system hides the warning visually. `NuxtLink` adds `rel="noopener noreferrer"` to external and new-tab links, so the opened page cannot reach back to yours.

## BaseCard

Groups one piece of content, such as a blog post preview or a team member, with optional media, header, body and footer. With `to`, the whole card is one link.

```vue
<BaseGrid as="ul" :columns="{ md: 3 }" role="list">
  <BaseCard v-for="post in posts" :key="post.id" as="li" :to="post.path">
    <template #media><BaseImage v-bind="post.image" ratio="16 / 9" /></template>
    <template #header><h3>{{ post.title }}</h3></template>
    <p>{{ post.summary }}</p>
  </BaseCard>
</BaseGrid>
```

| Prop | Type               | Default | Description                                                     |
| ---- | ------------------ | ------- | --------------------------------------------------------------- |
| `as` | `string`           | `'div'` | The element to render: `'article'` on its own, `'li'` in a list |
| `to` | `RouteLocationRaw` | None    | Makes the whole card one link, named by the header              |

| Slot      | Content                                  |
| --------- | ---------------------------------------- |
| `media`   | An image or video, shown on top          |
| `header`  | The title, with the page's heading level |
| `default` | The body                                 |
| `footer`  | Actions or details                       |

No events.

**Hooks:** the root element has the class `nc-card`, and `data-linked` with `to`. Its parts are `nc-card__header`, `nc-card__media`, `nc-card__body` and `nc-card__footer`, each only when its slot is used, and `nc-card__link`, the [`BaseLink`](#baselink) around the header of a linked card.

**Accessibility:** the header comes before the media in the markup, so screen readers meet the title first; the design system shows the media on top. The card renders no heading itself: put the heading level that fits the page in the header slot. A linked card's link is its header, so its accessible name is the title, not the whole card; the design system stretches it over the card. A linked card holds no other link or button, except in the footer.

## BaseBadge

A short label beside other content, such as "New", "Draft" or "3 unread", neutral or in a [status colour](styling.md#status-colours). It is not interactive.

```vue
<BaseBadge status="success">In stock</BaseBadge>
```

| Prop     | Type                                                        | Default     | Description |
| -------- | ----------------------------------------------------------- | ----------- | ----------- |
| `status` | `'neutral' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'neutral'` | Its colour  |

| Slot      | Content   |
| --------- | --------- |
| `default` | The label |

No events.

**Hooks:** the root `<span>` has the class `nc-badge` and `data-status` (`neutral`, `success`, `warning`, `danger`, `info`).

**Accessibility:** colour alone carries no meaning, so the text must: "Sold out", not a red dot. A bare number means nothing to a screen reader: write "3 unread", or place the badge beside text that explains it.

## BaseIcon

Sizes an icon to the text around it and handles screen readers. The icon itself is an SVG in the slot: the site's own, or one from any icon library, such as `@nuxt/icon`'s `<Icon>`. Nuxt Core adds no icon dependency.

```vue
<BaseIcon><svg viewBox="0 0 24 24" fill="currentColor">…</svg></BaseIcon>

<BaseIcon label="Next page" flip-rtl><Icon name="mdi:arrow-right" /></BaseIcon>
```

| Prop      | Type      | Default | Description                                                           |
| --------- | --------- | ------- | --------------------------------------------------------------------- |
| `label`   | `string`  | None    | The icon's meaning when no text says it; unset, it is decorative      |
| `flipRtl` | `boolean` | `false` | Mirrors it in right-to-left languages, for icons that point somewhere |

| Slot      | Content          |
| --------- | ---------------- |
| `default` | The icon, an SVG |

No events.

**Hooks:** the root `<span>` has the class `nc-icon`, and `data-flip-rtl` with `flipRtl`. The design system sizes it to `1em` and its `svg` to fill it: draw icons with `fill="currentColor"` or `stroke="currentColor"` so they take the text colour, in both schemes and in forced colours.

**Accessibility:** decorative by default: `aria-hidden="true"`, for an icon beside text that already says it. With `label`, it is `role="img"` named by the label. In a button with only an icon, give the `aria-label` to the button and keep the icon decorative.

## BaseDivider

A line between two pieces of content, horizontal or vertical.

```vue
<BaseDivider />

<BaseCluster>
  <span>Share</span>
  <BaseDivider orientation="vertical" decorative />
  <span>Print</span>
</BaseCluster>
```

| Prop          | Type                         | Default        | Description                                        |
| ------------- | ---------------------------- | -------------- | -------------------------------------------------- |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Its direction                                      |
| `decorative`  | `boolean`                    | `false`        | A line for the eye only, which screen readers skip |

No events, no slots.

**Hooks:** the root has the class `nc-divider` and `data-orientation` (`horizontal`, `vertical`). It has no margins: its spacing comes from its parent, such as a stack or a cluster.

**Accessibility:** an `<hr>`, which screen readers announce as a separator, with `aria-orientation="vertical"` when vertical. Use it for a change of topic. With `decorative`, it is a `<div>` with `aria-hidden="true"`.

## BaseAvatar

A person's picture in a circle, with their initials when there is no picture or it fails to load.

```vue
<BaseAvatar name="Ada Lovelace" src="/team/ada.jpg" size="lg" />
```

| Prop         | Type                   | Default  | Description                                                      |
| ------------ | ---------------------- | -------- | ---------------------------------------------------------------- |
| `name`       | `string`               | Required | The person's name: the accessible name and the initials          |
| `src`        | `string`               | None     | The picture's URL                                                |
| `size`       | `'sm' \| 'md' \| 'lg'` | `'md'`   | The size                                                         |
| `decorative` | `boolean`              | `false`  | Hides it from screen readers, when the name is written beside it |

No events, no slots.

**Hooks:** the root `<span>` has the class `nc-avatar` and `data-size` (`sm`, `md`, `lg`). It holds either `nc-avatar__image`, the `<img>`, or `nc-avatar__initials`.

**Accessibility:** the root is `role="img"`, named by `name`, whether it shows the picture or the initials, so screen readers always hear the name, never "AL". With `decorative`, as in a byline that already shows the name, it is hidden from them.

## BaseSpinner

Shows that something is loading. Screen readers announce it, and it stops spinning for visitors who ask for reduced motion. It sizes itself to the text around it.

```vue
<BaseSpinner v-if="pending" label="Chargement des articles" />
```

| Prop         | Type      | Default     | Description                                                       |
| ------------ | --------- | ----------- | ----------------------------------------------------------------- |
| `label`      | `string`  | `'Loading'` | What screen readers announce, for the site's language             |
| `decorative` | `boolean` | `false`     | Hides it from screen readers, when something else says it is busy |

No events, no slots.

**Hooks:** the root `<span>` has the class `nc-spinner`. Its parts are `nc-spinner__circle`, the ring, and `nc-spinner__label`, which the design system hides visually. Its turn lasts [`--duration-spin`](styling.md#radius-shadows-and-motion).

**Accessibility:** `role="status"`, a polite live region that reads its label. Some screen readers skip a live region that appears already filled, so render the spinner where the content will appear and replace it when the content is ready. [`BaseButton`](#basebutton) uses it with `decorative`.

## BaseAlert

A message in a [status colour](styling.md#status-colours) that stays in the page: opening hours, a sent form, form errors. Messages that float and disappear are the notifications of [roadmap phase 6](../ROADMAP.md#phase-6--interactive-components).

```vue
<BaseAlert v-if="sent" status="success" announce>
  <template #title>Message sent</template>
  We will reply within two days.
</BaseAlert>
```

| Prop       | Type                                           | Default  | Description                                         |
| ---------- | ---------------------------------------------- | -------- | --------------------------------------------------- |
| `status`   | `'info' \| 'success' \| 'warning' \| 'danger'` | `'info'` | Its colour                                          |
| `announce` | `boolean`                                      | `false`  | Reads it out as soon as it appears (`role="alert"`) |

| Slot      | Content            |
| --------- | ------------------ |
| `title`   | A short first line |
| `default` | The message        |

No events.

**Hooks:** the root `<div>` has the class `nc-alert` and `data-status` (`info`, `success`, `warning`, `danger`). Its parts are `nc-alert__title`, only with the title slot, and `nc-alert__body`.

**Accessibility:** use `announce` for a message that appears after something the visitor did, such as a submitted form: `role="alert"` interrupts the screen reader to read it. A message that is part of the page from the start needs no `announce`, or it would be read out on every page load. Colour alone carries no meaning: the title or the text must say what kind of message it is. The title is not a heading; put one in the slot if the page needs it.

## BaseImage

An image that reserves its space before it loads, so the page does not shift, loads lazily, and can be cropped to a fixed ratio. It renders an `<img>`, or the component given in `as`, such as `@nuxt/image`'s `<NuxtImg>`. Nuxt Core does not depend on `@nuxt/image`.

```vue
<BaseImage
  src="/team.jpg"
  alt="The team at the office"
  width="1200"
  height="800"
  ratio="16 / 9"
/>
```

With [`@nuxt/image`](https://image.nuxt.com/) installed in the site, import `NuxtImg` from `#components` in the page's script and pass it:

```vue
<BaseImage
  :as="NuxtImg"
  src="/team.jpg"
  alt="The team"
  width="1200"
  height="800"
  format="webp"
/>
```

| Prop       | Type                   | Default   | Description                                                    |
| ---------- | ---------------------- | --------- | -------------------------------------------------------------- |
| `src`      | `string`               | Required  | The image's URL                                                |
| `alt`      | `string`               | Required  | What it shows, or `''` when it is decoration                   |
| `width`    | `number \| string`     | Required  | Its real width in pixels                                       |
| `height`   | `number \| string`     | Required  | Its real height in pixels; with `width`, it reserves the space |
| `ratio`    | `string`               | None      | Crops it to this shape, as CSS writes it: `'16 / 9'`           |
| `fit`      | `'cover' \| 'contain'` | `'cover'` | With `ratio`: fills and crops, or fits inside                  |
| `priority` | `boolean`              | `false`   | For the image at the top of a page: loads at once and first    |
| `as`       | `string \| Component`  | `'img'`   | The element or component to render                             |

No events, no slots. `srcset`, `sizes` and the props of the component in `as` fall through.

**Hooks:** the root has the class `nc-image`. With `ratio`, it has `data-fit` (`cover`, `contain`) and the custom property `--image-ratio`, inline.

**Accessibility:** `alt` is required, so it is never forgotten: describe what the image shows, or pass `''` for an image that is only decoration.

## FormSwitch

An on/off control that applies at once, such as dark mode. For a choice submitted with a form, use a checkbox instead (roadmap phase 5).

```vue
<FormSwitch v-model="isDark">Dark mode</FormSwitch>
```

| Prop         | Type      | Default | Description                            |
| ------------ | --------- | ------- | -------------------------------------- |
| `modelValue` | `boolean` | `false` | Whether it is on; bound with `v-model` |

| Event               | Payload   | When                        |
| ------------------- | --------- | --------------------------- |
| `update:modelValue` | `boolean` | The user turns it on or off |

| Slot      | Content                      |
| --------- | ---------------------------- |
| `default` | The visible label (optional) |

**Hooks:** the root `<button>` has the class `nc-switch` and `aria-checked` (`true`, `false`); its parts are `nc-switch__track`, `nc-switch__thumb` and `nc-switch__label`. `disabled` falls through to the button.

**Accessibility:** a `<button role="switch">`, so Tab focuses it, Space or Enter toggles it, and screen readers announce it as on or off. Its accessible name is the slot; without one, give it an `aria-label`. The track is hidden from assistive technology.

## Layouts

The primitives layer has two [layouts](https://nuxt.com/docs/guide/directory-structure/app/layouts), in `layers/primitives/app/layouts/`. A site uses them by rendering `<NuxtLayout>` in its `app.vue`. `default` wraps every page; a page picks `auth` with `definePageMeta({ layout: 'auth' })`. The design system's rules are in [Page layouts](styling.md#page-layouts).

```vue
<!-- app.vue -->
<template>
  <NuxtLayout sticky-header skip-link-label="Aller au contenu">
    <template #header>
      <BaseContainer>…logo and navigation…</BaseContainer>
    </template>

    <NuxtPage />

    <template #footer>
      <BaseContainer>…</BaseContainer>
    </template>
  </NuxtLayout>
</template>
```

| Layout    | For                                                                       |
| --------- | ------------------------------------------------------------------------- |
| `default` | Every page: a header, the page, and a footer at the bottom of short pages |
| `auth`    | Sign-in and sign-up pages: one narrow column, centred in the window       |

Both take the same props and slots, except `stickyHeader`, which only `default` has. `<NuxtLayout>` passes its attributes to the layout as props.

| Prop            | Type      | Default             | Description                                                |
| --------------- | --------- | ------------------- | ---------------------------------------------------------- |
| `skipLinkLabel` | `string`  | `'Skip to content'` | The skip link's text, for the site's language              |
| `stickyHeader`  | `boolean` | `false`             | Keeps the header at the top of the window (`default` only) |

| Slot      | Content                                              |
| --------- | ---------------------------------------------------- |
| `header`  | The site header, such as the logo and the navigation |
| `default` | The page                                             |
| `footer`  | The site footer                                      |

**Hooks:** the root `<div>` has the class `nc-layout`, with `nc-layout--auth` in the auth layout and `data-sticky-header` with `stickyHeader`. Its parts are `nc-layout__header`, `nc-layout__main` and `nc-layout__footer`, and the skip link has the class `nc-skip-link`.

**Accessibility:** the layout provides the page's landmarks, so the slots must not add their own. It renders the header slot in a `<header>` and the footer slot in a `<footer>`, which screen readers announce as the banner and the content information; each one only when its slot is used. The page goes in `<main id="content">`. A skip link to it comes first on the page: hidden until a keyboard user tabs to it, it lets them jump past the header straight to the content.

## Documenting a component

When a component moves from stub to ready, add a section with this structure, and change its status in the inventory:

````markdown
## BaseExample

One or two sentences: what it is for, and when to use something else instead.

```vue
<BaseExample variant="primary">Save</BaseExample>
```

| Prop      | Type                       | Default     | Description      |
| --------- | -------------------------- | ----------- | ---------------- |
| `variant` | `'primary' \| 'secondary'` | `'primary'` | The visual style |

| Event   | Payload      | When                  |
| ------- | ------------ | --------------------- |
| `click` | `MouseEvent` | The user activates it |

| Slot      | Content   |
| --------- | --------- |
| `default` | The label |

**Hooks:** the root class (`nc-example`), the class of each part (`nc-example__icon`), and each `data-*` attribute with its values (`data-variant`: `primary`, `secondary`).

**Accessibility:** the keyboard interaction, the accessible name, and any ARIA it sets.
````

Omit the props, events or slots table when the component has none, and say so in one line.
