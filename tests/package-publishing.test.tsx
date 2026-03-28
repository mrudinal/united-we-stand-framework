import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

function readRepositoryFile(relativePath: string): string {
    return readFileSync(fileURLToPath(new URL(`../${relativePath}`, import.meta.url)), 'utf-8');
}

describe('package publishing guide packaging', () => {
    it('ships the publishing guide and links to it from the root README', () => {
        const packageJson = JSON.parse(readRepositoryFile('package.json')) as { files?: string[] };
        const readme = readRepositoryFile('README.md');

        expect(packageJson.files).toContain('PACKAGE-PUBLISHING.md');
        expect(readme).toContain('[PACKAGE-PUBLISHING.md](./PACKAGE-PUBLISHING.md)');
    });
});
