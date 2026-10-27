# Components

Every component, and how to document a new one.

The components are the [primitives layer](architecture.md#the-parts), `@modulane/nuxt-core/primitives`: they provide markup, behaviour and accessibility, and no CSS. Each one exposes [styling hooks](architecture.md#the-styling-hooks), listed in its section. The design system styles those hooks; a site that uses only the primitives styles them itself, as [usage.md](usage.md#primitives-with-your-own-styling) shows.

## Inventory

Nuxt registers components with their folder as a prefix, so the name to use in templates is the one in the first column.

| Component               | File                                                        | Status | Purpose                          |
| ----------------------- | ----------------------------------------------------------- | ------ | -------------------------------- |
| `<BaseContainer>`       | `layers/primitives/app/components/base/Container.vue`       | Ready  | Centres content, limits width    |
| `<BaseButton>`          | `layers/primitives/app/components/base/Button.vue`          | Stub   | Buttons (roadmap phase 4)        |
| `<BaseCard>`            | `layers/primitives/app/components/base/Card.vue`            | Stub   | Cards (roadmap phase 4)          |
| `<FormInput>`           | `layers/primitives/app/components/form/Input.vue`           | Stub   | Text inputs (roadmap phase 5)    |
| `<FormTextarea>`        | `layers/primitives/app/components/form/Textarea.vue`        | Stub   | Multi-line text inputs (phase 5) |
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
