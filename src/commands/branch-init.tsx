/**
 * Init command: initializes the current branch with an idea description.
 *
 * Detects the current git branch, creates the branch memory folder with
 * initializer bootstrap files, saves the user's idea into 01-init.md, and updates
 * 00-current-status.md to reflect that initializer work is active.
 */

import { join } from 'node:path';
import { rmSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { isGitRepository, getCurrentBranchName, tryGetDefaultBranchName } from '../lib/git.js';
import { sanitizeBranchName } from '../lib/branch.js';
import {
    ensureDirectoryExists,
    readFileOrNull,
    writeFileWithDirectories,
    doesFileExist,
} from '../lib/fs.js';
import { upsertManagedBlock } from '../lib/markers.js';
import { createLogger } from '../lib/logger.js';
import {
    readBranchRoutingMap,
    writeBranchRoutingMap,
    resolveBranchMemoryFolderName,
} from '../lib/branch-routing.js';
import {
    loadInitSpecTemplate,
    loadCurrentStatusSpecTemplate,
    buildCapturedIdeaBlock,
    buildOverviewStageBlock,
} from '../lib/templates.js';
import {
    buildInitializedBranchRuntimeState,
    parseBranchRuntimeState,
    serializeBranchRuntimeState,
} from '../lib/runtime-state.js';

export interface InitCommandOptions {
    workingDirectory: string;
    isDryRun: boolean;
    ideaText?: string;
    branchNameOverride?: string;
    force?: boolean;
}

const IDEA_MARKER_START = '<!-- united-we-stand:captured-idea:start -->';
const IDEA_MARKER_END = '<!-- united-we-stand:captured-idea:end -->';

/**
 * Inserts or replaces the captured-idea block inside `01-init.md`.
 * Prefers explicit markers and falls back to replacing the exact raw-idea section.
 */
function upsertCapturedIdeaBlock(existingContent: string, ideaText: string): string {
    const ideaBlock = `${IDEA_MARKER_START}\n${buildCapturedIdeaBlock(ideaText).trimEnd()}\n${IDEA_MARKER_END}`;

    if (existingContent.includes(IDEA_MARKER_START) && existingContent.includes(IDEA_MARKER_END)) {
        const markerPattern = new RegExp(
            `${escapeRegExpChars(IDEA_MARKER_START)}[\\s\\S]*?${escapeRegExpChars(IDEA_MARKER_END)}`,
            'm',
        );
        return existingContent.replace(markerPattern, ideaBlock);
    }

    if (/## Raw idea \/ problem statement/i.test(existingContent)) {
        return existingContent.replace(
            /(## Raw idea \/ problem statement\s*\r?\n)([\s\S]*?)(?=\r?\n##\s|$)/i,
            `$1${ideaBlock}\n`,
        );
    }

    const separator = existingContent.endsWith('\n') ? '\n' : '\n\n';
    return existingContent
        + separator
        + '## Raw idea / problem statement\n'
        + ideaBlock
        + '\n';
}

/**
 * Escapes marker text for safe use inside RegExp constructors.
 */
function escapeRegExpChars(rawString: string): string {
    return rawString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Reads the current branch name from status markdown for backward compatibility.
 */
function parseCurrentBranchFromStatus(statusContent: string): string | null {
    const currentBranchMatch = statusContent.match(/\|\s*Current branch\s*\|\s*`?([^|`]+)`?\s*\|/i);
    if (currentBranchMatch && currentBranchMatch[1]) {
        return currentBranchMatch[1].trim();
    }

    // Backward-compatibility with older templates that used `Branch`.
    const legacyBranchMatch = statusContent.match(/\|\s*Branch\s*\|\s*`?([^|`]+)`?\s*\|/i);
    if (legacyBranchMatch && legacyBranchMatch[1]) {
        return legacyBranchMatch[1].trim();
    }

    return null;
}

/**
 * Reads a single status-table field from `00-current-status.md`.
 */
function parseStatusField(statusContent: string, fieldLabel: string): string | null {
    const fieldPattern = new RegExp(`\\|\\s*${escapeRegExpChars(fieldLabel)}\\s*\\|\\s*([^|]+)\\|`, 'i');
    const fieldMatch = statusContent.match(fieldPattern);
    if (!fieldMatch || !fieldMatch[1]) {
        return null;
    }

    return fieldMatch[1].replace(/`/g, '').trim();
}

/**
 * Reads machine-readable branch identity first and falls back to status markdown.
 */
function readLinkedBranchIdentity(specFolderPath: string): { branchName: string | null; branchMemoryFolder: string | null } {
    const runtimeStatePath = join(specFolderPath, 'state.json');
    const runtimeStateContent = readFileOrNull(runtimeStatePath);
    const parsedRuntimeState = runtimeStateContent ? parseBranchRuntimeState(runtimeStateContent) : null;
    if (parsedRuntimeState) {
        return {
            branchName: parsedRuntimeState.branchName,
            branchMemoryFolder: parsedRuntimeState.branchMemoryFolder,
        };
    }

    const statusPath = join(specFolderPath, '00-current-status.md');
    const statusContent = readFileOrNull(statusPath);
    if (!statusContent) {
        return {
            branchName: null,
            branchMemoryFolder: null,
        };
    }

    return {
        branchName: parseCurrentBranchFromStatus(statusContent),
        branchMemoryFolder: null,
    };
}

/**
 * Returns whether an existing spec folder is already linked to the requested branch.
 */
function isSpecFolderAlreadyLinkedToBranch(specFolderPath: string, branchName: string): boolean {
    const linkedBranchIdentity = readLinkedBranchIdentity(specFolderPath);
    return linkedBranchIdentity.branchName === branchName;
}

/**
 * Reads the current stage and next recommended step from existing branch memory.
 */
function readExistingBranchStatusSummary(specFolderPath: string): {
    currentStage: string | null;
    nextRecommendedStep: string | null;
} {
    const runtimeStatePath = join(specFolderPath, 'state.json');
    const runtimeStateContent = readFileOrNull(runtimeStatePath);
    const parsedRuntimeState = runtimeStateContent ? parseBranchRuntimeState(runtimeStateContent) : null;
    if (parsedRuntimeState) {
        return {
            currentStage: parsedRuntimeState.currentStage,
            nextRecommendedStep: parsedRuntimeState.nextRecommendedStep,
        };
    }

    const statusPath = join(specFolderPath, '00-current-status.md');
    const statusContent = readFileOrNull(statusPath);
    if (!statusContent) {
        return {
            currentStage: null,
            nextRecommendedStep: null,
        };
    }

    return {
        currentStage: parseStatusField(statusContent, 'Current stage'),
        nextRecommendedStep: parseStatusField(statusContent, 'Next recommended step'),
    };
}

const REUSE_EXISTING_FOLDER_TOKEN = '__REUSE_EXISTING_FOLDER__';

/**
 * Prompts the user to resolve a branch-folder collision when interactive input is available.
 */
async function promptForCollisionResolution(defaultFolderName: string): Promise<string | null> {
    if (!input.isTTY || !output.isTTY) {
        return null;
    }

    const prompt = createInterface({ input, output });
    try {
        const shouldReuseExisting = (await prompt.question(
            `Branch memory folder ".spec-driven/${defaultFolderName}" already exists. Reuse it? [y/N]: `,
        )).trim().toLowerCase();

        if (shouldReuseExisting === 'y' || shouldReuseExisting === 'yes') {
            return REUSE_EXISTING_FOLDER_TOKEN;
        }

        const alternateFolderName = (await prompt.question(
            'Enter a different folder name for this branch memory (empty to cancel): ',
        )).trim();

        return alternateFolderName || null;
    } finally {
        prompt.close();
    }
}

/**
 * Prompts the user before writing framework memory on the repository default branch.
 */
async function promptForDefaultBranchInitialization(branchName: string): Promise<boolean | null> {
    if (!input.isTTY || !output.isTTY) {
        return null;
    }

    const prompt = createInterface({ input, output });
    try {
        const answer = (await prompt.question(
            `Branch "${branchName}" is the repository default branch. Continue writing framework memory on it? [y/N]: `,
        )).trim().toLowerCase();

        return answer === 'y' || answer === 'yes';
    } finally {
        prompt.close();
    }
}

export async function runBranchInitCommand(options: InitCommandOptions): Promise<void> {
    const logger = createLogger(options.isDryRun);
    const {
        workingDirectory,
        isDryRun,
        ideaText,
        branchNameOverride,
        force = false,
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

    const defaultBranchName = tryGetDefaultBranchName(workingDirectory);
    const sanitizedBranchName = sanitizeBranchName(currentBranch);
    if (!sanitizedBranchName) {
        logger.error(`Unable to sanitize branch name: "${currentBranch}"`);
        logger.info('Use a branch name that contains letters or numbers, or provide `--branch <name>`.');
        process.exitCode = 1;
        return;
    }

    const branchRoutingMap = readBranchRoutingMap(workingDirectory);
    let branchMemoryFolderName = resolveBranchMemoryFolderName(
        currentBranch,
        sanitizedBranchName,
        branchRoutingMap,
    );

    const specDrivenRootDirectory = join(workingDirectory, '.spec-driven');

    // Collision policy is enforced only when establishing a new branch routing.
    if (!branchRoutingMap[currentBranch]) {
        let didUserConfirmReuse = false;
        while (true) {
            // Reuse is only safe when the existing folder is already linked to the same branch.
            const candidateDirectoryPath = join(specDrivenRootDirectory, branchMemoryFolderName);
            const hasFolderCollision = doesFileExist(candidateDirectoryPath)
                && !isSpecFolderAlreadyLinkedToBranch(candidateDirectoryPath, currentBranch);

            if (!hasFolderCollision) {
                break;
            }

            const promptResult = await promptForCollisionResolution(branchMemoryFolderName);
            if (!promptResult) {
                logger.error(`Folder collision detected at ".spec-driven/${branchMemoryFolderName}".`);
                logger.info('Run in interactive mode to confirm reuse or provide a different folder name.');
                process.exitCode = 1;
                return;
            }

            if (promptResult === REUSE_EXISTING_FOLDER_TOKEN) {
                didUserConfirmReuse = true;
                break;
            }

            const sanitizedPromptFolderName = sanitizeBranchName(promptResult);
            if (!sanitizedPromptFolderName) {
                logger.warn(`Provided folder name "${promptResult}" is not valid after sanitization.`);
                continue;
            }

            branchMemoryFolderName = sanitizedPromptFolderName;
        }

        // If user explicitly confirmed reuse of an already-existing collided folder, proceed.
        if (didUserConfirmReuse) {
            logger.info(`Using existing branch memory folder ".spec-driven/${branchMemoryFolderName}" by user confirmation.`);
        }
    }

    const specDrivenDirectory = join(specDrivenRootDirectory, branchMemoryFolderName);
    const branchAlreadyInitialized = doesFileExist(specDrivenDirectory)
        && (
            branchRoutingMap[currentBranch] === branchMemoryFolderName
            || isSpecFolderAlreadyLinkedToBranch(specDrivenDirectory, currentBranch)
        );

    const isDefaultBranchTarget = defaultBranchName !== null && currentBranch === defaultBranchName;

    const isDefaultBranchWrite = isDefaultBranchTarget && (!branchAlreadyInitialized || force);

    if (isDefaultBranchWrite) {
        logger.warn(`"${currentBranch}" is detected as the repository default branch.`);
        logger.warn('Writing framework memory on the default branch can make later feature work, branch-specific specs, and long-lived workflow state harder to manage.');

        const didConfirmDefaultBranchInitialization = await promptForDefaultBranchInitialization(currentBranch);
        if (didConfirmDefaultBranchInitialization !== true) {
            logger.error('Default-branch framework writes require explicit confirmation.');
            logger.info('Create or checkout a feature branch first, or rerun `branch-init` interactively and confirm if you intentionally want to write framework memory on the default branch.');
            process.exitCode = 1;
            return;
        }

        logger.info(`Proceeding with framework writes on default branch "${currentBranch}" by user confirmation.`);
    }

    if (branchAlreadyInitialized && !force) {
        const branchStatusSummary = readExistingBranchStatusSummary(specDrivenDirectory);
        logger.warn(`Branch memory already exists for "${currentBranch}" at ".spec-driven/${branchMemoryFolderName}".`);
        if (branchStatusSummary.currentStage) {
            logger.info(`Current stage: ${branchStatusSummary.currentStage}`);
        }
        if (branchStatusSummary.nextRecommendedStep) {
            logger.info(`Next recommended step: ${branchStatusSummary.nextRecommendedStep}`);
        }
        logger.info('Re-running `branch-init` does not reset existing branch memory.');
        logger.info('Reset is only allowed when you explicitly rerun with `--force`.');
        logger.info('That reset only affects `.spec-driven/...` branch memory and does not revert code changes.');
        process.exitCode = 1;
        return;
    }

    logger.info(`Branch: ${currentBranch} -> ${branchMemoryFolderName}`);

    ensureDirectoryExists(specDrivenRootDirectory, isDryRun, logger);

    if (branchAlreadyInitialized && force) {
        logger.warn(`Resetting existing branch memory for "${currentBranch}" because --force was provided.`);
        if (!isDryRun) {
            rmSync(specDrivenDirectory, { recursive: true, force: true });
        }
    }

    ensureDirectoryExists(specDrivenDirectory, isDryRun, logger);

    const initFilePath = join(specDrivenDirectory, '01-init.md');
    let initFileContent = readFileOrNull(initFilePath) ?? loadInitSpecTemplate();
    initFileContent = upsertCapturedIdeaBlock(initFileContent, safeIdeaText);

    if (!isDryRun) {
        writeFileWithDirectories(initFilePath, initFileContent, false, logger);
    }
    logger.updated(initFilePath);

    const overviewFilePath = join(specDrivenDirectory, '00-current-status.md');
    const existingOverviewContent = readFileOrNull(overviewFilePath)
        ?? loadCurrentStatusSpecTemplate(currentBranch, branchMemoryFolderName);
    const overviewBlockContent = buildOverviewStageBlock(
        currentBranch,
        branchMemoryFolderName,
        '1-initializer',
        'none',
        'none',
        '1-initializer',
        'Initializer is active. Capture scope, assumptions, open questions, and success criteria before moving to planning.',
    );
    const updatedOverviewContent = upsertManagedBlock(existingOverviewContent, overviewBlockContent);

    if (!isDryRun) {
        writeFileWithDirectories(overviewFilePath, updatedOverviewContent, false, logger);
    }
    logger.updated(overviewFilePath);

    const runtimeStatePath = join(specDrivenDirectory, 'state.json');
    const initializedRuntimeState = buildInitializedBranchRuntimeState({
        branchName: currentBranch,
        sanitizedBranchName,
        branchMemoryFolder: branchMemoryFolderName,
    });
    if (!isDryRun) {
        writeFileWithDirectories(
            runtimeStatePath,
            serializeBranchRuntimeState(initializedRuntimeState),
            false,
            logger,
        );
    }
    logger.updated(runtimeStatePath);

    const currentMappedFolderName = branchRoutingMap[currentBranch];
    const shouldPersistException = branchMemoryFolderName !== sanitizedBranchName;

    // Persist routing only when the actual folder differs from the default sanitized branch name.
    if (shouldPersistException && currentMappedFolderName !== branchMemoryFolderName) {
        const nextBranchRoutingMap = {
            ...branchRoutingMap,
            [currentBranch]: branchMemoryFolderName,
        };
        writeBranchRoutingMap(workingDirectory, nextBranchRoutingMap, isDryRun, logger);
    } else if (!shouldPersistException && currentMappedFolderName) {
        const nextBranchRoutingMap = { ...branchRoutingMap };
        delete nextBranchRoutingMap[currentBranch];
        writeBranchRoutingMap(workingDirectory, nextBranchRoutingMap, isDryRun, logger);
    }

    logger.success(`Branch "${currentBranch}" initialized.`);
}
