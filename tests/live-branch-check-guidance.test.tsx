import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadAgentsMdBlockTemplate } from '../src/lib/templates.js';

function readRepositoryFile(relativePath: string): string {
    return readFileSync(fileURLToPath(new URL(`../${relativePath}`, import.meta.url)), 'utf-8');
}

describe('live branch check guidance for initialization', () => {
    it('documents the safeguard in the installed AGENTS block and canonical framework docs', () => {
        const agentsBlock = loadAgentsMdBlockTemplate();
        const coreRules = readRepositoryFile('.united-we-stand/framework/01-core-rules.md');
        const commandRouting = readRepositoryFile('.united-we-stand/framework/04-command-routing.md');
        const initializer = readRepositoryFile('.united-we-stand/agents/1-initializer.md');

        expect(agentsBlock).toContain('always perform a fresh live check of the current git branch');
        expect(agentsBlock).toContain('Never reuse an earlier branch check');
        expect(coreRules).toContain('Initialization requires a fresh live branch check');
        expect(coreRules).toContain('Do not rely on a previous branch check');
        expect(commandRouting).toContain('Perform a fresh live check of the current git branch at the moment initialization is requested');
        expect(initializer).toContain('always perform a fresh live check of the current git branch');
    });

    it('documents the safeguard in installed tool entrypoints and user-facing readmes', () => {
        const copilotInstructions = readRepositoryFile('.united-we-stand/copilot-instructions.md');
        const antigravityWorkflow = readRepositoryFile('.united-we-stand/antigravity-workflow.md');
        const cursorRule = readRepositoryFile('.united-we-stand/cursor-rule.mdc');
        const frameworkReadme = readRepositoryFile('.united-we-stand/README.md');
        const repositoryReadme = readRepositoryFile('README.md');

        expect(copilotInstructions).toContain('always perform a fresh live check of the current git branch');
        expect(antigravityWorkflow).toContain('always perform a fresh live check of the current git branch');
        expect(cursorRule).toContain('always perform a fresh live check of the current git branch');
        expect(frameworkReadme).toContain('always do a fresh live check of the current git branch');
        expect(repositoryReadme).toContain('always do a fresh live check of the current git branch');
    });
});
