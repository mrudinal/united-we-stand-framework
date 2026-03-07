## united-we-stand — AI Workflow Framework

This repository uses **united-we-stand**, a spec-driven AI workflow framework
that persists branch-aware context as markdown files.

### How to use (for AI agents)

1. **Detect** the current git branch.
2. **Read** this file (AGENTS.md) first for high-level guidance.
3. **Read** the framework and role agent files in `.united-we-stand/agents/`.
4. **Read** the branch spec files in `.united-we-stand/spec-driven/<current-branch>/` if present.
5. **Distinguish** between *framework agents* (staged workflow) and *standalone role agents* (on-demand helpers).
6. **Follow the staged process** — do not jump straight to coding.
7. **Check prerequisites** — mandatory prior steps must be completed before running a later step. Warn the user if a required prior step is missing (unless `--force` is used).
8. **`4-implementer`** is the **first** framework agent allowed to make code changes.
9. **Keep specs and decisions updated** when acting as a framework agent. Each agent updates its matching numbered spec file.
10. **Track next step** — after completing a stage, update `00-overview.md` with the current stage and recommended next step.
11. **Do not** update `.united-we-stand/spec-driven/<branch>/` when acting only as a standalone role agent (unless the user explicitly asks).
12. **Use persistent markdown context** instead of relying on chat memory alone.
13. **User is King & Spec is Truth**: When receiving a modification instruction from the user (e.g., "instead make this blue"), you must first check all currently existing steps and spec files, modify them to reflect the user's intent, and ONLY THEN follow that updated spec to make the code changes. The spec is the rule, not the code. Resolve mismatches by aligning code to the spec, not vice-versa.
14. **Automatic Routing & Chat Resumption**: The framework is automatic. In new or continued chats, the AI must check the latest step in the framework `00-overview.md` to establish context and continue from there. The AI must know what step is currently active, what step comes next (the next numbered agent, regardless of if it is optional or mandatory), and execute seamlessly. 
15. **User Commands**: `1-initializer` is the only strictly mandatory entry point. Without it, the AI works outside the framework (unless calling a standalone agent or starting with `--force`). After initialization, the user only needs to call commands like *"do the next step"*, *"what's my status"*, or *"do a quality review"*. The AI must intelligently route to the `0-status-checker` to provide status/next steps, or directly execute the next numbered agent in the sequence if told to proceed.

### Framework agents (staged workflow)

| # | Agent | Required | May change code? | Updates |
|---|-------|----------|-------------------|---------|
| 0 | status-checker | optional | no | `00-overview.md` |
| 1 | initializer | **mandatory** | no | `01-init.md` |
| 2 | planner | optional | no | `02-plan.md` |
| 3 | designer | optional | no | `03-design.md` |
| 4 | implementer | **mandatory** | **yes** | `04-implementation.md` |
| 5 | tests-builder | optional | yes (tests only) | `04-implementation.md` |
| 6 | quality-reviewer | optional | no | `05-code-review.md` |
| 7 | security-reviewer | optional | no | `05-code-review.md` |
| 8 | finalizer | optional | yes (docs only) | `08-finalization.md` |

### Workflow enforcement

- Steps 1 and 4 are **mandatory**.
- Any step after step 1 requires all prior mandatory steps to be completed.
- If a required prior step is missing, the agent must warn the user and stop.
- The user can override this with `--force` to skip prerequisite checks.

### Standalone role agents (on-demand)

- debugger
- documentation-writer
- project-manager

These may be invoked at any time but **do not** update branch spec files by default.

### File layout

```
AGENTS.md                                ← you are here
.github/copilot-instructions.md          ← redirects to AGENTS.md
.united-we-stand/
  agents/                                ← agent definitions
    0-status-checker.md … 8-finalizer.md
    debugger.md, documentation-writer.md, project-manager.md
  spec-driven/
    <sanitized-branch-name>/             ← per-branch persistent state
      00-overview.md … 08-finalization.md
```
