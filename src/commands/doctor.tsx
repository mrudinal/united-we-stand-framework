/**
 * Doctor command: checks repository health and reports missing files.
 *
 * Separates checks into framework-level (set up by `install`) and
 * branch-level (set up by `branch-init`) with targeted recommendations.
 */

import { join } from 'node:path';
import { isGitRepository, tryGetCurrentBranchName } from '../lib/git.js';
import { sanitizeBranchName } from '../lib/branch.js';
import { doesFileExist, readFileOrNull } from '../lib/fs.js';
import { hasManagedBlock } from '../lib/markers.js';
import { createLogger } from '../lib/logger.js';
import { readBranchRoutingMap, resolveBranchMemoryFolderName } from '../lib/branch-routing.js';
import {
    type BranchRuntimeState,
    parseBranchRuntimeState,
    validateBranchRuntimeState,
} from '../lib/runtime-state.js';
import {
    loadFrameworkFiles,
    loadSteeringFiles,
    loadPlaybookFiles,
    loadFrameworkAgentFiles,
    loadStandaloneAgentFiles,
} from '../lib/templates.js';

/** Options accepted by the doctor command. */
export interface DoctorCommandOptions {
    workingDirectory: string;
    isDryRun: boolean;
    branchNameOverride?: string;
}

interface StatusSnapshot {
    currentBranch: string;
    currentStage: string;
    completedSteps: string[];
    incompletedStages: string[];
    nextRecommendedStep: string;
    statusNote: string;
    blockersOrWarnings: string;
    lastUpdatedBy: string;
    lastUpdatedAt: string;
}

interface StageMetadataSnapshot {
    currentStage: string;
    completedSteps: string[];
    incompletedStages: string[];
}

const STATUS_FIELD_LABELS = {
    currentBranch: 'Current branch',
    currentStage: 'Current stage',
    completedSteps: 'Completed steps',
    incompletedStages: 'Incompleted stages',
    nextRecommendedStep: 'Next recommended step',
    statusNote: 'Status note',
    blockersOrWarnings: 'Blockers / warnings',
    lastUpdatedBy: 'Last updated by',
    lastUpdatedAt: 'Last updated at',
} as const;

const REQUIRED_STAGE_SECTIONS: Record<string, string[]> = {
    '01-init.md': [
        '## Raw idea / problem statement',
        '## Scope (in)',
        '## Scope (out)',
        '## Assumptions',
        '## Open questions',
        '## Success criteria',
    ],
    '02-plan.md': [
        '## Objectives',
        '## Dependencies',
        '## Risks / unknowns',
        '## Suggested execution order',
        '## Detailed task list',
        '## Status',
    ],
    '03-design.md': [
        '## Architecture / approach',
        '## Key components',
        '## Interfaces / data flow',
        '## Constraints',
        '## Design decisions',
    ],
    '04-implementation.md': [
        '## What changed',
        '## Why it changed',
        '## Files touched',
        '## Validation and tests executed',
        '## Remaining gaps / follow-ups',
    ],
    '05-code-review.md': [
        '## Quality & maintainability findings',
        '## Security / boundary findings',
        '## Optimization findings',
        '## Severity / priority',
        '## Recommended fixes',
        '## Reviewed scope and non-reviewed scope',
    ],
    '06-finalization.md': [
        '## Final summary',
        '## Delivered scope',
        '## Spec/code mismatches or uncaptured implementation changes',
        '## Known gaps',
        '## Recommended next actions',
        '## Documentation updates performed',
        '## User closure confirmation status',
    ],
};

const STAGE_FILE_TO_STAGE_NAME: Record<string, string> = {
    '01-init.md': '1-initializer',
    '02-plan.md': '2-planner',
    '03-design.md': '3-designer',
    '04-implementation.md': '4-implementer',
    '05-code-review.md': '5-code-reviewer',
    '06-finalization.md': '6-finalizer',
};

const REQUIRED_BOOTSTRAP_BRANCH_FILES = [
    '00-current-status.md',
    '01-init.md',
] as const;

/**
 * Returns the highest existing stage file and stage name within a branch folder.
 */
