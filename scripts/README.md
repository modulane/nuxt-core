# Ship-it

Ship-it turns local work into a reviewed pull request with a single command. It handles branches, commits, checks, pull requests and the clean-up after merge, so contributors rarely need to open GitHub.

It is plain Node.js with no dependencies, and behaves the same on Windows, macOS, Linux and in the devcontainer.

## Requirements

- Node.js 22 or later
- Git 2.30 or later
- [GitHub CLI](https://cli.github.com), authenticated with `gh auth login`

Run `yarn ship:doctor` first: it checks every requirement and prints the exact command to fix each problem.

## Commands

| Command | Purpose |
| --- | --- |
| `yarn ship` | Ship your work: checks, branch, commit, push and pull request. |
| `yarn ship:dry` | Run everything up to the plan, without modifying or pushing anything. |
| `yarn ship:plan` | Push the branch without opening a pull request. |
| `yarn ship:status` | Show your open pull requests (CI, reviews, conflicts) and the ones waiting for your review. |
| `yarn ship:watch` | Watch your branch's pull request and get native notifications. |
| `yarn ship:undo` | Undo a recent ship: its changes come back locally and the pull request is closed. |
| `yarn ship:doctor` | Check your environment. |
| `yarn ship:setup` | One-time repository setup (admin only). |

`yarn ship --skip-tests` skips the test gate. Use it only as a last resort: the pull request is flagged accordingly.

Menus are keyboard-driven: use <kbd>↑</kbd> <kbd>↓</kbd> then <kbd>Enter</kbd>, or type the option number.

## What `yarn ship` does

1. **Tidy up.** If the pull request of your current branch was merged, you are moved back to an up-to-date `main` (uncommitted changes come along) and merged local branches are deleted.
2. **Checks.** The clean-up scripts (`format`, `lint:fix`) run first, then the gates (`lint`, `typecheck`, `test`, limited to related tests). A script missing from `package.json` is skipped.
3. **Secret scan.** Added lines are scanned for API keys, tokens, private keys and `.env` files. Suspects are listed with `file:line`, and you must explicitly confirm false positives.
4. **Split.** When the diff mixes independent topics (application, tooling, docs), ship-it offers one pull request per topic.
5. **Plan.** The diff is analysed to propose a type, title, branch, summary and review notes, with the reasons behind them. Titles name what changed, such as `feat: add size prop to button component`. You can accept, edit each field or regenerate the plan.
6. **Issue.** An issue referenced in the branch name, commits or diff (`fixes #12`) is offered. Otherwise, you can pick one of your open assigned issues. The pull request then closes it.
7. **Delivery.** A branch is created when you are on `main`, then ship-it commits, rebases onto `origin/main` if it moved, pushes, and opens the pull request with labels and reviewers. An existing pull request is updated instead.

A rebase conflict never loses work: the rebase is aborted and you decide whether to push anyway or stop. Merging stays manual, once the review is done.

## Watching a pull request

`yarn ship:watch` polls the pull request of your branch every 30 seconds and sends a native notification (Windows toast, macOS Notification Center, Linux `notify-send`) for each review, comment, CI result or conflict. It stops when the pull request is merged or closed.

`yarn ship` offers to start watching right after delivery. Run `yarn ship:watch --test` to check that notifications appear on your machine. Set `SHIP_WATCH_INTERVAL` (in seconds) to change the polling interval.

## Undoing a ship

Every ship is recorded in `.ship/history.jsonl`, a local file ignored by Git. `yarn ship:undo` lists the ships whose pull request is still open. For the one you pick, it:

1. saves the pull request as a patch in `.ship/`,
2. restores its changes on `main` as uncommitted modifications,
3. closes the pull request and deletes its branch.

If the restore conflicts with newer changes on `main`, you choose between resolving the conflicts yourself or putting everything back as it was.

## Repository setup

`yarn ship:setup` aligns the GitHub repository with this workflow:

- squash merges only, with the pull request title as the commit title,
- branches deleted automatically after merge,
- the "Update branch" button enabled,
- the labels used by `ship.config.json`,
- Bug and Feature issue forms, with blank issues disabled.

It shows the differences and asks before changing anything. Running it again only proposes what is missing.

On a private repository with a free plan, GitHub offers neither branch protection nor native auto-merge, so the review rule relies on the team.

## Configuration

`ship.config.json`, at the repository root, is shared by the team. Every key is optional, and VS Code autocompletes the file through its `$schema`.

| Key | Default | Purpose |
| --- | --- | --- |
| `base` | `null` | Target branch of pull requests. `null` uses the default branch of `origin`. |
| `cleanup` | `["format", "lint:fix"]` | Scripts that fix code automatically before the gates. |
| `gates` | `["lint", "typecheck", "test"]` | Scripts that must pass before shipping. |
| `labels` | `feat` → `enhancement`, `fix` → `bug`, `docs` → `documentation`, `ui` → `accessibility` | Label per commit type. `ui` applies when `.vue` files change. |
| `reviewers` | `"auto"` | `"auto"` requests a review from the other collaborators, or provide a list of GitHub logins. |
| `split` | `true` | Offer one pull request per topic. |
| `codeDirs` | `["app", "server", "shared", …]` | Folders treated as application code. |
| `issues` | `{ "link": true, "keyword": "Closes" }` | Issue linking and the keyword used in the pull request. |
| `secrets` | `{ "ignorePaths": [] }` | Paths excluded from the secret scan (`*` and `**` globs). |

Invalid values stop ship-it with a clear message. `yarn ship:doctor` validates the file as well.

## AI assistance (optional)

Without AI, ship-it writes the plan from the diff alone. With an API key, an AI model refines the title and summary. Providers are tried in order:

| Provider | Key | Model override | Default model |
| --- | --- | --- | --- |
| Mistral | `MISTRAL_API_KEY` | `SHIP_MODEL` | `mistral-small-latest` |
| Groq | `GROQ_API_KEY` | `GROQ_MODEL` | `llama-3.3-70b-versatile` |

Set the keys in your environment or in `.env.local`, which Git ignores. `SHIP_AI=off` disables AI even when a key is present.
