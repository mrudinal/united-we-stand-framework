# .united-we-stand

This folder is the installed runtime framework for `united-we-stand`.

It is meant for people using the package inside their repositories.

## Install The Package

Install the package globally:

```bash
npm install -g @mrudinal/united-we-stand
```

Requirements:

- Node.js 18+
- git

## Use It In A Repository

Go to the target repository:

```bash
cd /path/to/your-repository
```

Install the framework files:

```bash
united-we-stand install
```

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
- future stage files may exist as templates before those stages are started
- `4-implementer` is the first framework stage allowed to change code
- standalone specialist agents are separate from the numbered framework stages

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
