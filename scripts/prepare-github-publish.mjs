import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const scriptsDirectory = dirname(currentFilePath);
const repositoryRoot = resolve(scriptsDirectory, '..');
const publishRoot = join(repositoryRoot, '.publish', 'github');
const distDirectory = join(repositoryRoot, 'dist');
const templateDirectory = join(repositoryRoot, '.united-we-stand');

/**
 * Ensures the built package artifacts needed for publishing are present.
 */
function assertPublishInputsExist() {
    if (!existsSync(distDirectory)) {
        throw new Error('Missing dist/. Run `npm run build` before preparing the GitHub publish package.');
    }

    if (!existsSync(templateDirectory)) {
        throw new Error('Missing .united-we-stand/ templates. The repository is incomplete.');
    }
}

/**
 * Reads the root package manifest for reuse in the GitHub publish artifact.
 */
function readRootPackageManifest() {
    const rawPackageManifest = readFileSync(join(repositoryRoot, 'package.json'), 'utf-8');
    return JSON.parse(rawPackageManifest);
}

/**
 * Builds a GitHub Packages manifest using the GitHub user scope.
 */
function buildGitHubPackageManifest(rootPackageManifest) {
    return {
        name: '@mrudinal/united-we-stand',
        version: rootPackageManifest.version,
        description: rootPackageManifest.description,
        type: rootPackageManifest.type,
        bin: rootPackageManifest.bin,
        main: rootPackageManifest.main,
        files: rootPackageManifest.files,
        keywords: rootPackageManifest.keywords,
        author: rootPackageManifest.author,
        license: rootPackageManifest.license,
        dependencies: rootPackageManifest.dependencies,
        engines: rootPackageManifest.engines,
        repository: rootPackageManifest.repository,
        publishConfig: {
            registry: 'https://npm.pkg.github.com',
        },
    };
}

/**
 * Recreates the temporary GitHub publish directory with the packaged files.
 */
function preparePublishDirectory(packageManifest) {
    rmSync(publishRoot, { recursive: true, force: true });
    mkdirSync(publishRoot, { recursive: true });

    cpSync(distDirectory, join(publishRoot, 'dist'), { recursive: true });
    cpSync(templateDirectory, join(publishRoot, '.united-we-stand'), { recursive: true });
    cpSync(join(repositoryRoot, 'README.md'), join(publishRoot, 'README.md'));
    cpSync(join(repositoryRoot, 'LICENSE'), join(publishRoot, 'LICENSE'));
    writeFileSync(
        join(publishRoot, 'package.json'),
        `${JSON.stringify(packageManifest, null, 2)}\n`,
        'utf-8',
    );
}

assertPublishInputsExist();

const rootPackageManifest = readRootPackageManifest();
const githubPackageManifest = buildGitHubPackageManifest(rootPackageManifest);

preparePublishDirectory(githubPackageManifest);

console.log(`Prepared GitHub publish package at ${publishRoot}`);
