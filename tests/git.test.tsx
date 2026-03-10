import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';
import { getCurrentBranchName, tryGetCurrentBranchName } from '../src/lib/git.js';

function createTempGitRepository(): string {
    const tempDirectory = mkdtempSync(join(tmpdir(), 'united-we-stand-git-test-'));
    execSync('git init', { cwd: tempDirectory, stdio: 'pipe' });
    execSync('git commit --allow-empty -m "init"', { cwd: tempDirectory, stdio: 'pipe' });
    return tempDirectory;
}

describe('git branch detection', () => {
    let tempRepoDirectory: string;

    beforeEach(() => {
        tempRepoDirectory = createTempGitRepository();
    });

    afterEach(() => {
        rmSync(tempRepoDirectory, { recursive: true, force: true });
    });

    it('returns a branch name in attached state', () => {
        const branchName = getCurrentBranchName(tempRepoDirectory);
        expect(branchName.length).toBeGreaterThan(0);
        expect(branchName.toUpperCase()).not.toBe('HEAD');
        expect(tryGetCurrentBranchName(tempRepoDirectory)).toBe(branchName);
    });

    it('returns null / throws in detached HEAD state', () => {
        const commitHash = execSync('git rev-parse HEAD', { cwd: tempRepoDirectory, stdio: 'pipe', encoding: 'utf-8' }).trim();
        execSync(`git checkout --detach ${commitHash}`, { cwd: tempRepoDirectory, stdio: 'pipe' });

        expect(tryGetCurrentBranchName(tempRepoDirectory)).toBeNull();
        expect(() => getCurrentBranchName(tempRepoDirectory)).toThrowError(/detached HEAD/i);
    });
});
