# united-we-stand

> Repo-scoped AI workflow framework — persists branch-aware specs and agent roles as **markdown files only**.

---

## What is this?

**united-we-stand** is a CLI tool that scaffolds a structured, spec-driven AI workflow inside any git repository. It creates persistent context files that AI coding assistants (Copilot, Cursor, Cline, etc.) can read at the start of every chat, so they don't lose track of your project's plans, decisions, and progress.

## Why?

AI chat sessions are **ephemeral**. Every new conversation starts from zero context. This leads to:

- Repeating yourself about project goals and constraints
- AI assistants jumping straight to code without planning
- Lost architectural decisions and design reasoning
- No persistent record of what was tried and what worked

**united-we-stand** solves this by creating a set of markdown files in your repository that act as persistent memory for AI assistants. The framework enforces a staged workflow (initialize → plan → design → implement → review) so that AI tools follow a disciplined process.

## How it works

1. Install and run `united-we-stand init` inside any git repository.
2. The CLI detects the current branch and creates:
   - `AGENTS.md` at the repo root (with managed block)
   - `.github/copilot-instructions.md` (with managed block)
    - `.united-we-stand/agents/*.md` — agent definitions
    - `.united-we-stand/spec-driven/<branch>/*.md` — per-branch persistent state
3. AI assistants read these files and follow the staged workflow.
4. As you progress through stages, the spec files accumulate context.
5. New AI chats on the same branch can recover the full context.

> ⚠️ **Only markdown files are written into target repositories.** No JSON, YAML, JS, TS, lockfiles, config files, or binaries — ever.

---

## Installation

```bash
# Global install
npm install -g united-we-stand

# Or use directly via npx
npx united-we-stand init
```

**Requirements:** Node.js ≥ 18, git

---

## Usage

### Initialize a repository

```bash
cd your-repo
united-we-stand init
```

Creates all framework files for the current branch. Safe to re-run — it's idempotent.

### Initialize a branch with an idea

```bash
git checkout -b feature/add-auth
united-we-stand branch-init "Add JWT-based authentication with refresh tokens"
```

Saves the idea into the branch spec files and marks the branch as initialized.

### Refresh templates

```bash
united-we-stand refresh
```

Re-applies templates and recreates any missing files without duplicating content.

### Health check

```bash
united-we-stand doctor
```

Reports whether all expected files exist and managed blocks are in place.

### Options

| Flag | Description |
|------|-------------|
| `--cwd <path>` | Run as if started in the given directory |
| `--dry-run` | Show what would be done without writing files |

---

## Command Reference

| Command | Purpose |
|---------|---------|
| `united-we-stand init` | Full initialization: AGENTS.md, Copilot instructions, agents, branch specs |
| `united-we-stand refresh` | Re-apply templates and update managed blocks |
| `united-we-stand doctor` | Check repo health and recommend fixes |
| `united-we-stand branch-init "<idea>"` | Initialize the current branch with an idea description |

---

## File Update Safety

united-we-stand uses **managed blocks** to coexist with your content:

```markdown
<!-- united-we-stand:start -->
(managed content — replaced on refresh)
<!-- united-we-stand:end -->
```

**Rules:**
- If a file doesn't exist → create it
- If a file exists without a managed block → append the block
- If a file already has a managed block → replace only that block
- All content outside the managed block is **preserved exactly**
- Re-running any command is **idempotent**

---

## Files Created in Target Repository

```
your-repo/
├── AGENTS.md                                    ← main AI instructions
├── .github/
│   └── copilot-instructions.md                  ← redirects to AGENTS.md
└── .united-we-stand/
    ├── agents/
    │   ├── 0-status-checker.md                  ← optional
    │   ├── 1-initializer.md                     ← mandatory
    │   ├── 2-planner.md                         ← mandatory
    │   ├── 3-designer.md                        ← optional
    │   ├── 0-status-checker.md                        ← optional
    │   ├── 4-implementer.md                     ← mandatory (first to code)
    │   ├── 6-conformance-reviewer.md            ← optional
    │   ├── 7-quality-review.md                  ← optional
    │   ├── 8-security-review.md                 ← optional
    │   ├── debugger.md                          ← standalone
    │   ├── project-manager.md                   ← standalone
    │   ├── code-reviewer.md                     ← standalone
    │   ├── refactorer.md                        ← standalone
    │   ├── documentation-writer.md              ← standalone
    │   └── test-writer.md                       ← standalone
    └── spec-driven/
        └── <sanitized-branch-name>/
            ├── 00-overview.md
            ├── 01-init.md
            ├── 02-plan.md
            ├── 03-design.md
            ├── 04-implementation.md
            ├── 05-review.md
            ├── 06-decisions.md
            └── 07-handoff.md
```

---

## Agent Types

### Framework Agents (staged workflow)

These agents represent stages in a structured process. They execute in order:

| # | Agent | Required | May Code? | Purpose |
|---|-------|----------|-----------|---------|
| 0 | Status Checker | optional | no | Inspect progress, suggest next step |
| 1 | Initializer | **mandatory** | no | Capture and structure the goal |
| 2 | Planner | **mandatory** | no | Create execution plan |
| 3 | Designer | optional | no | Detailed technical/UX design |
| 4 | Verifier | optional | no | Validate plan for gaps |
| 5 | Implementer | **mandatory** | **yes** | First stage allowed to write code |
| 6 | Conformance Reviewer | optional | with approval | Compare implementation to plan |
| 7 | Quality Review | optional | no | Code quality assessment |
| 8 | Security Review | optional | no | Security risk analysis |

### Standalone Role Agents (on-demand)

These can be invoked at any time during normal work. They do **not** update branch spec files unless explicitly asked.

- **Debugger** — diagnose and fix bugs
- **Project Manager** — prioritization and planning
- **Code Reviewer** — review code for quality
- **Refactorer** — improve code structure
- **Documentation Writer** — write docs
- **Test Writer** — write tests

---

## AGENTS.md and Copilot Integration

- `AGENTS.md` is recognized by GitHub Copilot and other AI tools as a project instructions file.
- `.github/copilot-instructions.md` provides additional Copilot-specific integration, redirecting to AGENTS.md.
- Both files use managed blocks so your custom content is never overwritten.

---

## Roadmap

- [ ] `united-we-stand status` — prettier status overview from branch specs
- [ ] `united-we-stand switch` — switch context when changing branches
- [ ] Custom agent templates via config
- [ ] Git hooks integration (auto-refresh on branch switch)
- [ ] VS Code extension for visual workflow navigation

---

## Publishing to npm

```bash
npm run build
npm test
npm publish
```

If using a scoped package name (e.g., `@yourscope/united-we-stand`), run:

```bash
npm publish --access public
```

---

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run CLI locally
node dist/cli.js init --cwd /path/to/test/repo
```

---

## License

MIT
