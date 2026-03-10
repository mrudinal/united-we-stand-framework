/**
 * Init command: initializes the current branch with an idea description.
 *
 * Detects the current git branch, creates the branch memory folder with all
 * spec files, saves the user's idea into 01-init.md, and updates
 * 00-current-status.md with the "initialized" stage.
 */

import { join } from 'node:path';
import { isGitRepository, getCurrentBranchName } from '../lib/git.js';
import { sanitizeBranchName } from '../lib/branch.js';
import {
    ensureDirectoryExists,
    readFileOrNull,
    writeFileWithDirectories,
    writeFileIfMissing,
    doesFileExist,
} from '../lib/fs.js';
import { upsertManagedBlock } from '../lib/markers.js';
import { createLogger } from '../lib/logger.js';
import {
    loadInitSpecTemplate,
    loadCurrentStatusSpecTemplate,
    buildCapturedIdeaBlock,
    buildOverviewStageBlock,
    loadBranchSpecFiles,
} from '../lib/templates.js';

export interface InitCommandOptions {
    workingDirectory: string;
    isDryRun: boolean;
    ideaText?: string;
    branchNameOverride?: string;
}

const IDEA_MARKER_START = '<!-- united-we-stand:captured-idea:start -->';
const IDEA_MARKER_END = '<!-- united-we-stand:captured-idea:end -->';

function upsertCapturedIdeaBlock(existingContent: string, ideaText: string): string {
    const ideaBlock = `${IDEA_MARKER_START}\n${buildCapturedIdeaBlock(ideaText).trimEnd()}\n${IDEA_MARKER_END}`;

    if (existingContent.includes(IDEA_MARKER_START) && existingContent.includes(IDEA_MARKER_END)) {
        const markerPattern = new RegExp(
            `${escapeRegExpChars(IDEA_MARKER_START)}[\\s\\S]*?${escapeRegExpChars(IDEA_MARKER_END)}`,
            'm',
        );
        return existingContent.replace(markerPattern, ideaBlock);
    }

    if (/## Raw idea/i.test(existingContent)) {
        return existingContent.replace(
            /## Raw idea[\s\S]*?(?=\n## |\n$|$)/m,
            ideaBlock + '\n',
        );
    }

    const separator = existingContent.endsWith('\n') ? '\n' : '\n\n';
    return existingContent + separator + ideaBlock + '\n';
}

function escapeRegExpChars(rawString: string): string {
    return rawString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function runBranchInitCommand(options: InitCommandOptions): void {
    const logger = createLogger(options.isDryRun);
    const {
        workingDirectory,
        isDryRun,
        ideaText,
        branchNameOverride,
    } = options;

    if (!isGitRepository(workingDirectory)) {
        logger.error(`Not a git repository: ${workingDirectory}`);
        logger.info('Run this command inside a git repository.');
        process.exitCode = 1;
        return;
    }

    const frameworkIndexPath = join(workingDirectory, '.united-we-stand', 'framework', '00-index.md');
    if (!doesFileExist(frameworkIndexPath)) {
        logger.error('Framework files are not installed in this repository.');
        logger.info('Run `united-we-stand install` first, then run `united-we-stand branch-init "<idea>"`.');
        process.exitCode = 1;
        return;
    }

    const safeIdeaText = ideaText || 'Work on the current branch';
    let currentBranch: string;
    if (branchNameOverride && branchNameOverride.trim().length > 0) {
        currentBranch = branchNameOverride.trim();
    } else {
        try {
            currentBranch = getCurrentBranchName(workingDirectory);
        } catch {
            logger.error('Unable to determine branch name because repository is in detached HEAD state.');
            logger.info('Checkout a named branch and retry, or run `united-we-stand branch-init --branch <name> "<idea>"`.');
            process.exitCode = 1;
            return;
        }
    }

    if (currentBranch.toUpperCase() === 'HEAD') {
        logger.error('Refusing to initialize branch memory for reserved branch name "HEAD".');
        logger.info('Use a real branch name or provide `--branch <name>` with a non-HEAD value.');
        process.exitCode = 1;
        return;
    }

    const sanitizedBranch = sanitizeBranchName(currentBranch);
    if (!sanitizedBranch) {
        logger.error(`Unable to sanitize branch name: "${currentBranch}"`);
        logger.info('Use a branch name that contains letters or numbers, or provide `--branch <name>`.');
        process.exitCode = 1;
        return;
    }

    logger.info(`Branch: ${currentBranch} -> ${sanitizedBranch}`);

    const specDrivenDirectory = join(workingDirectory, '.spec-driven', sanitizedBranch);
    ensureDirectoryExists(specDrivenDirectory, isDryRun, logger);

    for (const specFile of loadBranchSpecFiles(currentBranch, sanitizedBranch)) {
        if (specFile.relativePath === '00-current-status.md' || specFile.relativePath === '01-init.md') {
            continue;
        }
        writeFileIfMissing(join(specDrivenDirectory, specFile.relativePath), specFile.content, isDryRun, logger);
    }

    const initFilePath = join(specDrivenDirectory, '01-init.md');
    let initFileContent = readFileOrNull(initFilePath) ?? loadInitSpecTemplate();
    initFileContent = upsertCapturedIdeaBlock(initFileContent, safeIdeaText);

    if (!isDryRun) {
        writeFileWithDirectories(initFilePath, initFileContent, false, logger);
    }
    logger.updated(initFilePath);

    const overviewFilePath = join(specDrivenDirectory, '00-current-status.md');
    const existingOverviewContent = readFileOrNull(overviewFilePath)
        ?? loadCurrentStatusSpecTemplate(currentBranch, sanitizedBranch);
    const overviewBlockContent = buildOverviewStageBlock(
        currentBranch,
        sanitizedBranch,
        '1-initializer',
        'none',
        'none',
        '2-planner',
        'Initialization is complete. Advance explicitly when ready to move to planning.',
    );
    const updatedOverviewContent = upsertManagedBlock(existingOverviewContent, overviewBlockContent);

    if (!isDryRun) {
        writeFileWithDirectories(overviewFilePath, updatedOverviewContent, false, logger);
    }
    logger.updated(overviewFilePath);

    logger.success(`Branch "${currentBranch}" initialized.`);
}
