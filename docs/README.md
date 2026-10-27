# Documentation

This folder is the reference for how Nuxt Core is built and used. The [README](../README.md) introduces the project, the [roadmap](../ROADMAP.md) plans it, and [CONTRIBUTING](../CONTRIBUTING.md) describes the change and release workflow. Everything else lives here.

## Guides

| Guide                                 | What it covers                                                 | Status                     |
| ------------------------------------- | -------------------------------------------------------------- | -------------------------- |
| [Getting started](getting-started.md) | Requirements, installation, commands and troubleshooting       | Current                    |
| [Architecture](architecture.md)       | The folder structure, what belongs where, and the config files | Current                    |
| [Conventions](conventions.md)         | TypeScript, Vue, naming, SCSS, accessibility and imports       | Current                    |
| [Styling](styling.md)                 | The SCSS architecture, design tokens and breakpoints           | Current                    |
| [Components](components.md)           | Every component, and the template for documenting one          | Inventory only: no API yet |
| [Composables](composables.md)         | Every composable, and the template for documenting one         | Inventory only: no API yet |
| [Testing](testing.md)                 | How tests run, where they live and what to test                | Current                    |
| [Theming](theming.md)                 | How themes will work                                           | Planned (roadmap phase 10) |

## Keeping the documentation current

The documentation describes the code as it is on `main`, never as it is planned to be. Planned work belongs in the [roadmap](../ROADMAP.md).

**A pull request that changes behaviour, structure, commands, conventions or a public API updates the matching guide in the same pull request.** Reviewers check this like they check tests; the pull request template has a box for it.

| When a pull request…                                     | It updates                                                    |
| -------------------------------------------------------- | ------------------------------------------------------------- |
| adds, changes or removes a component                     | [components.md](components.md)                                |
| adds, changes or removes a composable                    | [composables.md](composables.md)                              |
| adds or changes a design token, breakpoint or SCSS file  | [styling.md](styling.md)                                      |
| adds a folder or moves files                             | [architecture.md](architecture.md)                            |
| adds or changes a `package.json` script or a requirement | [getting-started.md](getting-started.md) and the README       |
| changes a rule in code review                            | [conventions.md](conventions.md)                              |
| completes a roadmap item                                 | [ROADMAP.md](../ROADMAP.md): tick the item, update the status |

## Writing style

- Write for someone who has never seen the project. Explain why, not only what.
- Describe what exists. Mark anything not built yet as _planned_ and link to the roadmap phase.
- Use relative links to files, and check they resolve.
- Put commands and code in fenced blocks with a language: `bash`, `vue`, `ts`, `scss`.
- Prettier formats Markdown too, so run `yarn format` before committing.
