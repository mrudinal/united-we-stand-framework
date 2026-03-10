/**
 * Install command: sets up the united-we-stand framework in the target repository.
 *
 * Creates AGENTS.md, copilot instructions, and all agent markdown files.
 * With --force, ignores existing user edits and overwrites files with global templates.
 */

import { join } from 'node:path';
import { isGitRepository } from '../lib/git.js';
import { ensureDirectoryExists, writeFileIfMissing, upsertFileWithManagedBlock, overwriteFileWithManagedBlock, writeFileWithDirectories } from '../lib/fs.js';
import { createLogger } from '../lib/logger.js';
import {
    loadAgentsMdBlockTemplate,
    loadCopilotInstructionsTemplate,
    loadFrameworkAgentFiles,
    loadStandaloneAgentFiles,
} from '../lib/templates.js';

/** Options accepted by the install command. */
export interface InstallCommandOptions {
    workingDirectory: string;
    isDryRun: boolean;
    force: boolean;
}

/**
 * Runs the install command: applies templates locally.
 */
export async function runInstallCommand(options: InstallCommandOptions): Promise<void> {
    const logger = createLogger(options.isDryRun);
    const { workingDirectory, isDryRun, force } = options;

    if (!isGitRepository(workingDirectory)) {
        logger.error(`Not a git repository: ${workingDirectory}`);
        logger.info('Run this command inside a git repository.');
        process.exitCode = 1;
        return;
    }

    if (force) {
        logger.info('Installing united-we-stand framework files (FORCE mode enabled)...');
    } else {
        logger.info('Installing united-we-stand framework files...');
    }

    const agentsMdPath = join(workingDirectory, 'AGENTS.md');
    const githubDirectory = join(workingDirectory, '.github');
    ensureDirectoryExists(githubDirectory, isDryRun, logger);
    const copilotInstructionsPath = join(githubDirectory, 'copilot-instructions.md');

    if (force) {
        overwriteFileWithManagedBlock(agentsMdPath, loadAgentsMdBlockTemplate(), isDryRun, logger);
        overwriteFileWithManagedBlock(copilotInstructionsPath, loadCopilotInstructionsTemplate(), isDryRun, logger);
    } else {
        upsertFileWithManagedBlock(agentsMdPath, loadAgentsMdBlockTemplate(), isDryRun, logger);
        upsertFileWithManagedBlock(copilotInstructionsPath, loadCopilotInstructionsTemplate(), isDryRun, logger);
    }

    const agentsDirectory = join(workingDirectory, '.united-we-stand', 'agents');
    ensureDirectoryExists(agentsDirectory, isDryRun, logger);

    for (const agentFile of loadFrameworkAgentFiles()) {
        const filePath = join(agentsDirectory, agentFile.filename);
        if (force) {
            writeFileWithDirectories(filePath, agentFile.content, isDryRun, logger);
            logger.updated(filePath + ' (FORCED OVERWRITE)');
        } else {
            writeFileIfMissing(filePath, agentFile.content, isDryRun, logger);
        }
    }

    for (const agentFile of loadStandaloneAgentFiles()) {
        const filePath = join(agentsDirectory, agentFile.filename);
        if (force) {
            writeFileWithDirectories(filePath, agentFile.content, isDryRun, logger);
            logger.updated(filePath + ' (FORCED OVERWRITE)');
        } else {
            writeFileIfMissing(filePath, agentFile.content, isDryRun, logger);
        }
    }

    logger.success('united-we-stand installation complete.');
}
