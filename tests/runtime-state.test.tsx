import { describe, expect, it } from 'vitest';
import {
    buildInitializedBranchRuntimeState,
    validateBranchRuntimeState,
    serializeBranchRuntimeState,
    parseBranchRuntimeState,
} from '../src/lib/runtime-state.js';

describe('runtime state validation', () => {
    it('builds a valid initialized runtime state', () => {
        const runtimeState = buildInitializedBranchRuntimeState({
            branchName: 'feature/test-branch',
            sanitizedBranchName: 'feature-test-branch',
            branchMemoryFolder: 'feature-test-branch',
        });

        expect(validateBranchRuntimeState(runtimeState)).toEqual([]);
    });

    it('accepts a closed finalized workflow with currentStage none', () => {
        const validationErrors = validateBranchRuntimeState({
            branchName: 'main',
            sanitizedBranchName: 'main',
            branchMemoryFolder: 'main',
            currentStage: 'none',
            completedSteps: ['1-initializer', '4-implementer', '6-finalizer'],
            incompletedStages: [],
            nextRecommendedStep: 'none',
            lastUpdatedBy: '6-finalizer',
            lastUpdatedAt: '2026-03-13T00:00:00.000Z',
            initialized: true,
            finalized: true,
        });

        expect(validationErrors).toEqual([]);
    });

    it('rejects inconsistent finalized workflow metadata', () => {
        const validationErrors = validateBranchRuntimeState({
            branchName: 'main',
            sanitizedBranchName: 'main',
            branchMemoryFolder: 'main',
            currentStage: '6-finalizer',
            completedSteps: ['1-initializer', '4-implementer'],
            incompletedStages: [],
            nextRecommendedStep: 'none',
            lastUpdatedBy: '6-finalizer',
            lastUpdatedAt: '2026-03-13T00:00:00.000Z',
            initialized: true,
            finalized: true,
        });

        expect(validationErrors).toContain('finalized workflow must use currentStage = "none".');
        expect(validationErrors).toContain('finalized workflow must record "6-finalizer" in completedSteps.');
    });

    it('rejects none current stage when workflow is not finalized', () => {
        const validationErrors = validateBranchRuntimeState({
            branchName: 'main',
            sanitizedBranchName: 'main',
            branchMemoryFolder: 'main',
            currentStage: 'none',
            completedSteps: [],
            incompletedStages: [],
            nextRecommendedStep: 'none',
            lastUpdatedBy: '6-finalizer',
            lastUpdatedAt: '2026-03-13T00:00:00.000Z',
            initialized: true,
            finalized: false,
        });

        expect(validationErrors).toContain('currentStage cannot be "none" unless the workflow is explicitly finalized.');
        expect(validationErrors).toContain('nextRecommendedStep cannot be "none" unless the workflow is explicitly finalized.');
    });

    it('round-trips serialized finalized workflow state', () => {
        const rawContent = serializeBranchRuntimeState({
            branchName: 'main',
            sanitizedBranchName: 'main',
            branchMemoryFolder: 'main',
            currentStage: 'none',
            completedSteps: ['6-finalizer'],
            incompletedStages: [],
            nextRecommendedStep: 'none',
            lastUpdatedBy: '6-finalizer',
            lastUpdatedAt: '2026-03-13T00:00:00.000Z',
            initialized: true,
            finalized: true,
        });

        const parsedState = parseBranchRuntimeState(rawContent);

        expect(parsedState).not.toBeNull();
        expect(parsedState?.currentStage).toBe('none');
        expect(parsedState?.finalized).toBe(true);
        expect(parsedState?.nextRecommendedStep).toBe('none');
    });
});
