# united-we-stand

Repo-scoped AI workflow framework that stores persistent markdown context in your repository.

## What It Installs

`united-we-stand install` writes:

- `AGENTS.md` (managed block)
- `.github/copilot-instructions.md` (managed block)
- `.united-we-stand/README.md`
- `.united-we-stand/framework/**/*.md`
- `.united-we-stand/steering/**/*.md`
- `.united-we-stand/agents/**/*.md`
- `.united-we-stand/playbooks/**/*.md`

`united-we-stand branch-init "<idea>"` then creates:

- `.spec-driven/<sanitized-current-branch>/**`

Runtime note:

- `install --force` recreates `.united-we-stand/**` safely and does not modify `.spec-driven/**`.

## Installation

```bash
npm install -g united-we-stand
```

Requirements: Node.js 18+ and git.

## Usage

```bash
# install framework files in current git repo
united-we-stand install

# initialize branch memory
united-we-stand branch-init "Add JWT-based authentication"

# initialize branch memory in detached HEAD with explicit branch name
united-we-stand branch-init --branch feature/auth "Add JWT-based authentication"

# recreate missing framework files and refresh managed blocks
united-we-stand refresh

# run health checks
united-we-stand doctor

# run branch health checks for explicit branch name
united-we-stand doctor --branch feature/auth
```

`branch-init` requires framework files to already exist (run `install` first).

Common options:

- `--cwd <path>`
- `--dry-run`
- `branch-init --branch <name>` (override branch detection; useful in detached HEAD)
- `doctor --branch <name>` (check branch memory for explicit branch name)
- `install --force` (overwrite installed framework files)

## Recommended Repository Tree

```text
repo-root/
|-- AGENTS.md
|-- README.md
|-- .github/
|   `-- copilot-instructions.md
|-- .united-we-stand/
|   |-- README.md
|   |-- framework/
|   |   |-- 00-index.md
|   |   |-- 01-core-rules.md
|   |   |-- 02-state-model.md
|   |   |-- 03-stage-lifecycle.md
|   |   |-- 04-command-routing.md
|   |   |-- 05-conflict-resolution.md
|   |   |-- 06-spec-writing-standard.md
|   |   |-- 07-definition-of-done.md
|   |   |-- 08-skip-force-policy.md
|   |   |-- 09-traceability-model.md
|   |   |-- 10-review-model.md
|   |   |-- 11-glossary.md
|   |   `-- profiles/
|   |       |-- 00-profile-selection.md
|   |       |-- generic.md
|   |       |-- javascript-typescript.md
|   |       |-- python.md
|   |       |-- go.md
|   |       |-- java.md
|   |       |-- csharp.md
|   |       |-- rust.md
|   |       |-- php.md
|   |       |-- ruby.md
|   |       |-- web-app.md
|   |       |-- api-service.md
|   |       |-- cli-tool.md
|   |       |-- library-package.md
|   |       |-- mobile-app.md
|   |       `-- data-pipeline.md
|   |-- steering/
|   |   |-- 00-index.md
|   |   |-- product-steering.md
|   |   |-- architecture-steering.md
|   |   |-- coding-steering.md
|   |   |-- testing-steering.md
|   |   |-- security-steering.md
|   |   |-- observability-steering.md
|   |   |-- documentation-steering.md
|   |   |-- ux-steering.md
|   |   |-- data-steering.md
|   |   `-- repo-conventions.md
|   |-- agents/
|   |   |-- 0-status-checker.md
|   |   |-- 1-initializer.md
|   |   |-- 2-planner.md
|   |   |-- 3-designer.md
|   |   |-- 4-implementer.md
|   |   |-- 5-code-reviewer.md
|   |   |-- 6-finalizer.md
|   |   |-- debugger.md
|   |   |-- documentation-writer.md
|   |   |-- project-manager.md
|   |   |-- refactorer.md
|   |   |-- test-strategist.md
|   |   |-- performance-reviewer.md
|   |   |-- accessibility-reviewer.md
|   |   |-- api-contract-writer.md
|   |   |-- data-modeler.md
|   |   |-- migration-planner.md
|   |   |-- observability-reviewer.md
|   |   `-- release-coordinator.md
|   `-- playbooks/
|       |-- 00-index.md
|       |-- greenfield-feature.md
|       |-- existing-feature-enhancement.md
|       |-- bugfix.md
|       |-- refactor.md
|       |-- migration.md
|       |-- security-hotfix.md
|       |-- docs-only-change.md
|       |-- data-model-change.md
|       |-- api-change.md
|       |-- ui-ux-change.md
|       `-- release-preparation.md
`-- .spec-driven/
    `-- <sanitized-current-branch>/
        |-- 00-current-status.md
        |-- 01-init.md
        |-- 02-plan.md
        |-- 03-design.md
        |-- 04-implementation.md
        |-- 05-code-review.md
        |-- 06-finalization.md
        |-- 07-decisions.md
        |-- 08-traceability.md
        |-- 09-risks-issues.md
        |-- 10-test-strategy.md
        |-- 11-change-log.md
        |-- 12-handoff.md
        |-- 13-retrospective.md
        |-- modules/
        |   `-- example-module.md
        |-- api/
        |   |-- contracts.md
        |   |-- endpoints.md
        |   `-- auth-boundaries.md
        |-- data/
        |   |-- schema-notes.md
        |   |-- migrations.md
        |   `-- data-boundaries.md
        `-- ux/
            |-- user-flows.md
            |-- screen-states.md
            `-- copy-notes.md
```

## Managed Block Behavior

`AGENTS.md` and `.github/copilot-instructions.md` are maintained with markers:

```markdown
<!-- united-we-stand:start -->
...managed content...
<!-- united-we-stand:end -->
```

Rules:

- Missing file: created.
- Existing file with no marker: block appended.
- Existing file with marker: only marker block replaced.
- Content outside marker block is preserved.

## Development

```bash
npm install
npm run build
npm test
```

## License

MIT
