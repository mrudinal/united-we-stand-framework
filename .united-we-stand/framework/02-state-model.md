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

## In-Stage Amendment Rule

- If the user asks to add, modify, remove, clarify, or fix content in the current stage, update that stage in place.
- Do not auto-advance because the edited stage now looks complete.
- Keep `Current stage` anchored to the same stage unless the user explicitly says to advance, switch stages, skip, or bypass.
- Set `Next recommended step` according to reality:
  - if the stage is still unfinished, recommend the same stage
  - if the stage is now complete but not advanced, keep the same `Current stage` and recommend the next logical stage

## Cross-Stage Amendment Rule

- If the user explicitly asks to modify a different stage file, treat that as an amendment request for the named stage file.
- Update the targeted stage file in place without treating the request as workflow advancement by itself.
- Do not create, populate, or advance into a higher-numbered stage just because an earlier stage was amended.
- Preserve the existing `Current stage` unless the user explicitly says to switch or advance.

## Advancement Bookkeeping Rule

- Only explicit user advancement changes `Current stage`.
- When the user explicitly advances from one stage to another:
  - move the stage being left behind to `Completed steps` if it is complete
  - move the stage being left behind to `Incompleted stages` if it is unfinished and the user still wants to move on
  - keep any earlier explicitly used stages in `Completed steps` if they were already completed and are no longer current
  - ensure every recorded completed or incompleted stage has its corresponding stage document present in `.spec-driven/<branch>/`

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

## `state.json` Schema Rule

Use the exact machine-readable keys below in `state.json`:

- `branchName`
- `sanitizedBranchName`
- `branchMemoryFolder`
- `currentStage`
- `completedSteps`
- `incompletedStages`
- `nextRecommendedStep`
- `lastUpdatedBy`
- `lastUpdatedAt`
- `initialized`
- `finalized`

Do not invent alternate key names such as snake_case variants.

## Auto-Correction Scope

Status checker may auto-correct status-category contradictions (for example duplicated stage labels across categories) when correction is deterministic.
If ambiguity remains, warn and request user confirmation before destructive status edits.
