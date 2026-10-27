# Roadmap

How Nuxt Core grows from a project foundation to a project generator. Each phase builds on the previous ones.

Nuxt Core is a set of [Nuxt layers](https://nuxt.com/docs/guide/going-further/layers) in one package: a site installs it once and extends the parts it wants. Every phase keeps that promise. What a phase adds lands in a part, reaches sites through `extends`, is opt-in where it has a cost, and is overridable by the site.

| Part                                                  | Entry point                                | Phases                             |
| ----------------------------------------------------- | ------------------------------------------ | ---------------------------------- |
| Primitives: behaviour, markup, accessibility, no CSS  | `@modulane/nuxt-core/primitives`           | 3 (structure), 4 to 7              |
| Design: tokens, global styles, the primitives' styles | `@modulane/nuxt-core/design`               | 2, 3 (styles), 4 to 7 (styles), 10 |
| Everything: primitives styled by the design system    | `@modulane/nuxt-core`                      | All of the above                   |
| Sections, features, templates                         | One entry point each, added by their phase | 11 to 13                           |

The parts never import from each other; they meet only through the [styling hooks](docs/architecture.md#the-styling-hooks). Every component is therefore built twice over: once as a primitive, once as styles for its hooks.

The roadmap is a direction, not a schedule: phases may be added, removed or reorganised as real projects reveal new needs. It plans the work; the [documentation](docs/README.md) describes what already exists.

## Overview

| Phase                                                                 | Status         | Highlights                                          |
| --------------------------------------------------------------------- | -------------- | --------------------------------------------------- |
| [1. Project Foundation](#phase-1--project-foundation)                 | ✅ Done        | Layers, TypeScript, SCSS, tests, workflow, docs     |
| [2. Styling Foundation](#phase-2--styling-foundation)                 | 🟡 In progress | Design tokens done; reset and base typography to go |
| [3. Layout System](#phase-3--layout-system)                           | 🟡 In progress | Container done; grid and spacing to go              |
| [4. Core UI Components](#phase-4--core-ui-components)                 | ⬜ Planned     | Buttons, links, cards, badges, icons                |
| [5. Forms](#phase-5--forms)                                           | ⬜ Planned     | Inputs, selects, checkboxes, validation             |
| [6. Interactive Components](#phase-6--interactive-components)         | ⬜ Planned     | Modals, menus, tooltips, tabs, notifications        |
| [7. Navigation](#phase-7--navigation)                                 | ⬜ Planned     | Header, menus, footer, breadcrumbs                  |
| [8. Documentation & Showcase](#phase-8--documentation--showcase)      | ⬜ Planned     | A live gallery of every component                   |
| [9. Testing](#phase-9--testing)                                       | ⬜ Planned     | Component tests for everything reused               |
| [10. Themes](#phase-10--themes)                                       | ⬜ Planned     | Swappable visual identities                         |
| [11. Website Sections](#phase-11--website-sections)                   | ⬜ Planned     | Heroes, features, testimonials, pricing             |
| [12. Reusable Website Features](#phase-12--reusable-website-features) | ⬜ Planned     | SEO, contact forms, analytics, consent              |
| [13. Website Templates](#phase-13--website-templates)                 | ⬜ Planned     | Complete starting points per type of site           |
| [14. Project Generator](#phase-14--project-generator)                 | ⬜ Planned     | A new site from a few choices                       |

A phase is **done** when every item is ticked and its "Done when" condition holds. Work on a later phase can start early when it unblocks something.

---

## Phase 1 — Project Foundation

**Goal:** a clean and reliable starting point.

- [x] Nuxt 4 project structure ([architecture](docs/architecture.md))
- [x] Packaged as independent layers (primitives, design, both), with a playground that extends them as a site does ([architecture](docs/architecture.md), [usage](docs/usage.md))
- [x] Design styles in cascade layers, so any site CSS overrides them
- [x] TypeScript in strict mode, type-checked in CI
- [x] SCSS integration with a global stylesheet ([styling](docs/styling.md))
- [x] Vitest test runner ([testing](docs/testing.md))
- [x] Project conventions ([conventions](docs/conventions.md))
- [x] Git workflow: pull requests, CI, labels and automated releases ([CONTRIBUTING](CONTRIBUTING.md))
- [x] Documentation system ([docs](docs/README.md))

**Done when:** a new contributor can clone, install and pass `yarn check` by following the documentation alone, and a new site can install and extend the layer by following [usage.md](docs/usage.md).

---

## Phase 2 — Styling Foundation

**Goal:** the visual rules every component shares.

- [x] Colour tokens
- [x] Spacing scale
- [x] Font families and type scale
- [x] Border radius
- [x] Shadows
- [x] Motion durations and easing
- [x] Responsive breakpoints and the `respond-to()` mixin
- [ ] CSS reset
- [ ] Base typography: headings, paragraphs, links, lists

**Done when:** a bare HTML page with no component styles looks consistent across browsers, and every value comes from a token.

---

## Phase 3 — Layout System

**Goal:** responsive page layouts without custom CSS.

```text
Page
└── Container
    └── Grid
        ├── Content
        └── Content
```

- [x] Centred, width-limited container (`.nc-container`, `<BaseContainer>`)
- [ ] Grid and columns
- [ ] Spacing utilities (stacks, gaps)
- [ ] Responsive behaviour for each of the above

**Done when:** a typical page layout (header, content columns, footer) can be built from layout tools alone, and adapts from phone to desktop.

---

## Phase 4 — Core UI Components

**Goal:** the basic components almost every website uses.

- [ ] Button
- [ ] Link
- [ ] Card
- [ ] Badge
- [ ] Icon
- [ ] Divider
- [ ] Avatar
- [ ] Loading indicator

**Done when:** each component supports the states that apply to it (default, hover, focus, disabled, loading, error), exposes them as hooks, is styled by the design system, is documented in [components.md](docs/components.md) and has tests. Each one works, accessibly, with the design system removed.

---

## Phase 5 — Forms

**Goal:** common forms that are quick to build and accessible.

- [ ] Text input
- [ ] Textarea
- [ ] Select
- [ ] Checkbox
- [ ] Radio button
- [ ] Switch
- [ ] Form field: label, hint and error message around any control
- [ ] Validation

**Done when:** a contact form can be built from these components, works with the keyboard and announces errors to screen readers.

---

## Phase 6 — Interactive Components

**Goal:** common interactions with their accessibility details handled.

- [ ] Modal
- [ ] Dropdown menu
- [ ] Tooltip
- [ ] Popover
- [ ] Accordion
- [ ] Tabs
- [ ] Drawer
- [ ] Notifications

**Done when:** each component manages focus correctly, closes with Escape where expected, and follows the matching [WAI-ARIA pattern](https://www.w3.org/WAI/ARIA/apg/patterns/).

---

## Phase 7 — Navigation

**Goal:** the navigation every website needs.

- [ ] Header
- [ ] Navigation menu
- [ ] Mobile navigation
- [ ] Footer
- [ ] Breadcrumbs
- [ ] Pagination

**Done when:** a multi-page site can be navigated on phone and desktop, with the keyboard alone.

---

## Phase 8 — Documentation & Showcase

**Goal:** every component easy to discover and understand.

- [ ] A showcase page per component: variants, states and usage examples. The showcase lives in the playground, not the layer, so it adds no routes to sites
- [ ] The props, events and slots of each component, generated or kept in sync with [components.md](docs/components.md)

**Done when:** the showcase serves as the visual reference while building a new website.

---

## Phase 9 — Testing

**Goal:** reliable components. Protect what many projects reuse, rather than cover every line.

- [ ] Component testing environment (`nuxt` environment, DOM implementation)
- [ ] Tests for rendering, props and states
- [ ] Tests for mouse and keyboard interaction
- [ ] Automated accessibility checks

- [ ] A CI job that installs the packed package in a fresh site and builds it with each entry point

**Done when:** every component from phases 4 to 7 has tests, CI runs them on every pull request, and CI proves a site can install and build with each part.

---

## Phase 10 — Themes

**Goal:** the same components with completely different visual identities.

```text
                    Same components
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
          Modern        Elegant       Corporate
```

- [ ] Theme selection mechanism, set by the site in its `app.config.ts` ([theming](docs/theming.md) lists the open questions)
- [x] Dark mode, the default colour scheme, with a light scheme beside it ([styling](docs/styling.md#colour-schemes))
- [ ] `useTheme()` composable
- [ ] Three example themes

**Done when:** switching theme changes colours, typography, radius, shadows and spacing without changing a single component. Themes are part of the design layer.

---

## Phase 11 — Website Sections

**Goal:** complete reusable sections, so pages are assembled rather than built.

Sections become their own part, built from the primitives and styled by the design system like the components, so a site can take them unstyled too.

- [ ] Hero: centred, split, image, video
- [ ] Features: grid, list, alternating
- [ ] About: introduction, image and text, statistics
- [ ] Testimonials: grid, carousel, single
- [ ] Pricing
- [ ] Call to action
- [ ] Contact
- [ ] Gallery
- [ ] FAQ

**Done when:** a typical landing page can be assembled from sections only.

---

## Phase 12 — Reusable Website Features

**Goal:** functionality that keeps coming back in client websites. Only features that serve several projects belong here.

Every site receives the layer whole, so each feature is **off by default** and a site turns it on in its configuration: a disabled feature registers no server route and loads no code. Features that need heavy dependencies (blog, authentication, booking, search) ship as separate optional layers that a site adds to `extends`, so sites that do not use them do not install them.

- [ ] SEO helpers
- [ ] Contact form, with its server route
- [ ] Newsletter form
- [ ] Analytics
- [ ] Cookie consent
- [ ] Blog
- [ ] Search
- [ ] Authentication
- [ ] Booking

**Done when:** each feature can be enabled in a new site with configuration, not code.

---

## Phase 13 — Website Templates

**Goal:** complete starting points for common kinds of websites, combining components, sections, features and themes.

A template is a starter project that already extends Nuxt Core, with the theme, features, pages and placeholder content of its kind. Starting a site copies the template, so the site owns its pages while still receiving Nuxt Core updates.

- [ ] Business website
- [ ] Freelancer portfolio
- [ ] Restaurant
- [ ] Agency
- [ ] SaaS website
- [ ] Personal portfolio
- [ ] Landing page
- [ ] E-commerce website

**Done when:** a new site of each kind starts from its template with only content left to write.

---

## Phase 14 — Project Generator

**Goal:** a new website from a few choices.

```text
Project
├── Template
├── Theme
├── Features
├── Language
└── Configuration
```

- [ ] Generator that asks for each choice, run as a single command
- [ ] Generated project ready to develop: it starts from a template and extends Nuxt Core at the latest release

**Done when:** a new Nuxt Core website is running in minutes.
