import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = dirname(currentFilePath);
const repositoryRoot = resolve(currentDirectory, '..');
const builtCliPath = join(repositoryRoot, 'dist', 'cli.js');

if (!existsSync(builtCliPath)) {
    throw new Error('Built CLI not found at dist/cli.js. Run `npm run build` before `npm run test:e2e`.');
}

/**
 * Runs a git command inside the temporary repository.
 */
function runGit(tempRepositoryPath, gitArguments) {
    execFileSync('git', gitArguments, {
        cwd: tempRepositoryPath,
        stdio: 'pipe',
        encoding: 'utf-8',
    });
}

/**
 * Runs the built CLI and returns exit status plus combined output.
 */
function runCli(cliArguments) {
    const commandResult = spawnSync(process.execPath, [builtCliPath, ...cliArguments], {
        cwd: repositoryRoot,
        stdio: 'pipe',
        encoding: 'utf-8',
    });

    return {
        exitCode: commandResult.status ?? 1,
        output: `${commandResult.stdout ?? ''}${commandResult.stderr ?? ''}`,
    };
}

/**
 * Creates a committed temp repository with a deterministic `main` branch.
 */
function createTempGitRepository() {
    const tempRepositoryPath = mkdtempSync(join(tmpdir(), 'united-we-stand-e2e-'));
    const remoteRepositoryPath = join(tempRepositoryPath, '.tmp-origin.git');
    writeFileSync(join(tempRepositoryPath, 'README.md'), '# temp repo\n', 'utf-8');
    runGit(tempRepositoryPath, ['init']);
    runGit(tempRepositoryPath, ['config', 'user.email', 'test@example.com']);
    runGit(tempRepositoryPath, ['config', 'user.name', 'united-we-stand-e2e']);
    runGit(tempRepositoryPath, ['add', 'README.md']);
    runGit(tempRepositoryPath, ['commit', '-m', 'init']);
    runGit(tempRepositoryPath, ['branch', '-M', 'main']);
    runGit(tempRepositoryPath, ['init', '--bare', remoteRepositoryPath]);
    runGit(tempRepositoryPath, ['remote', 'add', 'origin', remoteRepositoryPath]);
    runGit(tempRepositoryPath, ['push', '-u', 'origin', 'main']);
    runGit(remoteRepositoryPath, ['symbolic-ref', 'HEAD', 'refs/heads/main']);
    runGit(tempRepositoryPath, ['remote', 'set-head', 'origin', '-a']);
    runGit(tempRepositoryPath, ['checkout', '-b', 'feature/current-work']);
    return tempRepositoryPath;
}

/**
 * Creates and cleans up a temp repository around a single scenario.
 */
function withTempRepository(runScenario) {
    const tempRepositoryPath = createTempGitRepository();
    try {
        runScenario(tempRepositoryPath);
    } finally {
        rmSync(tempRepositoryPath, { recursive: true, force: true });
    }
}

/**
 * Asserts that a CLI command completed successfully.
 */
function expectSuccessfulCommand(commandResult, label) {
    assert.equal(
        commandResult.exitCode,
        0,
        `${label} failed.\nExit code: ${commandResult.exitCode}\nOutput:\n${commandResult.output}`,
    );
}

/**
 * Verifies the main install -> branch-init -> doctor flow against the built CLI.
 */
function scenarioHappyPathPassesDoctor() {
    withTempRepository((tempRepositoryPath) => {
        const branchName = 'feature/happy-path';
        const branchFolder = 'feature-happy-path';
        expectSuccessfulCommand(
            runCli(['install', '--cwd', tempRepositoryPath]),
            'install',
        );
        expectSuccessfulCommand(
            runCli(['branch-init', '--cwd', tempRepositoryPath, '--branch', branchName, 'e2e happy path']),
            'branch-init',
        );

        const stateContent = readFileSync(join(tempRepositoryPath, '.spec-driven', branchFolder, 'state.json'), 'utf-8');
        const parsedState = JSON.parse(stateContent);

        assert.equal(parsedState.branchName, branchName);
        assert.equal(parsedState.sanitizedBranchName, branchFolder);
        assert.equal(parsedState.branchMemoryFolder, branchFolder);

        const doctorResult = runCli(['doctor', '--cwd', tempRepositoryPath, '--branch', branchName]);
        expectSuccessfulCommand(doctorResult, 'doctor');
        assert.match(doctorResult.output, /All checks passed\. Repository is fully set up\./);
        assert.match(doctorResult.output, /state\.json branch identity matches resolved branch context/);
    });
}

