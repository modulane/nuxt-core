# Components

Every component in `app/components/`, and how to document a new one.

## Inventory

Nuxt registers components with their folder as a prefix, so the name to use in templates is the one in the first column.

| Component               | File                                      | Status | Purpose                          |
| ----------------------- | ----------------------------------------- | ------ | -------------------------------- |
| `<BaseContainer>`       | `app/components/base/Container.vue`       | Ready  | Wraps content in a `.container`  |
| `<BaseButton>`          | `app/components/base/Button.vue`          | Stub   | Buttons (roadmap phase 4)        |
| `<BaseCard>`            | `app/components/base/Card.vue`            | Stub   | Cards (roadmap phase 4)          |
| `<FormInput>`           | `app/components/form/Input.vue`           | Stub   | Text inputs (roadmap phase 5)    |
| `<FormTextarea>`        | `app/components/form/Textarea.vue`        | Stub   | Multi-line text inputs (phase 5) |
| `<NavigationAppHeader>` | `app/components/navigation/AppHeader.vue` | Stub   | Site header (roadmap phase 7)    |
| `<NavigationAppFooter>` | `app/components/navigation/AppFooter.vue` | Stub   | Site footer (roadmap phase 7)    |

**Ready** components have an API documented below. **Stubs** are placeholders that reserve the structure: they render an empty `<div>` and must not be used yet.

## BaseContainer

Centres its content and limits its width. See [`.container`](styling.md#container) for the exact rules.

```vue
<BaseContainer>
  <h1>Page title</h1>
</BaseContainer>
```

| Slot      | Content               |
| --------- | --------------------- |
| `default` | The content to centre |

No props, no events.

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

**Accessibility:** the keyboard interaction, the accessible name, and any ARIA it sets.
````

Omit the props, events or slots table when the component has none, and say so in one line.
