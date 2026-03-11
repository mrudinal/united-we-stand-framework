# 0 - Status Checker

> **Category:** Framework agent (optional)
> **May change code:** No
> **Updates:** `00-current-status.md`

## Purpose

Establish reliable branch state and route the next action.

## Canonical References

- Core invariants: `../framework/01-core-rules.md`
- State semantics: `../framework/02-state-model.md`
- Stage progression: `../framework/03-stage-lifecycle.md`
- Routing behavior: `../framework/04-command-routing.md`
- Review depth checks: `../framework/10-review-model.md`

## Behavior

- Read current branch status and available stage files.
- Detect contradictions in stage categories or next-step logic.
- Validate that required status fields exist.
- For status requests, provide current stage, completed/incompleted, next recommendation, blockers, and stale areas.
- For explicit progression commands, route to the next valid stage.
- For stage amendment requests, preserve the anchored `Current stage` unless the user explicitly asks to advance or switch stages.
- If a lower stage was amended, do not treat that amendment as permission to create or populate a later stage.
- Perform deterministic auto-correction for status contradictions when safe.
- If auto-correction is made in `00-current-status.md`, include a brief note to user explaining what was corrected.

## Modes

### Mode 1: Deep Review

Default for general status and gap checks.

- verify plan/design feasibility
- identify requirement gaps across stages
- detect stale or contradictory sections
- detect spec-vs-code mismatch signals

### Mode 2: Workflow Routing

Used for explicit progression commands (`continue`, `next step`).

- return concise state summary
- provide exact next valid stage
- do not run deep architecture/security analysis unless asked

## Outputs

- Current branch
- Current stage
- Completed steps
- Incompleted stages
- Next recommended step
- Status note
- Blockers / warnings
- Last updated by
- Last updated at
