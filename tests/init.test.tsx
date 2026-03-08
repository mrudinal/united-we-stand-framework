import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';
import { runInitCommand } from '../src/commands/init.js';
import { getCurrentBranchName } from '../src/lib/git.js';
import { sanitizeBranchName } from '../src/lib/branch.js';

function createTempGitRepository(): string {
    const tempDirectory = mkdtempSync(join(tmpdir(), 'united-we-stand-init-test-'));
    execSync('git init', { cwd: tempDirectory, stdio: 'pipe' });
    execSync('git commit --allow-empty -m "init"', { cwd: tempDirectory, stdio: 'pipe' });
    return tempDirectory;
}

const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('init command (branch spec setup)', () => {
    let tempRepoDirectory: string;

    beforeEach(() => {
        tempRepoDirectory = createTempGitRepository();
        console.log = () => { };
        console.error = () => { };
    });

    afterEach(() => {
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
        rmSync(tempRepoDirectory, { recursive: true, force: true });
    });

    it('creates branch spec directory and all numbered spec files', () => {
        runInitCommand({
            workingDirectory: tempRepoDirectory,
            isDryRun: false,
            ideaText: 'my feature idea',
        });

        const currentBranch = getCurrentBranchName(tempRepoDirectory);
        const sanitizedBranch = sanitizeBranchName(currentBranch);
        const specDirectory = join(tempRepoDirectory, '.united-we-stand', 'spec-driven', sanitizedBranch);

        expect(existsSync(specDirectory)).toBe(true);
        expect(existsSync(join(specDirectory, '00-current-status.md'))).toBe(true);
        expect(existsSync(join(specDirectory, '01-init.md'))).toBe(true);
        expect(existsSync(join(specDirectory, '02-plan.md'))).toBe(true);
        expect(existsSync(join(specDirectory, '03-design.md'))).toBe(true);
        expect(existsSync(join(specDirectory, '04-implementation.md'))).toBe(true);
        expect(existsSync(join(specDirectory, '05-code-review.md'))).toBe(true);
        expect(existsSync(join(specDirectory, '06-finalization.md'))).toBe(true);
    });

    it('captures the idea in 01-init.md', () => {
        runInitCommand({
            workingDirectory: tempRepoDirectory,
            isDryRun: false,
            ideaText: 'my super cool feature',
        });

        const currentBranch = getCurrentBranchName(tempRepoDirectory);
        const specDirectory = join(tempRepoDirectory, '.united-we-stand', 'spec-driven', sanitizeBranchName(currentBranch));
        const initFileContent = readFileSync(join(specDirectory, '01-init.md'), 'utf-8');

        expect(initFileContent).toContain('my super cool feature');
        expect(initFileContent).toContain('<!-- united-we-stand:captured-idea:start -->');
        expect(initFileContent).toContain('<!-- united-we-stand:captured-idea:end -->');
    });

    it('sets overview stage to initialized and next step to 2-planner', () => {
        runInitCommand({
            workingDirectory: tempRepoDirectory,
            isDryRun: false,
            ideaText: 'idea',
        });

        const currentBranch = getCurrentBranchName(tempRepoDirectory);
        const specDirectory = join(tempRepoDirectory, '.united-we-stand', 'spec-driven', sanitizeBranchName(currentBranch));
        const overviewFileContent = readFileSync(join(specDirectory, '00-current-status.md'), 'utf-8');

        expect(overviewFileContent).toContain('| Current stage | 2-planner |');
        expect(overviewFileContent).toContain('| Completed steps | 1-initializer |');
        expect(overviewFileContent).toContain('| Next step | 2-planner |');
    });

    it('uses default idea text if none provided', () => {
        runInitCommand({
            workingDirectory: tempRepoDirectory,
            isDryRun: false,
        });

        const currentBranch = getCurrentBranchName(tempRepoDirectory);
        const specDirectory = join(tempRepoDirectory, '.united-we-stand', 'spec-driven', sanitizeBranchName(currentBranch));
        const initFileContent = readFileSync(join(specDirectory, '01-init.md'), 'utf-8');

        expect(initFileContent).toContain('Work on the current branch');
    });

    it('does not write files in dry-run mode', () => {
        runInitCommand({
            workingDirectory: tempRepoDirectory,
            isDryRun: true,
            ideaText: 'idea',
        });

        const currentBranch = getCurrentBranchName(tempRepoDirectory);
        const specDirectory = join(tempRepoDirectory, '.united-we-stand', 'spec-driven', sanitizeBranchName(currentBranch));
        expect(existsSync(specDirectory)).toBe(false);
    });
});
