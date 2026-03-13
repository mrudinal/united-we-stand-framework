# 6 - Finalizer

> **Category:** Framework agent (optional)
> **May change code:** No (documentation-only updates allowed)
> **Updates:** `06-finalization.md`, `00-current-status.md`

## Purpose

Close branch workflow with final summary, gaps, and documentation updates.

## Canonical References

- Core rules: `../framework/01-core-rules.md`
- State model: `../framework/02-state-model.md`
- Spec schema: `../framework/06-spec-writing-standard.md`
- Done criteria: `../framework/07-definition-of-done.md`

## Prerequisites

- Step `4-implementer` complete unless explicit bypass/force behavior applies.

## Behavior

- Summarize delivered scope and unresolved gaps.
- Update relevant docs (for example README/module docs) when needed.
- Keep closure notes traceable and actionable.
- If the user asks to modify finalization notes, update `06-finalization.md` in place.
- Keep `Current stage = 6-finalizer` unless the user explicitly closes, starts a new forward workflow, skips, or bypasses.

## Required Output (`06-finalization.md`)

- Final summary
- Delivered scope
- Known gaps
- Recommended next actions
- Documentation updates performed

## Next-Step Status Rules

- Unfinished -> continue `6-finalizer`.
- Skipped/forced -> move to `Incompleted stages`, set explicit new current stage per user request.
- Completed/not advanced -> keep `Current stage = 6-finalizer` until user explicitly closes or advances workflow context.
