# Conventions

The rules code review applies. When a rule changes, change it here in the same pull request.

## Formatting

[Prettier](https://prettier.io/) formats every file, with the rules in [`.prettierrc.json`](../.prettierrc.json): no semicolons, single quotes, trailing commas. Run `yarn format` before committing, or let the editor format on save. CI fails on unformatted files.

## TypeScript

- TypeScript runs in strict mode. Prefer explicit types on exported functions and props.
- Avoid `any`. When a type is truly unknown, use `unknown` and narrow it.
- Use `interface` for object shapes that may be extended, and `type` for unions, compositions and utility types.
- Put a type in `shared/types/` only when both `app/` and `server/` use it; otherwise keep it next to its code.

## Vue

- Use the Composition API with `<script setup lang="ts">`.
- Order blocks as `<template>`, `<script setup lang="ts">`, `<style lang="scss">`.
- Declare props and emits with types: `defineProps<{ … }>()` and `defineEmits<{ … }>()`.
- Give each component one clear responsibility. Prefer small components that compose over large ones that handle unrelated concerns.

## Naming

| What                  | Rule                                               | Example                                   |
| --------------------- | -------------------------------------------------- | ----------------------------------------- |
| Folders               | Lowercase                                          | `components/form/`                        |
| Component files       | PascalCase; the folder becomes a prefix            | `form/Input.vue` is used as `<FormInput>` |
| Composables           | `use` + PascalCase, exported under the file's name | `useTheme.ts` exports `useTheme`          |
| SCSS partials         | Leading underscore, kebab-case                     | `_container.scss`                         |
| CSS custom properties | `--category-name`                                  | `--color-primary`, `--space-4`            |
| CSS classes           | Meaningful, kebab-case                             | `.container`                              |

## Imports

- Do not import what Nuxt auto-imports: components, composables, Vue APIs (`ref`, `computed`) and Nuxt APIs (`useRoute`, `defineEventHandler`).
- Import everything else explicitly. In the layer, use the `#layers/nuxt-core/` alias or a relative path, never `~/`: in a site, `~/` points to the site's own `app/`, not to the layer.

## SCSS

- Design values come from the CSS custom properties in [styling.md](styling.md#design-tokens). Do not hard-code colours, spacing or font sizes.
- Use Sass for mixins, functions and organisation, with `@use`; `@import` is deprecated.
- Write mobile-first: base styles for small screens, `respond-to()` for larger ones.
- Keep nesting shallow, and avoid deeply nested selectors and `!important`.

## Accessibility

Accessibility is part of a component, not an extra:

- Use semantic HTML first (`<button>`, `<nav>`, `<label>`), ARIA only when HTML cannot express it.
- Everything usable with a mouse is usable with a keyboard, with a visible focus indicator.
- Every control has an accessible name.
- Text meets WCAG AA contrast against its background.

## Abstractions and dependencies

- Add something to Nuxt Core only when it is reusable across several projects. Code specific to one website stays in that website.
- Do not build for hypothetical needs. Three similar lines are better than a premature abstraction.
- Add a dependency only when Nuxt, Vue, TypeScript and the existing tooling cannot reasonably do the job.
