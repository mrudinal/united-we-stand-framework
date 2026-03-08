## united-we-stand — AI Workflow Framework

This repository uses **united-we-stand**, a spec-driven AI workflow framework
that persists branch-aware context as markdown files.

### How to use (for AI agents)

1. **Detect** the current git branch.
2. **Read** this file (`AGENTS.md`) first for high-level guidance.
3. **Read** the framework and role agent files in `.united-we-stand/agents/`.
4. **Read** the branch spec files in `.united-we-stand/spec-driven/<sanitized-current-branch>/` if present.
5. **Distinguish** between *framework agents* (staged workflow) and *standalone role agents* (on-demand helpers).
6. **Follow the staged process** — do not jump straight to coding.
7. **Check prerequisites** — mandatory prior steps must be completed before running a later step. Warn the user if a required prior step is missing (unless `--force` is used).
8. **`4-implementer`** is the **first** framework agent allowed by default to make code changes.
9. **Keep specs and decisions updated** when acting as a framework agent. Each framework agent updates its designated stage file and also checks whether `00-current-status.md` must be updated.
10. **Track next step** — after completing a stage, update `00-current-status.md` with the current stage and recommended next step, unless the user is only asking a question that does not require state changes. User questions alone must not modify non-status framework stage files unless the user explicitly asks to persist, revise, or repair them.
11. **Do not** update `.united-we-stand/spec-driven/<branch>/` when acting only as a standalone role agent, unless the user explicitly asks to persist the output or write the respective files.
12. **Use persistent markdown context** instead of relying on chat memory alone.
13. **User is King & Spec is Truth**: when receiving a modification instruction from the user (for example, “instead make this blue”), first review all existing framework steps and spec files, update the relevant specs to reflect the user’s latest intent, and only then make code changes if the active agent is allowed to do so.
14. **Automatic Routing & Chat Resumption**: the framework is automatic. In new or continued chats, the AI must check `00-current-status.md` first to establish context, determine the active step, determine the next numbered step, and continue seamlessly.
15. **Default progression rule**: if the user says things like *“next step”*, *“do the next step”*, or *“continue with the next step”*, execute the next numbered framework step by default **only if** prerequisites and state are valid and the current step is considered completed. Otherwise, report the blockers and wait for user confirmation. Do not skip ahead unless explicitly told to skip, or `--force` is used.
16. **Implementation guardrail**: if the user asks to implement while steps `2-planner` and/or `3-designer` are missing, do **not** silently invent that they were completed. Warn the user that planning/design are missing and ask for confirmation before proceeding directly to `4-implementer`, unless `--force` is used.
17. **Persistent context beats chat-only memory**: when there is a mismatch between remembered chat context and persisted framework files, prefer the persisted files and inform the user if clarification is needed.
18. **Framework state must not be created prematurely**: if the branch spec folder does not exist yet, do not create it preemptively. Wait for `1-initializer` or an explicit `--force` action that intentionally creates the framework state.
19. **Direct stage invocation still follows framework enforcement**: commands such as “plan this”, “design this”, “implement this”, “review this”, or “finalize this” must still respect prerequisite checks, mandatory-stage requirements, and --force behavior.

### Completion rules

A framework step is considered **completed** only when all of the following are true:

1. The corresponding stage file exists.
2. The minimum required sections for that stage are present.
3. `00-current-status.md` reflects the latest completed stage.
4. `00-current-status.md` contains the recommended next step.

If a stage file was updated but `00-current-status.md` was not updated accordingly, we should update `00-current-status.md` to reflect that updated stage.
If a stage file exists but is missing essential content, treat that step as incomplete. 
A later-stage file must not be treated as proof that earlier mandatory stages were completed. For example, if 04-implementation.md exists but 01-init.md is missing, the framework should not assume initialization happened.

### File modification rules

Framework agents must respect numbered ownership:

- By default, a framework agent may update its own numbered stage file and 00-current-status.md. It may update lower-numbered framework files only when required to align the persisted spec with the user’s latest confirmed intent or to document a confirmed discrepancy. Review-oriented agents such as 5-code-reviewer should report findings in their own stage file by default and must not rewrite lower-numbered framework files unless confirmed to do so by the user. If the user explicitly asks to persist suggested corrections there, obey the request from the user.
- Example: `4-implementer` may update `04-implementation.md` and, if necessary, also revise `03-design.md`, `02-plan.md`, `01-init.md`, and `00-current-status.md`.
- Higher-numbered framework files must not be edited by a lower-numbered agent, unless the framework is being intentionally bypassed with --force and the agent explicitly states that this is an override of normal ownership rules.
- **Spec first, then code**: whenever a user instruction changes intent, update the relevant spec files first, then make code changes if the active agent is allowed to do so.
- Agents that are marked as **not allowed to change code** must not modify application code, tests, configs, infrastructure, or unrelated docs unless explicitly told to do so by the user, following the rule of "Spec first, then code". “Code” includes source files, tests, build/config files, migration files, infrastructure files, and automation scripts.
- **Finalizer exception**: the finalizer stage (currently `6-finalizer`) may also update `06-finalization.md`, global `README` files, and other top-level guidance/instruction documents needed for wrap-up. It must still warn the user about remaining gaps instead of silently hiding them.
- **Stage file update method**: when updating an existing framework file, prefer revising the existing structured content in place. Append amendment sections only when preserving prior decisions or change history is useful. Do not duplicate entire stage files inside the same file unless the user explicitly asks for a historical log style.

