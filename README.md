# united-we-stand Framework

This repository is the documentation, source, build, test, and publish workspace for the `united-we-stand` package.

The runtime framework README that gets installed into target repositories is:

- [`.united-we-stand/README.md`](./.united-we-stand/README.md)

![united-we-stand logo](./public/united-we-stand-logo.png)

`united-we-stand` is a spec-driven development framework for agentic AI collaboration. It gives AI assistants a structured way to handle feature work, bug fixes, refactors, reviews, migrations, release preparation, and documentation updates with persistent branch-aware context instead of relying only on chat history.

The framework combines detailed staged instructions, reusable playbooks, and specialist agents that are invoked based on the task at hand. It is designed to work well with VS Code, Antigravity, Cursor, and similar repository-aware coding environments.

## What it does

The `united-we-stand` npm package installs a repository-scoped AI workflow framework that helps coding assistants work in a structured, branch-aware way instead of relying only on chat memory.

It provides:

- a global CLI: `united-we-stand`
- an installed framework directory: `.united-we-stand/`
- branch-aware workflow memory under `.spec-driven/`
- numbered framework stages for end-to-end delivery
- standalone specialist agents for focused tasks
- editor/AI pointer files that redirect supported tools back to the installed framework and current workflow state

Once installed and initialized, the framework helps an AI assistant understand:

- the current branch context
- the current workflow stage
- what has already been decided
- what file should be updated next
- how to continue work consistently across supported tools and chats

## Why it exists

Most AI coding workflows lose context between chats, tools, branches, and sessions. `united-we-stand` exists to give AI assistants a predictable, durable workflow model inside the repository itself.

Instead of depending only on temporary chat history, the framework stores branch progress and stage outputs in markdown files that travel with the repository. This makes it easier to:

- resume work later
- switch between supported AI coding tools
- keep feature planning and implementation grounded in written state
- reduce repeated prompting
- keep multi-step development work organized

## The package

The package installs a global CLI named:

- `united-we-stand`

The built package ships:

- compiled CLI output
- `.united-we-stand/**`
- `README.md`
- `LICENSE`

The repository also contains `public/` assets for source-repo documentation, and those assets are currently included in the published package.

Once the framework is installed and initialized, branch memory is saved for future chats and can be resumed across supported tools. You can move between VS Code, Antigravity, Cursor, and similar environments without manually re-pointing the AI, because the installed instructions direct it back to the current spec and workflow state automatically.

In a new chat, a simple prompt such as `what is the current status of united-we-stand` can be used to confirm the active workflow state.

## GitHub Repository Star Suggestion

After `united-we-stand install` completes inside a target repository, the CLI prints a short suggestion to star the source repository if the framework was helpful:

- <https://github.com/mrudinal/united-we-stand-framework>

This is only a log message. The install command does not call the GitHub API, does not use the `gh` CLI, does not read GitHub auth tokens for starring, and does not modify the user's GitHub account in any way.

## End-User Documentation

If you need detailed user-facing documentation, read:

- [`.united-we-stand/README.md`](./.united-we-stand/README.md)

That file explains:

- how users install the package
- how they run `install`, `branch-init`, `doctor`, and `refresh`
- framework stages and standalone agents
- runtime branch-memory layout inside their repositories

## How to install it

Install the public npm package with:

```bash
npm install -g @rudinmax87/united-we-stand
```

Then, inside a target repository:

```bash
united-we-stand install
```

For resetting the framework back to the defaults and overwriting everything under `.united-we-stand/`:

```bash
united-we-stand install --force
```

The install command creates the following framework files and directories:

### What files it creates

Running `united-we-stand install` installs:

- the framework docs under `.united-we-stand/`
- editor/agent pointer files such as:
  - `AGENTS.md`
  - `.github/copilot-instructions.md`
  - `.agents/workflows/united-we-stand.md`
  - `.cursor/rules/united-we-stand.mdc`

It also installs the framework agents, including:

- numbered framework agents:
  - `0-status-checker`
  - `1-initializer`
  - `2-planner`
  - `3-designer`
  - `4-implementer`
  - `5-code-reviewer`
  - `6-finalizer`
