import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, readFileSync, existsSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';
import { runBranchInitCommand } from '../src/commands/branch-init.js';
import { runInstallCommand } from '../src/commands/install.js';
import { getCurrentBranchName } from '../src/lib/git.js';
import { sanitizeBranchName } from '../src/lib/branch.js';

/**
 * Creates an isolated git repository for branch-init tests.
 */
function createTempGitRepository(): string {
    const tempDirectory = mkdtempSync(join(tmpdir(), 'united-we-stand-init-test-'));
    execSync('git init', { cwd: tempDirectory, stdio: 'pipe' });
    execSync('git config user.email "test@example.com"', { cwd: tempDirectory, stdio: 'pipe' });
    execSync('git config user.name "united-we-stand-test"', { cwd: tempDirectory, stdio: 'pipe' });
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

    it('creates only initializer bootstrap files for a new branch', async () => {
        await runBranchInitCommand({
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
        expect(existsSync(join(specDirectory, 'state.json'))).toBe(true);
        expect(existsSync(join(specDirectory, '02-plan.md'))).toBe(false);
        expect(existsSync(join(specDirectory, '03-design.md'))).toBe(false);
        expect(existsSync(join(specDirectory, '04-implementation.md'))).toBe(false);
        expect(existsSync(join(specDirectory, '05-code-review.md'))).toBe(false);
        expect(existsSync(join(specDirectory, '06-finalization.md'))).toBe(false);
    });

    it('captures the idea in 01-init.md', async () => {
        await runBranchInitCommand({
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

    it('keeps initializer active until the initializer content is completed', async () => {
        await runBranchInitCommand({
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
        expect(overviewFileContent).toContain('| Next recommended step | 1-initializer |');
        expect(overviewFileContent).toContain('| Status note | Initializer is active. Capture scope, assumptions, open questions, and success criteria before moving to planning. |');
    });

    it('writes machine-readable runtime state.json', async () => {
        await runBranchInitCommand({
            workingDirectory: tempRepoDirectory,
            isDryRun: false,
            ideaText: 'state test',
        });

        const currentBranch = getCurrentBranchName(tempRepoDirectory);
        const specDirectory = join(tempRepoDirectory, '.spec-driven', sanitizeBranchName(currentBranch));
        const stateContent = readFileSync(join(specDirectory, 'state.json'), 'utf-8');
        const parsedState = JSON.parse(stateContent) as Record<string, unknown>;

        expect(parsedState.branchName).toBe(currentBranch);
        expect(parsedState.sanitizedBranchName).toBe(sanitizeBranchName(currentBranch));
        expect(parsedState.branchMemoryFolder).toBe(sanitizeBranchName(currentBranch));
        expect(parsedState.currentStage).toBe('1-initializer');
        expect(parsedState.nextRecommendedStep).toBe('1-initializer');
        expect(parsedState.initialized).toBe(true);
        expect(parsedState.finalized).toBe(false);
        expect(Array.isArray(parsedState.completedSteps)).toBe(true);
        expect(Array.isArray(parsedState.incompletedStages)).toBe(true);
    });

    it('records branch identity in state.json for routing exceptions', async () => {
        const routingFilePath = join(tempRepoDirectory, '.spec-driven', '.branch-routing.json');
        mkdirSync(join(tempRepoDirectory, '.spec-driven'), { recursive: true });
        writeFileSync(
            routingFilePath,
            JSON.stringify({
                version: 1,
                mappings: {
                    'feature/exception-branch': 'custom-memory-folder',
                },
                updatedAt: new Date().toISOString(),
            }, null, 2),
            'utf-8',
        );

        await runBranchInitCommand({
            workingDirectory: tempRepoDirectory,
            isDryRun: false,
            branchNameOverride: 'feature/exception-branch',
            ideaText: 'exception mapping test',
        });

        const stateContent = readFileSync(
            join(tempRepoDirectory, '.spec-driven', 'custom-memory-folder', 'state.json'),
            'utf-8',
        );
        const parsedState = JSON.parse(stateContent) as Record<string, unknown>;

        expect(parsedState.branchName).toBe('feature/exception-branch');
        expect(parsedState.sanitizedBranchName).toBe('feature-exception-branch');
        expect(parsedState.branchMemoryFolder).toBe('custom-memory-folder');
    });

    it('uses default idea text if none provided', async () => {
        await runBranchInitCommand({
            workingDirectory: tempRepoDirectory,
            isDryRun: false,
        });

        const currentBranch = getCurrentBranchName(tempRepoDirectory);
        const specDirectory = join(tempRepoDirectory, '.spec-driven', sanitizeBranchName(currentBranch));
        const initFileContent = readFileSync(join(specDirectory, '01-init.md'), 'utf-8');

        expect(initFileContent).toContain('Work on the current branch');
    });

    it('does not reset an already-initialized branch unless --force is provided', async () => {
        await runBranchInitCommand({
            workingDirectory: tempRepoDirectory,
            isDryRun: false,
            branchNameOverride: 'main',
            ideaText: 'initial idea',
        });

        const specDirectory = join(tempRepoDirectory, '.spec-driven', 'main');
        writeFileSync(
            join(specDirectory, '02-plan.md'),
            `## Objectives

Plan objectives.

## High-level task breakdown

Plan tasks.

## Dependencies

None.

## Risks / unknowns

None.

## Suggested execution order

Do planning before design.
`,
            'utf-8',
        );
        writeFileSync(
            join(specDirectory, '00-current-status.md'),
            `# Branch Overview

| Field | Value |
|-------|-------|
| Current branch | \`main\` |
| Sanitized ID | \`main\` |
| Current stage | 2-planner |
| Completed steps | 1-initializer |
| Incompleted stages | none |
| Next recommended step | 3-designer |
| Status note | Planning is complete. |
| Blockers / warnings | none |
| Last updated by | 2-planner |
| Last updated at | 2026-03-13 |
`,
            'utf-8',
        );
        writeFileSync(
            join(specDirectory, 'state.json'),
            `{
  "branchName": "main",
  "sanitizedBranchName": "main",
  "branchMemoryFolder": "main",
  "currentStage": "2-planner",
  "completedSteps": ["1-initializer"],
  "incompletedStages": [],
  "nextRecommendedStep": "3-designer",
  "lastUpdatedBy": "2-planner",
  "lastUpdatedAt": "2026-03-13T00:00:00.000Z",
  "initialized": true,
  "finalized": false
}
`,
            'utf-8',
        );

        await runBranchInitCommand({
            workingDirectory: tempRepoDirectory,
            isDryRun: false,
            branchNameOverride: 'main',
            ideaText: 'new idea that should not overwrite state',
        });

        expect(process.exitCode).toBe(1);
        expect(readFileSync(join(specDirectory, 'state.json'), 'utf-8')).toContain('"currentStage": "2-planner"');
        expect(readFileSync(join(specDirectory, '00-current-status.md'), 'utf-8')).toContain('| Current stage | 2-planner |');
        expect(readFileSync(join(specDirectory, '01-init.md'), 'utf-8')).toContain('initial idea');
        expect(readFileSync(join(specDirectory, '01-init.md'), 'utf-8')).not.toContain('new idea that should not overwrite state');
    });

    it('resets branch memory when --force is provided', async () => {
        await runBranchInitCommand({
            workingDirectory: tempRepoDirectory,
            isDryRun: false,
            branchNameOverride: 'main',
            ideaText: 'initial idea',
        });

        const specDirectory = join(tempRepoDirectory, '.spec-driven', 'main');
        writeFileSync(
            join(specDirectory, '02-plan.md'),
            `## Objectives

Plan objectives.

## High-level task breakdown

Plan tasks.

## Dependencies

None.

## Risks / unknowns

None.

## Suggested execution order

Do planning before design.
`,
            'utf-8',
        );
        writeFileSync(
            join(specDirectory, 'state.json'),
            `{
  "branchName": "main",
  "sanitizedBranchName": "main",
  "branchMemoryFolder": "main",
  "currentStage": "2-planner",
  "completedSteps": ["1-initializer"],
  "incompletedStages": [],
  "nextRecommendedStep": "3-designer",
  "lastUpdatedBy": "2-planner",
  "lastUpdatedAt": "2026-03-13T00:00:00.000Z",
  "initialized": true,
  "finalized": false
}
`,
            'utf-8',
        );

        await runBranchInitCommand({
            workingDirectory: tempRepoDirectory,
            isDryRun: false,
            branchNameOverride: 'main',
            ideaText: 'forced reset idea',
            force: true,
        });

        expect(process.exitCode).toBe(0);
        expect(existsSync(join(specDirectory, '02-plan.md'))).toBe(false);
        expect(readFileSync(join(specDirectory, '01-init.md'), 'utf-8')).toContain('forced reset idea');
        expect(readFileSync(join(specDirectory, '00-current-status.md'), 'utf-8')).toContain('| Current stage | 1-initializer |');
        expect(readFileSync(join(specDirectory, 'state.json'), 'utf-8')).toContain('"currentStage": "1-initializer"');
    });

    it('does not write files in dry-run mode', async () => {
        await runBranchInitCommand({
            workingDirectory: tempRepoDirectory,
            isDryRun: true,
            ideaText: 'idea',
        });

        const currentBranch = getCurrentBranchName(tempRepoDirectory);
        const specDirectory = join(tempRepoDirectory, '.spec-driven', sanitizeBranchName(currentBranch));
        expect(existsSync(specDirectory)).toBe(false);
    });

    it('fails safely in detached HEAD without --branch override', async () => {
        const commitHash = execSync('git rev-parse HEAD', { cwd: tempRepoDirectory, stdio: 'pipe', encoding: 'utf-8' }).trim();
        execSync(`git checkout --detach ${commitHash}`, { cwd: tempRepoDirectory, stdio: 'pipe' });

        await runBranchInitCommand({
            workingDirectory: tempRepoDirectory,
            isDryRun: false,
            ideaText: 'detached flow',
        });

        expect(process.exitCode).toBe(1);
        expect(existsSync(join(tempRepoDirectory, '.spec-driven', 'head'))).toBe(false);
    });

    it('allows detached HEAD when explicit --branch override is provided', async () => {
        const commitHash = execSync('git rev-parse HEAD', { cwd: tempRepoDirectory, stdio: 'pipe', encoding: 'utf-8' }).trim();
        execSync(`git checkout --detach ${commitHash}`, { cwd: tempRepoDirectory, stdio: 'pipe' });

        await runBranchInitCommand({
            workingDirectory: tempRepoDirectory,
            isDryRun: false,
            ideaText: 'override flow',
            branchNameOverride: 'feature/manual-override',
        });

        const specDirectory = join(tempRepoDirectory, '.spec-driven', 'feature-manual-override');
        expect(existsSync(specDirectory)).toBe(true);
        expect(existsSync(join(specDirectory, '00-current-status.md'))).toBe(true);
    });

    it('requires install before branch-init to enforce protocol scaffolding', async () => {
        const rawRepoWithoutInstall = createTempGitRepository();
        try {
            await runBranchInitCommand({
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

    it('fails when default sanitized folder collides with another branch folder in non-interactive mode', async () => {
        const collidingFolderPath = join(tempRepoDirectory, '.spec-driven', 'feature-test');
        mkdirSync(collidingFolderPath, { recursive: true });
        writeFileSync(
            join(collidingFolderPath, '00-current-status.md'),
            '| Field | Value |\n|-------|-------|\n| Current branch | `old/branch` |\n',
            'utf-8',
        );

        await runBranchInitCommand({
            workingDirectory: tempRepoDirectory,
            isDryRun: false,
            branchNameOverride: 'feature/test',
            ideaText: 'collision test',
        });

        expect(process.exitCode).toBe(1);
        expect(existsSync(collidingFolderPath)).toBe(true);
    });

    it('uses branch routing exception map when present', async () => {
        const routingFilePath = join(tempRepoDirectory, '.spec-driven', '.branch-routing.json');
        mkdirSync(join(tempRepoDirectory, '.spec-driven'), { recursive: true });
        writeFileSync(
            routingFilePath,
            JSON.stringify({
                version: 1,
                mappings: {
                    'feature/exception-branch': 'custom-memory-folder',
                },
                updatedAt: new Date().toISOString(),
            }, null, 2),
            'utf-8',
        );

        await runBranchInitCommand({
            workingDirectory: tempRepoDirectory,
            isDryRun: false,
            branchNameOverride: 'feature/exception-branch',
            ideaText: 'exception mapping test',
        });

        const routingContent = readFileSync(routingFilePath, 'utf-8');
        expect(routingContent).toContain('"feature/exception-branch"');
        expect(routingContent).toContain('"custom-memory-folder"');
        expect(existsSync(join(tempRepoDirectory, '.spec-driven', 'custom-memory-folder'))).toBe(true);
    });
});