function getHighestExistingStage(
    specDrivenDirectory: string,
): { stageFileName: string; stageName: string } | null {
    let highestStage: { stageFileName: string; stageName: string } | null = null;

    for (const [stageFileName, stageName] of Object.entries(STAGE_FILE_TO_STAGE_NAME)) {
        if (doesFileExist(join(specDrivenDirectory, stageFileName))) {
            highestStage = { stageFileName, stageName };
        }
    }

    return highestStage;
}

/**
 * Validates that recorded stage metadata matches the stage files present on disk.
 */
function validateStageMetadataAgainstFiles(
    specDrivenDirectory: string,
    metadataLabel: string,
    metadata: StageMetadataSnapshot,
): string[] {
    const alignmentErrors: string[] = [];
    const highestExistingStage = getHighestExistingStage(specDrivenDirectory);
    const isClosedWorkflow = /^none$/i.test(metadata.currentStage) && metadata.completedSteps.includes('6-finalizer');

    if (isClosedWorkflow) {
        if (!doesFileExist(join(specDrivenDirectory, '06-finalization.md'))) {
            alignmentErrors.push(`${metadataLabel} marks the workflow closed but "06-finalization.md" is missing.`);
        }

        if (!highestExistingStage || highestExistingStage.stageName !== '6-finalizer') {
            alignmentErrors.push(
                `${metadataLabel} marks the workflow closed but the highest existing stage file is not `
                + '"06-finalization.md" (6-finalizer).',
            );
        }

        for (const recordedStage of [
            ...metadata.completedSteps,
            ...metadata.incompletedStages,
        ]) {
            const expectedStageFile = Object.entries(STAGE_FILE_TO_STAGE_NAME).find(
                ([, stageName]) => stageName === recordedStage,
            )?.[0];

            if (expectedStageFile && !doesFileExist(join(specDrivenDirectory, expectedStageFile))) {
                alignmentErrors.push(
                    `${metadataLabel} references stage "${recordedStage}" but "${expectedStageFile}" is missing.`,
                );
            }
        }

        return alignmentErrors;
    }

    if (highestExistingStage && metadata.currentStage !== highestExistingStage.stageName) {
        alignmentErrors.push(
            `${metadataLabel} current stage is "${metadata.currentStage}" but the highest existing stage file is `
            + `"${highestExistingStage.stageFileName}" (${highestExistingStage.stageName}).`,
        );
    }

    for (const recordedStage of [
        metadata.currentStage,
        ...metadata.completedSteps,
        ...metadata.incompletedStages,
    ]) {
        const expectedStageFile = Object.entries(STAGE_FILE_TO_STAGE_NAME).find(
            ([, stageName]) => stageName === recordedStage,
        )?.[0];

        if (expectedStageFile && !doesFileExist(join(specDrivenDirectory, expectedStageFile))) {
            alignmentErrors.push(
                `${metadataLabel} references stage "${recordedStage}" but "${expectedStageFile}" is missing.`,
            );
        }
    }

    return alignmentErrors;
}

/**
 * Escapes text for safe interpolation into a RegExp.
 */