- standalone specialist agents:
  - `debugger`
  - `documentation-writer`
  - `project-manager`
  - `refactorer`
  - `test-strategist`
  - `performance-reviewer`
  - `accessibility-reviewer`
  - `api-contract-writer`
  - `data-modeler`
  - `sql-database-designer`
  - `migration-planner`
  - `observability-reviewer`
  - `release-coordinator`
  - `web-designer`

The workflow is used in chat after installation. The framework steps are as follows:

1. `1-initializer`: `AGENTS.md initialize this branch for adding OAuth login`
2. `2-planner`: `plan this feature`
3. `3-designer`: `design the architecture for this change`
4. `4-implementer`: `implement this now`
5. `5-code-reviewer`: `do a code review`
6. `6-finalizer`: `wrap this up`

`0-status-checker` is a routing and validation stage, not a delivery stage. Examples: `what's my status`, `what is the current status of united-we-stand`

All of those steps are called in the chat, and do not need to be referenced explicitly after initialization. Simple prompts such as `lets move to the next step`, `next step`, or `do the next step` should move the AI framework to the next numbered stage.

For the most reliable initialization bootstrap, explicitly reference an installed framework file in the prompt, for example `.united-we-stand/README.md initialize this` or `AGENTS.md init the following`. Also, indicate at the end to only do the initialization step.
In normal chat usage, the AI should create branch memory during initialization, follow the numbered workflow stages, and use standalone agents only when the task calls for specialized help.

After the workflow is initialized, each stage writes or updates its branch file as follows:

| Stage | File name | General description |
|-------|-----------|---------------------|
| `0-status-checker` | `00-current-status.md` | Current branch status, blockers, recommended next step, and routing state |
| `1-initializer` | `01-init.md` | Raw idea, scope, assumptions, open questions, and success criteria |
| `2-planner` | `02-plan.md` | Ordered plan, dependencies, risks, and suggested execution order |
| `3-designer` | `03-design.md` | Architecture, interfaces, boundaries, data flow, and design decisions |
| `4-implementer` | `04-implementation.md` | What changed in code, validation performed, and remaining gaps |
| `5-code-reviewer` | `05-code-review.md` | Quality, maintainability, security, and review findings |
| `6-finalizer` | `06-finalization.md` | Final summary, uncaptured changes, doc updates, and closure confirmation |

Each stage document can be updated later, either manually or by asking the agent in the chat, if the work changes or the plan evolves. When moving to the next stage, the AI should use the latest version of those written documents as the main source of truth, instead of depending only on the chat.

### What safety/destructive behavior exists

The framework is designed to install into the target repository and update its own managed framework files.

Important behavior to know:

- `united-we-stand install` writes or updates framework-related files in the repository

- `united-we-stand install --force` resets the installed framework files under `.united-we-stand/` back to the package defaults

- `branch-init --force` is intended to reset the current branch workflow memory for the resolved branch folder under `.spec-driven/`

- the install command may update pointer files such as `AGENTS.md` and `.github/copilot-instructions.md` so supported tools are redirected to the installed framework

- the CLI prints a suggestion to star the source repository after install if the framework was helpful

The install command:

- does not call the GitHub API for starring

- does not use the `gh` CLI for starring

- does not read GitHub auth tokens for starring

- does not modify the user's GitHub account in any way
As with any repository-writing tool, review changes before committing them, especially when using `--force`.

### One simple example flow

A typical workflow looks like this:

1. Install the package globally:

```bash
npm install -g @rudinmax87/united-we-stand
```

2. Install the framework inside your repository:

```bash
united-we-stand install
```

3. In a new chat in your supported AI tool, initialize the branch:

```text
AGENTS.md initialize this branch for adding OAuth login. Only do the initialization step.
```

4. Continue through the numbered workflow stages in chat:

```text
plan this feature
design the architecture for this change
implement this now
do a code review
wrap this up
```

5. At any point, ask for status:

```text
what is the current status of united-we-stand
```

`0-status-checker` is a routing and validation stage, not a delivery stage. After initialization, simple prompts such as `lets move to the next step`, `next step`, or `do the next step` should move the AI framework to the next numbered stage.

