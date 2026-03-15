# united-we-stand source repository

This repository is the source, build, test, and publish workspace for the `united-we-stand` package.

It is the maintainer documentation for this repository, not the installed end-user framework guide.

The runtime framework README that gets installed into target repositories is:

- [`.united-we-stand/README.md`](./.united-we-stand/README.md)

![united-we-stand logo](./public/united-we-stand-logo.png)

## What This Repository Contains

- `src/`
  - CLI entrypoint, commands, and library code
- `.united-we-stand/`
  - framework markdown assets that are installed into target repositories
- `tests/`
  - unit, integration, and built-CLI smoke coverage
- `scripts/`
  - maintainer scripts, including GitHub publish artifact preparation
- `public/`
  - repository-local static assets such as the project logo used in this README
- `VERSIONS.md`
  - manual package version history and release notes

## Repository Layout

```text
repo-root/
|-- .united-we-stand/
|-- public/
|-- scripts/
|-- src/
|   |-- cli.tsx
|   |-- index.tsx
|   |-- commands/
|   `-- lib/
|-- tests/
|-- LICENSE
|-- package-lock.json
|-- package.json
|-- README.md
|-- VERSIONS.md
|-- tsconfig.json
`-- vitest.config.ts
```

## What The Package Exports

The package installs a global CLI named:

- `united-we-stand`

The built package ships:

- compiled CLI output
- `.united-we-stand/**`
- `README.md`
- `LICENSE`

The repository also contains `public/` assets for source-repo documentation, but those are not currently part of the published npm package.

## GitHub Repository Star

During `united-we-stand install`, the CLI makes a best-effort attempt to star the source repository on GitHub:

- <https://github.com/mrudinal/united-we-stand-framework>

This is a non-blocking operation that does not affect the install outcome. The user is informed of the result:

- If a `GITHUB_TOKEN` or `GH_TOKEN` environment variable is set, the CLI uses the GitHub REST API.
- If the `gh` CLI is installed and authenticated, it falls back to `gh api`.
- If neither authentication method is available, the CLI logs that GitHub auth was not detected and continues.
- On any error or timeout, the CLI logs a warning and continues normally.

The star attempt runs after all framework files have been written. It never blocks, never fails the install, and never modifies any files.

## Local Development

Install dependencies:

```bash
npm install
```

Build the package:

```bash
npm run build
```

Run unit/integration tests:

```bash
npm test
```

Run built-CLI smoke tests:

```bash
npm run test:e2e
```

## Source Of Truth Areas

- framework runtime assets: `.united-we-stand/**`
- CLI behavior: `src/commands/**` and `src/lib/**`
- package metadata: `package.json`
- publish preparation for GitHub Packages: `scripts/prepare-github-publish.mjs`

## Installed Editor Integration Files

When users run `united-we-stand install`, the framework also installs lightweight editor/agent integration pointers that redirect tools back to the root `AGENTS.md` file instead of duplicating rules.

Installed pointer files:

- `.github/copilot-instructions.md`
- `.agents/workflows/united-we-stand.md`
- `.cursor/rules/united-we-stand.mdc`

## Publish Targets

This repository is prepared for two scoped publish targets.

Current examples in this repository:

- public npm package: `@rudinmax87/united-we-stand`
- GitHub Packages package: `@mrudinal/united-we-stand`

If you adapt this publish flow for your own fork or package, replace those scopes with your own npm scope and GitHub owner scope.

Because the required scopes are different, the repository uses:

- the root `package.json` for npm publishing
- a generated temporary artifact for GitHub Packages publishing

## Build The Publish Artifact

When you publish to npm, you are publishing the package artifact generated from this repository, not a Docker image.

The npm package artifact for this repository consists of:

- compiled CLI output
- `.united-we-stand/**`
- `README.md`
- `LICENSE`

Those shipped files are defined in `package.json` under `files`.

If you want to inspect the package tarball locally before publishing, run:

```bash
npm pack
```

That creates a local `.tgz` archive containing the exact npm package contents that would be published from the root package.

## Publish To Scoped npm

This repository is currently configured to publish the root package as:

- `@rudinmax87/united-we-stand`

If you are publishing your own scoped variant, replace that name with your own npm scope and package name.

### Requirements

Before publishing to npm, make sure all of the following are true:

- you have Node.js 18+ installed
- you have npm installed
- you have an npm account
- your npm account has access to the package scope you plan to publish under
- you are logged in with the npm CLI
- the package `version` in `package.json` is the version you want to publish
- the package builds and tests pass locally

