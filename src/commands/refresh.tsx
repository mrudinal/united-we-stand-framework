/**
 * Refresh command: re-applies templates and updates managed blocks.
 *
 * Re-upserts AGENTS.md and copilot instructions managed blocks, and
 * recreates any missing agent files. Existing files are preserved.
 */

import { join } from 'node:path';
import { isGitRepository } from '../lib/git.js';
import { ensureDirectoryExists, writeFileIfMissing, upsertFileWithManagedBlock } from '../lib/fs.js';
import { createLogger } from '../lib/logger.js';
import {
    loadAgentsMdBlockTemplate,
    loadCopilotInstructionsTemplate,
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

    // Recreate any missing agent files (existing ones are kept intact).
    const agentsDirectory = join(workingDirectory, '.united-we-stand', 'agents');
    ensureDirectoryExists(agentsDirectory, isDryRun, logger);

    for (const agentFile of loadFrameworkAgentFiles()) {
        writeFileIfMissing(join(agentsDirectory, agentFile.filename), agentFile.content, isDryRun, logger);
    }
    for (const agentFile of loadStandaloneAgentFiles()) {
        writeFileIfMissing(join(agentsDirectory, agentFile.filename), agentFile.content, isDryRun, logger);
    }

    logger.success('united-we-stand refreshed successfully.');
}
