# Skip and Force Policy

## Normal Rule

Follow stages in order unless user explicitly requests skip/bypass.

## Force and Bypass Semantics

`--force` means explicit override of normal prerequisite/progression behavior.

Force/bypass must never be inferred from broad delivery language alone.
If a request could imply skipping or combining two or more stages, require explicit confirmation and name the affected stages before proceeding.

When force/bypass is applied:

- document bypass in stage file and status note
- move unfinished skipped stage(s) to `Incompleted stages`
- set new `Current stage` explicitly
- update `Next recommended step` accordingly

## Outside-Framework Work

If branch memory does not exist yet, working outside the framework is a separate mode from force/bypass:

- warn that united-we-stand is not initialized for the branch
- ask the user to confirm they want to continue outside the framework
- do not create `.spec-driven/...` files unless the user explicitly asks to initialize
- once the user confirms outside-framework work for the current chat, continue without repeating that confirmation unless they later ask to initialize or return to framework flow

## Mandatory Stage Warning

If user bypasses a mandatory stage (`1-initializer` or `4-implementer`):

- warn clearly about risk and missing guarantees
- proceed only if user confirms bypass intent

## Traceability Requirement

Bypass never erases history. Bypassed state must remain visible in:

- `00-current-status.md`
- relevant stage file notes
- traceability/risk appendices when impacted