function escapeRegExpText(rawText: string): string {
    return rawText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Reads a single table field value from `00-current-status.md`.
 */
function readStatusFieldValue(statusMarkdown: string, fieldLabel: string): string | null {
    const fieldPattern = new RegExp(`\\|\\s*${escapeRegExpText(fieldLabel)}\\s*\\|\\s*([^|]+)\\|`, 'i');
    const fieldMatch = statusMarkdown.match(fieldPattern);
    if (!fieldMatch || !fieldMatch[1]) {
        return null;
    }

    return fieldMatch[1].replace(/`/g, '').trim();
}

/**
 * Parses a comma-separated stage list while normalizing `none`.
 */
function parseStageList(rawValue: string): string[] {
    const normalizedValue = rawValue.trim();
    if (!normalizedValue || /^none$/i.test(normalizedValue)) {
        return [];
    }

    const parsedValues = normalizedValue
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);

    return Array.from(new Set(parsedValues));
}

/**
 * Parses the required status snapshot fields from status markdown.
 */
function parseStatusSnapshot(statusMarkdown: string): { snapshot: StatusSnapshot | null; errors: string[] } {
    const errors: string[] = [];

    const currentBranch = readStatusFieldValue(statusMarkdown, STATUS_FIELD_LABELS.currentBranch)
        ?? readStatusFieldValue(statusMarkdown, 'Branch');
    const currentStage = readStatusFieldValue(statusMarkdown, STATUS_FIELD_LABELS.currentStage);
    const completedSteps = readStatusFieldValue(statusMarkdown, STATUS_FIELD_LABELS.completedSteps);
    const incompletedStages = readStatusFieldValue(statusMarkdown, STATUS_FIELD_LABELS.incompletedStages);
    const nextRecommendedStep = readStatusFieldValue(statusMarkdown, STATUS_FIELD_LABELS.nextRecommendedStep);
    const statusNote = readStatusFieldValue(statusMarkdown, STATUS_FIELD_LABELS.statusNote);
    const blockersOrWarnings = readStatusFieldValue(statusMarkdown, STATUS_FIELD_LABELS.blockersOrWarnings);
    const lastUpdatedBy = readStatusFieldValue(statusMarkdown, STATUS_FIELD_LABELS.lastUpdatedBy);
    const lastUpdatedAt = readStatusFieldValue(statusMarkdown, STATUS_FIELD_LABELS.lastUpdatedAt);

    if (!currentBranch) errors.push('Missing status field: Current branch');
    if (!currentStage) errors.push('Missing status field: Current stage');
    if (!completedSteps) errors.push('Missing status field: Completed steps');
    if (!incompletedStages) errors.push('Missing status field: Incompleted stages');
    if (!nextRecommendedStep) errors.push('Missing status field: Next recommended step');
    if (!statusNote) errors.push('Missing status field: Status note');
    if (!blockersOrWarnings) errors.push('Missing status field: Blockers / warnings');
    if (!lastUpdatedBy) errors.push('Missing status field: Last updated by');
    if (!lastUpdatedAt) errors.push('Missing status field: Last updated at');

    if (errors.length > 0) {
        return { snapshot: null, errors };
    }

    const snapshot: StatusSnapshot = {
        currentBranch: currentBranch!,
        currentStage: currentStage!,
        completedSteps: parseStageList(completedSteps!),
        incompletedStages: parseStageList(incompletedStages!),
        nextRecommendedStep: nextRecommendedStep!,
        statusNote: statusNote!,
        blockersOrWarnings: blockersOrWarnings!,
        lastUpdatedBy: lastUpdatedBy!,
        lastUpdatedAt: lastUpdatedAt!,
    };

    return { snapshot, errors: [] };
}

/**
 * Validates semantic invariants for the parsed status snapshot.
 */
function validateStatusSnapshot(snapshot: StatusSnapshot): string[] {
    const errors: string[] = [];
    const isClosedWorkflow = /^none$/i.test(snapshot.currentStage);
    if (!snapshot.currentStage) {
        errors.push('Current stage is empty.');
    }
    if (!snapshot.nextRecommendedStep) {
        errors.push('Next recommended step is empty.');
    }
    if (isClosedWorkflow) {
        if (!/^none$/i.test(snapshot.nextRecommendedStep)) {
            errors.push('Closed workflow must use "none" as next recommended step.');
        }
        if (!snapshot.completedSteps.includes('6-finalizer')) {
            errors.push('Closed workflow must record "6-finalizer" in completed steps.');
        }
    } else if (/^none$/i.test(snapshot.nextRecommendedStep)) {
        errors.push('Next recommended step cannot be none while workflow is active.');
    }
    if (!snapshot.statusNote) {
        errors.push('Status note is empty.');
    }
    if (!snapshot.lastUpdatedBy) {
        errors.push('Last updated by is empty.');
    }
    if (!snapshot.lastUpdatedAt || Number.isNaN(Date.parse(snapshot.lastUpdatedAt))) {
        errors.push('Last updated at is not a valid date.');
    }

    const completedSet = new Set(snapshot.completedSteps);
    const incompletedSet = new Set(snapshot.incompletedStages);
    if (completedSet.size !== snapshot.completedSteps.length) {
        errors.push('Completed steps contains duplicates.');
    }
    if (incompletedSet.size !== snapshot.incompletedStages.length) {
        errors.push('Incompleted stages contains duplicates.');
    }
    if (!isClosedWorkflow && (completedSet.has(snapshot.currentStage) || incompletedSet.has(snapshot.currentStage))) {
        errors.push('Current stage also appears in completed or incompleted categories.');
    }
    for (const completedStage of completedSet) {
        if (incompletedSet.has(completedStage)) {
            errors.push(`Stage "${completedStage}" appears in both completed and incompleted categories.`);
        }
    }

    return errors;
}

/**
 * Compares stage lists as sets instead of raw array order.
 */
function areStageListsEquivalent(left: string[], right: string[]): boolean {
    const normalizedLeft = Array.from(new Set(left)).sort();
    const normalizedRight = Array.from(new Set(right)).sort();
    return JSON.stringify(normalizedLeft) === JSON.stringify(normalizedRight);
}

/**
 * Returns the stage set that should already have substantive content.
 */
function getStagesRequiringSubstantiveContent(snapshot: StatusSnapshot): Set<string> {
    const requiredStages = new Set<string>([
        ...snapshot.completedSteps,
        ...snapshot.incompletedStages,
    ]);

    // An anchored current stage only requires substantive content once it is
    // complete enough to recommend a different next step.
    if (!/^none$/i.test(snapshot.currentStage) && snapshot.nextRecommendedStep !== snapshot.currentStage) {
        requiredStages.add(snapshot.currentStage);
    }

    return requiredStages;
}

/**
 * Verifies that machine-readable branch identity matches the resolved branch context.
 */
function validateBranchIdentity(
    runtimeState: BranchRuntimeState,
    expectedBranchName: string,
    expectedSanitizedBranchName: string,
    expectedBranchMemoryFolder: string,
): string[] {
    const identityErrors: string[] = [];

    if (runtimeState.branchName !== expectedBranchName) {
        identityErrors.push(`branchName is "${runtimeState.branchName}" instead of "${expectedBranchName}".`);
    }
    if (runtimeState.sanitizedBranchName !== expectedSanitizedBranchName) {
        identityErrors.push(`sanitizedBranchName is "${runtimeState.sanitizedBranchName}" instead of "${expectedSanitizedBranchName}".`);
    }
    if (runtimeState.branchMemoryFolder !== expectedBranchMemoryFolder) {
        identityErrors.push(`branchMemoryFolder is "${runtimeState.branchMemoryFolder}" instead of "${expectedBranchMemoryFolder}".`);
    }

    return identityErrors;
}

/**
 * Returns whether a required markdown section still contains only placeholder content.
 */
function isSectionContentPlaceholderOnly(markdownContent: string, heading: string): boolean {
    const headingPattern = new RegExp(`${escapeRegExpText(heading)}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`, 'i');
    const sectionMatch = markdownContent.match(headingPattern);
    if (!sectionMatch || !sectionMatch[1]) {
        return false;
    }

    const sectionBody = sectionMatch[1]
        .replace(/<!--[\s\S]*?-->/g, '')
        .trim();

    if (!sectionBody) {
        return true;
    }

    const normalizedBody = sectionBody.toLowerCase();
    return (
        normalizedBody === 'tbd'
        || normalizedBody === 'unknown'
        || normalizedBody === 'not applicable'
        || normalizedBody === '_not yet defined. run `1-initializer` to capture the branch intent._'
    );
}

/**
 * Runs the doctor command: audits the repository for missing or misconfigured framework files.
 */
export function runDoctorCommand(options: DoctorCommandOptions): void {
    // Doctor never writes files; always uses non-dry-run logger for display.
    const logger = createLogger(false);
    const { workingDirectory, branchNameOverride } = options;

    let frameworkHealthy = true;
    let branchHealthy = true;

    /**
     * Logs a single pass/fail check and tracks overall health status.
     */
    function reportCheck(label: string, passed: boolean, category: 'framework' | 'branch', detail?: string): void {
        logger.check(label, passed, detail);
        if (!passed) {
            if (category === 'framework') {
                frameworkHealthy = false;
            } else {
                branchHealthy = false;
            }
        }
    }

    console.log('');
    logger.info('united-we-stand doctor - checking repository health\n');

    // Verify this is a git repository.
    const isGitRepo = isGitRepository(workingDirectory);
    reportCheck('Git repository detected', isGitRepo, 'framework');
    if (!isGitRepo) {
        logger.error('Not a git repository. Run `united-we-stand install` inside a git repo.');
        process.exitCode = 1;
        return;
    }

    // === Framework-level checks (created by `install`) ===
    console.log('');
    logger.info('Framework files (set up by `united-we-stand install`):');

    // Check AGENTS.md existence and managed block.
    const agentsMdPath = join(workingDirectory, 'AGENTS.md');
    const agentsMdExists = doesFileExist(agentsMdPath);
    reportCheck('AGENTS.md exists', agentsMdExists, 'framework');
    if (agentsMdExists) {
        const agentsMdContent = readFileOrNull(agentsMdPath) ?? '';
        reportCheck('AGENTS.md has managed block', hasManagedBlock(agentsMdContent), 'framework');
    }

    // Check copilot-instructions.md existence and managed block.
    const copilotInstructionsPath = join(workingDirectory, '.github', 'copilot-instructions.md');
    const copilotExists = doesFileExist(copilotInstructionsPath);
    reportCheck('.github/copilot-instructions.md exists', copilotExists, 'framework');
    if (copilotExists) {
        const copilotContent = readFileOrNull(copilotInstructionsPath) ?? '';
        reportCheck('.github/copilot-instructions.md has managed block', hasManagedBlock(copilotContent), 'framework');
    }

    const antigravityWorkflowPath = join(workingDirectory, '.agents', 'workflows', 'united-we-stand.md');
    reportCheck('.agents/workflows/united-we-stand.md exists', doesFileExist(antigravityWorkflowPath), 'framework');

    const cursorRulePath = join(workingDirectory, '.cursor', 'rules', 'united-we-stand.mdc');
    reportCheck('.cursor/rules/united-we-stand.mdc exists', doesFileExist(cursorRulePath), 'framework');

    const frameworkRootDirectory = join(workingDirectory, '.united-we-stand');
    reportCheck('.united-we-stand/ directory exists', doesFileExist(frameworkRootDirectory), 'framework');

    const frameworkReadmePath = join(frameworkRootDirectory, 'README.md');
    reportCheck('.united-we-stand/README.md exists', doesFileExist(frameworkReadmePath), 'framework');

    const frameworkDirectory = join(frameworkRootDirectory, 'framework');
    reportCheck('.united-we-stand/framework/ directory exists', doesFileExist(frameworkDirectory), 'framework');

    console.log('');
    logger.info('Framework docs:');
    for (const frameworkFile of loadFrameworkFiles()) {
        reportCheck(`  ${frameworkFile.relativePath}`, doesFileExist(join(frameworkRootDirectory, frameworkFile.relativePath)), 'framework');
    }

    const steeringDirectory = join(frameworkRootDirectory, 'steering');
    reportCheck('.united-we-stand/steering/ directory exists', doesFileExist(steeringDirectory), 'framework');

    console.log('');
    logger.info('Steering docs:');
    for (const steeringFile of loadSteeringFiles()) {
        reportCheck(`  ${steeringFile.relativePath}`, doesFileExist(join(frameworkRootDirectory, steeringFile.relativePath)), 'framework');
    }

    const playbooksDirectory = join(frameworkRootDirectory, 'playbooks');
    reportCheck('.united-we-stand/playbooks/ directory exists', doesFileExist(playbooksDirectory), 'framework');

    console.log('');
    logger.info('Playbooks:');
    for (const playbookFile of loadPlaybookFiles()) {
        reportCheck(`  ${playbookFile.relativePath}`, doesFileExist(join(frameworkRootDirectory, playbookFile.relativePath)), 'framework');
    }

    // Check agents directory.
    const agentsDirectory = join(frameworkRootDirectory, 'agents');
    reportCheck('.united-we-stand/agents/ directory exists', doesFileExist(agentsDirectory), 'framework');

    // Check individual framework agent files.
    console.log('');
    logger.info('Framework agents:');
    for (const agentFile of loadFrameworkAgentFiles()) {
        reportCheck(`  ${agentFile.filename}`, doesFileExist(join(agentsDirectory, agentFile.filename)), 'framework');
    }

    // Check individual standalone role agent files.
    console.log('');
    logger.info('Standalone role agents:');
    for (const agentFile of loadStandaloneAgentFiles()) {
        reportCheck(`  ${agentFile.filename}`, doesFileExist(join(agentsDirectory, agentFile.filename)), 'framework');
    }

    // === Branch-level checks (created by `branch-init`) ===
    const branchRoutingMap = readBranchRoutingMap(workingDirectory);
    const selectedBranch = branchNameOverride && branchNameOverride.trim().length > 0
        ? branchNameOverride.trim()
        : tryGetCurrentBranchName(workingDirectory);

    console.log('');
    if (!selectedBranch) {
        reportCheck(
            'Current branch is attached (not detached HEAD)',
            false,
            'branch',
            'Detached HEAD detected. Use --branch <name> to run branch checks.',
        );
        logger.warn('Skipping branch-file checks because no deterministic branch name is available.');
    } else {
        if (selectedBranch.toUpperCase() === 'HEAD') {
            reportCheck(
                'Branch name is not reserved value HEAD',
                false,
                'branch',
                'Use --branch <name> with a real branch name.',
            );
        } else {
            const sanitizedBranch = sanitizeBranchName(selectedBranch);
            if (!sanitizedBranch) {
                reportCheck(
                    'Branch name sanitizes to a valid folder name',
                    false,
                    'branch',
                    `Invalid branch value: "${selectedBranch}"`,
                );
            } else {
                const branchMemoryFolderName = resolveBranchMemoryFolderName(
                    selectedBranch,
                    sanitizedBranch,
                    branchRoutingMap,
                );
                const specDrivenDirectory = join(workingDirectory, '.spec-driven', branchMemoryFolderName);
                logger.info(`Branch spec files - ${selectedBranch} (${branchMemoryFolderName}):`);
                const specDirectoryExists = doesFileExist(specDrivenDirectory);
                reportCheck(`.spec-driven/${branchMemoryFolderName}/ directory exists`, specDirectoryExists, 'branch');

                if (specDirectoryExists) {
                    for (const requiredBootstrapFile of REQUIRED_BOOTSTRAP_BRANCH_FILES) {
                        reportCheck(
                            `  ${requiredBootstrapFile}`,
                            doesFileExist(join(specDrivenDirectory, requiredBootstrapFile)),
                            'branch',
                        );
                    }

                    const runtimeStatePath = join(specDrivenDirectory, 'state.json');
                    const runtimeStateExists = doesFileExist(runtimeStatePath);
                    reportCheck('  state.json', runtimeStateExists, 'branch');

                    const statusMarkdownPath = join(specDrivenDirectory, '00-current-status.md');
                    const statusMarkdownContent = readFileOrNull(statusMarkdownPath) ?? '';
                    const parsedStatus = parseStatusSnapshot(statusMarkdownContent);
                    reportCheck(
                        '  status required fields are present',
                        parsedStatus.errors.length === 0,
                        'branch',
                        parsedStatus.errors.length > 0 ? parsedStatus.errors.join(' | ') : undefined,
                    );

                    if (parsedStatus.snapshot) {
                        const statusSemanticErrors = validateStatusSnapshot(parsedStatus.snapshot);
                        reportCheck(
                            '  status semantics are consistent',
                            statusSemanticErrors.length === 0,
                            'branch',
                            statusSemanticErrors.length > 0 ? statusSemanticErrors.join(' | ') : undefined,
                        );

                        const statusFileAlignmentErrors = validateStageMetadataAgainstFiles(
                            specDrivenDirectory,
                            'Status metadata',
                            parsedStatus.snapshot,
                        );
                        reportCheck(
                            '  status metadata matches created stage files',
                            statusFileAlignmentErrors.length === 0,
                            'branch',
                            statusFileAlignmentErrors.length > 0 ? statusFileAlignmentErrors.join(' | ') : undefined,
                        );
                    }

                    if (runtimeStateExists) {
                        const runtimeStateContent = readFileOrNull(runtimeStatePath) ?? '';
                        const parsedRuntimeState = parseBranchRuntimeState(runtimeStateContent);
                        reportCheck(
                            '  state.json schema is valid',
                            parsedRuntimeState !== null,
                            'branch',
                            parsedRuntimeState ? undefined : 'Invalid JSON or missing required fields.',
                        );

                        if (parsedRuntimeState) {
                            // Validate machine-readable state first, then compare it back to status markdown.
                            const runtimeStateErrors = validateBranchRuntimeState(parsedRuntimeState);
                            reportCheck(
                                '  state.json semantics are consistent',
                                runtimeStateErrors.length === 0,
                                'branch',
                                runtimeStateErrors.length > 0 ? runtimeStateErrors.join(' | ') : undefined,
                            );

                            const identityErrors = validateBranchIdentity(
                                parsedRuntimeState,
                                selectedBranch,
                                sanitizedBranch,
                                branchMemoryFolderName,
                            );
                            reportCheck(
                                '  state.json branch identity matches resolved branch context',
                                identityErrors.length === 0,
                                'branch',
                                identityErrors.length > 0 ? identityErrors.join(' | ') : undefined,
                            );

                            const runtimeFileAlignmentErrors = validateStageMetadataAgainstFiles(
                                specDrivenDirectory,
                                'state.json metadata',
                                parsedRuntimeState,
                            );
                            reportCheck(
                                '  state.json metadata matches created stage files',
                                runtimeFileAlignmentErrors.length === 0,
                                'branch',
                                runtimeFileAlignmentErrors.length > 0 ? runtimeFileAlignmentErrors.join(' | ') : undefined,
                            );

                            if (parsedStatus.snapshot) {
                                const statusAndStateMatch = (
                                    parsedStatus.snapshot.currentBranch === parsedRuntimeState.branchName
                                    && branchMemoryFolderName === parsedRuntimeState.branchMemoryFolder
                                    && sanitizedBranch === parsedRuntimeState.sanitizedBranchName
                                    && parsedStatus.snapshot.currentStage === parsedRuntimeState.currentStage
                                    && areStageListsEquivalent(parsedStatus.snapshot.completedSteps, parsedRuntimeState.completedSteps)
                                    && areStageListsEquivalent(parsedStatus.snapshot.incompletedStages, parsedRuntimeState.incompletedStages)
                                    && parsedStatus.snapshot.nextRecommendedStep === parsedRuntimeState.nextRecommendedStep
                                    && parsedStatus.snapshot.lastUpdatedBy === parsedRuntimeState.lastUpdatedBy
                                );

                                reportCheck(
                                    '  state.json and 00-current-status.md are aligned',
                                    statusAndStateMatch,
                                    'branch',
                                    statusAndStateMatch ? undefined : 'Status markdown and runtime state diverge.',
                                );
                            }
                        }
                    }

                    const stagesRequiringSubstantiveContent = parsedStatus.snapshot
                        ? getStagesRequiringSubstantiveContent(parsedStatus.snapshot)
                        : new Set<string>();

                    // Keep template-only future stages acceptable until the workflow actually reaches them.
                    for (const [stageFileName, requiredHeadings] of Object.entries(REQUIRED_STAGE_SECTIONS)) {
                        const stageFilePath = join(specDrivenDirectory, stageFileName);
                        if (!doesFileExist(stageFilePath)) {
                            continue;
                        }

                        const stageFileContent = readFileOrNull(stageFilePath) ?? '';
                        const missingHeadings = requiredHeadings.filter(
                            (requiredHeading) => !stageFileContent.toLowerCase().includes(requiredHeading.toLowerCase()),
                        );

                        reportCheck(
                            `  ${stageFileName} required sections present`,
                            missingHeadings.length === 0,
                            'branch',
                            missingHeadings.length > 0 ? `Missing: ${missingHeadings.join(', ')}` : undefined,
                        );

                        const stageName = STAGE_FILE_TO_STAGE_NAME[stageFileName];
                        if (missingHeadings.length === 0 && stageName && stagesRequiringSubstantiveContent.has(stageName)) {
                            const placeholderHeadings = requiredHeadings.filter(
                                (requiredHeading) => isSectionContentPlaceholderOnly(stageFileContent, requiredHeading),
                            );
                            reportCheck(
                                `  ${stageFileName} required sections have substantive content`,
                                placeholderHeadings.length === 0,
                                'branch',
                                placeholderHeadings.length > 0 ? `Placeholder-only: ${placeholderHeadings.join(', ')}` : undefined,
                            );
                        }
                    }
                }
            }
        }
    }

    // === Print recommendation ===
    console.log('');
    if (frameworkHealthy && branchHealthy) {
        logger.success('All checks passed. Repository is fully set up.');
    } else if (!frameworkHealthy) {
        logger.warn('Framework files missing. Run `united-we-stand install` to set up.');
    } else {
        logger.warn('Branch runtime/spec issues detected. Review failed branch checks above and repair branch memory files.');
    }
}
