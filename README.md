# Nuxt Core

A reusable foundation for building modern websites with Nuxt.

Nuxt Core is a personal, reusable web development foundation designed to make the creation of new websites faster, more consistent, and easier to maintain.

The project provides reusable UI components, styling foundations, layouts, website sections, themes, and eventually complete website templates.

The goal is simple:

> **Build once, reuse everywhere.**

---

## Why Nuxt Core?

Creating a new website often means solving the same problems again and again:

* buttons
* forms
* navigation
* responsive layouts
* typography
* colors
* spacing
* accessibility
* animations
* SEO
* common website sections

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

---

## Goals

Nuxt Core aims to provide:

* A consistent development environment
* A reusable component library
* A flexible styling system
* Responsive and accessible components
* Reusable website sections
* Customizable visual themes
* Ready-to-use website templates
* A faster workflow for future projects

The project is designed to grow over time.

New components and features should be added when they solve a recurring problem or provide meaningful value to future projects.

---

## Technology

Nuxt Core is built around:

* [Nuxt](https://nuxt.com/)
* Vue
* TypeScript
* SCSS
* Vitest

The UI is intentionally built from scratch with SCSS rather than relying on an external component library.

This gives the project full control over its visual identity and allows the design system to evolve independently.

---

# Roadmap

The roadmap describes the planned evolution of Nuxt Core.

It is intentionally progressive: each stage builds on the previous one.

---

## Phase 1 — Project Foundation

**Goal:** Create a clean and reliable starting point for the project.

We will establish:

* The Nuxt project structure
* TypeScript configuration
* SCSS integration
* Testing setup
* Basic project conventions
* Git workflow - Thanks to [@GregoireF](https://discord/GregoireF)
* Initial documentation

<!-- **Status:** ✅ Completed -->
**Status:** 🟡 In progress

---

## Phase 2 — Styling Foundation

**Goal:** Create the basic visual rules used throughout the project.

This includes:

* CSS reset
* Colors
* Typography
* Spacing
* Border radius
* Shadows
* Animations and transitions
* Responsive breakpoints

These rules will make it possible for every component to share the same visual language.

**Status:** 🟡 In progress

---

## Phase 3 — Layout System

**Goal:** Make it easy to build responsive page layouts.

We will create reusable tools for:

* Centering content
* Controlling page width
* Creating columns
* Creating grids
* Managing spacing
* Building responsive layouts

For example:

```text
Page
└── Container
    └── Grid
        ├── Content
        └── Content
```

**Status:** ⬜ Planned

---

## Phase 4 — Core UI Components

**Goal:** Build the basic components used by almost every website.

Examples include:

* Buttons
* Links
* Cards
* Badges
* Icons
* Dividers
* Avatars
* Loading indicators

Each component should support common states such as:

* Default
* Hover
* Focus
* Disabled
* Loading
* Error, when relevant

**Status:** ⬜ Planned

---

## Phase 5 — Forms

**Goal:** Make common website forms quick to build.

Planned components include:

* Text inputs
* Text areas
* Select fields
* Checkboxes
* Radio buttons
* Switches
* Form fields
* Form validation

The components will be designed with accessibility and keyboard navigation in mind.

**Status:** ⬜ Planned

---

## Phase 6 — Interactive Components

**Goal:** Provide reusable components for common interactions.

Examples:

* Modals
* Dropdown menus
* Tooltips
* Popovers
* Accordions
* Tabs
* Drawers
* Notifications

These components should handle common interaction details such as keyboard navigation, focus management, and responsive behavior.

**Status:** ⬜ Planned

---

## Phase 7 — Navigation

**Goal:** Provide the common navigation elements required by websites.

Planned components include:

* Header
* Navigation menu
* Mobile navigation
* Footer
* Breadcrumbs
* Pagination

**Status:** ⬜ Planned

---

## Phase 8 — Documentation & Showcase

**Goal:** Make every component easy to discover and understand.

A dedicated showcase will demonstrate:

* What each component looks like
* Available variations
* Available states
* Component properties
* Usage examples

The showcase will also serve as a visual reference while developing future websites.

**Status:** ⬜ Planned

---

## Phase 9 — Testing

**Goal:** Make reusable components reliable.

Important components will receive automated tests covering things such as:

* Rendering
* Properties
* User interactions
* Different states
* Keyboard interactions
* Accessibility

The goal is not to test every line of code, but to protect the components that are reused across many projects.

**Status:** ⬜ Planned

---

## Phase 10 — Themes

**Goal:** Make the same components usable with completely different visual identities.

A theme can change things such as:

* Colors
* Typography
* Border radius
* Shadows
* Spacing
* Overall visual style

For example:

```text
                    Same components
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
          Modern        Elegant       Corporate
```

The components themselves should remain unchanged.

**Status:** ⬜ Planned

---

## Phase 11 — Website Sections

**Goal:** Move from individual components to complete reusable sections.

Examples:

### Hero sections

* Centered hero
* Split hero
* Image hero
* Video hero

### Features

* Feature grid
* Feature list
* Alternating features

### About

* Simple introduction
* Image + text
* Statistics

### Testimonials

* Testimonial grid
* Testimonial carousel
* Individual testimonial

### Other sections

* Pricing
* Call to action
* Contact
* Gallery
* FAQ

These sections will allow complete pages to be assembled much faster.

**Status:** ⬜ Planned

---

## Phase 12 — Reusable Website Features

**Goal:** Provide functionality that frequently appears in client websites.

Possible features include:

* SEO helpers
* Contact forms
* Newsletter forms
* Analytics
* Cookie consent
* Blog functionality
* Search
* Authentication
* Booking systems

Only features that provide real value across multiple projects should become part of Nuxt Core.

**Status:** ⬜ Planned

---

## Phase 13 — Website Templates

**Goal:** Create complete starting points for common types of websites.

Potential templates include:

* Business websites
* Freelancer portfolios
* Restaurants
* Agencies
* SaaS websites
* Personal portfolios
* Landing pages
* E-commerce websites

A template will combine existing components, sections, features, and themes into a coherent website structure.

**Status:** ⬜ Planned

---

## Phase 14 — Project Generator

**Goal:** Make starting a new website as fast as possible.

The long-term goal is to be able to create a new project by selecting options such as:

```text
Project
├── Template
├── Theme
├── Features
├── Language
└── Configuration
```

The project generator would then create a ready-to-develop Nuxt website using Nuxt Core.

**Status:** ⬜ Planned

---

# Development Principles

Nuxt Core follows a few simple principles.

### Reusability

A component should be reusable across multiple projects.

### Simplicity

Components should solve a problem without introducing unnecessary complexity.

### Accessibility

Reusable components should be usable by as many people as possible, including users navigating with a keyboard or assistive technology.

### Responsive by default

Components should work well across different screen sizes.

### Consistency

Similar problems should have similar solutions.

### No unnecessary dependencies

External dependencies should only be introduced when they provide significant value.

### Build for real needs

Nuxt Core should grow from real development needs rather than trying to predict every possible future requirement.

---

# Project Status

Nuxt Core is currently under active development.

The roadmap is a direction rather than a fixed schedule.

Features may be added, removed, or reorganized as the project evolves and real-world projects reveal new requirements.

---

# License

License information will be added when the project is ready for public distribution.
