# Contributing

Thank you for helping improve Nuxt Core. This guide covers the change workflow, the documentation rule, labels and releases. How the code itself is built and written is in the [documentation](docs/README.md).

Nuxt Core is a reusable foundation for building Nuxt websites. Contributions should keep it simple, predictable, accessible and reusable across different projects.

By contributing, you agree that your contribution is licensed under the [MIT licence](LICENSE), like the rest of the project. Everyone taking part follows the [code of conduct](https://github.com/modulane/.github/blob/main/CODE_OF_CONDUCT.md). Report security vulnerabilities privately, as the [security policy](https://github.com/modulane/.github/blob/main/SECURITY.md) describes, never in a public issue.

## Finding something to work on

The [roadmap](ROADMAP.md) lists what Nuxt Core still needs. Issues labelled [`good first issue`](https://github.com/modulane/nuxt-core/labels/good%20first%20issue) are small and self-contained; issues labelled [`help wanted`](https://github.com/modulane/nuxt-core/labels/help%20wanted) are larger but ready to start.

Comment on an issue before starting it, so nobody works on the same thing twice, and wait for the maintainer to assign it to you. For a change with no issue, open one first, unless it is a small fix. A new component follows the existing ones: a primitive in `layers/primitives` that exposes its states as [styling hooks](docs/architecture.md#the-styling-hooks), and its styles in `layers/design`, meeting the standards [in every phase](ROADMAP.md#in-every-phase) of the roadmap.

## Development setup

```bash
git clone https://github.com/modulane/nuxt-core.git
cd nuxt-core
corepack enable
yarn install
```

[Getting started](docs/getting-started.md) lists the requirements, every command and fixes for common setup problems. Before opening a pull request, run `yarn check`: it checks formatting, types and tests, as CI does.

## Workflow

Every change is made on a short-lived branch and reaches `main` through a pull request:

1. Create a branch from an up-to-date `main`, named after the change: `feat/base-button`, `fix/modal-close`, `docs/readme`, …
2. Open a **draft** pull request as soon as the branch has its first commit (`gh pr create --draft`), so the work is visible while it is in progress.
3. Push every commit to the branch as it is made. Run `yarn check` before each push. Nothing is released from a branch.
4. When the change is complete, mark the pull request ready for review (`gh pr ready`). Only a pull request that is ready is reviewed and merged. CI checks formatting, types and tests, and builds the site with Node.js 22, 24 and 26. It also measures test coverage, which must stay at 90% of the lines or more. A check verifies that the title follows [Conventional Commits](https://www.conventionalcommits.org/). Pull requests that change `.github/` are also audited by [zizmor](https://docs.zizmor.sh/). A final **CI passed** job succeeds only when every CI job has passed. It, the title check and the **AI disclosure** check (see [AI use](#ai-use)) are the checks that must pass before a pull request can be merged, so changing the Node.js versions never requires changing the repository rules.
5. Squash-merge it. The pull request title becomes the only commit on `main`. Delete the branch: the next change starts a new one from `main`.

The pull request title decides what is released, so choose its type carefully:

| Title starts with                                                           | Release                          |
| --------------------------------------------------------------------------- | -------------------------------- |
| `fix:`                                                                      | Patch, for example 0.4.0 → 0.4.1 |
| `feat:`                                                                     | Minor, for example 0.4.0 → 0.5.0 |
| `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `build:`, `ci:`, `chore:` | None                             |

Keep the summary lowercase and in the imperative: `feat: add base button`, not `Feat: Added base button`. Describe the change, not the development process: `feat: add responsive container`, not `worked on container`.

**Do not mark changes as breaking before 1.0.0.** A `!` after the type (`feat!:`) or a `BREAKING CHANGE:` footer makes a major release, which would release 1.0.0 early. Until then, describe incompatible changes in the pull request and release them as `feat:`.

A pull request represents one coherent change. Its description explains what changed and why, and the [pull request template](.github/PULL_REQUEST_TEMPLATE.md) lists what to check before asking for review.

### AI use

AI tools are allowed, but their use is never hidden. The rule is the same for the maintainer and for contributors.

- **Pull requests:** fill in the **AI use** section of the [pull request template](.github/PULL_REQUEST_TEMPLATE.md). Tick **No AI tool was used**, or tick **AI tools were used** and name each tool and what it did under it, for example "Claude Code wrote the first draft of the tests; I reviewed and changed them". The **AI disclosure** check fails until exactly one box is ticked, and a pull request cannot be merged without it. Editing the description runs the check again. Dependabot pull requests are exempt.
- **Issues:** every issue form asks the same question.
- **Comments and reviews:** say so when an AI tool wrote or drafted what you post. No check can verify this, so it relies on you.

You are responsible for everything you submit, whoever or whatever wrote it: read it, test it, and be ready to explain it.

## Documentation

**The documentation is part of the change.** A pull request that changes behaviour, structure, commands, conventions or a public API updates the matching guide in [`docs/`](docs/README.md) in the same pull request, and ticks the [roadmap](ROADMAP.md) item it completes. Reviewers check this like they check tests.

The [documentation index](docs/README.md#keeping-the-documentation-current) maps each kind of change to the guide it updates, and sets the writing style.

## Code

The rules code review applies are in [docs/conventions.md](docs/conventions.md): formatting, TypeScript, Vue, naming, imports, SCSS, accessibility, and when to add an abstraction or a dependency.

Before adding something, ask: **is this genuinely reusable across several projects?** A feature specific to one website stays in that website. If you are unsure whether something belongs in Nuxt Core, open an issue before starting a large change.

## Labels and reviews

Each issue form adds its kind label (`bug`, `enhancement` or `question`) and `needs-triage`. The maintainer removes `needs-triage` once the issue is reviewed, and adds `good first issue` or `help wanted` when it is ready to pick up. Roadmap items are grouped in one milestone per phase.

The **Pull request labels** workflow labels each pull request from its title, and updates the labels when the title is edited:

| Title type                                      | Kind label      | Release label    |
| ----------------------------------------------- | --------------- | ---------------- |
| `feat:`                                         | `enhancement`   | `release: minor` |
| `fix:`                                          | `bug`           | `release: patch` |
| `docs:`                                         | `documentation` | `release: none`  |
| `ci:`, `build:`                                 | `ci`            | `release: none`  |
| `refactor:`, `perf:`, `test:`, `style:`, others | `maintenance`   | `release: none`  |

A `!` after the type replaces the release label with `release: major`, so a breaking change is visible before it is merged. The workflow also assigns a new pull request to its author, and [`CODEOWNERS`](.github/CODEOWNERS) requests a review from the maintainer.

The labels themselves are defined in [`.github/labels.json`](.github/labels.json). When that file changes on `main`, the **Labels** workflow creates the missing labels and updates the others. It never deletes a label; remove one in the repository settings after taking it out of the file.

## Releases

Releases are fully automated with [semantic-release](https://semantic-release.gitbook.io/). Nuxt Core is not published to npm: a release is a git tag and a GitHub release.

1. A pull request is merged into `main`.
2. The **Release** workflow starts on that commit. Its first job runs the **CI** workflow.
3. If CI succeeds, the release job runs semantic-release in the same run, on the same commit. CI also publishes the coverage badge to GitHub Pages.
4. semantic-release reads the commits since the last release tag. If none of them is a `fix:` or `feat:`, it stops and nothing is released.
5. Otherwise it computes the next version, creates the `vX.Y.Z` git tag and a GitHub release with notes generated from the commits, and comments on the issues and pull requests it includes.

The version in `package.json` is always `0.0.0-development`. The real version exists only in git tags; the history starts from the `v0.0.0` tag.

The Release workflow can also be started by hand from the Actions tab. It then performs the same steps on the latest commit of `main`. Check **dry-run** to see the next version and its release notes without creating anything.

### Workflow security

The release job can push tags and create releases, so the workflows keep what it runs to a minimum:

- Every action is pinned to a full commit SHA, with its version in a comment. Dependabot proposes updates once a week, only for releases that are at least seven days old. Its pull requests are titled `ci:`, so they never trigger a release.
- Each job asks only for the permissions it needs, and each permission says what it is for.
- The release job runs only on `main`, keeps no git credential on disk, uses no dependency cache, and installs dependencies without running their build scripts.
