import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { tryGetDefaultBranchName } from '../src/lib/git.js';

const temporaryDirectories: string[] = [];

/**
 * Runs a git command inside the provided working directory.
 */
function runGitCommand(targetDirectory: string, args: string[]): string {
    return execFileSync('git', args, {
        cwd: targetDirectory,
        stdio: 'pipe',
        encoding: 'utf-8',
    });
}

/**
 * Creates a repository whose `origin/HEAD` points at the requested default branch.
 */
function createRepositoryWithDefaultBranch(defaultBranchName: string): string {
    const tempDirectory = mkdtempSync(join(tmpdir(), 'united-we-stand-git-test-'));
    const remoteDirectory = join(tempDirectory, '.tmp-origin.git');
    temporaryDirectories.push(tempDirectory);

    writeFileSync(join(tempDirectory, 'README.md'), '# git test\n', 'utf-8');
    runGitCommand(tempDirectory, ['init']);
    runGitCommand(tempDirectory, ['config', 'user.email', 'test@example.com']);
    runGitCommand(tempDirectory, ['config', 'user.name', 'united-we-stand-test']);
    runGitCommand(tempDirectory, ['add', 'README.md']);
    runGitCommand(tempDirectory, ['commit', '-m', 'init']);
    runGitCommand(tempDirectory, ['branch', '-M', defaultBranchName]);
    runGitCommand(tempDirectory, ['init', '--bare', remoteDirectory]);
    runGitCommand(tempDirectory, ['remote', 'add', 'origin', remoteDirectory]);
    runGitCommand(tempDirectory, ['push', '-u', 'origin', defaultBranchName]);
    runGitCommand(remoteDirectory, ['symbolic-ref', 'HEAD', `refs/heads/${defaultBranchName}`]);
    runGitCommand(tempDirectory, ['remote', 'set-head', 'origin', '-a']);

    return tempDirectory;
}

afterEach(() => {
    while (temporaryDirectories.length > 0) {
        const tempDirectory = temporaryDirectories.pop();
        if (tempDirectory) {
            rmSync(tempDirectory, { recursive: true, force: true });
        }
    }
});

describe('tryGetDefaultBranchName', () => {
    it('reads the tracked default branch from origin/HEAD', () => {
        const repositoryPath = createRepositoryWithDefaultBranch('trunk');

        expect(tryGetDefaultBranchName(repositoryPath)).toBe('trunk');
    }, 15000);

    it('returns null when the repository has no origin remote', () => {
        const repositoryPath = mkdtempSync(join(tmpdir(), 'united-we-stand-git-test-'));
        temporaryDirectories.push(repositoryPath);

        runGitCommand(repositoryPath, ['init']);
        runGitCommand(repositoryPath, ['config', 'user.email', 'test@example.com']);
        runGitCommand(repositoryPath, ['config', 'user.name', 'united-we-stand-test']);
        runGitCommand(repositoryPath, ['commit', '--allow-empty', '-m', 'init']);

        expect(tryGetDefaultBranchName(repositoryPath)).toBeNull();
    }, 15000);
});
