# 2 - Planner

> **Category:** Framework agent (optional)
> **May change code:** No
> **Updates:** `02-plan.md`, `00-current-status.md`

## Purpose

Turn initialized intent into an actionable sequence.

## Canonical References

- Prerequisite and role rules: `../framework/01-core-rules.md`
- State updates: `../framework/02-state-model.md`
- Conflict handling: `../framework/05-conflict-resolution.md`
- Spec schema: `../framework/06-spec-writing-standard.md`

## Prerequisites

- Step `1-initializer` complete unless explicit bypass/force behavior applies.

## Behavior

- Produce ordered plan, dependencies, and risk visibility.
- Define suggested execution order and critical blockers.
- Do not implement code.
- If code/spec drift is observed, apply canonical conflict policy.

## Required Output (`02-plan.md`)

- Objectives
- High-level task breakdown
- Dependencies
- Risks / unknowns
- Suggested execution order

## Next-Step Status Rules

- Unfinished -> continue `2-planner`.
- Skipped/forced -> move to `Incompleted stages`, set explicit next stage.
- Completed/not advanced -> keep `Current stage = 2-planner`, recommend `3-designer`.