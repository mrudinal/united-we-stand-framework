import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadAgentsMdBlockTemplate } from '../src/lib/templates.js';

function readRepositoryFile(relativePath: string): string {
    return readFileSync(fileURLToPath(new URL(`../${relativePath}`, import.meta.url)), 'utf-8');
}

describe('one-stage-at-a-time workflow guidance', () => {
    it('documents the rule in core routing guidance and installed AGENTS instructions', () => {
        const agentsBlock = loadAgentsMdBlockTemplate();
        const coreRules = readRepositoryFile('.united-we-stand/framework/01-core-rules.md');
        const stateModel = readRepositoryFile('.united-we-stand/framework/02-state-model.md');
        const stageLifecycle = readRepositoryFile('.united-we-stand/framework/03-stage-lifecycle.md');
        const commandRouting = readRepositoryFile('.united-we-stand/framework/04-command-routing.md');

        expect(agentsBlock).toContain('only runs one stage at a time');
        expect(agentsBlock).toContain('confirm one single stage');
        expect(coreRules).toContain('Only one framework stage may run at a time');
        expect(stateModel).toContain('## One-Stage-At-A-Time Rule');
        expect(stageLifecycle).toContain('only runs one stage at a time');
        expect(stageLifecycle).toContain('confirm one single stage to run now');
        expect(commandRouting).toContain('united-we-stand only runs one stage at a time');
        expect(commandRouting).toContain('suggest the next recommended numbered stage first');
    });

    it('documents the rule in initializer, status checker, and user-facing readmes', () => {
        const initializer = readRepositoryFile('.united-we-stand/agents/1-initializer.md');
        const statusChecker = readRepositoryFile('.united-we-stand/agents/0-status-checker.md');
        const frameworkReadme = readRepositoryFile('.united-we-stand/README.md');
        const repositoryReadme = readRepositoryFile('README.md');

        expect(initializer).toContain('do only `1-initializer`');
        expect(statusChecker).toContain('only runs one stage at a time');
        expect(frameworkReadme).toContain('only runs one stage at a time');
        expect(repositoryReadme).toContain('only runs one stage at a time');
    });
});
