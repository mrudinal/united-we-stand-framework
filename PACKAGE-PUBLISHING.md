# Package Publishing

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
npm publish .publish/github
```

Run it from the repository root after inspecting the prepared package manifest.

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
npm publish .publish/github
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

#### Visibility Warning for First GitHub Packages Publish

If you publish a GitHub npm package under a personal account scope for the first time, GitHub may create it as `private` by default even if your package is intended to be public.

After the first publish, check the package page in GitHub:

1. Open the package.
2. Go to `Package settings`.
3. In the visibility controls, change the package to `Public` if needed.

Important:

- this visibility change is done in the GitHub UI, not by regenerating the package artifact
- you do not need to publish a new package just to change a newly created package from private to public
- once a GitHub package is made public, GitHub may not allow changing it back to private

### Notes

- publish to npmjs.com and publish to GitHub Packages are separate flows
- the root package publishes to npm as `@rudinmax87/united-we-stand`
- the generated temporary GitHub artifact publishes to GitHub Packages as `@mrudinal/united-we-stand`
- replace those example scopes with your own if you publish from a different owner account or fork
- if authentication fails during GitHub Packages publish, re-check that your token is a `personal access token (classic)` with `write:packages`
