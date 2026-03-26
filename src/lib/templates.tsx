/**
 * Centralized template loader for united-we-stand.
 * Currently unused.
 *
 * Markdown template assets live under the package-root `.united-we-stand/`
 * directory. This module reads those assets and returns grouped file manifests
 * for installation and branch initialization.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const CURRENT_FILENAME = fileURLToPath(import.meta.url);
const CURRENT_DIRNAME = dirname(CURRENT_FILENAME);

const FRAMEWORK_AGENT_FILENAMES = [
    '0-status-checker.md',
    '1-initializer.md',
    '2-planner.md',
    '3-designer.md',
    '4-implementer.md',
    '5-code-reviewer.md',
    '6-finalizer.md',
];

const STANDALONE_AGENT_FILENAMES = [
    'debugger.md',
    'documentation-writer.md',
    'project-manager.md',
    'refactorer.md',
    'test-strategist.md',
    'optimizer.md',
    'performance-reviewer.md',
    'accessibility-reviewer.md',
    'api-contract-writer.md',
    'data-modeler.md',
    'sql-database-designer.md',
    'migration-planner.md',
    'observability-reviewer.md',
    'release-coordinator.md',
    'web-designer.md',
];

/** Represents a single markdown file with path (relative to `.united-we-stand/`) and content. */
export interface TemplateFileEntry {
    relativePath: string;
    content: string;
}

/** Represents a single agent markdown file with its filename and content. */
export interface AgentFileEntry {
    filename: string;
    content: string;
}

/** Represents a branch-spec markdown file with path relative to a branch folder and content. */
export interface BranchSpecFileEntry {
    relativePath: string;
    content: string;
}

/**
 * Returns the absolute path to the package-root `.united-we-stand/` directory.
 * Works from both `src/lib/` (dev) and `dist/lib/` (built).
 */
function resolveTemplateRootDirectory(): string {
    return join(CURRENT_DIRNAME, '..', '..', '.united-we-stand');
}

/**
 * Reads a template file from `.united-we-stand/` as UTF-8 text.
 */
function readTemplateFile(relativePath: string): string {
    return readFileSync(join(resolveTemplateRootDirectory(), relativePath), 'utf-8');
}

/**
 * Reads a template file and replaces all `{{KEY}}` placeholders with
 * values from the provided map.
 */
function readTemplateWithPlaceholders(
    relativePath: string,
    variables: Record<string, string>,
): string {
    let templateContent = readTemplateFile(relativePath);

    for (const [placeholderKey, replacementValue] of Object.entries(variables)) {
        templateContent = templateContent.replaceAll(`{{${placeholderKey}}}`, replacementValue);
    }

    return templateContent;
}

/**
 * Recursively lists markdown files under a directory relative to `.united-we-stand/`.
 */
function listMarkdownFiles(relativeDirectory: string): string[] {
    const absoluteDirectoryPath = join(resolveTemplateRootDirectory(), relativeDirectory);
    const filePaths: string[] = [];
    const directoryEntries = readdirSync(absoluteDirectoryPath, { withFileTypes: true })
        .sort((left, right) => left.name.localeCompare(right.name));

    for (const entry of directoryEntries) {
        const absoluteEntryPath = join(absoluteDirectoryPath, entry.name);
        if (entry.isDirectory()) {
            filePaths.push(...listMarkdownFiles(relative(resolveTemplateRootDirectory(), absoluteEntryPath)));
            continue;
        }

        if (entry.isFile() && entry.name.endsWith('.md')) {
            filePaths.push(relative(resolveTemplateRootDirectory(), absoluteEntryPath));
        }
    }

    return filePaths.sort((left, right) => left.localeCompare(right));
}

/**
 * Loads all markdown files under a directory relative to `.united-we-stand/`.
 */
function loadDirectoryFiles(relativeDirectory: string): TemplateFileEntry[] {
    return listMarkdownFiles(relativeDirectory).map((relativePath) => ({
        relativePath,
        content: readTemplateFile(relativePath),
    }));
}

/**
 * Returns the AGENTS.md managed block content.
 */
export function loadAgentsMdBlockTemplate(): string {
    return readTemplateFile('agents-md-block.md');
}

/**
 * Returns the copilot-instructions.md managed block content.
 */
export function loadCopilotInstructionsTemplate(): string {
    return readTemplateFile('copilot-instructions.md');
}

