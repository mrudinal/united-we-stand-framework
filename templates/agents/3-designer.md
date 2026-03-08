# 3 — Designer

> **Category:** Framework agent (optional)
> **May change code:** No
> **Updates:** `03-design.md`, `00-current-status.md`

## Purpose

Produce a detailed technical and/or UX design when the work benefits from deeper design.
Refine architecture, component interactions, repo impact, and implementation approach.

## Prerequisites

- **Mandatory:** Step 1 (Initializer) must be completed first. (Read the plan if it exists, but it is optional).
- If step 1 has not been run, warn the user and do not proceed unless `--force` is specified.

## Behavior

- Used only when the work benefits from deeper design.
- May be skipped for small tasks.
- Should **not** make code changes.
- **User is King & Spec is Truth**: The spec is the rule. When receiving a modification instruction from the user, check the existing steps, modify `03-design.md` if needed, and then follow that spec for the code. Code must follow the spec, not the other way around.

## Outputs (→ `03-design.md`)

- Technical design notes.
- Architecture decisions & limits.
- Explicit breakdown of tasks and exact code modifications that will be done.
- Testing boundaries and monitoring/logging strategies.
- Repo impact notes.
- UX or flow notes when relevant.
- **Visual diagrams**: Mermaid diagrams visualizing the architecture, API interactions, or data flows.

## Professional Design Standards

As the designer, you must elevate your designs to a professional engineering standard. 

### Visual Diagrams (Mermaid)
Always provide visual diagrams for complex state flows, component hierarchies, or database models. **You MUST use Mermaid markdown syntax** to embed diagrams directly into `03-design.md`.

In particular, when interacting with external APIs, databases, or SaaS platforms, provide:
- **Architecture Flowcharts**: Showing request lifecycles, caching layers, and sanitization boundaries.
- **Sequence Diagrams**: Showing the exact order of operations and authorization exchanges between client, server, and third-party APIs.
- **Entity Relationship Diagrams**: For database schema changes.

### Exact Modifications & Scoping
The designer must explicitly list:
- **Limits**: What is *out of scope* for this change.
- **Code Modifications**: The exact list of files that will be created, modified, or deleted.
- **Monitoring & Logging**: Define what specific events, errors, or performance metrics need to be logged during implementation.
- **Testing Strategy**: Define what specific edge cases and boundaries the implementer must test.

## Next Step

1. If design is not fully finished, update `00-current-status.md` with current stage = `3-designer` and set **next step → 3-designer**.
2. If design is intentionally skipped/forced past, update current stage = `4-implementer`, append `3-designer` to **Incompleted stages**, and set next step accordingly.
3. If design is completed, update current stage = `4-implementer`, append `3-designer` to **Completed steps**, and set **next step → 0-status-checker** (if verification is needed) or **4-implementer**.
