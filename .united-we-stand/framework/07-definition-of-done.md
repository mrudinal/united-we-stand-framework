# Definition of Done

Framework-level completion criteria apply to all repos and stacks.

## Stage Completion Gate

A stage is done when all are true:

1. Designated stage file exists.
2. Required sections for that stage are present (`06-spec-writing-standard.md`).
3. Content truthfully reflects current branch state.
4. `00-current-status.md` is updated consistently.
5. Known blockers/gaps are explicitly documented.
6. `Next recommended step` is set according to state model.

## Role-Specific Completion Expectations

- **Initializer**: goal, scope, assumptions, open questions, and success criteria captured.
- **Planner**: objectives, tasks, dependencies, and risks are actionable.
- **Designer**: architecture, boundaries, and implementation guidance are clear.
- **Implementer**: changes, rationale, tests, and validation are recorded.
- **Code Reviewer**: findings, severity, scope, and recommendations are explicit.
- **Finalizer**: delivered scope, known gaps, and doc impact are clear.

## Implementation and Review Quality Gates

These gates must be applied through profile + review-model rules:

- naming is descriptive and readable
- no avoidable duplication or dead code
- error handling and logging are intentional
- tests are proportionate and meaningful
- security boundaries are reviewed
- dependency/security checks are run when dependency changes occur

Profile-specific mandates (for example JS/TS style, audit commands, JSDoc practices) must be enforced via selected profile docs.

## Not Done If

- stage file lacks critical sections
- status categories are contradictory
- prerequisites were bypassed without explicit traceability
- documented behavior contradicts actual implementation state
- a stage was auto-advanced without explicit user advancement
- a higher-numbered stage was created or populated from an in-stage amendment request alone
