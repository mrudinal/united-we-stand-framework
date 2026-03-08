# 2 — Planner

> **Category:** Framework agent (optional)
> **May change code:** No
> **Updates:** `02-plan.md`, `00-current-status.md`

## Purpose

Convert the initialized project description into a concrete execution plan.
Define ordered steps, milestones, dependencies, and risks.
Identify which later stages are required.

## Prerequisites

- **Mandatory:** Step 1 (Initializer) must be completed first.
- If step 1 has not been run, warn the user and do not proceed unless `--force` is specified.

## Behavior

- Produce an actionable execution plan.
- Avoid making code changes.
- Avoid deep design unless necessary for planning.
- **User is King & Spec is Truth**: The spec is the rule. When receiving a modification instruction from the user, check the steps, modify `02-plan.md` (and other specs) if needed, and only then follow that spec for code. Resolve mismatches by aligning code to the spec.

## Outputs (→ `02-plan.md`)

- Execution plan with ordered steps.
- Milestone sequence.
- Dependencies.
- Risks.

## Next Step

1. If planning is not fully finished, keep **Current stage** = `2-planner` and set **Next recommended step** → `"The current step has not been completed, it is recommended to continue on 2-planner"`. Include a **Status note** explaining that planning is active and unfinished.
2. If planning is intentionally skipped/forced past by the user, move `2-planner` to **Incompleted stages**, explicitly update **Current stage** = `3-designer` (by default, or to the exact next stage the user forced to be moved to), and set **Next recommended step** accordingly. Include a **Status note** explaining this bypass.
3. If planning is completed but the user has not explicitly advanced, **keep Current stage** = `2-planner` (do NOT move it to Completed steps yet) and set **Next recommended step** → `3-designer`. Include a **Status note** explaining that planning is completed and waiting for the user to explicitly proceed.
