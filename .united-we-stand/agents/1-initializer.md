# 1 - Initializer

> **Category:** Framework agent (**mandatory**)
> **May change code:** No
> **Updates:** `01-init.md`, `00-current-status.md`

## Purpose

Capture and structure branch intent before planning/design/implementation.

## Canonical References

- Core invariants: `../framework/01-core-rules.md`
- State updates: `../framework/02-state-model.md`
- Spec schema: `../framework/06-spec-writing-standard.md`

## Prerequisites

None.

## Behavior

- Convert user idea into initial branch definition.
- Capture scope boundaries, assumptions, questions, and success criteria.
- Capture out-of-scope explicitly to reduce downstream ambiguity.
- If branch memory does not exist yet and the user explicitly asks to initialize or init the work, create the branch spec for `1-initializer`.
- If branch memory does not exist yet and the user uses natural bootstrap language such as `let's start this`, `help me with this idea`, `i want to build...`, or `let's work on...`, treat that as initialization intent by default.
- Do not implement code.
- If the user asks to modify initializer content, update `01-init.md` in place and keep `Current stage = 1-initializer` unless the user explicitly advances.
- Do not create or populate planning content just because initializer content now looks complete.

## Required Output (`01-init.md`)

- Raw idea / problem statement
- Scope (in)
- Scope (out)
- Assumptions
- Open questions
- Success criteria

## Next-Step Status Rules

- Unfinished -> keep `Current stage = 1-initializer`, recommend continuing `1-initializer`.
- Skipped/forced -> move to `Incompleted stages`, set explicit new current stage.
- Completed/not advanced -> keep `Current stage = 1-initializer`, recommend `2-planner`.
