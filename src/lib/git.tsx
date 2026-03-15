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
 * Returns null when the repository is in detached HEAD state or branch cannot be determined.
 */
export function tryGetCurrentBranchName(targetDirectory: string): string | null {
    try {
        const symbolicRef = execSync('git symbolic-ref --quiet --short HEAD', {
            cwd: targetDirectory,
            stdio: 'pipe',
            encoding: 'utf-8',
        }).trim();

        return symbolicRef || null;
    } catch {
        return null;
    }
}

/**
 * Returns the current git branch name for the given directory.
 * Throws when the repository is in detached HEAD state.
 */
export function getCurrentBranchName(targetDirectory: string): string {
    const branchName = tryGetCurrentBranchName(targetDirectory);
    if (!branchName) {
        throw new Error('Unable to determine current branch (detached HEAD).');
    }

    return branchName;
}

/**
 * Returns the repository default branch name when `origin/HEAD` is available.
 * Falls back to parsing `git remote show origin` when needed.
 */
export function tryGetDefaultBranchName(targetDirectory: string): string | null {
    try {
        const symbolicRef = execSync('git symbolic-ref --quiet --short refs/remotes/origin/HEAD', {
            cwd: targetDirectory,
            stdio: 'pipe',
            encoding: 'utf-8',
        }).trim();

        if (symbolicRef.startsWith('origin/')) {
            return symbolicRef.slice('origin/'.length) || null;
        }
    } catch {
        // Fall through to the slower remote-show parsing path.
    }

    try {
        const remoteShowOutput = execSync('git remote show origin', {
            cwd: targetDirectory,
            stdio: 'pipe',
            encoding: 'utf-8',
        });
        const headBranchMatch = remoteShowOutput.match(/HEAD branch:\s*(.+)/i);
        if (headBranchMatch && headBranchMatch[1]) {
            return headBranchMatch[1].trim() || null;
        }
    } catch {
        return null;
    }

    return null;
}
