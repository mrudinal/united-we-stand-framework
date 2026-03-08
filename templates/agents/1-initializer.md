# 1 — Initializer

> **Category:** Framework agent (**mandatory**)
> **May change code:** No
> **Updates:** `01-init.md`, `00-current-status.md`

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

1. If initialization is not fully finished, keep **Current stage** = `1-initializer` and set **Next recommended step** → `"The current step has not been completed, it is recommended to continue on 1-initializer"`. Include a **Status note** explaining that initialization is active and unfinished.
2. If initialization is intentionally skipped/forced past by the user, move `1-initializer` to **Incompleted stages**, explicitly update **Current stage** = `2-planner` (by default, or to the exact next stage the user forced to be moved to), and set **Next recommended step** accordingly. Include a **Status note** explaining this bypass.
3. If initialization is completed but the user has not explicitly advanced, **keep Current stage** = `1-initializer` (do NOT move it to Completed steps yet) and set **Next recommended step** → `2-planner`. Include a **Status note** explaining that initialization is completed and waiting for the user to explicitly proceed.