/**
 * Returns the Antigravity workflow pointer template.
 */
export function loadAntigravityWorkflowTemplate(): string {
    return readTemplateFile('antigravity-workflow.md');
}

/**
 * Returns the Cursor project rule pointer template.
 */
export function loadCursorRuleTemplate(): string {
    return readTemplateFile('cursor-rule.mdc');
}

/**
 * Returns the `.united-we-stand/README.md` template.
 */
export function loadFrameworkReadmeTemplate(): string {
    return readTemplateFile('README.md');
}

/**
 * Loads framework docs under `.united-we-stand/framework/`.
 */
export function loadFrameworkFiles(): TemplateFileEntry[] {
    return loadDirectoryFiles('framework');
}

/**
 * Loads steering docs under `.united-we-stand/steering/`.
 */
export function loadSteeringFiles(): TemplateFileEntry[] {
    return loadDirectoryFiles('steering');
}

/**
 * Loads playbook docs under `.united-we-stand/playbooks/`.
 */
export function loadPlaybookFiles(): TemplateFileEntry[] {
    return loadDirectoryFiles('playbooks');
}

/**
 * Loads all framework agent markdown files.
 */
export function loadFrameworkAgentFiles(): AgentFileEntry[] {
    return FRAMEWORK_AGENT_FILENAMES.map((filename) => ({
        filename,
        content: readTemplateFile(join('agents', filename)),
    }));
}

/**
 * Loads all standalone role agent markdown files.
 */
export function loadStandaloneAgentFiles(): AgentFileEntry[] {
    return STANDALONE_AGENT_FILENAMES.map((filename) => ({
        filename,
        content: readTemplateFile(join('agents', filename)),
    }));
}

/**
 * Lists all branch-spec markdown template paths relative to branch root.
 */
export function listBranchSpecRelativePaths(): string[] {
    return listMarkdownFiles(join('spec-driven', 'branch-template')).map((relativePath) => (
        relativePath.replace(/^spec-driven[\\/]+branch-template[\\/]/, '')
    ));
}

/**
 * Loads all branch spec markdown templates from `spec-driven/branch-template/`.
 */
export function loadBranchSpecFiles(branchName: string, sanitizedName: string): BranchSpecFileEntry[] {
    const placeholderVars = { BRANCH: branchName, SANITIZED: sanitizedName };

    return listBranchSpecRelativePaths().map((relativePath) => ({
        relativePath,
        content: readTemplateWithPlaceholders(join('spec-driven', 'branch-template', relativePath), placeholderVars),
    }));
}

/**
 * Reads the raw `01-init.md` template used as fallback content.
 */
export function loadInitSpecTemplate(): string {
    return readTemplateFile(join('spec-driven', 'branch-template', '01-init.md'));
}

/**
 * Reads the raw `00-current-status.md` template and fills branch placeholders.
 */
export function loadCurrentStatusSpecTemplate(branchName: string, sanitizedName: string): string {
    return readTemplateWithPlaceholders(
        join('spec-driven', 'branch-template', '00-current-status.md'),
        { BRANCH: branchName, SANITIZED: sanitizedName },
    );
}

/**
 * Builds the replaceable marker content for a captured idea in `01-init.md`.
 */
export function buildCapturedIdeaBlock(ideaText: string): string {
    return `${ideaText}\n`;
}

/**
 * Builds the managed branch overview block for `00-current-status.md`.
 */
export function buildOverviewStageBlock(
    branchName: string,
    sanitizedName: string,
    currentStage: string,
    completedSteps: string,
    incompletedStages: string,
    nextRecommendedStep: string,
    statusNote: string,
    blockersOrWarnings: string = 'none',
): string {
    const todayDate = new Date().toISOString().slice(0, 10);

    return `# Branch Overview

| Field | Value |
|-------|-------|
| Current branch | \`${branchName}\` |
| Sanitized ID | \`${sanitizedName}\` |
| Current stage | ${currentStage} |
| Completed steps | ${completedSteps} |
| Incompleted stages | ${incompletedStages} |
| Next recommended step | ${nextRecommendedStep} |
| Status note | ${statusNote} |
| Blockers / warnings | ${blockersOrWarnings} |
| Last updated by | 1-initializer |
| Last updated at | ${todayDate} |
`;
}
