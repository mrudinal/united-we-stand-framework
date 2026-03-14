# Versions

## 0.1.0

`0.1.0` is the initial published version of `united-we-stand`.

This version establishes the package as a repo-scoped AI workflow framework distributed as a CLI. It is designed to be installed into an existing git repository so an AI assistant can work with persistent branch-aware context instead of relying only on chat memory.

### What this version does

This version provides:

- a CLI named `united-we-stand`
- installable framework assets under `.united-we-stand/`
- persistent branch-aware runtime state under `.spec-driven/`
- deterministic markdown-based workflow guidance for AI-assisted development
- reusable stage agents, specialist agents, playbooks, profiles, and steering documents

The main idea in `0.1.0` is that the framework separates:

- reusable framework rules in `.united-we-stand/`
- branch-specific working memory in `.spec-driven/<branch-folder>/`

That means a repository can refresh or reset framework assets while keeping branch work and workflow state separate.

### CLI commands in 0.1.0

This version ships four CLI commands:

#### `united-we-stand install`

Installs the framework files into a target git repository.

It writes:

- `AGENTS.md`
- `.github/copilot-instructions.md`
- `.agents/workflows/united-we-stand.md`
- `.cursor/rules/united-we-stand.mdc`
- `.united-we-stand/**`

It supports `--force` so the installed framework content can be overwritten with the package defaults.

#### `united-we-stand branch-init`

Initializes branch-specific runtime state for the current branch, or for a branch explicitly provided with `--branch`.

It creates the initial branch memory files:

- `.spec-driven/<branch-folder>/00-current-status.md`
- `.spec-driven/<branch-folder>/01-init.md`
- `.spec-driven/<branch-folder>/state.json`

This command is branch-aware, protects against detached `HEAD` misuse, and includes branch-folder collision protection.

#### `united-we-stand doctor`

Checks repository health for both:

- installed framework files
- branch-specific runtime/spec files

It validates file presence, status metadata, runtime state consistency, stage/file alignment, and whether required stage sections have substantive content when a stage claims to be complete enough to move forward.

#### `united-we-stand refresh`

Re-applies managed blocks and recreates missing framework files while preserving existing custom files whenever possible.

### Framework model in 0.1.0

This version introduces a staged, spec-driven workflow intended for AI collaboration.

The numbered workflow stages are:

1. `1-initializer`
2. `2-planner`
3. `3-designer`
4. `4-implementer`
5. `5-code-reviewer`
6. `6-finalizer`

It also includes:

- `0-status-checker` as the routing and validation stage

The workflow is designed around these core ideas:

- branch specs are durable working memory
- stages stay anchored until the user explicitly advances or bypasses them
- earlier-stage edits do not silently auto-advance later stages
- implementation is the first numbered stage allowed to change code
- workflow state should be traceable in both markdown and machine-readable form

### Runtime branch memory in 0.1.0

This version defines runtime branch memory outside the framework folder itself.

The key branch runtime location is:

- `.spec-driven/<sanitized-branch>/`

Important files in that folder:

- `00-current-status.md`: human-readable workflow state
- `01-init.md`: captured branch intent and scope
- `state.json`: machine-readable workflow state

The status and state model track:

- current branch
- sanitized branch id
- current stage
- completed steps
- incompleted stages
- next recommended step
- last updated metadata
- initialization/finalization flags

### Installed framework content in 0.1.0

This version installs a full documentation/runtime layer under `.united-we-stand/`.

The main sections are:

- `framework/`: canonical reusable workflow rules
- `steering/`: repo-specific guidance categories
- `agents/`: numbered framework stages and specialist agents
- `playbooks/`: scenario-specific routing guides
- `spec-driven/branch-template/`: branch-file templates used by initialization

### Framework stage agents included in 0.1.0

This version ships these numbered framework agents:

- `0-status-checker`
- `1-initializer`
- `2-planner`
- `3-designer`
- `4-implementer`
- `5-code-reviewer`
- `6-finalizer`

Their responsibilities at a high level are:

- `0-status-checker`: inspect workflow state, detect gaps, validate consistency, and route the safest next action
- `1-initializer`: capture raw idea, scope, assumptions, open questions, and success criteria
- `2-planner`: turn initialized intent into an ordered execution plan with dependencies and risks
- `3-designer`: define architecture, boundaries, interfaces, and design decisions before coding
- `4-implementer`: make code changes and record what changed plus how it was validated
- `5-code-reviewer`: review implementation quality, security, testing, and unresolved issues
- `6-finalizer`: summarize delivered scope, known gaps, follow-up work, and documentation updates

### Specialist agents included in 0.1.0

This version also ships standalone specialist agents that can be invoked without automatically becoming numbered framework stages.

Included specialist agents:

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

These allow the framework to support more specialized tasks such as:

- debugging failures
- writing documentation
- refactoring without behavior changes
- planning test coverage
- reviewing performance or accessibility
- defining API contracts
- modeling data and SQL schemas
- planning migrations
- reviewing observability
- preparing releases
- defining visual website direction

### Profiles included in 0.1.0

This version includes profile guidance so implementation and review can adapt to language and project type.

Examples of included profiles:

- `generic`
- `javascript-typescript`
- `python`
- `go`
- `java`
- `php`
- `ruby`
- `rust`
- `csharp`
- `api-service`
- `cli-tool`
- `library-package`
- `web-app`
- `mobile-app`
- `data-pipeline`

The profile model is meant to let the framework combine:

- one general base profile
- one primary language profile
- one primary project-type profile

### Playbooks included in 0.1.0

This version includes scenario-based playbooks such as:

- `greenfield-feature`
- `existing-feature-enhancement`
- `bugfix`
- `refactor`
- `migration`
- `security-hotfix`
- `docs-only-change`
- `data-model-change`
- `api-change`
- `ui-ux-change`
- `release-preparation`

These playbooks help route the same framework differently depending on the kind of change the user is making.

### Key design decisions present in 0.1.0

This version establishes several important design choices:

- framework assets are template-driven and shipped inside the package
- branch runtime state lives outside the framework assets
- stage progression is explicit rather than automatic
- missing planning/design should trigger warnings before direct implementation
- detached `HEAD` and branch-folder collisions are guarded against
- both human-readable and machine-readable state are maintained
- doctor-style validation is part of the product from the beginning

### Summary of 0.1.0

Version `0.1.0` is the foundational release of the project.

It already includes:

- a usable CLI
- framework installation and refresh behavior
- branch initialization and branch routing support
- runtime state validation through `doctor`
- numbered workflow stages
- specialist agents
- profiles
- playbooks
- publish support for npm and GitHub Packages

In short, `0.1.0` is the base release that defines how `united-we-stand` works as a branch-aware, markdown-driven AI workflow framework for software repositories.