/**
 * Verifies that doctor still flags placeholder-only content for completed stages.
 */
function scenarioDoctorFailsCompletedPlaceholderStage() {
    withTempRepository((tempRepositoryPath) => {
        const branchName = 'feature/doctor-placeholder';
        const branchFolder = 'feature-doctor-placeholder';
        expectSuccessfulCommand(
            runCli(['install', '--cwd', tempRepositoryPath]),
            'install',
        );
        expectSuccessfulCommand(
            runCli(['branch-init', '--cwd', tempRepositoryPath, '--branch', branchName, 'doctor placeholder scenario']),
            'branch-init',
        );

        const branchDirectory = join(tempRepositoryPath, '.spec-driven', branchFolder);
        writeFileSync(
            join(branchDirectory, '00-current-status.md'),
            [
                '# Branch Overview',
                '',
                '| Field | Value |',
                '|-------|-------|',
                `| Current branch | \`${branchName}\` |`,
                `| Sanitized ID | \`${branchFolder}\` |`,
                '| Current stage | 2-planner |',
                '| Completed steps | 1-initializer |',
                '| Incompleted stages | none |',
                '| Next recommended step | 3-designer |',
                '| Status note | Planning is complete. Advance to design when ready. |',
                '| Blockers / warnings | none |',
                '| Last updated by | 2-planner |',
                '| Last updated at | 2026-03-10 |',
                '',
            ].join('\n'),
            'utf-8',
        );

        writeFileSync(
            join(branchDirectory, 'state.json'),
            `${JSON.stringify({
                branchName,
                sanitizedBranchName: branchFolder,
                branchMemoryFolder: branchFolder,
                currentStage: '2-planner',
                completedSteps: ['1-initializer'],
                incompletedStages: [],
                nextRecommendedStep: '3-designer',
                lastUpdatedBy: '2-planner',
                lastUpdatedAt: '2026-03-10T00:00:00.000Z',
                initialized: true,
                finalized: false,
            }, null, 2)}\n`,
            'utf-8',
        );

        writeFileSync(
            join(branchDirectory, '02-plan.md'),
            `## Objectives

TBD

## High-level task breakdown

TBD

## Dependencies

TBD

## Risks / unknowns

TBD

## Suggested execution order

TBD
`,
            'utf-8',
        );

        const doctorResult = runCli(['doctor', '--cwd', tempRepositoryPath, '--branch', branchName]);
        assert.match(doctorResult.output, /02-plan\.md required sections have substantive content/);
        assert.match(doctorResult.output, /Branch runtime\/spec issues detected\./);
        assert.doesNotMatch(doctorResult.output, /All checks passed\. Repository is fully set up\./);
    });
}

/**
 * Verifies that collision protection blocks unsafe folder reuse in non-interactive mode.
 */
function scenarioCollisionFailsNonInteractiveReuse() {
    withTempRepository((tempRepositoryPath) => {
        expectSuccessfulCommand(
            runCli(['install', '--cwd', tempRepositoryPath]),
            'install',
        );

        const collidedFolderPath = join(tempRepositoryPath, '.spec-driven', 'feature-test');
        mkdirSync(collidedFolderPath, { recursive: true });
        writeFileSync(
            join(collidedFolderPath, 'state.json'),
            `${JSON.stringify({
                branchName: 'old/branch',
                sanitizedBranchName: 'old-branch',
                branchMemoryFolder: 'feature-test',
                currentStage: '1-initializer',
                completedSteps: [],
                incompletedStages: [],
                nextRecommendedStep: '1-initializer',
                lastUpdatedBy: '1-initializer',
                lastUpdatedAt: '2026-03-10T00:00:00.000Z',
                initialized: true,
                finalized: false,
            }, null, 2)}\n`,
            'utf-8',
        );

        const branchInitResult = runCli([
            'branch-init',
            '--cwd',
            tempRepositoryPath,
            '--branch',
            'feature/test',
            'collision scenario',
        ]);

        assert.equal(
            branchInitResult.exitCode,
            1,
            `branch-init collision scenario should fail.\nOutput:\n${branchInitResult.output}`,
        );
        assert.match(branchInitResult.output, /Folder collision detected at "\.spec-driven\/feature-test"\./);
    });
}

/**
 * Verifies that re-running branch-init requires explicit --force and does not mutate state otherwise.
 */
