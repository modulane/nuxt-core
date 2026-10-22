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

### 2. Ship your work

When you're ready to ship your current work:

```bash
yarn ship          # branch + commit + push + pull request
yarn ship:dry      # everything up to the plan, nothing is modified or pushed
yarn ship:plan     # push the branch without opening a pull request
yarn ship:status   # your open PRs (CI, reviews, conflicts) + PRs waiting for your review
yarn ship:doctor   # check your setup and get the exact command to fix each problem
yarn ship:undo     # pick one of your recent ships: changes come back locally, PR closed
yarn ship:watch    # watch your branch's PR: native notifications on review, comment, conflict, merge
yarn ship:setup    # one-time (admin): squash-only merges, auto-delete branches, labels, issue forms
yarn ship --skip-tests   # emergency only: skip the test gate (flagged in the PR)
```

Menus are keyboard-driven (↑↓ then Enter, or the option number); each step shows a spinner and its duration.

Ship-it is plain Node: it works the same on Windows, macOS, Linux and in the devcontainer. It needs Node 22+ and [GitHub CLI](https://cli.github.com). **First time? Run `yarn ship:doctor`** — it tells you what to install (`winget install GitHub.cli`, `gh auth login`, `gh auth setup-git`…).

The command will:

1. **Tidy up**: if your current branch's PR was merged, switch back to an up-to-date `main` (your uncommitted changes come along) and delete merged local branches.
2. **Gates**: run the cleanup scripts (`format`, `lint:fix`), then the gates (`lint`, `typecheck`, `test` — related tests only). Both lists come from `ship.config.json`; a missing script is skipped.
3. **Secret scan**: look for API keys, tokens, private keys and `.env` files in what you're about to push. Suspects are listed with `file:line`; you confirm explicitly if they are false positives.
4. **Split**: if the diff mixes independent topics (application / tooling / docs), offer one PR per topic.
5. **Plan**: detect what you did from the diff and propose type, title, branch, PR summary and review notes, with the reasons. Titles name what changed: new props and events (`feat: add size prop to button component`), keyboard handling, exports, `// fix: …` comments, style-only changes. With an AI key, the AI refines it; otherwise the detected plan is used as is. Accept, regenerate or edit it field by field.
6. **Issue**: an issue number found in the branch, commits or diff (`fixes #12`) is offered; otherwise you can pick one of your open assigned issues. The PR gets `Closes #N`.
7. **Delivery**: branch (when on `main`), commit, rebase onto `origin/main` if it moved (conflict → nothing is lost, you choose), push (`--force-with-lease` after a rebase), and open the PR ready for review with labels and reviewers. An existing PR is updated instead.

At the end, ship-it offers to watch the PR right away (`yarn ship:watch`): it polls every 30 s (`SHIP_WATCH_INTERVAL`), sends a native notification (Windows toast, macOS, Linux `notify-send`) for each new review, comment, CI result or conflict, and stops when the PR is merged or closed. Check notifications work with `yarn ship:watch --test`.

**Repository setup:** `yarn ship:setup` aligns GitHub with this workflow — squash merges only (commit title = PR title), branches deleted after merge, "Update branch" button, labels from `ship.config.json`, and Bug / Feature issue forms (blank issues disabled, roadmap phases listed). It shows the difference and asks before changing anything; re-running it only proposes what's missing. Note: on a private repository with a free plan, GitHub doesn't offer branch protection or native auto-merge — the review rule relies on the team.

Every ship is recorded in `.ship/history.jsonl` (local, git-ignored) — that is what `yarn ship:undo` uses. Undo saves the PR as a patch first, restores it on `main` as uncommitted changes, and only then closes the PR; if the restore conflicts, you choose between resolving the conflicts or putting everything back.

**Team config:** `ship.config.json` (versioned, autocompleted in VS Code through its `$schema`) sets the gates, cleanup scripts, label mapping, reviewers (`"auto"` = the other collaborators), split, code folders, issue keyword and secret-scan exclusions. Invalid values stop ship-it with a clear message; `yarn ship:doctor` validates it too.

**AI (optional):** set `MISTRAL_API_KEY` and/or `GROQ_API_KEY` in your environment or in `.env.local` (git-ignored). Providers are tried in that order. `SHIP_MODEL` / `GROQ_MODEL` override the models (defaults `mistral-small-latest`, `llama-3.3-70b-versatile`); `SHIP_AI=off` disables the AI.

Merging stays manual, once CI is green and the review is done. Next `yarn ship` cleans up after the merge.

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
