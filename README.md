# Nuxt Core

[![CI](https://github.com/modulane/nuxt-core/actions/workflows/release.yml/badge.svg?branch=main)](https://github.com/modulane/nuxt-core/actions/workflows/release.yml)

A reusable foundation for building modern websites with Nuxt.

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
- [Quick start](#quick-start)
- [Documentation](#documentation)
- [Principles](#principles)
- [Contributing](#contributing)
- [License](#license)

## Status

Nuxt Core is in early development. The project foundation is in place; the styling foundation and layout system are in progress, and components come next. The [roadmap](ROADMAP.md) shows every phase and what is done.

## Technology

- [Nuxt](https://nuxt.com/) 4 and [Vue](https://vuejs.org/) 3
- [TypeScript](https://www.typescriptlang.org/), in strict mode
- [Sass](https://sass-lang.com/) (SCSS) and CSS custom properties
- [Vitest](https://vitest.dev/)

The UI is built from scratch with SCSS rather than on a component library. This gives the project full control over its visual identity and lets the design system evolve on its own terms.

## Quick start

Requirements: Node.js 22.22.3, 24.15, or 26 and later, and [Corepack](https://github.com/nodejs/corepack) (included with Node.js 24 and earlier).

```bash
git clone https://github.com/modulane/nuxt-core.git
cd nuxt-core
corepack enable
yarn install
yarn dev
```

The development server runs at <http://localhost:3000>. [Getting started](docs/getting-started.md) lists every command and how to fix common setup problems.

## Documentation

| Guide                                      | Covers                                        |
| ------------------------------------------ | --------------------------------------------- |
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

Bug reports and feature ideas are welcome in the [issue tracker](https://github.com/modulane/nuxt-core/issues). [CONTRIBUTING.md](CONTRIBUTING.md) describes the workflow, labels and release process.

## License

License information will be added when the project is ready for public distribution.
