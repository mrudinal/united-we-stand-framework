import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { upsertManagedBlock, wrapInManagedBlock } from './markers.js';
import type { Logger } from './logger.js';

/**
 * Creates a directory (and all parent directories) if it does not already exist.
 */
export function ensureDirectoryExists(
    directoryPath: string,
    isDryRun: boolean,
    logger: Logger,
): void {
    if (existsSync(directoryPath)) {
        return;
    }

    if (isDryRun) {
        logger.created(directoryPath + '/');
        return;
    }

    mkdirSync(directoryPath, { recursive: true });
    logger.created(directoryPath + '/');
}

/**
 * Reads a file as UTF-8 text, returning null if the file does not exist.
 */
export function readFileOrNull(filePath: string): string | null {
    try {
        return readFileSync(filePath, 'utf-8');
    } catch {
        return null;
    }
}

/**
 * Checks whether a file exists at the given path.
 */
export function doesFileExist(filePath: string): boolean {
    return existsSync(filePath);
}

/**
 * Writes content to a file, creating parent directories as needed.
 * In dry-run mode the write is skipped but logged.
 */
export function writeFileWithDirectories(
    filePath: string,
    content: string,
    isDryRun: boolean,
    logger: Logger,
): void {
    if (isDryRun) {
        logger.created(filePath);
        return;
    }

    // Ensure the parent directory exists before writing.
    const parentDirectory = dirname(filePath);
    if (!existsSync(parentDirectory)) {
        mkdirSync(parentDirectory, { recursive: true });
    }

    writeFileSync(filePath, content, 'utf-8');
}

/**
 * Writes a file only if it does not already exist (skips otherwise).
 * Returns true if the file was written, false if it was skipped.
 */
export function writeFileIfMissing(
    filePath: string,
    content: string,
    isDryRun: boolean,
    logger: Logger,
): boolean {
    if (existsSync(filePath)) {
        logger.skipped(filePath);
        return false;
    }

    writeFileWithDirectories(filePath, content, isDryRun, logger);
    return true;
}

/**
 * Reads a file, upserts a managed block into the content, and writes it back.
 * Creates the file if it does not exist.
 * Skips the write if the content would be unchanged (idempotent).
 */
export function upsertFileWithManagedBlock(
    filePath: string,
    innerContent: string,
    isDryRun: boolean,
    logger: Logger,
): void {
    const existingContent = readFileOrNull(filePath) ?? '';
    const updatedContent = upsertManagedBlock(existingContent, innerContent);

    // Skip write when the content is already up to date.
    if (existingContent === updatedContent) {
        logger.skipped(filePath);
        return;
    }

    if (isDryRun) {
        if (existingContent.length === 0) {
            logger.created(filePath);
        } else {
            logger.updated(filePath);
        }
        return;
    }

    // Ensure parent directory exists before writing.
    const parentDirectory = dirname(filePath);
    if (!existsSync(parentDirectory)) {
        mkdirSync(parentDirectory, { recursive: true });
    }
    writeFileSync(filePath, updatedContent, 'utf-8');

    if (existingContent.length === 0) {
        logger.created(filePath);
    } else {
        logger.updated(filePath);
    }
}

/**
 * Completely overwrites a file with the given managed block content.
 * WARNING: Destructively ignores existing user content and only writes the managed block.
 * Used for --force commands.
 */
export function overwriteFileWithManagedBlock(
    filePath: string,
    innerContent: string,
    isDryRun: boolean,
    logger: Logger,
): void {
    const wrappedContent = wrapInManagedBlock(innerContent) + '\n';

    if (isDryRun) {
        logger.updated(filePath + ' (FORCED OVERWRITE)');
        return;
    }

    const parentDirectory = dirname(filePath);
    if (!existsSync(parentDirectory)) {
        mkdirSync(parentDirectory, { recursive: true });
    }
    writeFileSync(filePath, wrappedContent, 'utf-8');
    logger.updated(filePath + ' (FORCED OVERWRITE)');
}
