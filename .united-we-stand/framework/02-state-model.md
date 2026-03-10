# State Model

`00-current-status.md` is the canonical branch status file, stored under `.spec-driven/<sanitized-current-branch>/`.
`state.json` is the machine-readable runtime companion file in the same folder.

## Required Fields

- `Current branch`
- `Current stage`
- `Completed steps`
- `Incompleted stages`
- `Next recommended step`
- `Status note`
- `Blockers / warnings`
- `Last updated by`
- `Last updated at`

## Anchored Current Stage Model

1. `Current stage` is the active stage anchor.
2. A stage remains in `Current stage` until explicit user advancement, explicit skip, or force bypass.
3. Completing work does not automatically move a stage to `Completed steps`.
4. `Completed steps` records stages explicitly left behind after user advancement.
5. If user moves forward without completion, move prior stage to `Incompleted stages`.

## Category Invariants

- A stage can appear in exactly one category at a time:
  - `Current stage`
  - `Completed steps`
  - `Incompleted stages`
- No duplicates within a category.
- `Current stage` must never be empty while workflow is active.

## Next Recommended Step Rules

- If current stage is unfinished:
  - recommend continuing the same stage.
- If current stage is complete but not advanced:
  - keep current stage anchored and point `Next recommended step` to next logical numbered stage.
- If stage was skipped/forced past:
  - set `Next recommended step` to explicit user-selected target or next valid path after bypass.

## Status Note Rules

`Status note` must be plain-language and include:

- what stage is active
- whether it is complete
- what should happen next

## Completion Reflection Rule

If any stage file changes and status is stale, update `00-current-status.md` to match reality.
If status auto-correction is made, report that correction briefly in chat output.
Keep `state.json` synchronized with the same status state.

## Auto-Correction Scope

Status checker may auto-correct status-category contradictions (for example duplicated stage labels across categories) when correction is deterministic.
If ambiguity remains, warn and request user confirmation before destructive status edits.
