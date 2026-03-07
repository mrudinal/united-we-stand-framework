/**
 * Sanitizes a git branch name into a filesystem-safe folder name.
 *
 * Rules applied in order:
 *  1. Lowercase the entire name
 *  2. Replace slashes and backslashes with dashes
 *  3. Replace any remaining non-alphanumeric/dash/underscore characters with dashes
 *  4. Collapse consecutive dashes into a single dash
 *  5. Trim leading and trailing dashes
 */
export function sanitizeBranchName(rawBranchName: string): string {
    return rawBranchName
        .toLowerCase()
        .replace(/[/\\]/g, '-')
        .replace(/[^a-z0-9\-_]/g, '-')
        .replace(/-{2,}/g, '-')
        .replace(/^-+|-+$/g, '');
}
