import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';
import { runInstallCommand } from '../src/commands/install.js';
import { runBranchInitCommand } from '../src/commands/branch-init.js';
import { runDoctorCommand } from '../src/commands/doctor.js';
import { serializeBranchRuntimeState } from '../src/lib/runtime-state.js';

/**
 * Creates an isolated git repository for doctor-command tests.
 */
function createTempGitRepository(): string {
    const tempDirectory = mkdtempSync(join(tmpdir(), 'united-we-stand-doctor-test-'));
    execSync('git init', { cwd: tempDirectory, stdio: 'pipe' });
    execSync('git commit --allow-empty -m "init"', { cwd: tempDirectory, stdio: 'pipe' });
    return tempDirectory;
}

/**
 * Builds minimal status markdown for doctor validation scenarios.
 */
function buildStatusMarkdown(
    currentStage: string,
    completedSteps: string,
    incompletedStages: string,
    nextRecommendedStep: string,
    statusNote: string,
    lastUpdatedBy: string,
): string {
    return `# Branch Overview

| Field | Value |
|-------|-------|
| Current branch | \`main\` |
| Sanitized ID | \`main\` |
| Current stage | ${currentStage} |
| Completed steps | ${completedSteps} |
| Incompleted stages | ${incompletedStages} |
| Next recommended step | ${nextRecommendedStep} |
| Status note | ${statusNote} |
| Blockers / warnings | none |
| Last updated by | ${lastUpdatedBy} |
| Last updated at | 2026-03-10 |
`;
}

const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('doctor command', () => {
    let tempRepoDirectory: string;
    let logLines: string[];

    beforeEach(async () => {
        tempRepoDirectory = createTempGitRepository();
        logLines = [];
        console.log = (message?: unknown) => {
            logLines.push(String(message ?? ''));
        };
        console.error = (message?: unknown) => {
            logLines.push(String(message ?? ''));
        };

        await runInstallCommand({ workingDirectory: tempRepoDirectory, isDryRun: false, force: false });
        await runBranchInitCommand({
            workingDirectory: tempRepoDirectory,
            isDryRun: false,
            branchNameOverride: 'main',
            ideaText: 'doctor test idea',
        });
        process.exitCode = 0;
        logLines = [];
    });

    afterEach(() => {
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
        process.exitCode = 0;
        rmSync(tempRepoDirectory, { recursive: true, force: true });
    });

    it('passes for a freshly initialized branch with untouched future-stage templates', () => {
        runDoctorCommand({
            workingDirectory: tempRepoDirectory,
            isDryRun: false,
            branchNameOverride: 'main',
        });

        const output = logLines.join('\n');
        expect(output).toContain('All checks passed. Repository is fully set up.');
        expect(output).not.toContain('02-plan.md required sections have substantive content');
        expect(output).not.toContain('03-design.md required sections have substantive content');
        expect(output).not.toContain('04-implementation.md required sections have substantive content');
        expect(output).not.toContain('05-code-review.md required sections have substantive content');
        expect(output).not.toContain('06-finalization.md required sections have substantive content');
    });

    it('fails a stage that is marked complete but still contains only placeholders', () => {
        const specDirectory = join(tempRepoDirectory, '.spec-driven', 'main');
        const statusPath = join(specDirectory, '00-current-status.md');
        const runtimeStatePath = join(specDirectory, 'state.json');

        writeFileSync(
            statusPath,
            buildStatusMarkdown(
                '2-planner',
                '1-initializer',
                'none',
                '3-designer',
                'Planning is complete. Advance to design when ready.',
                '2-planner',
            ),
            'utf-8',
        );

        writeFileSync(
            runtimeStatePath,
            serializeBranchRuntimeState({
                branchName: 'main',
                sanitizedBranchName: 'main',
                branchMemoryFolder: 'main',
                currentStage: '2-planner',
                completedSteps: ['1-initializer'],
                incompletedStages: [],
                nextRecommendedStep: '3-designer',
                lastUpdatedBy: '2-planner',
                lastUpdatedAt: '2026-03-10T00:00:00.000Z',
                initialized: true,
                finalized: false,
            }),
            'utf-8',
        );

        runDoctorCommand({
            workingDirectory: tempRepoDirectory,
            isDryRun: false,
            branchNameOverride: 'main',
        });

        const output = logLines.join('\n');
        expect(output).toContain('02-plan.md required sections have substantive content');
        expect(output).toContain('Placeholder-only: ## Objectives, ## High-level task breakdown, ## Dependencies, ## Risks / unknowns, ## Suggested execution order');
        expect(output).toContain('Branch runtime/spec issues detected.');
    });

    it('fails when state.json branch identity does not match the resolved branch context', () => {
        const specDirectory = join(tempRepoDirectory, '.spec-driven', 'main');
        const runtimeStatePath = join(specDirectory, 'state.json');

        writeFileSync(
            runtimeStatePath,
            serializeBranchRuntimeState({
                branchName: 'wrong-branch',
                sanitizedBranchName: 'wrong-branch',
                branchMemoryFolder: 'wrong-folder',
                currentStage: '1-initializer',
                completedSteps: [],
                incompletedStages: [],
                nextRecommendedStep: '1-initializer',
                lastUpdatedBy: '1-initializer',
                lastUpdatedAt: '2026-03-10T00:00:00.000Z',
                initialized: true,
                finalized: false,
            }),
            'utf-8',
        );

        runDoctorCommand({
            workingDirectory: tempRepoDirectory,
            isDryRun: false,
            branchNameOverride: 'main',
        });

        const output = logLines.join('\n');
        expect(output).toContain('state.json branch identity matches resolved branch context');
        expect(output).toContain('branchName is "wrong-branch" instead of "main".');
        expect(output).toContain('branchMemoryFolder is "wrong-folder" instead of "main".');
    });
});
