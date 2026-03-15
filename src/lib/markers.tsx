/**
 * Managed-block markers used to fence united-we-stand content inside
 * user-owned files like AGENTS.md and .github/copilot-instructions.md.
 */

export const MARKER_START = '<!-- united-we-stand:start -->';
export const MARKER_END = '<!-- united-we-stand:end -->';

/**
 * Checks whether the given content string contains a managed block.
 */
export function hasManagedBlock(content: string): boolean {
    return content.includes(MARKER_START) && content.includes(MARKER_END);
}

/**
 * Wraps inner content with the managed block start/end markers.
 */
export function wrapInManagedBlock(innerContent: string): string {
    return `${MARKER_START}\n${innerContent.trimEnd()}\n${MARKER_END}`;
}

/**
 * Inserts or replaces the managed block inside existing file content.
 *
 * Behavior:
 *  - If both markers are found → replaces everything between them (inclusive).
 *  - If neither marker is found → appends the block after a blank line.
 *  - If the file content is empty → returns just the block.
 *  - If only one marker is found (orphaned) → strips it and appends a fresh block.
 */
export function upsertManagedBlock(existingContent: string, innerContent: string): string {
    const wrappedBlock = wrapInManagedBlock(innerContent);

    // Empty file: return just the managed block.
    if (existingContent.length === 0) {
        return wrappedBlock + '\n';
    }

    // Orphaned marker: one marker is present without its pair.
    // Strip the stray marker so the block can be cleanly appended.
    const hasStart = existingContent.includes(MARKER_START);
    const hasEnd = existingContent.includes(MARKER_END);
    let sanitizedContent = existingContent;
    if (hasStart !== hasEnd) {
        const orphanedMarker = hasStart ? MARKER_START : MARKER_END;
        sanitizedContent = existingContent
            .replace(orphanedMarker, '')
            .replace(/\n{3,}/g, '\n\n');
    }

    // Existing managed block found: replace it in-place.
    if (hasManagedBlock(sanitizedContent)) {
        const markerPattern = new RegExp(
            `${escapeRegExpChars(MARKER_START)}[\\s\\S]*?${escapeRegExpChars(MARKER_END)}`,
            'm',
        );
        return sanitizedContent.replace(markerPattern, wrappedBlock);
    }

    // No managed block present: append with a blank line separator.
    const separator = sanitizedContent.endsWith('\n') ? '\n' : '\n\n';
    return sanitizedContent + separator + wrappedBlock + '\n';
}

/**
 * Escapes special regex characters in a string for safe use in RegExp constructors.
 */
function escapeRegExpChars(rawString: string): string {
    return rawString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
