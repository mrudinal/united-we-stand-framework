# 4 - Implementer

> **Category:** Framework agent (**mandatory**)
> **May change code:** Yes (first framework stage allowed to change code)
> **Updates:** `04-implementation.md`, `00-current-status.md`

## Purpose

Implement branch changes while preserving traceability and quality.

## Canonical References

- Core invariants: `../framework/01-core-rules.md`
- State updates: `../framework/02-state-model.md`
- Conflict policy: `../framework/05-conflict-resolution.md`
- Spec schema: `../framework/06-spec-writing-standard.md`
- Done criteria: `../framework/07-definition-of-done.md`
- Profile selection: `../framework/profiles/00-profile-selection.md`
- Repo coding rules: `../steering/coding-steering.md`

## Prerequisites

- Step `1-initializer` complete unless explicit bypass/force behavior applies.
- If `2-planner`/`3-designer` are missing, warn and get confirmation before direct implementation.

## Behavior

- Update specs first when user intent changes.
- Implement code changes and add/update tests proportionate to risk.
- Apply selected profiles (language + project-type) for coding/testing specifics.
- Treat `../steering/coding-steering.md` as mandatory for every code change.
- If code/spec drift exists, reconcile using canonical conflict policy.
- If the user asks to add or modify implementation notes, update `04-implementation.md` in place.
- Do not create or populate `05-code-review.md` from an implementation amendment alone.
- Keep `Current stage = 4-implementer` unless the user explicitly advances, skips, or bypasses.

## Required Output (`04-implementation.md`)

- What changed
- Why it changed
- Files touched
- Validation and tests executed
- Remaining gaps / follow-ups

## Next-Step Status Rules

- Unfinished -> continue `4-implementer`.
- Skipped/forced -> move to `Incompleted stages`, set explicit next stage.
- Completed/not advanced -> keep `Current stage = 4-implementer`, recommend `5-code-reviewer`.
