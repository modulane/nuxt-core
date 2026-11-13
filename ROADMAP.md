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

| Phase                                                                 | Status     | Highlights                                      |
| --------------------------------------------------------------------- | ---------- | ----------------------------------------------- |
| [1. Project Foundation](#phase-1--project-foundation)                 | ✅ Done    | Layers, TypeScript, SCSS, tests, workflow, docs |
| [2. Styling Foundation](#phase-2--styling-foundation)                 | ✅ Done    | Tokens, base styles, Sass helpers, browsers     |
| [3. Layout System](#phase-3--layout-system)                           | ✅ Done    | Container, grid, spacing, breakpoints, layouts  |
| [4. Core UI Components](#phase-4--core-ui-components)                 | ✅ Done    | Buttons, links, cards, badges, icons            |
| [5. Forms](#phase-5--forms)                                           | ⬜ Planned | Inputs, selects, checkboxes, validation         |
| [6. Interactive Components](#phase-6--interactive-components)         | ⬜ Planned | Modals, menus, tooltips, tabs, notifications    |
| [7. Navigation](#phase-7--navigation)                                 | ⬜ Planned | Header, menus, footer, breadcrumbs              |
| [8. Documentation & Showcase](#phase-8--documentation--showcase)      | ⬜ Planned | A live gallery of every component               |
| [9. Testing](#phase-9--testing)                                       | ⬜ Planned | Component tests for everything reused           |
| [10. Themes](#phase-10--themes)                                       | ⬜ Planned | Swappable visual identities                     |
| [11. Website Sections](#phase-11--website-sections)                   | ⬜ Planned | Heroes, features, testimonials, pricing         |
| [12. Reusable Website Features](#phase-12--reusable-website-features) | ⬜ Planned | SEO, contact forms, analytics, consent          |
| [13. Website Templates](#phase-13--website-templates)                 | ⬜ Planned | Complete starting points per type of site       |
| [14. Project Generator](#phase-14--project-generator)                 | ⬜ Planned | A new site from a few choices                   |
| [15. Public Release](#phase-15--public-release)                       | ⬜ Planned | Public repo, npm, 1.0.0, documentation site     |

A phase is **done** when every item is ticked and its "Done when" condition holds. Work on a later phase can start early when it unblocks something.

## In every phase

What each phase adds meets these standards. They are not repeated in each phase's list, and a phase is not done until its work meets them:

- **Accessible:** WCAG 2.2 AA, usable with the keyboard alone and with a screen reader, with reduced motion and forced colours respected.
- **Ready for any language:** no component hard-codes text a visitor reads. Built-in text (`Close`, `Next page`) is a prop with an English default, so a site can translate it, and styles use logical properties (`inline-start`, not `left`) so right-to-left languages work.
- **Responsive:** mobile-first, from the smallest phone to a wide desktop.
- **Light:** a part a site does not use adds no CSS and no JavaScript, and a component ships JavaScript only for behaviour HTML and CSS cannot provide.
- **Built from tokens:** every design value comes from a token, and every primitive works without the design system.
- **Documented and tested:** each change updates [the documentation](docs/README.md), the playground and the tests in the same pull request.

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
- [x] Sass helpers for sites: unit, fluid-size and colour functions, and media query, focus, motion, text and reset mixins, through `#nuxt-core/scss` ([styling](docs/styling.md#sass-helpers))
- [x] CSS reset ([styling](docs/styling.md#reset))
- [x] Base typography: headings, paragraphs, links, lists, code ([styling](docs/styling.md#typography))
- [x] Running-text spacing (`.nc-flow`)
- [x] Status colours: success, warning, danger and info, each with a contrast colour, in both schemes ([styling](docs/styling.md#status-colours))
- [x] Interaction states: hover and active shades of the action colours, and a disabled style ([styling](docs/styling.md#interaction-states))
- [x] Border widths and the focus ring (width, offset, colour) as tokens ([styling](docs/styling.md#borders-and-focus-ring))
- [x] Layering scale (`z-index`) for sticky headers, dropdowns, modals and notifications ([styling](docs/styling.md#layering))
- [x] Visually hidden utility, for text that only screen readers announce ([styling](docs/styling.md#nc-visually-hidden))
- [x] Forced colours (Windows high contrast): focus rings and component states stay visible ([styling](docs/styling.md#forced-colours))
- [x] Base styles for tables, figures and description lists, which rich-text content uses ([styling](docs/styling.md#typography))
- [x] Scrollbars coloured by the scheme, with no component and no JavaScript ([styling](docs/styling.md#scrollbars))
- [x] Browser support policy: the browsers and versions the design system targets, documented and used as the CSS build target ([styling](docs/styling.md#browser-support))

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
- [x] Grid and columns (`.nc-grid`, `<BaseGrid>`, [styling](docs/styling.md#nc-grid))
- [x] Spacing utilities (stacks, gaps): `.nc-stack`, `.nc-cluster`, `<BaseStack>`, `<BaseCluster>` ([styling](docs/styling.md#nc-stack))
- [x] Responsive behaviour for each of the above
- [x] `useBreakpoints()` composable, for layout decisions CSS cannot make ([composables](docs/composables.md#usebreakpoints))
- [x] The container's maximum width as a token ([styling](docs/styling.md#layout-tokens))
- [x] Page layouts (`default`, `auth`): header, main and footer areas, with the main area as the skip link's target ([components](docs/components.md#layouts))

**Done when:** a typical page layout (header, content columns, footer) can be built from layout tools alone, and adapts from phone to desktop.

---

## Phase 4 — Core UI Components

**Goal:** the basic components almost every website uses.

- [x] Button ([components](docs/components.md#basebutton))
- [x] Link ([components](docs/components.md#baselink))
- [x] Card ([components](docs/components.md#basecard))
- [x] Badge ([components](docs/components.md#basebadge))
- [x] Icon: inline SVG in a wrapper, with no icon dependency; a site can still put `@nuxt/icon` inside it ([components](docs/components.md#baseicon))
- [x] Divider ([components](docs/components.md#basedivider))
- [x] Avatar ([components](docs/components.md#baseavatar))
- [x] Loading indicator ([components](docs/components.md#basespinner))
- [x] Alert: a static message in each status colour ([components](docs/components.md#basealert))
- [x] Image: responsive and lazy-loaded, with a fixed aspect ratio so the page does not shift (with or without `@nuxt/image`) ([components](docs/components.md#baseimage))

**Done when:** each component supports the states that apply to it (default, hover, focus, disabled, loading, error), exposes them as hooks, is styled by the design system, is documented in [components.md](docs/components.md) and has tests. Each one works, accessibly, with the design system removed.

---

## Phase 5 — Forms

**Goal:** common forms that are quick to build and accessible.

- [x] Text input ([components](docs/components.md#forminput))
- [x] `useSanitize()` composable, to clean text, URLs and payloads from outside ([composables](docs/composables.md#usesanitize))
- [ ] Textarea
- [ ] Select
- [ ] Checkbox
- [ ] Radio button
- [x] Switch ([components](docs/components.md#formswitch))
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
- [ ] Carousel, needed by the testimonial sections
- [ ] Lightbox, needed by the gallery section
- [ ] Enter and leave transitions shared by every component (fade, slide, scale), turned off by reduced motion

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
- [ ] Skip link, to jump past the header to the main content
- [ ] Language switcher, for multilingual sites (phase 12)

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

- [x] Component testing environment (`nuxt` environment, DOM implementation) ([testing](docs/testing.md))
- [ ] Tests for rendering, props and states
- [ ] Tests for mouse and keyboard interaction
- [ ] Automated accessibility checks
- [ ] Visual regression checks for the design system, in both colour schemes
- [ ] A size budget for each entry point (CSS and JavaScript), checked in CI

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
- [ ] `useTheme()` composable (the colour scheme part is done: [composables](docs/composables.md#usetheme))
- [ ] Colour scheme: a default chosen by the site, and following the visitor's system preference
- [ ] Web fonts per theme, self-hosted and loaded without layout shift
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
- [ ] Error pages: not found and server error, in the site's look

**Done when:** a typical landing page can be assembled from sections only.

---

## Phase 12 — Reusable Website Features

**Goal:** functionality that keeps coming back in client websites. Only features that serve several projects belong here.

Every site receives the layer whole, so each feature is **off by default** and a site turns it on in its configuration: a disabled feature registers no server route and loads no code. Features that need heavy dependencies (blog, authentication, booking, search) ship as separate optional layers that a site adds to `extends`, so sites that do not use them do not install them.

- [ ] SEO: meta and Open Graph tags, sitemap, `robots.txt`, structured data
- [ ] Contact form, with its server route, spam protection and email delivery
- [ ] Newsletter form
- [ ] Analytics
- [ ] Cookie consent
- [ ] Multilingual sites: translated routes and content, and a language for each visitor
- [ ] Content: Markdown pages or a headless CMS, so content can change without code
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

---

## Phase 15 — Public Release

**Goal:** Nuxt Core usable by people outside the team. This phase can move earlier if a site needs it.

- [x] Licence: MIT ([LICENSE](LICENSE))
- [x] Public repository, with `main` protected, private vulnerability reporting and secret scanning turned on
- [ ] Published on the npm registry, alongside the Git tags
- [ ] Version 1.0.0, once the hooks, tokens and component APIs are stable
- [ ] Versioning policy: what counts as a breaking change (a renamed hook, token, prop or event), and an upgrade guide for each major version
- [ ] A public documentation site, built from `docs/` and the showcase

**Done when:** a developer outside the team can find, install, use and upgrade Nuxt Core without access to the repository.
