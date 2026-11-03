# Nuxt Core

[![CI](https://github.com/modulane/nuxt-core/actions/workflows/release.yml/badge.svg?branch=main)](https://github.com/modulane/nuxt-core/actions/workflows/release.yml)

A reusable foundation for building modern websites with Nuxt, delivered as [Nuxt layers](https://nuxt.com/docs/guide/going-further/layers): accessible unstyled primitives, a design system, or both.

> **Build once, reuse everywhere.**

Every new website solves the same problems again: buttons, forms, navigation, responsive layouts, typography, colours, spacing, accessibility, animations, SEO, common sections. Nuxt Core turns them into building blocks that are developed and tested once, then combined into new sites.

```text
Nuxt Core
    │
    ├── UI components
    ├── Layouts
    ├── Website sections
    ├── Features
    ├── Themes
    └── Templates
             │
             ▼
       New website
```

## Contents

- [Status](#status)
- [Technology](#technology)
- [Usage](#usage)
- [Development](#development)
- [Documentation](#documentation)
- [Principles](#principles)
- [Contributing](#contributing)
- [License](#license)

## Status

Nuxt Core is in early development, before 1.0.0. The project foundation, styling foundation, layout system and core UI components are done; forms come next. The [roadmap](ROADMAP.md) shows every phase and what is done.

## Technology

- [Nuxt](https://nuxt.com/) 4 and [Vue](https://vuejs.org/) 3
- [TypeScript](https://www.typescriptlang.org/), in strict mode
- [Sass](https://sass-lang.com/) (SCSS) and CSS custom properties
- [Vitest](https://vitest.dev/)

The UI is built from scratch rather than on a component library. The primitives carry the behaviour and accessibility; the design system, in SCSS, carries the look. They meet only through documented class and `data-*` hooks, so either can be replaced.

## Usage

Nuxt Core comes in independent parts. A site picks what it needs:

| Part       | `extends`                        | For                                                                                   |
| ---------- | -------------------------------- | ------------------------------------------------------------------------------------- |
| Everything | `@modulane/nuxt-core`            | The components, styled by the design system                                           |
| Primitives | `@modulane/nuxt-core/primitives` | Accessible, unstyled components to style with your own CSS, Tailwind or anything else |
| Design     | `@modulane/nuxt-core/design`     | The design tokens and styles, with your own or another library's components           |

A site installs a release from GitHub and extends a part:

```bash
yarn add @modulane/nuxt-core@github:modulane/nuxt-core#v0.9.0
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  extends: ['@modulane/nuxt-core'],
})
```

The site can override any style with plain CSS, and any component, composable or layout with a file of the same name. [Using Nuxt Core](docs/usage.md) covers npm and pnpm, styling the primitives, using the design system with other components, and overrides.

## Development

Requirements: Node.js 22.22.3, 24.15, or 26 and later, and [Corepack](https://github.com/nodejs/corepack) (included with Node.js 24 and earlier).

```bash
git clone https://github.com/modulane/nuxt-core.git
cd nuxt-core
corepack enable
yarn install
yarn dev
```

`yarn dev` runs the playground, a development app that extends the layer as a site does, at <http://localhost:3000>. [Getting started](docs/getting-started.md) lists every command and how to fix common setup problems.

## Documentation

| Guide                                      | Covers                                        |
| ------------------------------------------ | --------------------------------------------- |
| [Using Nuxt Core](docs/usage.md)           | Installing the parts, styling, overriding     |
| [Getting started](docs/getting-started.md) | Requirements, installation, commands          |
| [Architecture](docs/architecture.md)       | Folder structure and configuration files      |
| [Conventions](docs/conventions.md)         | Coding rules applied in review                |
| [Styling](docs/styling.md)                 | SCSS architecture, design tokens, breakpoints |
| [Components](docs/components.md)           | Every component and its API                   |
| [Composables](docs/composables.md)         | Every composable and its API                  |
| [Testing](docs/testing.md)                 | Running and writing tests                     |
| [Theming](docs/theming.md)                 | How themes will work                          |

The [documentation index](docs/README.md) explains how the guides are kept up to date.

## Principles

- **Reusable:** a component earns its place by serving several projects.
- **Simple:** solve the problem without unnecessary complexity.
- **Accessible:** usable with a keyboard and assistive technology.
- **Responsive by default:** works on every screen size.
- **Consistent:** similar problems get similar solutions.
- **Few dependencies:** add one only when it brings significant value.
- **Built for real needs:** grow from actual projects, not predictions.

## Contributing

Bug reports, feature ideas and pull requests are welcome. Issues labelled [`good first issue`](https://github.com/modulane/nuxt-core/labels/good%20first%20issue) and [`help wanted`](https://github.com/modulane/nuxt-core/labels/help%20wanted) are ready to pick up. [CONTRIBUTING.md](CONTRIBUTING.md) describes how to claim one, the workflow, labels and release process.

## License

[MIT](LICENSE)
