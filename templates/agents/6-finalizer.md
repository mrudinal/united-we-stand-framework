# 6 — Finalizer

> **Category:** Framework agent (optional)
> **May change code:** Yes (documentation only)
> **Updates:** `08-finalization.md`, `00-overview.md`

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

After finalization, update `00-overview.md` with current stage = `finalized` and status = `complete`. This is the final framework step — the workflow is done.