function scenarioReinitRequiresForce() {
    withTempRepository((tempRepositoryPath) => {
        const branchName = 'feature/reinit-test';
        const branchFolder = 'feature-reinit-test';
        expectSuccessfulCommand(
            runCli(['install', '--cwd', tempRepositoryPath]),
            'install',
        );
        expectSuccessfulCommand(
            runCli(['branch-init', '--cwd', tempRepositoryPath, '--branch', branchName, 'first init']),
            'branch-init initial',
        );

        const branchDirectory = join(tempRepositoryPath, '.spec-driven', branchFolder);
        writeFileSync(
            join(branchDirectory, '02-plan.md'),
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
            join(branchDirectory, '00-current-status.md'),
            [
                '# Branch Overview',
                '',
                '| Field | Value |',
                '|-------|-------|',
                `| Current branch | \`${branchName}\` |`,
                `| Sanitized ID | \`${branchFolder}\` |`,
                '| Current stage | 2-planner |',
                '| Completed steps | 1-initializer |',
                '| Incompleted stages | none |',
                '| Next recommended step | 3-designer |',
                '| Status note | Planning is complete. |',
                '| Blockers / warnings | none |',
                '| Last updated by | 2-planner |',
                '| Last updated at | 2026-03-13 |',
                '',
            ].join('\n'),
            'utf-8',
        );
        writeFileSync(
            join(branchDirectory, 'state.json'),
            `${JSON.stringify({
                branchName,
                sanitizedBranchName: branchFolder,
                branchMemoryFolder: branchFolder,
                currentStage: '2-planner',
                completedSteps: ['1-initializer'],
                incompletedStages: [],
                nextRecommendedStep: '3-designer',
                lastUpdatedBy: '2-planner',
                lastUpdatedAt: '2026-03-13T00:00:00.000Z',
                initialized: true,
                finalized: false,
            }, null, 2)}\n`,
            'utf-8',
        );

        const blockedReinitResult = runCli(['branch-init', '--cwd', tempRepositoryPath, '--branch', branchName, 'second init']);
        assert.equal(blockedReinitResult.exitCode, 1, `branch-init re-run without force should fail.\nOutput:\n${blockedReinitResult.output}`);
        assert.match(blockedReinitResult.output, /Current stage: 2-planner/);
        assert.match(blockedReinitResult.output, /Reset is only allowed when you explicitly rerun with `--force`\./);

        const stateContent = readFileSync(join(branchDirectory, 'state.json'), 'utf-8');
        assert.match(stateContent, /"currentStage": "2-planner"/);
    });
}

/**
 * Verifies that default-branch initialization requires explicit confirmation or --force.
 */
function scenarioDefaultBranchInitRequiresForce() {
    withTempRepository((tempRepositoryPath) => {
        expectSuccessfulCommand(
            runCli(['install', '--cwd', tempRepositoryPath]),
            'install',
        );

        const blockedInitResult = runCli(['branch-init', '--cwd', tempRepositoryPath, '--branch', 'main', 'default branch init']);
        assert.equal(
            blockedInitResult.exitCode,
            1,
            `branch-init on default branch should require confirmation.\nOutput:\n${blockedInitResult.output}`,
        );
        assert.match(blockedInitResult.output, /default branch/i);
        assert.match(blockedInitResult.output, /requires explicit confirmation/i);

        const forcedInitResult = runCli(['branch-init', '--cwd', tempRepositoryPath, '--branch', 'main', '--force', 'forced default branch init']);
        expectSuccessfulCommand(forcedInitResult, 'branch-init forced default branch');
        assert.equal(existsSync(join(tempRepositoryPath, '.spec-driven', 'main', 'state.json')), true);
    });
}

const scenarios = [
    ['happy path passes doctor', scenarioHappyPathPassesDoctor],
    ['doctor fails completed placeholder stage', scenarioDoctorFailsCompletedPlaceholderStage],
    ['collision fails non-interactive reuse', scenarioCollisionFailsNonInteractiveReuse],
    ['reinit requires force', scenarioReinitRequiresForce],
    ['default branch init requires force', scenarioDefaultBranchInitRequiresForce],
];

let failureCount = 0;

for (const [scenarioName, scenarioRunner] of scenarios) {
    try {
        scenarioRunner();
        console.log(`PASS ${scenarioName}`);
    } catch (error) {
        failureCount += 1;
        console.error(`FAIL ${scenarioName}`);
        console.error(error instanceof Error ? error.stack ?? error.message : String(error));
    }
}

if (failureCount > 0) {
    process.exitCode = 1;
} else {
    console.log(`E2E passed: ${scenarios.length} scenarios`);
}
