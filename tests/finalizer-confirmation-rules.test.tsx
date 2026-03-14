import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

function readRepositoryFile(relativePath: string): string {
    return readFileSync(fileURLToPath(new URL(`../${relativePath}`, import.meta.url)), 'utf-8');
}

describe('finalizer confirmation rules', () => {
    it('requires finalizer to surface uncaptured changes and ask for confirmation', () => {
        const finalizer = readRepositoryFile('.united-we-stand/agents/6-finalizer.md');

        expect(finalizer).toContain('identify meaningful changes that are present in code/docs but not yet captured in the branch specs');
        expect(finalizer).toContain('Ask the user to confirm whether the finalization is acceptable');
        expect(finalizer).toContain('Only treat finalization as definitively closed after the user explicitly confirms');
        expect(finalizer).toContain('User closure confirmation status');
        expect(finalizer).toContain('set `Current stage = none`');
    });

    it('records finalizer confirmation semantics in state/done/readme docs', () => {
        const stateModel = readRepositoryFile('.united-we-stand/framework/02-state-model.md');
        const routingModel = readRepositoryFile('.united-we-stand/framework/04-command-routing.md');
        const doneModel = readRepositoryFile('.united-we-stand/framework/07-definition-of-done.md');
        const frameworkReadme = readRepositoryFile('.united-we-stand/README.md');

        expect(stateModel).toContain('user has not yet confirmed closure');
        expect(stateModel).toContain('Current stage = none');
        expect(routingModel).toContain('Closed Workflow Reopen Rule');
        expect(routingModel).toContain('reopen `6-finalizer` as the current stage');
        expect(routingModel).toContain('require finalization approval again');
        expect(doneModel).toContain('without explicit user confirmation that the final state is acceptable');
        expect(frameworkReadme).toContain('close the workflow with `Current stage = none`');
    });
});
