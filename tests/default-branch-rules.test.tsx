import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadAgentsMdBlockTemplate } from '../src/lib/templates.js';

function readRepositoryFile(relativePath: string): string {
    return readFileSync(fileURLToPath(new URL(`../${relativePath}`, import.meta.url)), 'utf-8');
}

describe('default-branch initialization guidance', () => {
    it('documents the default-branch warning in the installed AGENTS block', () => {
        const agentsBlock = loadAgentsMdBlockTemplate();

        expect(agentsBlock).toContain('current branch is detected as the repository default branch');
        expect(agentsBlock).toContain('ask for confirmation before creating `.spec-driven/...` files');
        expect(agentsBlock).toContain('unless the user explicitly uses `--force`');
    });

    it('documents the canonical routing rule and sticky outside-framework behavior', () => {
        const commandRouting = readRepositoryFile('.united-we-stand/framework/04-command-routing.md');

        expect(commandRouting).toContain('## Default Branch Initialization Rule');
        expect(commandRouting).toContain('warn clearly that initialization is being requested on the default branch');
        expect(commandRouting).toContain('This one-time outside-framework confirmation stays sticky on the default branch too.');
    });

    it('documents the same warning in initializer guidance and user-facing README', () => {
        const initializer = readRepositoryFile('.united-we-stand/agents/1-initializer.md');
        const frameworkReadme = readRepositoryFile('.united-we-stand/README.md');

        expect(initializer).toContain('warn about default-branch risks');
        expect(initializer).toContain('unless the user explicitly used `--force`');
        expect(frameworkReadme).toContain('If you are on the repository default branch');
        expect(frameworkReadme).toContain('explicit init requests should still warn and ask for confirmation');
    });
});
