/**
 * Refresh command: re-applies templates and updates managed blocks.
 *
 * Re-upserts AGENTS.md and copilot instructions managed blocks, and
 * recreates any missing framework docs, steering docs, playbooks, and agents.
 * Existing files are preserved.
 */

import { join } from 'node:path';
import { isGitRepository } from '../lib/git.js';
import { ensureDirectoryExists, writeFileIfMissing, upsertFileWithManagedBlock } from '../lib/fs.js';
import { createLogger } from '../lib/logger.js';
import {
    loadAgentsMdBlockTemplate,
    loadCopilotInstructionsTemplate,
    loadAntigravityWorkflowTemplate,
    loadCursorRuleTemplate,
    loadFrameworkReadmeTemplate,
    loadFrameworkFiles,
    loadSteeringFiles,
    loadPlaybookFiles,
    loadFrameworkAgentFiles,
    loadStandaloneAgentFiles,
} from '../lib/templates.js';

/** Options accepted by the refresh command. */
export interface RefreshCommandOptions {
    workingDirectory: string;
    isDryRun: boolean;
}

/**
 * Runs the refresh command: re-applies managed blocks and recreates missing agent files.
 */
export function runRefreshCommand(options: RefreshCommandOptions): void {
    const logger = createLogger(options.isDryRun);
    const { workingDirectory, isDryRun } = options;

    // Verify the target is a git repository.
    if (!isGitRepository(workingDirectory)) {
        logger.error(`Not a git repository: ${workingDirectory}`);
        logger.info('Run this command inside a git repository.');
        process.exitCode = 1;
        return;
    }

    logger.info('Refreshing united-we-stand framework files...');

    // Re-apply managed blocks to AGENTS.md and copilot instructions.
    const agentsMdPath = join(workingDirectory, 'AGENTS.md');
    upsertFileWithManagedBlock(agentsMdPath, loadAgentsMdBlockTemplate(), isDryRun, logger);

    const githubDirectory = join(workingDirectory, '.github');
    ensureDirectoryExists(githubDirectory, isDryRun, logger);
    const copilotInstructionsPath = join(githubDirectory, 'copilot-instructions.md');
    upsertFileWithManagedBlock(copilotInstructionsPath, loadCopilotInstructionsTemplate(), isDryRun, logger);

    const antigravityWorkflowsDirectory = join(workingDirectory, '.agents', 'workflows');
    ensureDirectoryExists(antigravityWorkflowsDirectory, isDryRun, logger);
    writeFileIfMissing(
        join(antigravityWorkflowsDirectory, 'united-we-stand.md'),
        loadAntigravityWorkflowTemplate(),
        isDryRun,
        logger,
    );

    const cursorRulesDirectory = join(workingDirectory, '.cursor', 'rules');
    ensureDirectoryExists(cursorRulesDirectory, isDryRun, logger);
    writeFileIfMissing(
        join(cursorRulesDirectory, 'united-we-stand.mdc'),
        loadCursorRuleTemplate(),
        isDryRun,
        logger,
    );

    const frameworkRootDirectory = join(workingDirectory, '.united-we-stand');
    ensureDirectoryExists(frameworkRootDirectory, isDryRun, logger);
    writeFileIfMissing(join(frameworkRootDirectory, 'README.md'), loadFrameworkReadmeTemplate(), isDryRun, logger);

    const frameworkDirectory = join(frameworkRootDirectory, 'framework');
    ensureDirectoryExists(frameworkDirectory, isDryRun, logger);
    for (const frameworkFile of loadFrameworkFiles()) {
        writeFileIfMissing(join(frameworkRootDirectory, frameworkFile.relativePath), frameworkFile.content, isDryRun, logger);
    }

    const steeringDirectory = join(frameworkRootDirectory, 'steering');
    ensureDirectoryExists(steeringDirectory, isDryRun, logger);
    for (const steeringFile of loadSteeringFiles()) {
        writeFileIfMissing(join(frameworkRootDirectory, steeringFile.relativePath), steeringFile.content, isDryRun, logger);
    }

    const playbooksDirectory = join(frameworkRootDirectory, 'playbooks');
    ensureDirectoryExists(playbooksDirectory, isDryRun, logger);
    for (const playbookFile of loadPlaybookFiles()) {
        writeFileIfMissing(join(frameworkRootDirectory, playbookFile.relativePath), playbookFile.content, isDryRun, logger);
    }

    // Recreate any missing agent files (existing ones are kept intact).
    const agentsDirectory = join(frameworkRootDirectory, 'agents');
    ensureDirectoryExists(agentsDirectory, isDryRun, logger);

    for (const agentFile of loadFrameworkAgentFiles()) {
        writeFileIfMissing(join(agentsDirectory, agentFile.filename), agentFile.content, isDryRun, logger);
    }
    for (const agentFile of loadStandaloneAgentFiles()) {
        writeFileIfMissing(join(agentsDirectory, agentFile.filename), agentFile.content, isDryRun, logger);
    }

    logger.success('united-we-stand refreshed successfully.');
}
