# united-we-stand source repository

This repository is the source, build, test, and publish workspace for the `united-we-stand` package.

It is maintainer documentation for this repository, not the installed end-user framework guide.

The runtime framework README that gets installed into target repositories is:

- [`.united-we-stand/README.md`](C:/Users/Max/Desktop/Frameworks/united-we-stand-framework/.united-we-stand/README.md)

## What This Repository Contains

- `src/`
  - CLI entrypoint, commands, and library code
- `.united-we-stand/`
  - framework markdown assets that are installed into target repositories
- `tests/`
  - unit, integration, and built-CLI smoke coverage
- `scripts/`
  - maintainer scripts, including GitHub publish artifact preparation
- `dist/`
  - generated build output

## Repository Layout

```text
repo-root/
|-- src/
|   |-- cli.tsx
|   |-- index.tsx
|   |-- commands/
|   `-- lib/
|-- tests/
|-- scripts/
|-- .united-we-stand/
|-- dist/
|-- package.json
|-- package-lock.json
`-- README.md
```

## What The Package Exports

The package installs a global CLI named:

- `united-we-stand`

The built package ships:

- `dist/**`
- `.united-we-stand/**`
- `README.md`
- `LICENSE`

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

## Publish Targets

This repository is prepared for two private user-scoped publish targets:

- private npm package: `@rudinmax87/united-we-stand`
- private GitHub Packages package: `@mrudinal/united-we-stand`

Because the required scopes are different, the repository uses:

- the root `package.json` for npm publishing
- a generated `.publish/github/package.json` artifact for GitHub Packages publishing

## Build The Publish Artifact

When you publish to npm, you are publishing the package artifact generated from this repository, not a Docker image.

The npm package artifact for this repository consists of:

- `dist/**`
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

This repository is already configured to publish the root package as:

- `@rudinmax87/united-we-stand`

### Requirements

Before publishing to npm, make sure all of the following are true:

- you have Node.js 18+ installed
- you have npm installed
- you have an npm account
- your npm account has access to the `@rudinmax87` scope
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

- `name` is `@rudinmax87/united-we-stand`
- `version` is the release version you want to publish

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
npm publish --access restricted
```

The root `package.json` already includes:

- scoped package name: `@rudinmax87/united-we-stand`
- `publishConfig.access = restricted`

So `npm publish` is usually enough, but `npm publish --access restricted` makes the intended access mode explicit.

### Quick publish command sequence

```bash
npm install
npm run build
npm test
npm run test:e2e
npm login
npm whoami
npm pack
npm publish --access restricted
```

## Publish To GitHub Packages

This repository can also be published to GitHub Packages as:

- `@mrudinal/united-we-stand`

GitHub Packages for npm uses:

- registry: `https://npm.pkg.github.com`
- scoped package name: `@mrudinal/united-we-stand`

### Requirements

Before publishing to GitHub Packages, make sure all of the following are true:

- you have Node.js 18+ and npm installed
- you have a GitHub account with access to `mrudinal/united-we-stand-framework`
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

- `.publish/github/package.json`
- `.publish/github/dist/**`
- `.publish/github/.united-we-stand/**`

#### 5. Inspect the generated publish artifact

Confirm that these files exist:

- `.publish/github/package.json`
- `.publish/github/dist/`
- `.publish/github/.united-we-stand/`

The generated `package.json` in that folder is already configured for:

- package name: `@mrudinal/united-we-stand`
- registry: `https://npm.pkg.github.com`

#### 6. Publish from the generated folder

```bash
npm publish .publish/github
```

The generated GitHub Packages artifact uses:

- package name: `@mrudinal/united-we-stand`
- registry: `https://npm.pkg.github.com`

### Quick GitHub Packages publish sequence

```bash
npm install
npm run build
npm test
npm run test:e2e
npm login --scope=@mrudinal --auth-type=legacy --registry=https://npm.pkg.github.com
npm run prepare:publish:github
cd .publish/github
npm publish
```

### Verify The GitHub Package Exists

After publishing, verify the package in both the CLI and the GitHub UI.

#### Verify from the CLI

If you already authenticated npm to GitHub Packages, run:

```bash
npm view @mrudinal/united-we-stand version --registry=https://npm.pkg.github.com
```

You can also inspect more package metadata:

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
   - package name is `@mrudinal/united-we-stand`
   - the newly published version is listed
   - installation instructions and package metadata are visible

You can also check the repository sidebar for the linked package if GitHub associates the package with `mrudinal/united-we-stand-framework`.

### Notes

- publish to npmjs.com and publish to GitHub Packages are separate flows
- the root package publishes to npm as `@rudinmax87/united-we-stand`
- the generated `.publish/github` artifact publishes to GitHub Packages as `@mrudinal/united-we-stand`
- if authentication fails during GitHub Packages publish, re-check that your token is a `personal access token (classic)` with `write:packages`

## End-User Documentation

If you need the installed user-facing documentation, read:

- [`.united-we-stand/README.md`](C:/Users/Max/Desktop/Frameworks/united-we-stand-framework/.united-we-stand/README.md)

That file explains:

- how users install the package
- how they run `install`, `branch-init`, `doctor`, and `refresh`
- framework stages and standalone agents
- runtime branch-memory layout inside their repositories

## License

MIT