### Framework agents (staged workflow)

| # | Agent          | Required        | May change code? | Primary updates |
| - | -------------- | --------------- | ---------------- | --------------- |
| 0 | status-checker | optional        | no               | `00-current-status.md` |
| 1 | initializer    | **mandatory**   | no               | `01-init.md` |
| 2 | planner        | optional        | no               | `02-plan.md` |
| 3 | designer       | optional        | no               | `03-design.md` |
| 4 | implementer    | **mandatory**   | **yes**          | `04-implementation.md` |
| 5 | code-reviewer  | optional        | no               | `05-code-review.md` |
| 6 | finalizer      | optional        | no, docs only    | `06-finalization.md` |

### Stage requirements

#### `0-status-checker`
Purpose:
- Read current framework state.
- Report current stage, completed stages, missing prerequisites, and next numbered step.
- Update `00-current-status.md` when needed.

Minimum output:
- Current branch
- **Current stage**: the highest-numbered stage that is currently active, meaning the stage the framework is presently working on after user approval, user request to continue, or a forced move forward; this does not move backward when the user requests changes to lower-numbered stages.
- Completed steps
- Next recommended step
- Blockers / warnings
- Last updated by
- Last updated at

#### `1-initializer`
Purpose:
- Capture the raw user idea and structure it into initial branch context.

Minimum output in `01-init.md`:
- Raw idea / problem statement
- Scope (in)
- Scope (out)
- Assumptions
- Open questions
- Success criteria

Also:
- Update `00-current-status.md` to reflect initialization and the next numbered step.

#### `2-planner`
Purpose:
- Convert initialized intent into a structured execution plan without designing implementation details too deeply.

Minimum output in `02-plan.md`:
- Objectives
- High-level task breakdown
- Dependencies
- Risks / unknowns
- Suggested execution order

Also:
- Update `00-current-status.md`.

#### `3-designer`
Purpose:
- Define the intended design before coding.

Minimum output in `03-design.md`:
- Architecture / approach
- Key components
- Interfaces / data flow
- Constraints
- Design decisions

Also:
- Update `00-current-status.md`.

#### `4-implementer`
Purpose:
- Perform the actual code changes.

Minimum output in `04-implementation.md`:
- What changed
- Why it changed
- Files touched
- Any spec files adjusted first
- Remaining gaps / follow-ups

Rules:
- This is the first framework agent allowed to modify code.
- If user intent changed, update specs first, then code.
- If `2-planner` and/or `3-designer` are missing and the user explicitly asks to implement, warn and ask for confirmation before proceeding, unless `--force` is used.

Also:
- Update `00-current-status.md`.

#### `5-code-reviewer`
Purpose:
- Review the implementation by default across **both** quality and security dimensions. If no implementation or implementation record exists yet, the reviewer must warn the user and either stop or perform a limited review only on the materials that currently exist, clearly stating the reduced review scope.

Default behavior:
- If the user says *“review this”*, *“do a code review”*, or anything similarly general, review **both**:
  1. **Quality & Maintainability**
  2. **Adversarial Security & Boundaries (Security)**

Selective behavior:
- If the user explicitly asks for only one kind of review, only perform and document that requested subsection.

Minimum output in `05-code-review.md`:
- `## Quality & Maintainability`
- `## Adversarial Security & Boundaries (Security)`
- Findings
- Severity / priority
- Recommended fixes
- What was reviewed / what was not reviewed

Also:
- Update `00-current-status.md`.

#### `6-finalizer`
Purpose:
- Wrap up the branch work with final documentation and user-facing notes.

Minimum output in `06-finalization.md`:
- Final summary both in the respective numbered file and in the agent chat.
- Delivered scope
- Known gaps
- Recommended next actions
- Global Documentation updates performed

Rules:
- Docs-only changes are allowed.
- May update top-level docs and instructions files as needed.
- Must warn the user about remaining functional, quality, or security gaps instead of silently closing the workflow.

Also:
- Update `00-current-status.md`.

### Workflow enforcement

