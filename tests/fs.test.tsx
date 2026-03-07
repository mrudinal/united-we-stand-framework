import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
    writeFileWithDirectories,
    writeFileIfMissing,
    upsertFileWithManagedBlock,
} from '../src/lib/fs.js';
import { createLogger } from '../src/lib/logger.js';
import { MARKER_START, MARKER_END } from '../src/lib/markers.js';

/**
 * Creates a temporary directory for test isolation.
 */
function createTempDirectory(): string {
    return mkdtempSync(join(tmpdir(), 'united-we-stand-test-'));
}

/** No-op function used to silence logger output in tests. */
function noopLogHandler(): void { /* silent */ }

const silentLogger = createLogger(false);
silentLogger.info = noopLogHandler;
silentLogger.success = noopLogHandler;
silentLogger.warn = noopLogHandler;
silentLogger.error = noopLogHandler;
silentLogger.created = noopLogHandler;
silentLogger.updated = noopLogHandler;
silentLogger.skipped = noopLogHandler;
silentLogger.check = noopLogHandler;

describe('fs helpers', () => {
    let tempDirectory: string;

    beforeEach(() => {
        tempDirectory = createTempDirectory();
    });

    afterEach(() => {
        rmSync(tempDirectory, { recursive: true, force: true });
    });

    describe('writeFileWithDirectories', () => {
        it('creates a file and parent directories', () => {
            const filePath = join(tempDirectory, 'nested', 'deep', 'test.md');
            writeFileWithDirectories(filePath, '# Hello', false, silentLogger);
            expect(readFileSync(filePath, 'utf-8')).toBe('# Hello');
        });
    });

    describe('writeFileIfMissing', () => {
        it('writes a file when it does not exist', () => {
            const filePath = join(tempDirectory, 'new.md');
            const wasWritten = writeFileIfMissing(filePath, 'content', false, silentLogger);
            expect(wasWritten).toBe(true);
            expect(readFileSync(filePath, 'utf-8')).toBe('content');
        });

        it('skips when file already exists', () => {
            const filePath = join(tempDirectory, 'existing.md');
            writeFileSync(filePath, 'original', 'utf-8');
            const wasWritten = writeFileIfMissing(filePath, 'new', false, silentLogger);
            expect(wasWritten).toBe(false);
            expect(readFileSync(filePath, 'utf-8')).toBe('original');
        });
    });

    describe('dry-run', () => {
        it('does not write files in dry-run mode', () => {
            const filePath = join(tempDirectory, 'dry.md');
            writeFileWithDirectories(filePath, '# Dry', true, silentLogger);
            expect(existsSync(filePath)).toBe(false);
        });
    });

    describe('upsertFileWithManagedBlock', () => {
        it('creates a new file with managed block', () => {
            const filePath = join(tempDirectory, 'agents.md');
            upsertFileWithManagedBlock(filePath, 'block content', false, silentLogger);
            const fileContent = readFileSync(filePath, 'utf-8');
            expect(fileContent).toContain(MARKER_START);
            expect(fileContent).toContain('block content');
            expect(fileContent).toContain(MARKER_END);
        });

        it('replaces existing managed block', () => {
            const filePath = join(tempDirectory, 'agents.md');
            writeFileSync(filePath, `# Title\n\n${MARKER_START}\nold\n${MARKER_END}\n\nFooter\n`, 'utf-8');
            upsertFileWithManagedBlock(filePath, 'new content', false, silentLogger);
            const fileContent = readFileSync(filePath, 'utf-8');
            expect(fileContent).toContain('# Title');
            expect(fileContent).toContain('new content');
            expect(fileContent).not.toContain('old');
            expect(fileContent).toContain('Footer');
        });

        it('is idempotent', () => {
            const filePath = join(tempDirectory, 'idem.md');
            upsertFileWithManagedBlock(filePath, 'content', false, silentLogger);
            const firstContent = readFileSync(filePath, 'utf-8');
            upsertFileWithManagedBlock(filePath, 'content', false, silentLogger);
            const secondContent = readFileSync(filePath, 'utf-8');
            expect(secondContent).toBe(firstContent);
        });

        it('skips write when content is unchanged', () => {
            const filePath = join(tempDirectory, 'skip.md');
            upsertFileWithManagedBlock(filePath, 'content', false, silentLogger);
            // Second call should detect no change and skip.
            upsertFileWithManagedBlock(filePath, 'content', false, silentLogger);
            const fileContent = readFileSync(filePath, 'utf-8');
            expect(fileContent).toContain('content');
        });
    });
});
