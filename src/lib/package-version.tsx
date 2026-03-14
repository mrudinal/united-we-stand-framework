import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

interface PackageManifest {
    version?: unknown;
}

/**
 * Reads the package version from the package manifest so the CLI uses the same
 * single source of truth as publishing.
 */
export function readPackageVersion(): string {
    const currentFilePath = fileURLToPath(import.meta.url);
    const currentDirectory = dirname(currentFilePath);
    const packageJsonPath = join(currentDirectory, '..', '..', 'package.json');
    const packageManifest = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as PackageManifest;

    if (typeof packageManifest.version !== 'string' || packageManifest.version.trim().length === 0) {
        throw new Error(`Package version is missing or invalid in ${packageJsonPath}.`);
    }

    return packageManifest.version;
}
