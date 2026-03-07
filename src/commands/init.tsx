/**
 * Init command: initializes the current branch with an idea description.
 *
 * Detects the current git branch, creates the spec-driven folder with all
 * spec files, saves the user's idea into 01-init.md, and updates
 * 00-overview.md with the "initialized" stage.
 */

import { join } from 'node:path';
import { isGitRepository, getCurrentBranchName } from '../lib/git.js';
import { sanitizeBranchName } from '../lib/branch.js';
import { ensureDirectoryExists, readFileOrNull, writeFileWithDirectories, writeFileIfMissing } from '../lib/fs.js';
import { upsertManagedBlock } from '../lib/markers.js';
import { createLogger } from '../lib/logger.js';
import {
    loadInitSpecTemplate,
    buildCapturedIdeaBlock,
    buildOverviewStageBlock,
    loadBranchSpecFiles,
} from '../lib/templates.js';

export interface InitCommandOptions {
    workingDirectory: string;
    isDryRun: boolean;
    ideaText?: string;
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

    if (existingContent.includes('_Not yet captured.')) {
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

export function runInitCommand(options: InitCommandOptions): void {
    const logger = createLogger(options.isDryRun);
    const { workingDirectory, isDryRun, ideaText } = options;

    if (!isGitRepository(workingDirectory)) {
        logger.error(`Not a git repository: ${workingDirectory}`);
        logger.info('Run this command inside a git repository.');
        process.exitCode = 1;
        return;
    }

    const safeIdeaText = ideaText || 'Work on the current branch';
    const currentBranch = getCurrentBranchName(workingDirectory);
    const sanitizedBranch = sanitizeBranchName(currentBranch);

    logger.info(`Branch: ${currentBranch} → ${sanitizedBranch}`);

    const specDrivenDirectory = join(workingDirectory, '.united-we-stand', 'spec-driven', sanitizedBranch);
    ensureDirectoryExists(specDrivenDirectory, isDryRun, logger);

    for (const specFile of loadBranchSpecFiles(currentBranch, sanitizedBranch)) {
        if (specFile.filename === '00-overview.md' || specFile.filename === '01-init.md') {
            continue;
        }
        writeFileIfMissing(join(specDrivenDirectory, specFile.filename), specFile.content, isDryRun, logger);
    }

    const initFilePath = join(specDrivenDirectory, '01-init.md');
    let initFileContent = readFileOrNull(initFilePath) ?? loadInitSpecTemplate();
    initFileContent = upsertCapturedIdeaBlock(initFileContent, safeIdeaText);

    if (!isDryRun) {
        writeFileWithDirectories(initFilePath, initFileContent, false, logger);
    }
    logger.updated(initFilePath);

    const overviewFilePath = join(specDrivenDirectory, '00-overview.md');
    const overviewBlockContent = buildOverviewStageBlock(currentBranch, sanitizedBranch, 'initialized', 'initialized', '2-planner');
    const existingOverviewContent = readFileOrNull(overviewFilePath) ?? '';
    const updatedOverviewContent = upsertManagedBlock(existingOverviewContent, overviewBlockContent);

    if (!isDryRun) {
        writeFileWithDirectories(overviewFilePath, updatedOverviewContent, false, logger);
    }
    logger.updated(overviewFilePath);

    logger.success(`Branch "${currentBranch}" initialized.`);
}
