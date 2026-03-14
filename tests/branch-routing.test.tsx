import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { readBranchRoutingMap } from '../src/lib/branch-routing.js';

function createTempDirectory(): string {
    return mkdtempSync(join(tmpdir(), 'united-we-stand-routing-test-'));
}

describe('branch routing map', () => {
    let tempDirectory: string;

    beforeEach(() => {
        tempDirectory = createTempDirectory();
        mkdirSync(join(tempDirectory, '.spec-driven'), { recursive: true });
    });

    afterEach(() => {
        rmSync(tempDirectory, { recursive: true, force: true });
    });

    it('sanitizes loaded routing folder names before using them', () => {
        writeFileSync(
            join(tempDirectory, '.spec-driven', '.branch-routing.json'),
            JSON.stringify({
                version: 1,
                mappings: {
                    'feature/add-task': '../../outside-folder',
                    'feature_keep_underscores': 'feature_keep_underscores',
                    'Feature/Spacing Test': 'Feature/Spacing Test',
                },
                updatedAt: new Date().toISOString(),
            }, null, 2),
            'utf-8',
        );

        const routingMap = readBranchRoutingMap(tempDirectory);

        expect(routingMap['feature/add-task']).toBe('outside-folder');
        expect(routingMap.feature_keep_underscores).toBe('feature_keep_underscores');
        expect(routingMap['Feature/Spacing Test']).toBe('feature-spacing-test');
    });

    it('drops routing entries that sanitize to an empty folder name', () => {
        writeFileSync(
            join(tempDirectory, '.spec-driven', '.branch-routing.json'),
            JSON.stringify({
                version: 1,
                mappings: {
                    'feature/empty': '////',
                },
                updatedAt: new Date().toISOString(),
            }, null, 2),
            'utf-8',
        );

        const routingMap = readBranchRoutingMap(tempDirectory);

        expect(routingMap['feature/empty']).toBeUndefined();
    });
});
