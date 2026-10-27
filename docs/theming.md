# Theming

> **Planned.** Themes are [roadmap phase 10](../ROADMAP.md#phase-10--themes). This page describes the approach the current code prepares for; it will document the real API once themes exist.

## The idea

A theme changes how the components look (colours, typography, radius, shadows, spacing) without changing the components themselves. Themes belong to the [design layer](architecture.md#the-parts): a site that styles the primitives its own way does not receive them.

## What already supports it

Every design value is a CSS custom property on `:root`, defined in [`base/_root.scss`](../layers/design/app/assets/scss/base/_root.scss) and the [colour schemes](#dark-mode), and listed in [styling.md](styling.md#design-tokens). The styles the design system gives the primitives read these properties instead of hard-coded values, so a theme only has to give them new values. Because custom properties change at runtime, switching theme does not need a rebuild.

This is why the [conventions](conventions.md#scss) forbid hard-coded colours, spacing and font sizes: each one would be a value a theme cannot change.

## Dark mode

Dark mode is a **colour scheme**, a variant of each theme, not a theme of its own: a theme sets the identity (Modern, Elegant…) and each theme gives values for both schemes. The design system ships a dark scheme, the default, and a light one, selected with `data-color-scheme="light"` on `<html>` ([colour schemes](styling.md#colour-schemes)). [`useTheme()`](composables.md#usetheme) reads and switches the scheme and sets that attribute. The schemes live in [`schemes/`](../layers/design/app/assets/scss/schemes/) and set only the colour and shadow tokens.

## Still to decide

- How a theme is selected: a class or `data-theme` attribute on `<html>`, or separate stylesheets.
- What `useTheme()` adds for themes: it handles only the colour scheme for now.
- Whether a site can change the default scheme, and whether to follow the visitor's `prefers-color-scheme`.
