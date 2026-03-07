/**
 * Doctor command: checks repository health and reports missing files.
 *
 * Separates checks into framework-level (set up by `init`) and
 * branch-level (set up by `branch-init`) with targeted recommendations.
 */

import { join } from 'node:path';
import { isGitRepository, getCurrentBranchName } from '../lib/git.js';
import { sanitizeBranchName } from '../lib/branch.js';
import { doesFileExist, readFileOrNull } from '../lib/fs.js';
import { hasManagedBlock } from '../lib/markers.js';
import { createLogger } from '../lib/logger.js';
import { loadFrameworkAgentFiles, loadStandaloneAgentFiles, loadBranchSpecFiles } from '../lib/templates.js';

/** Options accepted by the doctor command. */
export interface DoctorCommandOptions {
    workingDirectory: string;
    isDryRun: boolean;
}

/**
 * Runs the doctor command: audits the repository for missing or misconfigured framework files.
 */
export function runDoctorCommand(options: DoctorCommandOptions): void {
    // Doctor never writes files; always uses non-dry-run logger for display.
    const logger = createLogger(false);
    const { workingDirectory } = options;

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
    logger.info('united-we-stand doctor — checking repository health\n');

    // Verify this is a git repository.
    const isGitRepo = isGitRepository(workingDirectory);
    reportCheck('Git repository detected', isGitRepo, 'framework');
    if (!isGitRepo) {
        logger.error('Not a git repository. Run `united-we-stand init` inside a git repo.');
        process.exitCode = 1;
        return;
    }

    // === Framework-level checks (created by `init`) ===
    console.log('');
    logger.info('Framework files (set up by `united-we-stand init`):');

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

    // Check agents directory.
    const agentsDirectory = join(workingDirectory, '.united-we-stand', 'agents');
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
    const currentBranch = getCurrentBranchName(workingDirectory);
    const sanitizedBranch = sanitizeBranchName(currentBranch);
    const specDrivenDirectory = join(workingDirectory, '.united-we-stand', 'spec-driven', sanitizedBranch);

    console.log('');
    logger.info(`Branch spec files — ${currentBranch} (${sanitizedBranch}):`);
    const specDirectoryExists = doesFileExist(specDrivenDirectory);
    reportCheck(`spec-driven/${sanitizedBranch}/ directory exists`, specDirectoryExists, 'branch');

    if (specDirectoryExists) {
        for (const specFile of loadBranchSpecFiles(currentBranch, sanitizedBranch)) {
            reportCheck(`  ${specFile.filename}`, doesFileExist(join(specDrivenDirectory, specFile.filename)), 'branch');
        }
    }

    // === Print recommendation ===
    console.log('');
    if (frameworkHealthy && branchHealthy) {
        logger.success('All checks passed. Repository is fully set up.');
    } else if (!frameworkHealthy) {
        logger.warn('Framework files missing. Run `united-we-stand init` to set up.');
    } else {
        logger.warn(`Branch "${currentBranch}" not initialized. Run \`united-we-stand branch-init "<idea>"\` to set up.`);
    }
}
