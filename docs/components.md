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
| `<BaseButton>`          | `layers/primitives/app/components/base/Button.vue`          | Stub   | Buttons (roadmap phase 4)        |
| `<BaseCard>`            | `layers/primitives/app/components/base/Card.vue`            | Stub   | Cards (roadmap phase 4)          |
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
