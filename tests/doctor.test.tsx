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
    execSync('git config user.email "test@example.com"', { cwd: tempDirectory, stdio: 'pipe' });
    execSync('git config user.name "united-we-stand-test"', { cwd: tempDirectory, stdio: 'pipe' });
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
        expect(output).toContain('.agents/workflows/united-we-stand.md exists');
        expect(output).toContain('.cursor/rules/united-we-stand.mdc exists');
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
            join(specDirectory, '02-plan.md'),
            `## Objectives

TBD

## Dependencies

TBD

## Risks / unknowns

TBD

## Security / dependency risk plan

TBD

## Suggested execution order

TBD

## Detailed task list

TBD

## Status

TBD
`,
            'utf-8',
        );

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
        expect(output).toContain('Placeholder-only: ## Objectives, ## Dependencies, ## Risks / unknowns, ## Security / dependency risk plan, ## Suggested execution order, ## Detailed task list, ## Status');
        expect(output).toContain('Branch runtime/spec issues detected.');
    });

    it('fails when 05-code-review.md is missing the optimization findings section', () => {
        const specDirectory = join(tempRepoDirectory, '.spec-driven', 'main');
        const statusPath = join(specDirectory, '00-current-status.md');
        const runtimeStatePath = join(specDirectory, 'state.json');

        writeFileSync(
            join(specDirectory, '05-code-review.md'),
            `## Quality & maintainability findings

No quality issues found.

## Vulnerability audit findings

No dependency vulnerabilities detected.

## Security / boundary findings

No security issues found.

## Severity / priority

Low.

## Recommended fixes

Not applicable.

## Lint/parser/static-analysis observations

Not run.

## Residual risks

Unknown.

## Reviewed scope and non-reviewed scope

Reviewed the current branch implementation.
`,
            'utf-8',
        );

        writeFileSync(
            statusPath,
            buildStatusMarkdown(
                '5-code-reviewer',
                '1-initializer, 2-planner, 3-designer, 4-implementer',
                'none',
                '6-finalizer',
                'Review is complete and ready for finalization.',
                '5-code-reviewer',
            ),
            'utf-8',
        );

        writeFileSync(
            runtimeStatePath,
            serializeBranchRuntimeState({
                branchName: 'main',
                sanitizedBranchName: 'main',
                branchMemoryFolder: 'main',
                currentStage: '5-code-reviewer',
                completedSteps: ['1-initializer', '2-planner', '3-designer', '4-implementer'],
                incompletedStages: [],
                nextRecommendedStep: '6-finalizer',
                lastUpdatedBy: '5-code-reviewer',
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
        expect(output).toContain('05-code-review.md required sections present');
        expect(output).toContain('Missing: ## Optimization findings');
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

    it('fails when current stage does not match the highest created stage file', () => {
        const specDirectory = join(tempRepoDirectory, '.spec-driven', 'main');
        const statusPath = join(specDirectory, '00-current-status.md');
        const runtimeStatePath = join(specDirectory, 'state.json');

        writeFileSync(
            join(specDirectory, '02-plan.md'),
            `## Objectives

Plan objectives.

## Dependencies

None.

## Risks / unknowns

None.

## Security / dependency risk plan

No special security risks.

## Suggested execution order

Do planning before design.

## Detailed task list

Plan tasks.

## Status

Plan status.
`,
            'utf-8',
        );

        writeFileSync(
            join(specDirectory, '03-design.md'),
            `## Architecture / approach

Design approach.

## Key components

Key components list.

## Interfaces / data flow

Interface notes.

## Constraints

Constraint notes.

## Security boundaries / attack surface

Security notes.

## Design decisions

Decision notes.
`,
            'utf-8',
        );

        writeFileSync(
            statusPath,
            buildStatusMarkdown(
                '2-planner',
                '1-initializer',
                'none',
                '3-designer',
                'Planning is complete. Design file exists but metadata is stale.',
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
        expect(output).toContain('status metadata matches created stage files');
        expect(output).toContain('state.json metadata matches created stage files');
        expect(output).toContain('Status metadata current stage is "2-planner" but the highest existing stage file is "03-design.md" (3-designer).');
        expect(output).toContain('state.json metadata current stage is "2-planner" but the highest existing stage file is "03-design.md" (3-designer).');
    });

    it('passes when a branch is explicitly bootstrapped into planning without 01-init.md', () => {
        const specDirectory = join(tempRepoDirectory, '.spec-driven', 'main');
        const statusPath = join(specDirectory, '00-current-status.md');
        const runtimeStatePath = join(specDirectory, 'state.json');

        rmSync(join(specDirectory, '01-init.md'), { force: true });
        writeFileSync(
            join(specDirectory, '02-plan.md'),
            `## Objectives

Plan objectives.

## Dependencies

None.

## Risks / unknowns

Initializer was bypassed by explicit user choice.

## Security / dependency risk plan

No special security risks.

## Suggested execution order

Do planning before design.

## Detailed task list

Plan tasks.

## Status

Planning is active.
`,
            'utf-8',
        );

        writeFileSync(
            statusPath,
            buildStatusMarkdown(
                '2-planner',
                'none',
                '1-initializer',
                '2-planner',
                'Planning was explicitly started first; initializer remains bypassed and incomplete.',
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
                completedSteps: [],
                incompletedStages: ['1-initializer'],
                nextRecommendedStep: '2-planner',
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
        expect(output).toContain('All checks passed. Repository is fully set up.');
        expect(output).toContain('status metadata matches created stage files');
        expect(output).toContain('state.json metadata matches created stage files');
        expect(output).not.toContain('01-init.md');
    });
});
