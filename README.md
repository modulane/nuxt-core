# Nuxt Core

[![CI](https://github.com/modulane/nuxt-core/actions/workflows/release.yml/badge.svg?branch=main)](https://github.com/modulane/nuxt-core/actions/workflows/release.yml)

A reusable foundation for building modern websites with Nuxt.

Nuxt Core is a personal, reusable web development foundation designed to make the creation of new websites faster, more consistent, and easier to maintain.

The project provides reusable UI components, styling foundations, layouts, website sections, themes, and eventually complete website templates.

The goal is simple:

> **Build once, reuse everywhere.**

## Contents

- [Why Nuxt Core?](#why-nuxt-core)
- [Goals](#goals)
- [Technology](#technology)
- [Getting started](#getting-started)
- [Development principles](#development-principles)
- [Project status](#project-status)
- [Contributing](#contributing)
- [License](#license)

## Why Nuxt Core?

Creating a new website often means solving the same problems again and again:

- buttons
- forms
- navigation
- responsive layouts
- typography
- colors
- spacing
- accessibility
- animations
- SEO
- common website sections

Nuxt Core aims to turn these recurring tasks into reusable building blocks.

Instead of starting every project from scratch, a new website can be built by combining components and sections that have already been developed and tested.

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

## Goals

Nuxt Core aims to provide:

- A consistent development environment
- A reusable component library
- A flexible styling system
- Responsive and accessible components
- Reusable website sections
- Customizable visual themes
- Ready-to-use website templates
- A faster workflow for future projects

The project is designed to grow over time. New components and features should be added when they solve a recurring problem or provide meaningful value to future projects.

## Technology

Nuxt Core is built around:

- [Nuxt](https://nuxt.com/) 4
- [Vue](https://vuejs.org/) 3
- [TypeScript](https://www.typescriptlang.org/), in strict mode
- [Sass](https://sass-lang.com/) (SCSS)
- [Vitest](https://vitest.dev/)

The UI is intentionally built from scratch with SCSS rather than relying on an external component library. This gives the project full control over its visual identity and allows the design system to evolve independently.

## Getting started

Requirements: Node.js 22.22.3, 24.15 or 26 and later (the versions Nuxt supports), and Yarn, provided by [Corepack](https://github.com/nodejs/corepack).

```bash
git clone https://github.com/modulane/nuxt-core.git
cd nuxt-core
corepack enable
yarn install
yarn dev
```

The development server runs at <http://localhost:3000>.

| Command          | Purpose                                       |
| ---------------- | --------------------------------------------- |
| `yarn dev`       | Start the development server                  |
| `yarn build`     | Build for production                          |
| `yarn preview`   | Preview the production build locally          |
| `yarn test`      | Run the test suite                            |
| `yarn typecheck` | Type-check the project                        |
| `yarn format`    | Format every file with Prettier               |
| `yarn check`     | Check formatting, types and tests, as CI does |

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full development setup.

## Development principles

Nuxt Core follows a few simple principles.

- **Reusability:** a component should be reusable across multiple projects.
- **Simplicity:** components should solve a problem without introducing unnecessary complexity.
- **Accessibility:** reusable components should be usable by as many people as possible, including users navigating with a keyboard or assistive technology.
- **Responsive by default:** components should work well across different screen sizes.
- **Consistency:** similar problems should have similar solutions.
- **No unnecessary dependencies:** external dependencies should only be introduced when they provide significant value.
- **Build for real needs:** Nuxt Core should grow from real development needs rather than trying to predict every possible future requirement.

## Project status

Nuxt Core is currently under active development. The [roadmap](ROADMAP.md) describes the planned phases, from the project foundation to a project generator.

## Contributing

Bug reports and feature ideas are welcome in the [issue tracker](https://github.com/modulane/nuxt-core/issues). See [CONTRIBUTING.md](CONTRIBUTING.md) for the development setup, workflow, labels and release process.

## License

License information will be added when the project is ready for public distribution.
