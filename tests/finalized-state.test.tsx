import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';
import { runInstallCommand } from '../src/commands/install.js';
import { runBranchInitCommand } from '../src/commands/branch-init.js';
import { runDoctorCommand } from '../src/commands/doctor.js';
import { serializeBranchRuntimeState, validateBranchRuntimeState } from '../src/lib/runtime-state.js';

function createTempGitRepository(): string {
    const tempDirectory = mkdtempSync(join(tmpdir(), 'united-we-stand-finalized-test-'));
    execSync('git init', { cwd: tempDirectory, stdio: 'pipe' });
    execSync('git config user.email "test@example.com"', { cwd: tempDirectory, stdio: 'pipe' });
    execSync('git config user.name "united-we-stand-test"', { cwd: tempDirectory, stdio: 'pipe' });
    execSync('git commit --allow-empty -m "init"', { cwd: tempDirectory, stdio: 'pipe' });
    return tempDirectory;
}

const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('finalized workflow state', () => {
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
            ideaText: 'finalized workflow state test',
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

    it('accepts closed workflow runtime state with currentStage none after finalizer approval', () => {
        const validationErrors = validateBranchRuntimeState({
            branchName: 'main',
            sanitizedBranchName: 'main',
            branchMemoryFolder: 'main',
            currentStage: 'none',
            completedSteps: ['6-finalizer'],
            incompletedStages: [],
            nextRecommendedStep: 'none',
            lastUpdatedBy: '6-finalizer',
            lastUpdatedAt: '2026-03-13T00:00:00.000Z',
            initialized: true,
            finalized: true,
        });

        expect(validationErrors).toEqual([]);
    });

    it('passes doctor for a closed workflow with confirmed finalization', () => {
        const specDirectory = join(tempRepoDirectory, '.spec-driven', 'main');

        writeFileSync(
            join(specDirectory, '06-finalization.md'),
            `## Final summary

Closure summary.

## Delivered scope

Delivered final branch state.

## Spec/code mismatches or uncaptured implementation changes

None.

## Known gaps

None.

## Recommended next actions

None.

## Documentation updates performed

Updated branch finalization notes.

## User closure confirmation status

Confirmed by user.
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
| Current stage | none |
| Completed steps | 6-finalizer |
| Incompleted stages | none |
| Next recommended step | none |
| Status note | Workflow is closed after explicit finalizer approval. Await a new user request to reopen work. |
| Blockers / warnings | none |
| Last updated by | 6-finalizer |
| Last updated at | 2026-03-13 |
`,
            'utf-8',
        );

        writeFileSync(
            join(specDirectory, 'state.json'),
            serializeBranchRuntimeState({
                branchName: 'main',
                sanitizedBranchName: 'main',
                branchMemoryFolder: 'main',
                currentStage: 'none',
                completedSteps: ['6-finalizer'],
                incompletedStages: [],
                nextRecommendedStep: 'none',
                lastUpdatedBy: '6-finalizer',
                lastUpdatedAt: '2026-03-13T00:00:00.000Z',
                initialized: true,
                finalized: true,
            }),
            'utf-8',
        );

        runDoctorCommand({
            workingDirectory: tempRepoDirectory,
            isDryRun: false,
            branchNameOverride: 'main',
        });

        const output = logLines.join('\n');
        expect(output).toContain('All checks passed. Repository is fully set up.');
        expect(output).toContain('state.json semantics are consistent');
        expect(output).toContain('status metadata matches created stage files');
    });

    it('fails doctor when workflow claims to be closed but finalization file is missing', () => {
        const specDirectory = join(tempRepoDirectory, '.spec-driven', 'main');

        writeFileSync(
            join(specDirectory, '00-current-status.md'),
            `# Branch Overview

| Field | Value |
|-------|-------|
| Current branch | \`main\` |
| Sanitized ID | \`main\` |
| Current stage | none |
| Completed steps | 6-finalizer |
| Incompleted stages | none |
| Next recommended step | none |
| Status note | Workflow is closed after explicit finalizer approval. Await a new user request to reopen work. |
| Blockers / warnings | none |
| Last updated by | 6-finalizer |
| Last updated at | 2026-03-13 |
`,
            'utf-8',
        );

        writeFileSync(
            join(specDirectory, 'state.json'),
            serializeBranchRuntimeState({
                branchName: 'main',
                sanitizedBranchName: 'main',
                branchMemoryFolder: 'main',
                currentStage: 'none',
                completedSteps: ['6-finalizer'],
                incompletedStages: [],
                nextRecommendedStep: 'none',
                lastUpdatedBy: '6-finalizer',
                lastUpdatedAt: '2026-03-13T00:00:00.000Z',
                initialized: true,
                finalized: true,
            }),
            'utf-8',
        );

        runDoctorCommand({
            workingDirectory: tempRepoDirectory,
            isDryRun: false,
            branchNameOverride: 'main',
        });

        const output = logLines.join('\n');
        expect(output).toContain('marks the workflow closed but "06-finalization.md" is missing');
        expect(output).toContain('Branch runtime/spec issues detected.');
    });

    it('accepts reopened finalizer state after new work is requested on a closed branch', () => {
        const validationErrors = validateBranchRuntimeState({
            branchName: 'main',
            sanitizedBranchName: 'main',
            branchMemoryFolder: 'main',
            currentStage: '6-finalizer',
            completedSteps: ['1-initializer', '4-implementer', '5-code-reviewer'],
            incompletedStages: [],
            nextRecommendedStep: '6-finalizer',
            lastUpdatedBy: '6-finalizer',
            lastUpdatedAt: '2026-03-13T00:00:00.000Z',
            initialized: true,
            finalized: false,
        });

        expect(validationErrors).toEqual([]);
    });
});
