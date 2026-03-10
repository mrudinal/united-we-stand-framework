export interface BranchRuntimeState {
    branchName: string;
    sanitizedBranchName: string;
    branchMemoryFolder: string;
    currentStage: string;
    completedSteps: string[];
    incompletedStages: string[];
    nextRecommendedStep: string;
    lastUpdatedBy: string;
    lastUpdatedAt: string;
    initialized: boolean;
    finalized: boolean;
}

export interface BuildInitializedBranchRuntimeStateOptions {
    branchName: string;
    sanitizedBranchName: string;
    branchMemoryFolder: string;
}

/**
 * Builds the initial runtime state for a newly created branch memory folder.
 */
export function buildInitializedBranchRuntimeState(
    options: BuildInitializedBranchRuntimeStateOptions,
): BranchRuntimeState {
    return {
        branchName: options.branchName,
        sanitizedBranchName: options.sanitizedBranchName,
        branchMemoryFolder: options.branchMemoryFolder,
        currentStage: '1-initializer',
        completedSteps: [],
        incompletedStages: [],
        nextRecommendedStep: '1-initializer',
        lastUpdatedBy: '1-initializer',
        lastUpdatedAt: new Date().toISOString(),
        initialized: true,
        finalized: false,
    };
}

/**
 * Parses a branch runtime state JSON document into a validated object shape.
 */
export function parseBranchRuntimeState(rawContent: string): BranchRuntimeState | null {
    try {
        const parsed = JSON.parse(rawContent) as Partial<BranchRuntimeState>;
        if (!parsed || typeof parsed !== 'object') {
            return null;
        }

        if (
            typeof parsed.branchName !== 'string'
            || typeof parsed.sanitizedBranchName !== 'string'
            || typeof parsed.branchMemoryFolder !== 'string'
            || typeof parsed.currentStage !== 'string'
            || !Array.isArray(parsed.completedSteps)
            || !Array.isArray(parsed.incompletedStages)
            || typeof parsed.nextRecommendedStep !== 'string'
            || typeof parsed.lastUpdatedBy !== 'string'
            || typeof parsed.lastUpdatedAt !== 'string'
            || typeof parsed.initialized !== 'boolean'
            || typeof parsed.finalized !== 'boolean'
        ) {
            return null;
        }

        return {
            branchName: parsed.branchName,
            sanitizedBranchName: parsed.sanitizedBranchName,
            branchMemoryFolder: parsed.branchMemoryFolder,
            currentStage: parsed.currentStage,
            completedSteps: parsed.completedSteps.filter((value): value is string => typeof value === 'string'),
            incompletedStages: parsed.incompletedStages.filter((value): value is string => typeof value === 'string'),
            nextRecommendedStep: parsed.nextRecommendedStep,
            lastUpdatedBy: parsed.lastUpdatedBy,
            lastUpdatedAt: parsed.lastUpdatedAt,
            initialized: parsed.initialized,
            finalized: parsed.finalized,
        };
    } catch {
        return null;
    }
}

/**
 * Serializes branch runtime state into stable JSON text with a trailing newline.
 */
export function serializeBranchRuntimeState(state: BranchRuntimeState): string {
    return `${JSON.stringify(state, null, 2)}\n`;
}

/**
 * Validates required fields and semantic invariants for branch runtime state.
 */
export function validateBranchRuntimeState(state: BranchRuntimeState): string[] {
    const validationErrors: string[] = [];

    if (!state.branchName.trim()) {
        validationErrors.push('branchName is empty.');
    }
    if (!state.sanitizedBranchName.trim()) {
        validationErrors.push('sanitizedBranchName is empty.');
    }
    if (!state.branchMemoryFolder.trim()) {
        validationErrors.push('branchMemoryFolder is empty.');
    }
    if (!state.currentStage.trim()) {
        validationErrors.push('currentStage is empty.');
    }
    if (!state.nextRecommendedStep.trim()) {
        validationErrors.push('nextRecommendedStep is empty.');
    }
    if (!state.lastUpdatedBy.trim()) {
        validationErrors.push('lastUpdatedBy is empty.');
    }
    if (!state.lastUpdatedAt.trim() || Number.isNaN(Date.parse(state.lastUpdatedAt))) {
        validationErrors.push('lastUpdatedAt is not a valid ISO date.');
    }
    if (state.sanitizedBranchName !== state.sanitizedBranchName.toLowerCase()) {
        validationErrors.push('sanitizedBranchName must be lowercase.');
    }

    const completedSet = new Set(state.completedSteps);
    const incompletedSet = new Set(state.incompletedStages);
    if (completedSet.size !== state.completedSteps.length) {
        validationErrors.push('completedSteps has duplicated values.');
    }
    if (incompletedSet.size !== state.incompletedStages.length) {
        validationErrors.push('incompletedStages has duplicated values.');
    }
    if (completedSet.has(state.currentStage) || incompletedSet.has(state.currentStage)) {
        validationErrors.push('currentStage is duplicated in completedSteps or incompletedStages.');
    }
    for (const stageName of completedSet) {
        if (incompletedSet.has(stageName)) {
            validationErrors.push(`stage "${stageName}" exists in both completedSteps and incompletedStages.`);
        }
    }

    return validationErrors;
}
