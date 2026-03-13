import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';
import { runInstallCommand } from '../src/commands/install.js';
import { MARKER_START, MARKER_END } from '../src/lib/markers.js';

// Prevent real network calls during tests.
vi.mock('../src/lib/github.js', () => ({
    tryStarRepository: vi.fn().mockResolvedValue(undefined),
}));

/**
 * Creates an isolated git repository for install-command tests.
 */
function createTempGitRepository(): string {
    const tempDirectory = mkdtempSync(join(tmpdir(), 'united-we-stand-postinstall-'));
    execSync('git init', { cwd: tempDirectory, stdio: 'pipe' });
    execSync('git config user.email "test@example.com"', { cwd: tempDirectory, stdio: 'pipe' });
    execSync('git config user.name "united-we-stand-test"', { cwd: tempDirectory, stdio: 'pipe' });
    execSync('git commit --allow-empty -m "init"', { cwd: tempDirectory, stdio: 'pipe' });
    return tempDirectory;
}

const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalInitCwd = process.env.INIT_CWD;

describe('install command', () => {
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
        await runInstallCommand({ workingDirectory: tempRepoDirectory, isDryRun: false, force: false });
        const agentsMdContent = readFileSync(join(tempRepoDirectory, 'AGENTS.md'), 'utf-8');
        expect(agentsMdContent).toContain(MARKER_START);
        expect(agentsMdContent).toContain(MARKER_END);
        expect(agentsMdContent).toContain('united-we-stand');
    });

    it('creates .github/copilot-instructions.md', async () => {
        await runInstallCommand({ workingDirectory: tempRepoDirectory, isDryRun: false, force: false });
        expect(existsSync(join(tempRepoDirectory, '.github', 'copilot-instructions.md'))).toBe(true);
    });

    it('creates Antigravity and Cursor pointer files', async () => {
        await runInstallCommand({ workingDirectory: tempRepoDirectory, isDryRun: false, force: false });
        expect(existsSync(join(tempRepoDirectory, '.agents', 'workflows', 'united-we-stand.md'))).toBe(true);
        expect(existsSync(join(tempRepoDirectory, '.cursor', 'rules', 'united-we-stand.mdc'))).toBe(true);
    });

    it('creates framework agent files', async () => {
        await runInstallCommand({ workingDirectory: tempRepoDirectory, isDryRun: false, force: false });
        const agentsDirectory = join(tempRepoDirectory, '.united-we-stand', 'agents');
        expect(existsSync(join(agentsDirectory, '0-status-checker.md'))).toBe(true);
        expect(existsSync(join(agentsDirectory, '1-initializer.md'))).toBe(true);
        expect(existsSync(join(agentsDirectory, '2-planner.md'))).toBe(true);
        expect(existsSync(join(agentsDirectory, '4-implementer.md'))).toBe(true);
        expect(existsSync(join(agentsDirectory, '5-code-reviewer.md'))).toBe(true);
        expect(existsSync(join(agentsDirectory, '6-finalizer.md'))).toBe(true);
    });

    it('creates standalone role agent files', async () => {
        await runInstallCommand({ workingDirectory: tempRepoDirectory, isDryRun: false, force: false });
        const agentsDirectory = join(tempRepoDirectory, '.united-we-stand', 'agents');
        expect(existsSync(join(agentsDirectory, 'debugger.md'))).toBe(true);
        expect(existsSync(join(agentsDirectory, 'project-manager.md'))).toBe(true);
        expect(existsSync(join(agentsDirectory, 'documentation-writer.md'))).toBe(true);
        expect(existsSync(join(agentsDirectory, 'refactorer.md'))).toBe(true);
        expect(existsSync(join(agentsDirectory, 'release-coordinator.md'))).toBe(true);
        expect(existsSync(join(agentsDirectory, 'sql-database-designer.md'))).toBe(true);
        expect(existsSync(join(agentsDirectory, 'web-designer.md'))).toBe(true);
    });

    it('creates framework, steering, playbook, and framework readme files', async () => {
        await runInstallCommand({ workingDirectory: tempRepoDirectory, isDryRun: false, force: false });
        const frameworkRoot = join(tempRepoDirectory, '.united-we-stand');
        expect(existsSync(join(frameworkRoot, 'README.md'))).toBe(true);
        expect(existsSync(join(frameworkRoot, 'framework', '00-index.md'))).toBe(true);
        expect(existsSync(join(frameworkRoot, 'framework', 'profiles', '00-profile-selection.md'))).toBe(true);
        expect(existsSync(join(frameworkRoot, 'steering', '00-index.md'))).toBe(true);
        expect(existsSync(join(frameworkRoot, 'playbooks', '00-index.md'))).toBe(true);
    });

    it('does NOT create branch spec-driven files', async () => {
        await runInstallCommand({ workingDirectory: tempRepoDirectory, isDryRun: false, force: false });
        const runtimeSpecDirectory = join(tempRepoDirectory, '.spec-driven');
        expect(existsSync(runtimeSpecDirectory)).toBe(false);
    });

    it('is idempotent — running logic twice produces same output', async () => {
        await runInstallCommand({ workingDirectory: tempRepoDirectory, isDryRun: false, force: false });
        const firstAgentsMd = readFileSync(join(tempRepoDirectory, 'AGENTS.md'), 'utf-8');

        await runInstallCommand({ workingDirectory: tempRepoDirectory, isDryRun: false, force: false });
        const secondAgentsMd = readFileSync(join(tempRepoDirectory, 'AGENTS.md'), 'utf-8');

        expect(secondAgentsMd).toBe(firstAgentsMd);
    });

    it('keeps user-customized framework markdown when install is not forced', async () => {
        await runInstallCommand({ workingDirectory: tempRepoDirectory, isDryRun: false, force: false });

        const coreRulesPath = join(tempRepoDirectory, '.united-we-stand', 'framework', '01-core-rules.md');
        writeFileSync(coreRulesPath, '# user custom rules\n\ncustom content\n', 'utf-8');

        await runInstallCommand({ workingDirectory: tempRepoDirectory, isDryRun: false, force: false });
        const preservedContent = readFileSync(coreRulesPath, 'utf-8');

        expect(preservedContent).toContain('custom content');
    });

    it('resets customized framework markdown when install is forced', async () => {
        await runInstallCommand({ workingDirectory: tempRepoDirectory, isDryRun: false, force: false });

        const coreRulesPath = join(tempRepoDirectory, '.united-we-stand', 'framework', '01-core-rules.md');
        writeFileSync(coreRulesPath, '# user custom rules\n\ncustom content\n', 'utf-8');

        await runInstallCommand({ workingDirectory: tempRepoDirectory, isDryRun: false, force: true });
        const resetContent = readFileSync(coreRulesPath, 'utf-8');

        expect(resetContent).not.toContain('custom content');
        expect(resetContent).toContain('# Core Rules');
    });
});
