import { join } from 'node:path';
import { readFileOrNull, writeFileWithDirectories } from './fs.js';
import type { Logger } from './logger.js';

const BRANCH_ROUTING_FILENAME = '.branch-routing.json';
const BRANCH_ROUTING_VERSION = 1;

interface BranchRoutingPayload {
    version: number;
    mappings: Record<string, string>;
    updatedAt: string;
}

function getRoutingFilePath(workingDirectory: string): string {
    return join(workingDirectory, '.spec-driven', BRANCH_ROUTING_FILENAME);
}

export function readBranchRoutingMap(workingDirectory: string): Record<string, string> {
    const filePath = getRoutingFilePath(workingDirectory);
    const rawContent = readFileOrNull(filePath);
    if (!rawContent) {
        return {};
    }

    try {
        const parsed = JSON.parse(rawContent) as Partial<BranchRoutingPayload>;
        if (!parsed || typeof parsed !== 'object' || !parsed.mappings || typeof parsed.mappings !== 'object') {
            return {};
        }

        const safeMappings: Record<string, string> = {};
        for (const [branchName, folderName] of Object.entries(parsed.mappings)) {
            if (typeof branchName === 'string' && typeof folderName === 'string' && branchName && folderName) {
                safeMappings[branchName] = folderName;
            }
        }
        return safeMappings;
    } catch {
        return {};
    }
}

export function writeBranchRoutingMap(
    workingDirectory: string,
    mappings: Record<string, string>,
    isDryRun: boolean,
    logger: Logger,
): void {
    const filePath = getRoutingFilePath(workingDirectory);
    const payload: BranchRoutingPayload = {
        version: BRANCH_ROUTING_VERSION,
        mappings,
        updatedAt: new Date().toISOString(),
    };

    writeFileWithDirectories(filePath, `${JSON.stringify(payload, null, 2)}\n`, isDryRun, logger);
    logger.updated(filePath);
}

export function resolveBranchMemoryFolderName(
    branchName: string,
    defaultSanitizedFolderName: string,
    mappings: Record<string, string>,
): string {
    return mappings[branchName] ?? defaultSanitizedFolderName;
}
