## united-we-stand workflow

Use `AGENTS.md` at the repository root as the canonical instruction entrypoint.

Before acting:
1. Read `AGENTS.md`.
2. Follow the linked files under `.united-we-stand/` for framework, steering, agents, and playbooks.
3. Read and update branch state under `.spec-driven/<sanitized-current-branch>/`.
4. If present, read `.spec-driven/.branch-routing.json` to resolve branch-folder exceptions.

If branch memory does not exist yet and the user asks for concrete code changes or other persistent repo work without explicitly asking to initialize the framework, warn that united-we-stand is not initialized for the branch and ask whether to proceed outside the framework for the current chat.

For the most reliable natural-language initialization when branch memory does not exist yet, reference any installed united-we-stand file together with the init request, for example `AGENTS.md initialize this`.
