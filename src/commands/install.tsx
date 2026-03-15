/**
 * Install command: sets up the united-we-stand framework in the target repository.
 *
 * Creates AGENTS.md, copilot instructions, and the full `.united-we-stand/`
 * framework tree (framework, steering, agents, playbooks).
 * With --force, ignores existing user edits and overwrites files with global templates.
 */

import { join } from 'node:path';
import { isGitRepository } from '../lib/git.js';
import { ensureDirectoryExists, writeFileIfMissing, upsertFileWithManagedBlock, writeFileWithDirectories } from '../lib/fs.js';
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
import { tryStarRepository } from '../lib/github.js';

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
    const antigravityWorkflowsDirectory = join(workingDirectory, '.agents', 'workflows');
    const cursorRulesDirectory = join(workingDirectory, '.cursor', 'rules');
    const frameworkRootDirectory = join(workingDirectory, '.united-we-stand');
    const frameworkDirectory = join(frameworkRootDirectory, 'framework');
    const steeringDirectory = join(frameworkRootDirectory, 'steering');
    const playbooksDirectory = join(frameworkRootDirectory, 'playbooks');
    const agentsDirectory = join(frameworkRootDirectory, 'agents');

    ensureDirectoryExists(githubDirectory, isDryRun, logger);
    ensureDirectoryExists(antigravityWorkflowsDirectory, isDryRun, logger);
    ensureDirectoryExists(cursorRulesDirectory, isDryRun, logger);
    ensureDirectoryExists(frameworkRootDirectory, isDryRun, logger);
    ensureDirectoryExists(frameworkDirectory, isDryRun, logger);
    ensureDirectoryExists(steeringDirectory, isDryRun, logger);
    ensureDirectoryExists(playbooksDirectory, isDryRun, logger);
    ensureDirectoryExists(agentsDirectory, isDryRun, logger);

    const copilotInstructionsPath = join(githubDirectory, 'copilot-instructions.md');
    const antigravityWorkflowPath = join(antigravityWorkflowsDirectory, 'united-we-stand.md');
    const cursorRulePath = join(cursorRulesDirectory, 'united-we-stand.mdc');
    const frameworkReadmePath = join(frameworkRootDirectory, 'README.md');

    if (force) {
        // For user-owned files with managed blocks: update only the block, preserve everything outside it.
        upsertFileWithManagedBlock(agentsMdPath, loadAgentsMdBlockTemplate(), isDryRun, logger);
        upsertFileWithManagedBlock(copilotInstructionsPath, loadCopilotInstructionsTemplate(), isDryRun, logger);
        writeFileWithDirectories(antigravityWorkflowPath, loadAntigravityWorkflowTemplate(), isDryRun, logger);
        logger.updated(antigravityWorkflowPath + ' (FORCED OVERWRITE)');
        writeFileWithDirectories(cursorRulePath, loadCursorRuleTemplate(), isDryRun, logger);
        logger.updated(cursorRulePath + ' (FORCED OVERWRITE)');
        writeFileWithDirectories(frameworkReadmePath, loadFrameworkReadmeTemplate(), isDryRun, logger);
        logger.updated(frameworkReadmePath + ' (FORCED OVERWRITE)');
    } else {
        upsertFileWithManagedBlock(agentsMdPath, loadAgentsMdBlockTemplate(), isDryRun, logger);
        upsertFileWithManagedBlock(copilotInstructionsPath, loadCopilotInstructionsTemplate(), isDryRun, logger);
        writeFileIfMissing(antigravityWorkflowPath, loadAntigravityWorkflowTemplate(), isDryRun, logger);
        writeFileIfMissing(cursorRulePath, loadCursorRuleTemplate(), isDryRun, logger);
        writeFileIfMissing(frameworkReadmePath, loadFrameworkReadmeTemplate(), isDryRun, logger);
    }

    for (const frameworkFile of loadFrameworkFiles()) {
        const filePath = join(frameworkRootDirectory, frameworkFile.relativePath);
        if (force) {
            writeFileWithDirectories(filePath, frameworkFile.content, isDryRun, logger);
            logger.updated(filePath + ' (FORCED OVERWRITE)');
        } else {
            writeFileIfMissing(filePath, frameworkFile.content, isDryRun, logger);
        }
    }

    for (const steeringFile of loadSteeringFiles()) {
        const filePath = join(frameworkRootDirectory, steeringFile.relativePath);
        if (force) {
            writeFileWithDirectories(filePath, steeringFile.content, isDryRun, logger);
            logger.updated(filePath + ' (FORCED OVERWRITE)');
        } else {
            writeFileIfMissing(filePath, steeringFile.content, isDryRun, logger);
        }
    }

    for (const playbookFile of loadPlaybookFiles()) {
        const filePath = join(frameworkRootDirectory, playbookFile.relativePath);
        if (force) {
            writeFileWithDirectories(filePath, playbookFile.content, isDryRun, logger);
            logger.updated(filePath + ' (FORCED OVERWRITE)');
        } else {
            writeFileIfMissing(filePath, playbookFile.content, isDryRun, logger);
        }
    }

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

    // Best-effort: attempt to star the source repository on GitHub.
    if (!isDryRun) {
        await tryStarRepository(logger);
    }
}
