import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';
import { runPostinstall } from '../src/scripts/postinstall.js';
import { MARKER_START, MARKER_END } from '../src/lib/markers.js';

function createTempGitRepository(): string {
    const tempDirectory = mkdtempSync(join(tmpdir(), 'united-we-stand-postinstall-'));
    execSync('git init', { cwd: tempDirectory, stdio: 'pipe' });
    execSync('git commit --allow-empty -m "init"', { cwd: tempDirectory, stdio: 'pipe' });
    return tempDirectory;
}

const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalInitCwd = process.env.INIT_CWD;

describe('postinstall script', () => {
    let tempRepoDirectory: string;

    beforeEach(() => {
        tempRepoDirectory = createTempGitRepository();
        process.env.INIT_CWD = tempRepoDirectory;
        console.log = () => { };
        console.error = () => { };
    });

    afterEach(() => {
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
        if (originalInitCwd) {
            process.env.INIT_CWD = originalInitCwd;
        } else {
            delete process.env.INIT_CWD;
        }
        rmSync(tempRepoDirectory, { recursive: true, force: true });
    });

    it('creates AGENTS.md with managed block', async () => {
        await runPostinstall();
        const agentsMdContent = readFileSync(join(tempRepoDirectory, 'AGENTS.md'), 'utf-8');
        expect(agentsMdContent).toContain(MARKER_START);
        expect(agentsMdContent).toContain(MARKER_END);
        expect(agentsMdContent).toContain('united-we-stand');
    });

    it('creates .github/copilot-instructions.md', async () => {
        await runPostinstall();
        expect(existsSync(join(tempRepoDirectory, '.github', 'copilot-instructions.md'))).toBe(true);
    });

    it('creates framework agent files', async () => {
        await runPostinstall();
        const agentsDirectory = join(tempRepoDirectory, '.united-we-stand', 'agents');
        expect(existsSync(join(agentsDirectory, '0-status-checker.md'))).toBe(true);
        expect(existsSync(join(agentsDirectory, '1-initializer.md'))).toBe(true);
        expect(existsSync(join(agentsDirectory, '2-planner.md'))).toBe(true);
        expect(existsSync(join(agentsDirectory, '4-implementer.md'))).toBe(true);
        expect(existsSync(join(agentsDirectory, '5-code-reviewer.md'))).toBe(true);
        expect(existsSync(join(agentsDirectory, '6-finalizer.md'))).toBe(true);
    });

    it('creates standalone role agent files', async () => {
        await runPostinstall();
        const agentsDirectory = join(tempRepoDirectory, '.united-we-stand', 'agents');
        expect(existsSync(join(agentsDirectory, 'debugger.md'))).toBe(true);
        expect(existsSync(join(agentsDirectory, 'project-manager.md'))).toBe(true);
        expect(existsSync(join(agentsDirectory, 'documentation-writer.md'))).toBe(true);
    });

    it('does NOT create branch spec-driven files', async () => {
        await runPostinstall();
        const specDrivenDirectory = join(tempRepoDirectory, '.united-we-stand', 'spec-driven');
        expect(existsSync(specDrivenDirectory)).toBe(false);
    });

    it('is idempotent — running logic twice produces same output', async () => {
        await runPostinstall();
        const firstAgentsMd = readFileSync(join(tempRepoDirectory, 'AGENTS.md'), 'utf-8');

        await runPostinstall();
        const secondAgentsMd = readFileSync(join(tempRepoDirectory, 'AGENTS.md'), 'utf-8');

        expect(secondAgentsMd).toBe(firstAgentsMd);
    });
});
