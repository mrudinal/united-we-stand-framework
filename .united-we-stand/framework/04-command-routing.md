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
4. Avoid conversational deadlocks: do useful work in the active stage instead of repeatedly asking for formal advancement when the user intent is already clear.

### `next step` / `do the next step` / `continue with the next step`

1. Run `0-status-checker`.
2. If current stage completed and prerequisites pass: advance to next numbered stage.
3. If current stage unfinished: report blocker unless user explicitly skips or uses force semantics.

## Stage Amendment Commands

Requests that explicitly ask to add, modify, update, remove, fix, clarify, or rewrite content inside a stage are amendment requests, not progression requests.

Examples:

- `add this in planning`
- `modify init`
- `update the design`
- `remove this from finalization`
- `fix the plan wording`

Routing behavior:

1. Update the targeted stage file in place.
2. Do not auto-advance to another stage.
3. Do not create or populate a higher-numbered stage from that request alone.
4. Keep `Current stage` anchored unless the user explicitly says to advance, switch stages, skip, or bypass.
5. Keep `state.json` and `00-current-status.md` aligned after the amendment.

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
Direct commands should not be blocked only because the user did not use formal advancement wording, as long as safety/prerequisite checks are satisfied.
If the user explicitly says to modify an existing stage rather than start or switch to it, treat that as a stage amendment command instead of a stage switch.

## Initialization Bootstrap Rule

If the user explicitly asks to initialize or init the work and branch memory does not exist yet:

1. Treat that as explicit permission to create the branch spec under `.spec-driven/<branch>/`.
2. Create or initialize the branch runtime files needed for `1-initializer`.
3. Capture the user-provided intent in `01-init.md`.
4. Keep the workflow anchored in `1-initializer` unless the user explicitly advances.
5. Still enforce detached HEAD safety and branch-folder collision safety.

Examples:

- `init the following`
- `initialize this`
- `initialize this branch for adding OAuth login`
- `let's start this`
- `help me with the following idea, i want...`
- `i want to build...`
- `i want to create...`
- `let's work on...`

Interpretation rule:

- If branch memory does not exist yet, broad start-of-work phrases should route to `1-initializer` by default, not directly to planning, design, or implementation.
- Phrases about an idea, starting work, or wanting to build something should be treated as initialization intent unless the user explicitly asks for a later stage.

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

## Assist-First Rule

If a user says short commands such as `continue`, `fix it`, `implement this`, or `review quickly`:

- prioritize productive progress over workflow ceremony
- perform the nearest safe action for the active/target stage
- update status fields so the workflow remains traceable
- ask for explicit confirmation only when bypassing prerequisites or making risky/destructive changes
- do not treat `fix this in planning`, `update init`, or similar stage amendment requests as permission to advance stages

## Branch-Init Collision Rule

When branch-memory initialization would create a folder that already exists for a different branch context:

- ask user to confirm reuse, or
- ask user to provide a different folder name
- persist exceptions in `.spec-driven/.branch-routing.json`