## Creating Your Own Package

If you want to generate and publish your own package variant of this framework, follow [the maintainer guide](https://github.com/mrudinal/united-we-stand-framework/blob/main/docs/generate-your-own-package.md).

## Contents in this repository

### What This Repository Contains

- `src/`
  - CLI entrypoint, commands, and library code
- `.united-we-stand/`
  - framework markdown assets that are installed into target repositories
- `tests/`
  - unit, integration, and built-CLI smoke coverage
- `scripts/`
  - maintainer scripts, including GitHub publish artifact preparation
- `public/`
  - repository-local static assets such as the project logo used in this README
- `VERSIONS.md`
  - manual package version history and release notes

## Repository Layout

```text
repo-root/
|-- .united-we-stand/
|-- public/
|-- scripts/
|-- src/
|   |-- cli.tsx
|   |-- index.tsx
|   |-- commands/
|   `-- lib/
|-- tests/
|-- LICENSE
|-- package-lock.json
|-- package.json
|-- README.md
|-- VERSIONS.md
|-- tsconfig.json
`-- vitest.config.ts
```

# License

This project is licensed under the **MIT License**.

That means you may use it, copy it, modify it, merge it, publish it, distribute it, sublicense it, and/or sell copies of it, subject only to the conditions of the MIT License itself.

Those MIT conditions are:

1. The copyright notice must be included in copies or substantial portions of the software.
2. The software is provided **as is**, without warranty of any kind.

There are **no additional legal restrictions beyond MIT**.

See the [LICENSE](./LICENSE) file for the full legal text.

### Permissions

| Permission | Allowed |
|---|---|
| Personal use | ✔ |
| Commercial use | ✔ |
| Modification | ✔ |
| Distribution | ✔ |
| Private use | ✔ |
| Sublicensing | ✔ |
| Warranty or liability from the maintainer | ✖ |

**Commercial use is explicitly permitted.** You may use this package and its installed framework files in commercial products, client projects, internal enterprise tools, or any paid service without restriction and without requiring a separate commercial license.

### Community Terms

The following are **community requests and project norms**, not additional legal license conditions.

#### Public Use and Participation

This framework is public and free for anyone to use, evaluate, and deploy. You are actively invited to try it, give feedback, and adapt it to your own workflows.

- **Forks are welcome.** Fork this repository freely for personal use, team use, or to build something new.
- **Pull requests are welcome.** If you find a bug or want to improve the framework, open a PR. PRs that fix broken behavior are reviewed with priority.
- **Bug fixes take priority over new features.** The stability and correctness of the framework model comes before expanding its scope. A broken workflow rule or incorrect CLI behavior will be addressed before a new agent or command is added.
- **Feature requests are accepted as issues.** If you have a feature idea, open an issue. There is no guarantee of implementation, but well-reasoned requests are considered.

#### Derived Works and Attribution (requested, not required)

If you publish a framework, package, tool, or product that is substantially based on or inspired by `united-we-stand`, attribution is appreciated.

Suggested credit information:

| Field | Suggested value |
|---|---|
| Author / maintainer username | `mrudinal` |
| Package name and version | `@rudinmax87/united-we-stand@<version you based your work on>` |
| Source repository URL | `https://github.com/mrudinal/united-we-stand-framework` |

Suggested credit format:

```text
Based on @rudinmax87/united-we-stand@<version> by mrudinal
https://github.com/mrudinal/united-we-stand-framework
```

# Versioning

This project follows **Semantic Versioning** (`MAJOR.MINOR.PATCH`):

- `PATCH` — backwards-compatible bug fixes
- `MINOR` — backwards-compatible new features or agents
- `MAJOR` — breaking changes to the CLI interface, framework file layout, or workflow model

You can safely pin a minor version (e.g., `^0.1.0`) and expect patch updates to be non-breaking within that range.

# No Warranty

This software is provided as-is. The MIT License explicitly disclaims all warranties. Use it in production at your own discretion. Bugs will be addressed but there is no SLA or guaranteed response time.
