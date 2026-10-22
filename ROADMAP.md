## Phase 1 — Project Foundation

**Goal:** Create a clean and reliable starting point for the project.

We will establish:

* The Nuxt project structure
* TypeScript configuration
* SCSS integration
* Testing setup
* Basic project conventions
* Git workflow - Thanks to [@GregoireF](https://github.com/GregoireF)
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