Optional but recommended checks:

- confirm the current npm user with `npm whoami`
- confirm the target registry with `npm config get registry`
- inspect the tarball with `npm pack`

### Step-by-step

#### 1. Install dependencies

```bash
npm install
```

#### 2. Build the package

```bash
npm run build
```

#### 3. Run the test suite

```bash
npm test
npm run test:e2e
```

#### 4. Confirm the package version and scoped name

Check `package.json` and confirm:

- `name` is the package name you intend to publish
- `version` is the release version you want to publish

For this repository today, the configured name is `@rudinmax87/united-we-stand`.

#### 5. Log in to npm

```bash
npm login
```

If you want to verify the authenticated user:

```bash
npm whoami
```

#### 6. Optionally build the publish tarball locally

```bash
npm pack
```

This lets you inspect the exact package contents before publishing.

#### 7. Publish the scoped package

```bash
npm publish --access public
```

The root `package.json` already includes:

- scoped package name for this repository
- `publishConfig.access = public`

So `npm publish` is usually enough, but `npm publish --access public` makes the intended access mode explicit for a scoped public package.

### Quick publish command sequence

```bash
npm install
npm run build
npm test
npm run test:e2e
npm login
npm whoami
npm pack
npm publish --access public
```

## Publish To GitHub Packages

This repository can also be published to GitHub Packages as:

- `@mrudinal/united-we-stand`

GitHub Packages for npm uses:

- registry: `https://npm.pkg.github.com`
- scoped package name: `@mrudinal/united-we-stand`

Treat `@mrudinal` as the current example owner scope for this repository. If you publish from your own fork or organization, replace it with your own GitHub Packages scope.

### Requirements

Before publishing to GitHub Packages, make sure all of the following are true:

- you have Node.js 18+ and npm installed
- you have a GitHub account with access to the repository that owns the package
- you have a GitHub `personal access token (classic)`
- that token has at least:
  - `write:packages`
  - `read:packages`
- you are authenticated to `https://npm.pkg.github.com`
- the package builds and tests pass locally

Important:

- GitHub Packages for npm currently uses `personal access token (classic)` authentication
- for npm CLI v9+, GitHub recommends `--auth-type=legacy` when logging in from the command line

### Step-by-step

#### 1. Build and validate the package

```bash
npm install
npm run build
npm test
npm run test:e2e
```

#### 2. Create a GitHub personal access token (classic)

Create a token in GitHub with:

- `write:packages`
- `read:packages`

If you also want to delete packages later, add:

- `delete:packages`

#### 3. Authenticate npm to GitHub Packages

You can authenticate in either of these ways.

Option A: add your token to `~/.npmrc`

```ini
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_PAT_CLASSIC
```

Option B: log in with npm

```bash
npm login --scope=@YOUR_GITHUB_SCOPE --auth-type=legacy --registry=https://npm.pkg.github.com
```

Example for this repository:

```bash
npm login --scope=@mrudinal --auth-type=legacy --registry=https://npm.pkg.github.com
```

When prompted, use:

- Username: your GitHub username
- Password: your GitHub personal access token (classic)
- Email: your GitHub account email

#### 4. Prepare the GitHub-scoped publish artifact

```bash
npm run prepare:publish:github
```

That creates:

- a temporary GitHub-scoped publish artifact
- a GitHub-scoped package manifest
- the compiled CLI output and installed framework assets needed for publication

#### 5. Inspect the generated publish artifact

Confirm that these files exist:

- the generated GitHub-scoped package manifest
- the generated compiled CLI output
- the generated `.united-we-stand/` asset copy

The generated `package.json` in that folder is already configured for:

- package name: `@mrudinal/united-we-stand`
- registry: `https://npm.pkg.github.com`

#### 6. Publish from the generated folder

Publish from the generated GitHub artifact directory created by `npm run prepare:publish:github`.

The publish command is typically:

```bash
npm publish
```

Run it from inside the generated artifact directory after inspecting the prepared package manifest.

The generated GitHub Packages artifact uses:

- package name: `@mrudinal/united-we-stand`
- registry: `https://npm.pkg.github.com`

### Quick GitHub Packages publish sequence

```bash
npm install
npm run build
npm test
npm run test:e2e
npm login --scope=@YOUR_GITHUB_SCOPE --auth-type=legacy --registry=https://npm.pkg.github.com
npm run prepare:publish:github
```

Example scope for this repository: `@mrudinal`

### Verify The GitHub Package Exists

After publishing, verify the package in both the CLI and the GitHub UI.

