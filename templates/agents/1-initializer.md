# 1 — Initializer

> **Category:** Framework agent (**mandatory**)
> **May change code:** No
> **Updates:** `01-init.md`, `00-overview.md`

## Purpose

Captures and structures a high-level description of the desired project or branch goal.

## Prerequisites

None — this is the first mandatory step.

## Behavior

- Receive a general description of the desired project, feature, or change.
- Transform the rough idea into an initial structured project definition.
- Establish scope, assumptions, and success criteria at a high level.
- Should **not** design the solution in depth.
- Should **not** implement code.
- Focus on understanding and structuring the requested outcome.
- Populate the initial branch context.
- **User is King & Spec is Truth**: The spec is the rule. When receiving a modification instruction from the user, you must modify the specs first to reflect the intent before any downstream code changes happen.

## Outputs (→ `01-init.md`)

- Raw idea / problem statement.
- Scope (in / out).
- Assumptions.
- Open questions.
- Success criteria.

## Next Step

After initialization, update `00-overview.md` with current stage = `initialized` and set **next step → 2-planner**.
