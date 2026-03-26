import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadAgentsMdBlockTemplate } from '../src/lib/templates.js';

function readRepositoryFile(relativePath: string): string {
    return readFileSync(fileURLToPath(new URL(`../${relativePath}`, import.meta.url)), 'utf-8');
}

describe('uninitialized branch routing guidance', () => {
    it('documents silent direct-work handling in the installed AGENTS block', () => {
        const agentsBlock = loadAgentsMdBlockTemplate();

        expect(agentsBlock).toContain('do not interrupt to explain missing framework setup');
        expect(agentsBlock).toContain('Help with the request normally');
        expect(agentsBlock).toContain('Only surface initialization/framework guidance when the user explicitly asks to initialize');
        expect(agentsBlock).not.toContain('proceed outside the framework');
    });

    it('documents the silent direct-work flow in canonical command routing', () => {
        const commandRouting = readRepositoryFile('.united-we-stand/framework/04-command-routing.md');

        expect(commandRouting).toContain('## Uninitialized Branch Work Rule');
        expect(commandRouting).toContain('do not warn about missing framework initialization by default');
        expect(commandRouting).toContain('continue helping with the requested repo work normally');
        expect(commandRouting).toContain('fix these vulnerabilities');
        expect(commandRouting).not.toContain('continue normally outside the framework');
    });

    it('documents the same behavior in implementer guidance and user-facing README', () => {
        const implementer = readRepositoryFile('.united-we-stand/agents/4-implementer.md');
        const frameworkReadme = readRepositoryFile('.united-we-stand/README.md');

        expect(implementer).toContain('do not treat the request as automatic entry into `4-implementer`');
        expect(implementer).toContain('do not mention missing framework setup');
        expect(frameworkReadme).toContain('continue helping with that request normally');
        expect(frameworkReadme).toContain('fix these vulnerabilities');
        expect(frameworkReadme).not.toContain('proceed outside the framework for the current chat');
    });
});
