# .united-we-stand

This folder is the installed runtime framework for `united-we-stand`.

It is meant for people using the package inside their repositories.

## Install The Package

If you are installing from GitHub Packages, authenticate npm first.

### 1. Create a GitHub personal access token (classic)

Create a token with at least:

- `read:packages`

If the package is tied to a private repository and your account needs repository access through the token, also include the repository permissions required by your GitHub account setup.

### 2. Authenticate npm to GitHub Packages

Option A: add your token to `~/.npmrc`

```ini
@mrudinal:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_PAT_CLASSIC
```

Option B: log in with npm

```bash
npm login --scope=@mrudinal --auth-type=legacy --registry=https://npm.pkg.github.com
```

When prompted, use:

- Username: your GitHub username
- Password: your GitHub personal access token (classic)
- Email: your GitHub account email

### 3. Install the package globally

```bash
npm install -g @mrudinal/united-we-stand
```

Requirements:

- Node.js 18+
- git

If your scope mapping is not already in `~/.npmrc`, you can also install with the registry flag explicitly:

```bash
npm install -g @mrudinal/united-we-stand --registry=https://npm.pkg.github.com
```

### 4. Verify the CLI is available

```bash
united-we-stand --version
```

## Use It In A Repository

Go to the target repository:

```bash
cd /path/to/your-repository
```

Install the framework files:

```bash
united-we-stand install
```

Reset the framework back to the defaults and overwrite everything under `.united-we-stand/`:

```bash
united-we-stand install --force
```

Use `install --force` when you want to discard local edits to the installed framework and restore the default framework files shipped by the package. Treat `.united-we-stand/` as resettable package content, not as the place for branch-specific working memory. Branch-specific and request-specific custom rules, decisions, notes, and execution state should live under `.spec-driven/<branch-folder>/` in the files created by `branch-init`.

Initialize branch memory for the branch you are working on:

```bash
united-we-stand branch-init "Describe the change you want to make"
```

If you are in detached HEAD, provide the branch name explicitly:

```bash
united-we-stand branch-init --branch feature/my-change "Describe the change you want to make"
```

Check the repository health:

```bash
united-we-stand doctor
```

Check a specific branch explicitly:

```bash
united-we-stand doctor --branch feature/my-change
```

Refresh missing framework files and managed blocks:

```bash
united-we-stand refresh
```

## Typical First-Time Flow

```bash
git checkout -b feature/my-change
united-we-stand install
united-we-stand branch-init "Describe the change you want to make"
united-we-stand doctor
```

## What Gets Installed

`united-we-stand install` writes:

- `AGENTS.md`
- `.github/copilot-instructions.md`
- `.united-we-stand/**`

`united-we-stand install --force` resets the installed framework back to the package defaults and overwrites the shipped files under:

- `.united-we-stand/**`

Use that when `.united-we-stand/` was edited locally and you want the default framework back.

`united-we-stand branch-init` writes:

- `.spec-driven/<branch-folder>/**`
- `.spec-driven/.branch-routing.json` when a branch uses a non-default folder mapping

## Runtime Branch Memory

Runtime branch memory is intentionally stored outside this folder at:

- `.spec-driven/<sanitized-branch>/`
- `.spec-driven/.branch-routing.json`
- `.spec-driven/<sanitized-branch>/state.json`

`state.json` is the machine-readable branch record and includes:

- original branch name
- sanitized branch name
- resolved branch memory folder
- current workflow stage
- completed and incompleted stages
- next recommended step
- update metadata

Fresh `branch-init` creates the branch folder, captures the raw idea in `01-init.md`, and leaves the branch in active `1-initializer` mode until initializer content is completed.

Keep branch-specific and request-specific working context in `.spec-driven/<branch-folder>/`. The installed `.united-we-stand/` directory should be treated as the default framework layer that can be refreshed or reset back to package defaults.

## What To Read First

Normal read order after installation:

1. repository `AGENTS.md`
2. `.united-we-stand/framework/00-index.md`
3. relevant profile docs under `.united-we-stand/framework/profiles/`
4. relevant steering docs under `.united-we-stand/steering/`
5. branch runtime files under `.spec-driven/<branch-folder>/`

## Framework Stage Order

The numbered framework stages are:

0. `0-status-checker`: inspect workflow state, detect gaps, validate consistency, and route the next correct action
1. `1-initializer`: capture the branch intent, scope, assumptions, open questions, and success criteria
2. `2-planner`: turn initialized intent into an ordered execution plan with dependencies and risks
3. `3-designer`: define architecture, interfaces, boundaries, and implementation approach before coding
4. `4-implementer`: make the code changes and record what changed plus how it was validated
5. `5-code-reviewer`: review implementation quality, security, test sufficiency, and remaining issues
6. `6-finalizer`: summarize delivered scope, known gaps, follow-up actions, and documentation updates

### Proper Order

Normal workflow order:

1. `1-initializer`
2. `2-planner`
3. `3-designer`
4. `4-implementer`
5. `5-code-reviewer`
6. `6-finalizer`

`0-status-checker` is a routing and validation stage, not a delivery stage.

### Mandatory vs Optional

Mandatory framework stages:

- `1-initializer`
- `4-implementer`

Optional framework stages:

- `0-status-checker`
- `2-planner`
- `3-designer`
- `5-code-reviewer`
- `6-finalizer`

### Important Workflow Rules

- a fresh branch starts in active `1-initializer` mode
- the current stage stays anchored until the user explicitly advances or bypasses it
- adding or modifying content inside a stage does not advance that stage by itself
- if you ask to change planning, init, design, review, or finalization content, the AI should update that stage in place without creating the next stage
- future stage files may exist as templates before those stages are started
- `4-implementer` is the first framework stage allowed to change code
- standalone specialist agents are separate from the numbered framework stages

