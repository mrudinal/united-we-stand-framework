# Review Model

## Review Modes

### Mode A: Workflow Status Review (`0-status-checker` deep review)

Use when user asks for status, gaps, or overall check.

Validate:

- current stage consistency and status integrity
- plan/design feasibility before implementation
- missing requirement links between earlier and later stages
- stale or contradictory spec sections

A **gap** is any requirement, feature, or constraint requested in earlier stages that is absent, unsupported, or contradicted in later stages.

### Mode B: Code Review (`5-code-reviewer`)

Use for implementation review requests.

Default scope includes both:

- Quality and Maintainability
- Adversarial Security and Boundaries

User may explicitly narrow scope.

## Review Dimensions

1. **Conformance**
   - implementation matches branch specs or drift is explicitly documented
2. **Quality**
   - readability, complexity, modularity, error handling, duplication
   - required comment coverage from coding steering
   - oversized or multi-responsibility functions
   - routine SonarQube-style maintainability findings that should have been prevented during implementation
   - lint, parser-based analysis, and static-analysis findings relevant to the changed scope
3. **Security**
   - input validation/injection boundaries
   - authn/authz ownership checks (BOLA/IDOR)
   - data exposure minimization
   - dependency/supply-chain considerations
4. **Testing**
   - tests exist and cover high-risk paths proportionately
5. **Documentation**
   - implementation and finalization notes are complete and truthful

## Output Requirements

Review output should state:

- what was reviewed
- what was not reviewed
- findings
- severity/priority
- recommended fixes
- lint/parser/static-analysis observations and whether those checks were run
- residual risks

## Reviewer Behavior Constraints

- report discrepancies by default
- treat mandatory coding-steering violations as review findings that block a clean review
- use available lint/parser/static-analysis results as first-class review evidence instead of optional background context
- do not rewrite lower stages unless user explicitly requests it
- if drift is found, apply conflict policy (`05-conflict-resolution.md`)
