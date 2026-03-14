import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadAgentsMdBlockTemplate } from '../src/lib/templates.js';

function readRepositoryFile(relativePath: string): string {
    return readFileSync(fileURLToPath(new URL(`../${relativePath}`, import.meta.url)), 'utf-8');
}

describe('uninitialized branch routing guidance', () => {
    it('documents outside-framework confirmation in the installed AGENTS block', () => {
        const agentsBlock = loadAgentsMdBlockTemplate();

        expect(agentsBlock).toContain('warn that united-we-stand is not initialized for the branch');
        expect(agentsBlock).toContain('proceed outside the framework');
        expect(agentsBlock).toContain('do not ask for the same confirmation again');
    });

    it('documents the warning-and-confirm flow in canonical command routing', () => {
        const commandRouting = readRepositoryFile('.united-we-stand/framework/04-command-routing.md');

        expect(commandRouting).toContain('## Uninitialized Branch Work Rule');
        expect(commandRouting).toContain('warn clearly that united-we-stand is not initialized for the current branch');
        expect(commandRouting).toContain('continue normally outside the framework');
        expect(commandRouting).toContain('fix these vulnerabilities');
    });

    it('documents the same behavior in implementer guidance and user-facing README', () => {
        const implementer = readRepositoryFile('.united-we-stand/agents/4-implementer.md');
        const frameworkReadme = readRepositoryFile('.united-we-stand/README.md');

        expect(implementer).toContain('do not treat the request as automatic entry into `4-implementer`');
        expect(implementer).toContain('outside the framework for the current chat');
        expect(frameworkReadme).toContain('proceed outside the framework for the current chat');
        expect(frameworkReadme).toContain('fix these vulnerabilities');
    });
});