#### Verify from the CLI

If you already authenticated npm to GitHub Packages, run:

```bash
npm view @YOUR_GITHUB_SCOPE/united-we-stand version --registry=https://npm.pkg.github.com
```

Example for this repository:

```bash
npm view @mrudinal/united-we-stand version --registry=https://npm.pkg.github.com
```

You can also inspect more package metadata:

```bash
npm view @YOUR_GITHUB_SCOPE/united-we-stand --registry=https://npm.pkg.github.com
```

Example for this repository:

```bash
npm view @mrudinal/united-we-stand --registry=https://npm.pkg.github.com
```

If the package is visible and the publish succeeded, npm will return the published version and metadata instead of a not found or auth error.

#### Verify in the GitHub UI

Open GitHub and check the package in the UI:

1. Go to your GitHub profile or the owning account.
2. Open the `Packages` tab.
3. Look for `united-we-stand`.
4. Open the package page and confirm:
   - package name matches your published scope and package name
   - the newly published version is listed
   - installation instructions and package metadata are visible

For this repository today, the example package name is `@mrudinal/united-we-stand`.

You can also check the repository sidebar for the linked package if GitHub associates the package with your repository.

### Notes

- publish to npmjs.com and publish to GitHub Packages are separate flows
- the root package publishes to npm as `@rudinmax87/united-we-stand`
- the generated temporary GitHub artifact publishes to GitHub Packages as `@mrudinal/united-we-stand`
- replace those example scopes with your own if you publish from a different owner account or fork
- if authentication fails during GitHub Packages publish, re-check that your token is a `personal access token (classic)` with `write:packages`

## End-User Documentation

If you need detailed user-facing documentation, read:

- [`.united-we-stand/README.md`](./.united-we-stand/README.md)

That file explains:

- how users install the package
- how they run `install`, `branch-init`, `doctor`, and `refresh`
- framework stages and standalone agents
- runtime branch-memory layout inside their repositories

## Package Summary

Install the public npm package with:

```bash
npm install -g @rudinmax87/united-we-stand
```

Then, inside a target repository:

```bash
united-we-stand install
```

That installs:

- the framework docs under `.united-we-stand/`
- editor/agent pointer files such as `AGENTS.md`, `.github/copilot-instructions.md`, `.agents/workflows/united-we-stand.md`, and `.cursor/rules/united-we-stand.mdc`
- numbered framework agents: `0-status-checker`, `1-initializer`, `2-planner`, `3-designer`, `4-implementer`, `5-code-reviewer`, `6-finalizer`
- standalone specialist agents: `debugger`, `documentation-writer`, `project-manager`, `refactorer`, `test-strategist`, `performance-reviewer`, `accessibility-reviewer`, `api-contract-writer`, `data-modeler`, `sql-database-designer`, `migration-planner`, `observability-reviewer`, `release-coordinator`, and `web-designer`

The workflow is mainly used in chat after installation:

1. `1-initializer`: `AGENTS.md initialize this branch for adding OAuth login`
2. `2-planner`: `plan this feature`
3. `3-designer`: `design the architecture for this change`
4. `4-implementer`: `implement this now`
5. `5-code-reviewer`: `do a code review`
6. `6-finalizer`: `wrap this up`

`0-status-checker` is a routing and validation stage, not a delivery stage. Example: `what's my status`

For the most reliable initialization bootstrap, explicitly reference an installed framework file in the prompt, for example `.united-we-stand/README.md initialize this` or `AGENTS.md init the following`.
In normal chat usage, the AI should create branch memory during initialization, follow the numbered workflow stages, and use standalone agents only when the task calls for specialized help.

After the workflow is initialized, each stage writes or updates its branch file as follows:

| Stage | File name | General description |
|-------|-----------|---------------------|
| `0-status-checker` | `00-current-status.md` | Current branch status, blockers, recommended next step, and routing state |
| `1-initializer` | `01-init.md` | Raw idea, scope, assumptions, open questions, and success criteria |
| `2-planner` | `02-plan.md` | Ordered plan, dependencies, risks, and suggested execution order |
| `3-designer` | `03-design.md` | Architecture, interfaces, boundaries, data flow, and design decisions |
| `4-implementer` | `04-implementation.md` | What changed in code, validation performed, and remaining gaps |
| `5-code-reviewer` | `05-code-review.md` | Quality, maintainability, security, and review findings |
| `6-finalizer` | `06-finalization.md` | Final summary, uncaptured changes, doc updates, and closure confirmation |

## License

MIT
