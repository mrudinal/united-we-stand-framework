/**
 * Doctor command: checks repository health and reports missing files.
 *
 * Separates checks into framework-level (set up by `install`) and
 * branch-level (set up by `branch-init`) with targeted recommendations.
 */

import { join } from 'node:path';
import { isGitRepository, tryGetCurrentBranchName } from '../lib/git.js';
import { sanitizeBranchName } from '../lib/branch.js';
import { doesFileExist, readFileOrNull } from '../lib/fs.js';
import { hasManagedBlock } from '../lib/markers.js';
import { createLogger } from '../lib/logger.js';
import {
    loadFrameworkFiles,
    loadSteeringFiles,
    loadPlaybookFiles,
    loadFrameworkAgentFiles,
    loadStandaloneAgentFiles,
    listBranchSpecRelativePaths,
} from '../lib/templates.js';

/** Options accepted by the doctor command. */
export interface DoctorCommandOptions {
    workingDirectory: string;
    isDryRun: boolean;
    branchNameOverride?: string;
}

/**
 * Runs the doctor command: audits the repository for missing or misconfigured framework files.
 */
export function runDoctorCommand(options: DoctorCommandOptions): void {
    // Doctor never writes files; always uses non-dry-run logger for display.
    const logger = createLogger(false);
    const { workingDirectory, branchNameOverride } = options;

    let frameworkHealthy = true;
    let branchHealthy = true;

    /**
     * Logs a single pass/fail check and tracks overall health status.
     */
    function reportCheck(label: string, passed: boolean, category: 'framework' | 'branch', detail?: string): void {
        logger.check(label, passed, detail);
        if (!passed) {
            if (category === 'framework') {
                frameworkHealthy = false;
            } else {
                branchHealthy = false;
            }
        }
    }

    console.log('');
    logger.info('united-we-stand doctor - checking repository health\n');

    // Verify this is a git repository.
    const isGitRepo = isGitRepository(workingDirectory);
    reportCheck('Git repository detected', isGitRepo, 'framework');
    if (!isGitRepo) {
        logger.error('Not a git repository. Run `united-we-stand install` inside a git repo.');
        process.exitCode = 1;
        return;
    }

    // === Framework-level checks (created by `install`) ===
    console.log('');
    logger.info('Framework files (set up by `united-we-stand install`):');

    // Check AGENTS.md existence and managed block.
    const agentsMdPath = join(workingDirectory, 'AGENTS.md');
    const agentsMdExists = doesFileExist(agentsMdPath);
    reportCheck('AGENTS.md exists', agentsMdExists, 'framework');
    if (agentsMdExists) {
        const agentsMdContent = readFileOrNull(agentsMdPath) ?? '';
        reportCheck('AGENTS.md has managed block', hasManagedBlock(agentsMdContent), 'framework');
    }

    // Check copilot-instructions.md existence and managed block.
    const copilotInstructionsPath = join(workingDirectory, '.github', 'copilot-instructions.md');
    const copilotExists = doesFileExist(copilotInstructionsPath);
    reportCheck('.github/copilot-instructions.md exists', copilotExists, 'framework');
    if (copilotExists) {
        const copilotContent = readFileOrNull(copilotInstructionsPath) ?? '';
        reportCheck('.github/copilot-instructions.md has managed block', hasManagedBlock(copilotContent), 'framework');
    }

    const frameworkRootDirectory = join(workingDirectory, '.united-we-stand');
    reportCheck('.united-we-stand/ directory exists', doesFileExist(frameworkRootDirectory), 'framework');

    const frameworkReadmePath = join(frameworkRootDirectory, 'README.md');
    reportCheck('.united-we-stand/README.md exists', doesFileExist(frameworkReadmePath), 'framework');

    const frameworkDirectory = join(frameworkRootDirectory, 'framework');
    reportCheck('.united-we-stand/framework/ directory exists', doesFileExist(frameworkDirectory), 'framework');

    console.log('');
    logger.info('Framework docs:');
    for (const frameworkFile of loadFrameworkFiles()) {
        reportCheck(`  ${frameworkFile.relativePath}`, doesFileExist(join(frameworkRootDirectory, frameworkFile.relativePath)), 'framework');
    }

    const steeringDirectory = join(frameworkRootDirectory, 'steering');
    reportCheck('.united-we-stand/steering/ directory exists', doesFileExist(steeringDirectory), 'framework');

    console.log('');
    logger.info('Steering docs:');
    for (const steeringFile of loadSteeringFiles()) {
        reportCheck(`  ${steeringFile.relativePath}`, doesFileExist(join(frameworkRootDirectory, steeringFile.relativePath)), 'framework');
    }

    const playbooksDirectory = join(frameworkRootDirectory, 'playbooks');
    reportCheck('.united-we-stand/playbooks/ directory exists', doesFileExist(playbooksDirectory), 'framework');

    console.log('');
    logger.info('Playbooks:');
    for (const playbookFile of loadPlaybookFiles()) {
        reportCheck(`  ${playbookFile.relativePath}`, doesFileExist(join(frameworkRootDirectory, playbookFile.relativePath)), 'framework');
    }

    // Check agents directory.
    const agentsDirectory = join(frameworkRootDirectory, 'agents');
    reportCheck('.united-we-stand/agents/ directory exists', doesFileExist(agentsDirectory), 'framework');

    // Check individual framework agent files.
    console.log('');
    logger.info('Framework agents:');
    for (const agentFile of loadFrameworkAgentFiles()) {
        reportCheck(`  ${agentFile.filename}`, doesFileExist(join(agentsDirectory, agentFile.filename)), 'framework');
    }

    // Check individual standalone role agent files.
    console.log('');
    logger.info('Standalone role agents:');
    for (const agentFile of loadStandaloneAgentFiles()) {
        reportCheck(`  ${agentFile.filename}`, doesFileExist(join(agentsDirectory, agentFile.filename)), 'framework');
    }

    // === Branch-level checks (created by `branch-init`) ===
    const selectedBranch = branchNameOverride && branchNameOverride.trim().length > 0
        ? branchNameOverride.trim()
        : tryGetCurrentBranchName(workingDirectory);

    console.log('');
    if (!selectedBranch) {
        reportCheck(
            'Current branch is attached (not detached HEAD)',
            false,
            'branch',
            'Detached HEAD detected. Use --branch <name> to run branch checks.',
        );
        logger.warn('Skipping branch-file checks because no deterministic branch name is available.');
    } else {
        if (selectedBranch.toUpperCase() === 'HEAD') {
            reportCheck(
                'Branch name is not reserved value HEAD',
                false,
                'branch',
                'Use --branch <name> with a real branch name.',
            );
        } else {
            const sanitizedBranch = sanitizeBranchName(selectedBranch);
            if (!sanitizedBranch) {
                reportCheck(
                    'Branch name sanitizes to a valid folder name',
                    false,
                    'branch',
                    `Invalid branch value: "${selectedBranch}"`,
                );
            } else {
                const specDrivenDirectory = join(workingDirectory, '.spec-driven', sanitizedBranch);
                logger.info(`Branch spec files - ${selectedBranch} (${sanitizedBranch}):`);
                const specDirectoryExists = doesFileExist(specDrivenDirectory);
                reportCheck(`.spec-driven/${sanitizedBranch}/ directory exists`, specDirectoryExists, 'branch');

                if (specDirectoryExists) {
                    for (const specRelativePath of listBranchSpecRelativePaths()) {
                        reportCheck(`  ${specRelativePath}`, doesFileExist(join(specDrivenDirectory, specRelativePath)), 'branch');
                    }
                }
            }
        }
    }

    // === Print recommendation ===
    console.log('');
    if (frameworkHealthy && branchHealthy) {
        logger.success('All checks passed. Repository is fully set up.');
    } else if (!frameworkHealthy) {
        logger.warn('Framework files missing. Run `united-we-stand install` to set up.');
    } else {
        logger.warn('Branch memory not initialized. Run `united-we-stand branch-init "<idea>"` to set up.');
    }
}