## CLI Commands vs Chat Commands

There are only four CLI commands:

- `united-we-stand install`
- `united-we-stand branch-init "Describe the change"`
- `united-we-stand refresh`
- `united-we-stand doctor`

There are no CLI subcommands for the numbered framework stages such as `united-we-stand planner` or `united-we-stand finalizer`.

The numbered stages are meant to be called from the AI chat, not from the CLI.

## Using Natural Language In Chat

You can talk to the AI very naturally. You do not need rigid command syntax as long as the intent is clear.

Examples:

- `initialize this branch for adding OAuth login`
- `let's start this`
- `help me with the following idea, i want a community tab`
- `i want to build a community section`
- `i want to create an admin login flow`
- `let's work on the admin login flow`
- `plan this feature`
- `design the architecture for this change`
- `implement this now`
- `do a code review`
- `wrap this up`
- `what's my status`
- `continue`
- `next step`

The framework is designed to route short natural requests such as `continue`, `fix it`, `implement this`, `review this`, and `check for gaps` to the nearest safe workflow action.
If you ask to modify a specific stage, for example `add this in planning` or `update init`, that should be treated as an in-place stage amendment and not as permission to auto-advance to the next stage.
If branch memory does not exist yet, an explicit request such as `init the following` or `initialize this` should be treated as permission to create the branch spec and start `1-initializer`.
If branch memory does not exist yet, broader natural phrases such as `let's start this`, `help me with the following idea, i want...`, `i want to build...`, `i want to create...`, or `let's work on...` should also default to `1-initializer` unless you explicitly ask for a later stage.

## Framework Stage Chat Routes

Examples for each numbered stage:

- `initialize this` -> `1-initializer`
- `init the following` -> `1-initializer`
- `plan this` -> `2-planner`
- `design this` -> `3-designer`
- `implement this` -> `4-implementer`
- `review this` or `do a code review` -> `5-code-reviewer`
- `finalize this` or `wrap this up` -> `6-finalizer`

More example prompts:

- `initialize this branch for adding OAuth login`
- `let's start this`
- `help me with the following idea, i want a community tab`
- `i want to build a community section`
- `i want to create an admin login flow`
- `let's work on the admin login flow`
- `plan this feature`
- `design the architecture for this change`
- `implement this now`
- `do a code review`
- `wrap this up`

Related status and progression prompts:

- `what's my status`
- `show my status`
- `check for gaps`
- `continue`
- `next step`
- `do the next step`

## Direct Chat Routes

Framework-stage routes:

- `what's my status` -> `0-status-checker`
- `show my status` -> `0-status-checker`
- `check for gaps` -> `0-status-checker`
- `initialize this` -> `1-initializer`
- `init the following` -> `1-initializer`
- `let's start this` -> `1-initializer` when branch memory does not exist yet
- `help me with the following idea, i want...` -> `1-initializer` when branch memory does not exist yet
- `i want to build...` -> `1-initializer` when branch memory does not exist yet
- `i want to create...` -> `1-initializer` when branch memory does not exist yet
- `let's work on...` -> `1-initializer` when branch memory does not exist yet
- `plan this` -> `2-planner`
- `design this` -> `3-designer`
- `implement this` -> `4-implementer`
- `review this` -> `5-code-reviewer`
- `do a code review` -> `5-code-reviewer`
- `review quality` -> `5-code-reviewer` with quality scope
- `review security` -> `5-code-reviewer` with security scope
- `security compliance check` -> `5-code-reviewer` with security scope
- `finalize this` -> `6-finalizer`
- `wrap this up` -> `6-finalizer`

Standalone specialist routes:

- `debug this` -> `debugger`
- `document this` -> `documentation-writer`
- `manage this project` -> `project-manager`
- `refactor this` -> `refactorer`
- `plan tests for this` -> `test-strategist`
- `check performance` -> `performance-reviewer`
- `check accessibility` -> `accessibility-reviewer`
- `write api contracts` -> `api-contract-writer`
- `model the data` -> `data-modeler`
- `plan migration` -> `migration-planner`
- `review observability` -> `observability-reviewer`
- `prepare release` -> `release-coordinator`

Standalone route examples:

- `debug this failing branch-init flow`
- `document this install process`
- `refactor this CLI without changing behavior`
- `plan tests for this doctor command`
- `write api contracts for the new endpoint`
- `prepare release for this package`

## Standalone Agents

Standalone agents can be used at any time when the task needs specialized help. They do not automatically become framework stages.

- `debugger`: investigate failures, isolate likely causes, and propose or implement minimal fixes when asked
- `documentation-writer`: write or improve documentation without automatically changing framework stage files
- `project-manager`: summarize scope, blockers, milestones, dependencies, and coordination needs
- `refactorer`: plan or execute structural improvements while preserving behavior
- `test-strategist`: design proportionate test strategy and identify critical test coverage gaps
- `performance-reviewer`: review latency, throughput, memory, and performance hotspots
- `accessibility-reviewer`: review accessibility concerns for UI work, including semantics and navigation
- `api-contract-writer`: define API request/response boundaries, contracts, and field exposure rules
- `data-modeler`: design or review schemas, migrations, and data boundaries
- `migration-planner`: plan safe technical or data migrations, including rollback and compatibility concerns
- `observability-reviewer`: review logging, metrics, tracing, and operational diagnosability
- `release-coordinator`: prepare release-readiness summaries, rollout notes, and follow-up actions

## Layers

- `framework/`: canonical reusable workflow rules
- `steering/`: repository-specific steering
- `agents/`: numbered framework agents plus standalone specialists
- `playbooks/`: scenario-specific routing guides
