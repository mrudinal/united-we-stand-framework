import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Checks whether the given directory is inside a git repository.
 */
export function isGitRepository(targetDirectory: string): boolean {
    // Fast path: look for a .git directory at the target root.
    if (existsSync(join(targetDirectory, '.git'))) {
        return true;
    }

    // Fallback: ask git itself (handles worktrees and nested repos).
    try {
        execSync('git rev-parse --is-inside-work-tree', {
            cwd: targetDirectory,
            stdio: 'pipe',
            encoding: 'utf-8',
        });
        return true;
    } catch {
        return false;
    }
}

/**
 * Returns the current git branch name for the given directory.
 * Falls back to "HEAD" when in a detached HEAD state.
 */
export function getCurrentBranchName(targetDirectory: string): string {
    try {
        const branchName = execSync('git rev-parse --abbrev-ref HEAD', {
            cwd: targetDirectory,
            stdio: 'pipe',
            encoding: 'utf-8',
        }).trim();

        return branchName || 'HEAD';
    } catch {
        return 'HEAD';
    }
}
