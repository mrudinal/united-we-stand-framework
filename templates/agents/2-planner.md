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

After planning, update `00-current-status.md` with current stage = `3-designer` (or `4-implementer` if user decided that design is not needed), append `2-planner` to completed steps, and set **next step → 3-designer** (if design is needed) or **4-implementer** (if design is not needed).
