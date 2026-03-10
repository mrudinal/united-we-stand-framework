# Stage Lifecycle

Each framework stage moves through deterministic lifecycle states.

## Lifecycle States

### 1. Not started
Stage has not begun in current branch context.

### 2. Active and unfinished
Stage is current anchor and still needs work.

### 3. Active and completed
Stage work is complete, but stage remains anchored until explicit advancement.

### 4. Completed and advanced
Stage was explicitly advanced and moved to `Completed steps`.

### 5. Incompleted / bypassed
Stage was active but unfinished and explicitly skipped or forced past.

## Advancement Triggers

Advancement occurs only when one of the following is true:

- user explicitly requests next step
- user explicitly names another stage
- user explicitly requests skip/bypass
- `--force` semantics are applied per framework policy

Completion alone is not an advancement trigger.

## Resumption Inputs

When resuming work, consult:

- `Current stage`
- `Next recommended step`
- `Status note`
- `Blockers / warnings`
