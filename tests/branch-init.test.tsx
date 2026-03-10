import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';
import { runBranchInitCommand } from '../src/commands/branch-init.js';
import { runInstallCommand } from '../src/commands/install.js';
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

    beforeEach(async () => {
        tempRepoDirectory = createTempGitRepository();
        console.log = () => { };
        console.error = () => { };
        await runInstallCommand({ workingDirectory: tempRepoDirectory, isDryRun: false, force: false });
        process.exitCode = 0;
    });

    afterEach(() => {
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
        process.exitCode = 0;
        rmSync(tempRepoDirectory, { recursive: true, force: true });
    });

    it('creates branch spec directory with core, appendices, and subfolders', () => {
        runBranchInitCommand({
            workingDirectory: tempRepoDirectory,
            isDryRun: false,
            ideaText: 'my feature idea',
        });

        const currentBranch = getCurrentBranchName(tempRepoDirectory);
        const sanitizedBranch = sanitizeBranchName(currentBranch);
        const specDirectory = join(tempRepoDirectory, '.spec-driven', sanitizedBranch);

        expect(existsSync(specDirectory)).toBe(true);
        expect(existsSync(join(specDirectory, '00-current-status.md'))).toBe(true);
        expect(existsSync(join(specDirectory, '01-init.md'))).toBe(true);
        expect(existsSync(join(specDirectory, '02-plan.md'))).toBe(true);
        expect(existsSync(join(specDirectory, '03-design.md'))).toBe(true);
        expect(existsSync(join(specDirectory, '04-implementation.md'))).toBe(true);
        expect(existsSync(join(specDirectory, '05-code-review.md'))).toBe(true);
        expect(existsSync(join(specDirectory, '06-finalization.md'))).toBe(true);
        expect(existsSync(join(specDirectory, '07-decisions.md'))).toBe(true);
        expect(existsSync(join(specDirectory, '08-traceability.md'))).toBe(true);
        expect(existsSync(join(specDirectory, '09-risks-issues.md'))).toBe(true);
        expect(existsSync(join(specDirectory, '10-test-strategy.md'))).toBe(true);
        expect(existsSync(join(specDirectory, '11-change-log.md'))).toBe(true);
        expect(existsSync(join(specDirectory, '12-handoff.md'))).toBe(true);
        expect(existsSync(join(specDirectory, '13-retrospective.md'))).toBe(true);
        expect(existsSync(join(specDirectory, 'modules', 'example-module.md'))).toBe(true);
        expect(existsSync(join(specDirectory, 'api', 'contracts.md'))).toBe(true);
        expect(existsSync(join(specDirectory, 'api', 'endpoints.md'))).toBe(true);
        expect(existsSync(join(specDirectory, 'api', 'auth-boundaries.md'))).toBe(true);
        expect(existsSync(join(specDirectory, 'data', 'schema-notes.md'))).toBe(true);
        expect(existsSync(join(specDirectory, 'data', 'migrations.md'))).toBe(true);
        expect(existsSync(join(specDirectory, 'data', 'data-boundaries.md'))).toBe(true);
        expect(existsSync(join(specDirectory, 'ux', 'user-flows.md'))).toBe(true);
        expect(existsSync(join(specDirectory, 'ux', 'screen-states.md'))).toBe(true);
        expect(existsSync(join(specDirectory, 'ux', 'copy-notes.md'))).toBe(true);
    });

    it('captures the idea in 01-init.md', () => {
        runBranchInitCommand({
            workingDirectory: tempRepoDirectory,
            isDryRun: false,
            ideaText: 'my super cool feature',
        });

        const currentBranch = getCurrentBranchName(tempRepoDirectory);
        const specDirectory = join(tempRepoDirectory, '.spec-driven', sanitizeBranchName(currentBranch));
        const initFileContent = readFileSync(join(specDirectory, '01-init.md'), 'utf-8');

        expect(initFileContent).toContain('my super cool feature');
        expect(initFileContent).toContain('<!-- united-we-stand:captured-idea:start -->');
        expect(initFileContent).toContain('<!-- united-we-stand:captured-idea:end -->');
    });

    it('keeps initializer as current stage and recommends 2-planner next', () => {
        runBranchInitCommand({
            workingDirectory: tempRepoDirectory,
            isDryRun: false,
            ideaText: 'idea',
        });

        const currentBranch = getCurrentBranchName(tempRepoDirectory);
        const specDirectory = join(tempRepoDirectory, '.spec-driven', sanitizeBranchName(currentBranch));
        const overviewFileContent = readFileSync(join(specDirectory, '00-current-status.md'), 'utf-8');

        expect(overviewFileContent).toContain('| Current stage | 1-initializer |');
        expect(overviewFileContent).toContain('| Completed steps | none |');
        expect(overviewFileContent).toContain('| Incompleted stages | none |');
        expect(overviewFileContent).toContain('| Next recommended step | 2-planner |');
        expect(overviewFileContent).toContain('| Status note | Initialization is complete. Advance explicitly when ready to move to planning. |');
    });

    it('uses default idea text if none provided', () => {
        runBranchInitCommand({
            workingDirectory: tempRepoDirectory,
            isDryRun: false,
        });

        const currentBranch = getCurrentBranchName(tempRepoDirectory);
        const specDirectory = join(tempRepoDirectory, '.spec-driven', sanitizeBranchName(currentBranch));
        const initFileContent = readFileSync(join(specDirectory, '01-init.md'), 'utf-8');

        expect(initFileContent).toContain('Work on the current branch');
    });

    it('does not write files in dry-run mode', () => {
        runBranchInitCommand({
            workingDirectory: tempRepoDirectory,
            isDryRun: true,
            ideaText: 'idea',
        });

        const currentBranch = getCurrentBranchName(tempRepoDirectory);
        const specDirectory = join(tempRepoDirectory, '.spec-driven', sanitizeBranchName(currentBranch));
        expect(existsSync(specDirectory)).toBe(false);
    });

    it('fails safely in detached HEAD without --branch override', () => {
        const commitHash = execSync('git rev-parse HEAD', { cwd: tempRepoDirectory, stdio: 'pipe', encoding: 'utf-8' }).trim();
        execSync(`git checkout --detach ${commitHash}`, { cwd: tempRepoDirectory, stdio: 'pipe' });

        runBranchInitCommand({
            workingDirectory: tempRepoDirectory,
            isDryRun: false,
            ideaText: 'detached flow',
        });

        expect(process.exitCode).toBe(1);
        expect(existsSync(join(tempRepoDirectory, '.spec-driven', 'head'))).toBe(false);
    });

    it('allows detached HEAD when explicit --branch override is provided', () => {
        const commitHash = execSync('git rev-parse HEAD', { cwd: tempRepoDirectory, stdio: 'pipe', encoding: 'utf-8' }).trim();
        execSync(`git checkout --detach ${commitHash}`, { cwd: tempRepoDirectory, stdio: 'pipe' });

        runBranchInitCommand({
            workingDirectory: tempRepoDirectory,
            isDryRun: false,
            ideaText: 'override flow',
            branchNameOverride: 'feature/manual-override',
        });

        const specDirectory = join(tempRepoDirectory, '.spec-driven', 'feature-manual-override');
        expect(existsSync(specDirectory)).toBe(true);
        expect(existsSync(join(specDirectory, '00-current-status.md'))).toBe(true);
    });

    it('requires install before branch-init to enforce protocol scaffolding', () => {
        const rawRepoWithoutInstall = createTempGitRepository();
        try {
            runBranchInitCommand({
                workingDirectory: rawRepoWithoutInstall,
                isDryRun: false,
                ideaText: 'should fail before install',
            });

            expect(process.exitCode).toBe(1);
            expect(existsSync(join(rawRepoWithoutInstall, '.spec-driven'))).toBe(false);
        } finally {
            rmSync(rawRepoWithoutInstall, { recursive: true, force: true });
            process.exitCode = 0;
        }
    });
});
