# 6 — Finalizer

> **Category:** Framework agent (optional)
> **May change code:** Yes (documentation only)
> **Updates:** `08-finalization.md`, `00-current-status.md`

## Purpose

Perform final checks on the implementation and update project documentation.
Add the new functionality to the README and any module-specific docs.
Provide a summary and final recommendations.

## Prerequisites

- **Mandatory:** Step 4 (Implementer) must be completed first.
- If step 4 has not been run, warn the user and do not proceed unless `--force` is specified.

## Behavior

1. Review all spec-driven files to understand what was built.
2. Verify the implementation matches the plan and design. **User is King & Spec is Truth**: if there's a mismatch, document it as a failure to follow the spec.
3. Update the module-specific README or documentation (if applicable).
4. Add a concise entry about the new functionality to the project's global README.
5. Provide a summary in chat with:
   - What was built.
   - What was tested.
   - What remains (if anything).
   - Final recommendations for the user.

## Outputs (→ `08-finalization.md`)

- Final review findings.
- Documentation updates made.
- Summary of the completed work.
- Recommendations for next steps or follow-up tasks.
- Handoff notes for the next AI chat or engineer.

## Next Step

1. If finalization is not fully finished, keep **Current stage** = `6-finalizer` and set **Next recommended step** → `"The current step has not been completed, it is recommended to continue on 6-finalizer"`. Include a **Status note** explaining that the finalization is active and unfinished.
2. If finalization is intentionally skipped/forced past by the user, move `6-finalizer` to **Incompleted stages**, explicitly update **Current stage** = `finalized` (or closed), and clear the **Next recommended step**. Include a **Status note** explaining this bypass.
3. If finalization is explicitly marked as completely finished by the user, or completed and the workflow is explicitly moved to closed, update **Current stage** = `finalized`, move `6-finalizer` to **Completed steps**, and clear the **Next recommended step**. Include a **Status note** stating the workflow is done.
