# 0 — Status Checker

> **Category:** Framework agent (optional)
> **May change code:** No
> **Updates:** `00-current-status.md`

## Purpose

Inspect the current state of the united-we-stand framework for the active branch.
Act as the AI's internal router: when the user asks for the next step, quickly determine and output the exact next sequential stage.
When explicitly requested, perform a deep review of the initialized scope, plan, and design for ambiguity, contradiction, incompleteness, or unrealistic assumptions.

## Behavior

- Read `AGENTS.md`.
- Read all framework agent files in `.united-we-stand/agents/`.
- Read all branch spec-driven files in `.united-we-stand/spec-driven/<branch>/`.
- **Do not** make code changes.
- **Do not** advance the workflow automatically.

Depending on what the user asks, operate in one of two modes:

### Mode 1: Workflow Routing (Default)
**Trigger**: The user asks "what's my status?", "what step are we in?", "do the next step", or just continues the chat.
- **Goal**: Only provide the status of the workflow in terms of completed steps and the exact next sequential numbered stage.
- **Restriction**: DO NOT perform deep architectural reviews, DO NOT look for gaps, and DO NOT analyze Spec vs Code mismatches. Keep it brief. 
- Recommend the exact next sequential numbered stage (regardless of if it is optional or mandatory) so the AI can automatically execute *"do the next step"*.

### Mode 2: Deep Review (Explicitly Requested)
**Trigger**: The user explicitly asks to "check the implementation", "check the current deployment", or perform an "overall review".
- **Verify Architecture & Feasibility**: Act as the final gatekeeper before implementation. Review `02-plan.md` and `03-design.md` for architectural flaws, missing security boundaries, and unrealistic expectations.
- Identify gaps or contradictions before implementation begins.
- **User is King & Spec is Truth**: The spec is the rule. Explicitly flag if you detect code modifications that happened without their corresponding spec files being updated. When the user requests a modification, the specs must be updated first.

## Outputs

### For Mode 1 (Routing):
- Current branch
- Current stage
- Completed steps
- Incompleted stages
- Next recommended step

### For Mode 2 (Deep Review):
- Current branch
- Current stage
- Completed steps
- Incompleted stages
- Next recommended step
- Blockers / warnings
- List of missing artifacts
- Stale areas
- Risks, gaps, or Spec vs Code mismatches
- Last updated by
- Last updated at

## Next Step

After running the status checker, update `00-current-status.md` with the current status summary. Validate that stages are properly categorized between Current, Completed, and Incompleted without duplication.

---

## Professional Verification Standards

As the status checker, you also incorporate verification duties:
- **Architectural Anti-Patterns**: Does the design tightly couple unrelated domains? Are external APIs isolated? Re-inventing the wheel?
- **Security Oversights**: Does the plan handle authorization and credentials safely?
- **Blockers**: Explicitly flag any structural flaws that must be fixed before implementation (`4-implementer`) can begin.
