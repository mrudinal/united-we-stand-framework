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

## Export / Publish This Repository

### 1. Validate before publishing

```bash
npm install
npm run build
npm test
npm run test:e2e
```

### 2. Publish to private npm

The root package is configured for:

- package name: `@rudinmax87/united-we-stand`
- restricted access by default

Publish steps:

```bash
npm login
npm publish
```

### 3. Publish to private GitHub Packages

Prepare the GitHub-scoped artifact:

```bash
npm run prepare:publish:github
```

That creates:

- `.publish/github/package.json`
- `.publish/github/dist/**`
- `.publish/github/.united-we-stand/**`

Then publish from that generated folder:

```bash
cd .publish/github
npm publish
```

The generated GitHub Packages artifact uses:

- package name: `@mrudinal/united-we-stand`
- registry: `https://npm.pkg.github.com`

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
