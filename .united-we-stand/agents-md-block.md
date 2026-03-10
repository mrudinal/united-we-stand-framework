## united-we-stand Operating Contract

This repository uses **united-we-stand**, a spec-driven AI workflow framework that persists branch-aware context as markdown files.

### Entry and Read Order

1. Detect current git branch and sanitize branch name.
2. Read `AGENTS.md` first.
3. Read `.united-we-stand/framework/00-index.md` and follow framework reading order.
4. Read `.united-we-stand/framework/profiles/00-profile-selection.md` and apply relevant profiles.
5. Read `.united-we-stand/steering/00-index.md` and relevant steering docs.
6. Read relevant role contracts in `.united-we-stand/agents/` and scenario guides in `.united-we-stand/playbooks/`.
7. Read branch state under `.spec-driven/<sanitized-current-branch>/` if present.

### Core Workflow Rules

- Stages and steps are interchangeable terms.
- Follow staged workflow; do not jump straight to coding.
- `4-implementer` is the first framework stage allowed to change code.
- Keep specs and decisions updated when acting as framework stages.
- Update `00-current-status.md` whenever workflow state changes.
- Keep `Current stage` anchored until user explicitly advances or bypasses.
- Avoid deadlocks: when user intent is clear (`continue`, `implement`, `fix`, `review`), take the nearest safe action and keep status traceability updated.
- Do not assume missing stage files are completed.
- Do not create branch state folders preemptively; `branch-init` or explicit user instruction should create them.
- Runtime branch memory is writable under `.spec-driven/` only.
- Treat `.united-we-stand/` as installed framework content (do not use it for runtime branch memory updates).
- Use persistent files over chat memory when they conflict.

Canonical source of these rules:

- `framework/01-core-rules.md`
- `framework/02-state-model.md`
- `framework/03-stage-lifecycle.md`

### Required Status Fields (`00-current-status.md`)

- `Current branch`
- `Current stage`
- `Completed steps`
- `Incompleted stages`
- `Next recommended step`
- `Status note`
- `Blockers / warnings`
- `Last updated by`
- `Last updated at`

### Framework Stage Agents

- `0-status-checker`
- `1-initializer` (mandatory)
- `2-planner`
- `3-designer`
- `4-implementer` (mandatory)
- `5-code-reviewer`
- `6-finalizer`

### Standalone Role Agents

- `debugger`
- `documentation-writer`
- `project-manager`
- `refactorer`
- `test-strategist`
- `performance-reviewer`
- `accessibility-reviewer`
- `api-contract-writer`
- `data-modeler`
- `migration-planner`
- `observability-reviewer`
- `release-coordinator`

Standalone roles may run anytime but do not automatically become framework stages. They should not update stage files unless explicitly asked.

### Routing Defaults

- Status/progress questions -> `0-status-checker`
- Planning/design requests -> `2-planner` / `3-designer`
- Implementation requests -> `4-implementer`
- Review requests -> `5-code-reviewer`
- Wrap-up requests -> `6-finalizer`
- Specialist requests -> matching standalone role

Canonical routing and ambiguity handling are defined in `.united-we-stand/framework/04-command-routing.md`.

### Conflict and Bypass

- For code/spec conflicts, follow `.united-we-stand/framework/05-conflict-resolution.md`.
- For skip/force behavior, follow `.united-we-stand/framework/08-skip-force-policy.md`.
- For completion/advancement semantics, follow `.united-we-stand/framework/02-state-model.md` and `.united-we-stand/framework/03-stage-lifecycle.md`.

### Modification Safety

- Spec first, then code when user intent changes.
- Preserve user-authored code unless explicit user instruction says otherwise.
- Respect role permissions and stage ownership rules.
- Never run destructive git actions unless explicitly instructed.

### Instruction Placement Map

To keep this entrypoint stable and reusable, detailed rules are intentionally moved to canonical files:

- State categories and next-step logic -> `framework/02-state-model.md`
- Routing modes (`continue`, `next step`, status deep review) -> `framework/04-command-routing.md`
- Spec-vs-code conflict resolution -> `framework/05-conflict-resolution.md`
- Stage file schemas and required sections -> `framework/06-spec-writing-standard.md`
- Completion criteria -> `framework/07-definition-of-done.md`
- Skip/force semantics -> `framework/08-skip-force-policy.md`
- Review depth and dimensions -> `framework/10-review-model.md`
- Language/project coding standards -> `framework/profiles/*.md`

### Directory Map

```text
.united-we-stand/
  framework/   # canonical reusable framework rules
  steering/    # repo-specific product/engineering steering
  agents/      # numbered framework stages + standalone specialists
  playbooks/   # scenario-specific workflow guides
.spec-driven/
  <sanitized-current-branch>/
    00-current-status.md
    01-init.md ... 06-finalization.md
    07-decisions.md ... 13-retrospective.md
    modules/ api/ data/ ux/
```
