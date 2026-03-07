/**
 * Postinstall script: sets up the united-we-stand framework in the target repository.
 *
 * Runs automatically during `npm install`.
 * Creates AGENTS.md, copilot instructions, and all agent markdown files,
 * and attempts to star the GitHub repository.
 */

import { join } from 'node:path';
import { isGitRepository } from '../lib/git.js';
import { ensureDirectoryExists, writeFileIfMissing, upsertFileWithManagedBlock } from '../lib/fs.js';
import { createLogger } from '../lib/logger.js';
import { tryStarRepository } from '../lib/github.js';
import {
    loadAgentsMdBlockTemplate,
    loadCopilotInstructionsTemplate,
    loadFrameworkAgentFiles,
    loadStandaloneAgentFiles,
} from '../lib/templates.js';

export async function runPostinstall(): Promise<void> {
    const logger = createLogger(false);

    // Determine the target directory. When npm runs a postinstall script,
    // INIT_CWD is the directory where the user ran `npm install`.
    // Fallback to process.cwd() if INIT_CWD is missing.
    const targetDirectory = process.env.INIT_CWD || process.cwd();

    // Do not fail hard if not a git repo, since it's just a postinstall hook.
    if (!isGitRepository(targetDirectory)) {
        logger.info(`Not inside a git repository (${targetDirectory}). Skipping framework file creation.`);
        return;
    }

    logger.info('Initializing united-we-stand framework files...');

    // Create or update AGENTS.md with the managed block.
    const agentsMdPath = join(targetDirectory, 'AGENTS.md');
    upsertFileWithManagedBlock(agentsMdPath, loadAgentsMdBlockTemplate(), false, logger);

    // Create or update .github/copilot-instructions.md with the managed block.
    const githubDirectory = join(targetDirectory, '.github');
    ensureDirectoryExists(githubDirectory, false, logger);
    const copilotInstructionsPath = join(githubDirectory, 'copilot-instructions.md');
    upsertFileWithManagedBlock(copilotInstructionsPath, loadCopilotInstructionsTemplate(), false, logger);

    // Create all agent markdown files (framework + standalone).
    const agentsDirectory = join(targetDirectory, '.united-we-stand', 'agents');
    ensureDirectoryExists(agentsDirectory, false, logger);

    for (const agentFile of loadFrameworkAgentFiles()) {
        writeFileIfMissing(join(agentsDirectory, agentFile.filename), agentFile.content, false, logger);
    }
    for (const agentFile of loadStandaloneAgentFiles()) {
        writeFileIfMissing(join(agentsDirectory, agentFile.filename), agentFile.content, false, logger);
    }

    logger.success('united-we-stand package installation complete. Agents created.');

    // Best-effort GitHub star.
    await tryStarRepository(logger);
}

// Run the function when the script is executed directly.
if (import.meta.url === `file://${process.argv[1]}`) {
    runPostinstall().catch((err) => {
        console.error('Postinstall error:', err);
    });
}
