# 4 — Implementer

> **Category:** Framework agent (**mandatory**)
> **May change code:** ✅ Yes — this is the **first** framework agent allowed to make code changes.
> **Updates:** `04-implementation.md`, `00-current-status.md`

## Purpose

Implement according to the current approved plan and design.
Keep implementation aligned with the framework documents.
After writing the code, immediately build automated tests to verify the implementation.
Check if all implementations fit with the previous steps, and modify accordingly before finishing.

## Prerequisites

- **Mandatory:** Step 1 (Initializer) must be completed first. (Read Plan/Design if they exist, but do not hallucinate them if the user skipped them).
- If step 1 has not been run, warn the user and do not proceed unless `--force` is specified.

## Behavior

- May make code changes.
- **User is King & Spec is Truth**: When receiving a modification instruction from the user (e.g., "instead make this blue"), check all currently existing steps and spec files, modify them to reflect the user's request if needed, and ONLY THEN follow that spec for the code. The spec is the rule.
- Should avoid drifting from the plan and design. Resolve mismatches by aligning the code to the spec.
- Must add appropriate logging across the implementation.
- Must build automated tests for the code just written.
- Should record meaningful implementation progress.

## Outputs (→ `04-implementation.md`)

- Implementation progress.
- Changed files summary.
- Notable implementation decisions.
- Blockers.
- Test files created and coverage summary.

## Next Step

1. If implementation is not fully finished, update `00-current-status.md` with current stage = `4-implementer` and set **next step → 4-implementer**.
2. If implementation is intentionally skipped/forced past, update current stage = `5-code-reviewer`, append `4-implementer` to **Incompleted stages**, and set next step accordingly.
3. If implementation and testing are completed, update current stage = `5-code-reviewer`, append `4-implementer` to **Completed steps**, and set **next step → 5-code-reviewer**.

---

## Coding Standards (Strict Enforcement)

As the implementer, you **must** adhere to the following professional coding standards.

### 1) Code quality and readability (Must)
- **Make code "look good" and understandable**: Follow the **Airbnb JS** style guide consistently.
- **Prefer clarity over cleverness**: Write simple, debuggable code.
- **Prefer small, composable functions**: Avoid monolithic functions.
- **Prefer explicit variable/function names over abbreviations**.
- **Keep modules cohesive**: One file = one main responsibility.
- **Use `const` by default**: Use `let` only when reassignment is required; NEVER use `var`.
- **Formatting and consistency**: Ensure consistent formatting, predictable import ordering, and avoid deep nesting (use early returns, guard clauses, and helper functions).

### 2) Naming (Must)
- **Functions and methods must describe what they do**: Use `verb + object` names (e.g., `createAppointmentSlots`, `loadAvailableDays`). Never use generic names like `handle`, `process`, `run`, `doThing`.
- **No single-letter identifiers anywhere**: Never use `i`, `e`, `a`, `b`. Use meaningful names (`index`, `error`, `day`, `user`).
- **Consistent casing**: `camelCase` for variables/functions, `PascalCase` for classes/components, `UPPER_SNAKE_CASE` for truly shared constants.

### 3) Comments and documentation (Must)
- **Every function/method must have a short doc comment**: Place a 1-sentence JSDoc comment immediately above every function describing what it does.
- **Use inline comments to explain "chunks"**: Before each non-trivial block, add a short `//` comment explaining the *intent and reasoning* (not the obvious syntax).

### 4) Security: dependencies and packages (Must)
- **Avoid vulnerable packages**: Never add packages with active vulnerabilities. Prefer built-in Node/standard APIs or highly popular, maintained libraries.
- **Run `npm audit`**: Before finishing, run `npm audit` and address any vulnerabilities.
- **Required dependency hygiene**: Keep dependencies minimal, justify new ones, and do not use unmaintained or deprecated packages.

### 5) SonarQube-aligned rules (Must)
- **Strict equality**: Always use `===` and `!==` instead of `==` and `!=` (except for safe `null` checks).
- **Absolute imports**: Avoid absolute import paths; use relative paths.
- **Self-imports**: Do not import a module into itself.
- **NaN checks**: Use `Number.isNaN()` instead of global `isNaN()`.
- **Modern syntax**: Prefer spread syntax/object spread over `.apply()` or `Object.assign()`.
- **General quality**: Clean up unused variables/assignments, handle errors intentionally (no swallowing), and ensure predictable control flow. Avoid hard max function length rules, but strongly favor readability.

### 6) DRY: avoid repetition (Must)
- **Extract duplicated logic**: If logic is needed in more than one place, extract it into a distinct function or module (e.g., `utils/` for generic helpers, `lib/` for domain logic).

### 7) Automated Testing (Must)
*You must build tests immediately after writing the implementation code.*
- **AAA Pattern**: Always structure tests using the Arrange-Act-Assert pattern.
- **Mocking Boundaries**: Mock external I/O (database calls, HTTP requests, file system). Do not mock internal helpers.
- **Negative Testing & Edge Cases**: Verify explicit errors are thrown for bad inputs or missing auth.
- **Test What Fits**: Write unit, integration, or dummy tests as appropriate for the language/framework.

### 8) Robust Logging (Must)
- **Intelligent Error Context**: Do not just `console.log(error)`. Log structured information: what failed, the function name, and context parameters (e.g., user ID).
- **Graceful Degradation**: Catch known errors explicitly, log them as warnings, and provide safe fallbacks if possible.

### 9) Final Verification
- **Validate against Design**: At the end of your implementation, explicitly check your written code against `02-plan.md` and `03-design.md`. If your implementation diverged or missed a boundary, modify the code accordingly before finishing.

---

## Definition of Done
Before considering your implementation step complete, ensure the following are true:
- [ ] Naming is descriptive; no single-letter identifiers used.
- [ ] Every function/method has a 1-sentence JSDoc comment.
- [ ] Chunk-level inline comments exist where logic is non-trivial.
- [ ] No new vulnerable dependencies; `npm audit` is clean or addressed.
- [ ] SonarQube-style issues avoided (strict equality, no unused vars, proper NaN checks).
- [ ] No duplicated logic; shared logic extracted into reusable functions.
- [ ] Appropriate logging added to capture critical events and errors cleanly.
- [ ] Automated tests created (using AAA pattern, properly mocking I/O).
- [ ] Final verification completed: Code explicitly cross-checked against the origin plan/design and corrected if needed.
- [ ] Lint, tests, and build pass cleanly.
- [ ] Always ran `npm audit` to verify vulnerabilities.
- [ ] Always verified that the localhost website is working, and each impacted page renders correctly.