- Steps **1** and **4** are **mandatory**.
- Any step after step **1** requires all prior **mandatory** steps to be completed.
- If a required prior step is missing, the agent must warn the user and stop.
- The user can override prerequisite checks with `--force`.
- Optional stages are still part of the numbered workflow and should be executed in order when the user says to continue or do the next step.
- An explicit request to implement does **not** automatically mean planning/design happened; if steps `2` and/or `3` are missing, warn and ask for confirmation before direct implementation, unless `--force` is used.

### Conflict resolution between code and spec

- **Never destroy or overwrite the user’s manually added code solely because the spec says something else.**
- If the current code conflicts with the spec and the user did **not** request a spec change, **update the spec to fit the current code** and inform the user clearly about that change.
- If the user gives a new instruction that contradicts the existing spec and requires code changes, **update the spec first**, then update the code.
- If there is uncertainty about whether code is intentional user-authored work or accidental drift, warn the user before making destructive changes.

### Standalone role agents (on-demand)

- debugger
- documentation-writer
- project-manager

Rules for standalone role agents:

- They may be invoked at any time.
- They should still read:
  - `AGENTS.md`
  - relevant agent definitions
  - current branch spec files if present
- By default, they do **not** update branch spec files.
- If the user explicitly asks them to persist their output or write files, they may write only the files explicitly requested by the user. This permission includes non-framework project files only if the user clearly requested those exact targets. They must not silently update framework stage files or unrelated repository files unless the user clearly asked for that.
- They do not become framework stages unless the user explicitly routes work through the framework.

### User command routing

The AI should intelligently route common user instructions as follows:

- **“what’s my status”** → route to `0-status-checker`
- **“show my status”** → route to `0-status-checker`
- **“where am I in the process?”** → route to `0-status-checker`
- **“do the next step”**, **continue with the next step”**, **“next step”** → run `0-status-checker` first, then execute the next numbered framework step if prerequisites and state are valid and this step is considered completed, otherwise report them and wait for user confirmation on the next steps.
- **“continue”** → run `0-status-checker`, re-establish context, and continue with the next numbered framework step only if prerequisites and state are valid and this step is considered completed; otherwise continue with the current active step unless there are blockers, in which case report them and wait for user confirmation on the next steps.
- **“plan this”** → route to `2-planner`
- **“design this”** → route to `3-designer`
- **“implement this”** before step `1-initializer` → warn and stop unless `--force` is used
- **“implement this”** when step `1` exists but steps `2` and/or `3` are missing → warn the user and ask for confirmation before proceeding to `4-implementer`, unless `--force` is used
- **“review this”** → route to `5-code-reviewer` and run both review sections by default
- **“do a code review”** → route to `5-code-reviewer` and run both review sections by default
- **“review quality”** → route to `5-code-reviewer` and perform only `Quality & Maintainability`
- **“review security”** → route to `5-code-reviewer` and perform only `Adversarial Security & Boundaries (Security)`
- **“security compliance check”** → route to `5-code-reviewer` and perform only `Adversarial Security & Boundaries (Security)`
- **“finalize this”** → route to `6-finalizer`
- **“wrap this up”** → route to `6-finalizer`
- **“debug this”** → route to standalone `debugger`
- **“document this”** → route to standalone `documentation-writer`
- **“manage this project”** → route to standalone `project-manager`

If a user command is ambiguous, prefer:
1. checking `00-current-status.md`,
2. matching the nearest valid framework or standalone agent,
3. preserving existing framework state unless the user explicitly wants to bypass it.

### Branch name sanitization

Use a deterministic sanitized branch name for the current branch to create the respective spec folder `.united-we-stand/spec-driven/<sanitized-current-branch>/`:

- convert to lowercase
- replace spaces with `-`
- replace `/` with `-`
- remove characters invalid for folder names
- collapse repeated `-`
- trim leading and trailing `-`

Example:
- `feature/New Checkout UI` → `feature-new-checkout-ui`

### Missing files / missing folder behavior

- If the branch spec folder does not exist, do **not** create it automatically just because the AI is inspecting the repo.
- The branch spec folder should normally be created by `1-initializer`, or intentionally via an explicit `--force` action.
- If the folder exists but a specific stage file is missing, that file may be created by the corresponding stage when it runs.
- If `00-current-status.md` is missing inside an existing framework folder, reconstruct it from the latest valid stage information if possible, and inform the user.
- If a framework file exists but is malformed, duplicated, or internally contradictory, preserve it, warn the user, and repair it conservatively if instructed by the user, rather than deleting and recreating it blindly. 

### File layout

```text
AGENTS.md                                ← you are here
.github/copilot-instructions.md          ← redirects to AGENTS.md
.united-we-stand/
  agents/                                ← agent definitions
    0-status-checker.md … 6-finalizer.md
    debugger.md, documentation-writer.md, project-manager.md
  spec-driven/
    <sanitized-current-branch-name>/             ← per-branch persistent state
      00-current-status.md
      01-init.md
      02-plan.md
      03-design.md
      04-implementation.md
      05-code-review.md
      06-finalization.md