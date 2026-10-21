# Contributing to Nuxt Core

Thank you for contributing to Nuxt Core.

Nuxt Core is designed to be a reusable foundation for building Nuxt websites. Contributions should keep the project simple, predictable, accessible, and reusable across different projects.

## Getting Started

### Requirements

* Node.js 22+
* npm
* Git

### Setup

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd nuxt-core
npm install
```

Start the development server:

```bash
npm run dev
```

## Development Workflow

Nuxt Core uses an automated Git workflow.

You do **not** need to create a branch before starting to work.

### 1. Start coding

Work directly from `main`.

Make whatever changes are necessary for the task you're working on.

You don't need to know the final feature name before you start.

### 2. Save your work

When you're ready to save your current work:

```bash
npm run save
```

The command will:

1. Detect your current Git state.
2. Ask what type of change you're making.
3. Ask for a short description.
4. Create a feature branch when necessary.
5. Create the commit.
6. Push the branch to GitHub.
7. Create a pull request when applicable.

The goal is to keep Git workflow simple and let automation handle the repetitive parts.

### 3. Review the Pull Request

Before merging, make sure:

* The changes are relevant to the current task.
* Tests pass.
* The production build succeeds.
* The implementation follows the project's conventions.
* The change is useful as part of a reusable core.

## Branches

Branches are created automatically by the development workflow.

Branch names follow this format:

```text
<type>/<short-description>
```

Examples:

```text
feat/base-button
fix/modal-close
refactor/scss-tokens
test/base-input
docs/update-readme
```

Supported types include:

* `feat` — new functionality
* `fix` — bug fixes
* `refactor` — code restructuring without changing behavior
* `test` — tests
* `docs` — documentation
* `style` — styling-only changes
* `chore` — maintenance and tooling

## Commits

Commits follow a simple Conventional Commits-style format:

```text
<type>: <description>
```

Examples:

```text
feat: add base button
fix: prevent modal from closing on escape
refactor: simplify button props
test: add button tests
docs: update contributing guide
chore: update dependencies
```

Commit messages should describe the change, not the development process.

Prefer:

```text
feat: add responsive container
```

over:

```text
worked on container
```

Large commits are acceptable when they represent one coherent piece of work.

Do not split changes into artificial commits simply to make the history look busy.

## Pull Requests

Pull requests should represent one coherent change.

A pull request should ideally:

* Have a clear title.
* Explain what changed.
* Explain why the change was made when it isn't obvious.
* Include relevant tests.
* Pass the project's automated checks.

Pull request titles follow the same convention as commits:

```text
feat: add base button
fix: prevent duplicate form submission
refactor: simplify modal state
```

## Testing

Tests are written with Vitest.

Run the test suite with:

```bash
npm run test
```

Run tests in watch mode while developing:

```bash
npm run test:watch
```

New functionality should include tests when practical.

Bug fixes should include a regression test when appropriate.

## Build

Before merging a significant change, verify that the project builds successfully:

```bash
npm run build
```

Type checking is currently not part of the required development workflow and may be introduced later.

## Code Conventions

### TypeScript

Nuxt Core uses TypeScript in strict mode.

Prefer strong, explicit types.

Avoid `any` unless there is a legitimate reason to use it.

Use:

* `interface` for object contracts that may need extension.
* `type` for unions, compositions, and utility types.
* Shared types in `shared/types/` when they are genuinely shared.

### Vue

Use Vue's Composition API and `<script setup lang="ts">`.

Components should have a clear and focused responsibility.

Prefer small, composable components over large components that handle unrelated concerns.

### Naming

Use kebab-case for files and directories where appropriate:

```text
base-button/
app-header/
scss-tokens/
```

Vue components use PascalCase:

```vue
<BaseButton />
<AppHeader />
```

Composables use the `use` prefix:

```text
useModal.ts
useAuth.ts
```

### SCSS

Nuxt Core uses Sass/SCSS.

Use:

* CSS custom properties for design tokens.
* Sass for mixins, functions, and organization.
* Mobile-first responsive design.
* Shallow nesting.
* Meaningful class names.

Avoid unnecessary `!important` and deeply nested selectors.

## Reusability

Nuxt Core is not a collection of random components.

Before adding something to the core, consider:

> Is this genuinely reusable across multiple projects?

Prefer abstractions that solve recurring problems.

Avoid adding functionality purely because it might be useful someday.

A feature that is specific to a single website should generally remain in that website rather than being added to Nuxt Core.

## Accessibility

Accessibility is part of the implementation, not an optional enhancement.

New components should consider:

* Semantic HTML.
* Keyboard navigation.
* Focus management.
* Screen readers.
* Labels and accessible names.
* Appropriate ARIA attributes when necessary.
* Sufficient visual contrast.

Interactive components should be usable without a mouse whenever practical.

## Dependencies

Keep dependencies to a minimum.

Before adding a dependency, consider whether the functionality can reasonably be implemented using Nuxt, Vue, TypeScript, or our existing tooling.

Dependencies should solve a real problem rather than provide convenience for something trivial.

## Documentation

New reusable functionality should be documented when its usage is not immediately obvious.

Components and systems that become part of the public core should eventually have examples in the project's documentation/showcase.

## Keeping the Core Clean

Nuxt Core should remain:

* Simple.
* Predictable.
* Reusable.
* Accessible.
* Maintainable.
* Framework-aligned.

Avoid unnecessary abstractions, configuration, dependencies, or tooling.

When in doubt, prefer the simpler solution.

## Questions and Discussions

If you're unsure whether something belongs in Nuxt Core, open an issue or discuss the idea before implementing a large change.

Small improvements can be developed directly using the normal workflow.

---

**Build once. Reuse everywhere.**
