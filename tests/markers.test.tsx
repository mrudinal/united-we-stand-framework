import { describe, it, expect } from 'vitest';
import {
    hasManagedBlock,
    upsertManagedBlock,
    MARKER_START,
    MARKER_END,
} from '../src/lib/markers.js';

describe('hasManagedBlock', () => {
    it('returns false for empty string', () => {
        expect(hasManagedBlock('')).toBe(false);
    });

    it('returns false when markers are absent', () => {
        expect(hasManagedBlock('# My README\nSome content')).toBe(false);
    });

    it('returns true when both markers are present', () => {
        const content = `# Readme\n${MARKER_START}\nhello\n${MARKER_END}\nfooter`;
        expect(hasManagedBlock(content)).toBe(true);
    });

    it('returns false when only start marker is present', () => {
        expect(hasManagedBlock(`${MARKER_START}\nstuff`)).toBe(false);
    });
});

describe('upsertManagedBlock', () => {
    const inner = 'managed content here';

    it('creates a block in empty content', () => {
        const result = upsertManagedBlock('', inner);
        expect(result).toContain(MARKER_START);
        expect(result).toContain(MARKER_END);
        expect(result).toContain(inner);
    });

    it('appends block when no markers exist', () => {
        const existing = '# My Readme\n\nUser content here.\n';
        const result = upsertManagedBlock(existing, inner);
        // User content is preserved
        expect(result).toContain('# My Readme');
        expect(result).toContain('User content here.');
        // Block is appended
        expect(result).toContain(MARKER_START);
        expect(result).toContain(inner);
        // User content comes before block
        const userIdx = result.indexOf('User content here.');
        const blockIdx = result.indexOf(MARKER_START);
        expect(userIdx).toBeLessThan(blockIdx);
    });

    it('replaces existing block', () => {
        const existing = `# Readme\n\n${MARKER_START}\nold stuff\n${MARKER_END}\n\nFooter\n`;
        const result = upsertManagedBlock(existing, inner);
        // Old content replaced
        expect(result).not.toContain('old stuff');
        // New content present
        expect(result).toContain(inner);
        // Surrounding content preserved
        expect(result).toContain('# Readme');
        expect(result).toContain('Footer');
    });

    it('is idempotent — re-inserting same content produces same result', () => {
        const first = upsertManagedBlock('', inner);
        const second = upsertManagedBlock(first, inner);
        expect(second).toBe(first);
    });

    it('preserves all user content outside the managed block', () => {
        const existing = `# Title\n\nParagraph 1.\n\n${MARKER_START}\nold\n${MARKER_END}\n\nParagraph 2.\n`;
        const result = upsertManagedBlock(existing, 'new');
        expect(result).toContain('# Title');
        expect(result).toContain('Paragraph 1.');
        expect(result).toContain('Paragraph 2.');
        expect(result).toContain('new');
        expect(result).not.toContain('old');
    });
});
