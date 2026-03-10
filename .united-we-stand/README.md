# .united-we-stand

This folder contains installed framework guidance for `united-we-stand`.

## Layers

- `framework/`: canonical reusable workflow rules
- `steering/`: repository-specific steering
- `agents/`: numbered framework agents plus standalone specialists
- `playbooks/`: scenario-specific routing guides

## Runtime Branch Memory

Runtime branch memory is intentionally stored outside this folder at:

- `.spec-driven/<sanitized-branch>/`

This design keeps `.united-we-stand/` safely reinstallable with `install --force`.

## Branch Files

Each branch folder should contain:

- `00-current-status.md` to `06-finalization.md`
- Appendices `07` to `13`
- `modules/`, `api/`, `data/`, and `ux/` subfolders when relevant