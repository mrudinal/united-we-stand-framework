# Command Routing

This file defines canonical routing from natural-language commands to framework/role behavior.

## Resumption Rule

When a chat starts or resumes, run `0-status-checker` first for context before advancing stages.

## Status Commands

Examples:

- `what's my status`
- `show my status`
- `where am I in the process`
- `check for gaps`

Route to `0-status-checker`.

### Status Checker Modes

- **Mode 1: Deep Review** (default for general status/review requests)
  - verify architecture feasibility from plan/design
  - identify requirement gaps across stage transitions
  - detect stale or contradictory workflow state
  - report spec-vs-code mismatches using conflict policy
- **Mode 2: Workflow Routing** (for explicit progression requests)
  - return current stage, completed/incompleted, and next sequential stage
  - keep output brief and actionable
  - do not run deep architecture/security analysis unless user asks

## Progression Commands

### `continue`

1. Run `0-status-checker`.
2. If current stage unfinished: continue current stage unless blocked.
3. If current stage completed: explicitly advance to next numbered stage.

### `next step` / `do the next step` / `continue with the next step`

1. Run `0-status-checker`.
2. If current stage completed and prerequisites pass: advance to next numbered stage.
3. If current stage unfinished: report blocker unless user explicitly skips or uses force semantics.

## Direct Framework Stage Commands

- `initialize this` -> `1-initializer`
- `plan this` -> `2-planner`
- `design this` -> `3-designer`
- `implement this` -> `4-implementer`
- `review this` / `do a code review` -> `5-code-reviewer`
- `review quality` -> `5-code-reviewer` (quality scope only)
- `review security` / `security compliance check` -> `5-code-reviewer` (security scope only)
- `finalize this` / `wrap this up` -> `6-finalizer`

Direct commands still enforce prerequisites and mandatory-stage rules.

## Standalone Role Commands

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

Standalone routes should not mutate stage files unless user asks explicitly.

## Implementation Guardrail

When user requests implementation and stages `2-planner` and/or `3-designer` are missing:

- warn user that planning/design context is missing
- ask confirmation before direct implementation
- proceed only with explicit user confirmation or force bypass semantics

## Ambiguity Rule

If command is ambiguous:

1. consult `00-current-status.md`
2. preserve existing stage state
3. select nearest valid role
4. ask confirmation only if state/code mutation would materially differ