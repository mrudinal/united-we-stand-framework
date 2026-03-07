/**
 * Centralized template loader for united-we-stand.
 *
 * All markdown templates live in the `templates/` directory as standalone .md
 * files. This module reads them at runtime and provides accessor functions for
 * each template category: managed blocks, agents, and branch spec files.
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ========================== Path Resolution ========================

const CURRENT_FILENAME = fileURLToPath(import.meta.url);
const CURRENT_DIRNAME = dirname(CURRENT_FILENAME);

/**
 * Returns the absolute path to the package-root `templates/` directory.
 * Works from both `src/lib/` (dev) and `dist/lib/` (built).
 */
function resolveTemplatesDirectory(): string {
    return join(CURRENT_DIRNAME, '..', '..', 'templates');
}

/**
 * Reads a template file from the templates directory as UTF-8 text.
 */
function readTemplateFile(relativePath: string): string {
    return readFileSync(join(resolveTemplatesDirectory(), relativePath), 'utf-8');
}

/**
 * Reads a template file and replaces all `{{KEY}}` placeholders with
 * the corresponding values from the provided variables map.
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

// ========================== Managed Block Templates ================

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

// ========================== Agent File Manifest ====================

/** Represents a single agent markdown file with its name and content. */
export interface AgentFileEntry {
    filename: string;
    content: string;
}

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
];

/**
 * Loads all framework agent markdown files from the templates directory.
 */
export function loadFrameworkAgentFiles(): AgentFileEntry[] {
    return FRAMEWORK_AGENT_FILENAMES.map((filename) => ({
        filename,
        content: readTemplateFile(join('agents', filename)),
    }));
}

/**
 * Loads all standalone role agent markdown files from the templates directory.
 */
export function loadStandaloneAgentFiles(): AgentFileEntry[] {
    return STANDALONE_AGENT_FILENAMES.map((filename) => ({
        filename,
        content: readTemplateFile(join('agents', filename)),
    }));
}

// ========================== Branch Spec Templates ==================

/** Represents a single branch spec markdown file with its name and content. */
export interface SpecFileEntry {
    filename: string;
    content: string;
}

const SPEC_DRIVEN_FILENAMES = [
    '00-overview.md',
    '01-init.md',
    '02-plan.md',
    '03-design.md',
    '04-implementation.md',
    '05-code-review.md',
    '06-finalization.md',
];

/**
 * Loads all branch spec-driven markdown files, interpolating branch
 * name placeholders in templates that use them.
 */
export function loadBranchSpecFiles(branchName: string, sanitizedName: string): SpecFileEntry[] {
    const placeholderVars = { BRANCH: branchName, SANITIZED: sanitizedName };

    return SPEC_DRIVEN_FILENAMES.map((filename) => ({
        filename,
        content: readTemplateWithPlaceholders(join('spec-driven', filename), placeholderVars),
    }));
}

/**
 * Reads the raw 01-init.md template (used as fallback content
 * when branch-init creates the init file for the first time).
 */
export function loadInitSpecTemplate(): string {
    return readTemplateFile(join('spec-driven', '01-init.md'));
}

// ========================== Branch-Init Managed Blocks ==============

/**
 * Builds the managed block content for a captured idea in 01-init.md.
 */
export function buildCapturedIdeaBlock(ideaText: string): string {
    return `## Raw idea\n\n${ideaText}\n`;
}

/**
 * Builds the managed block content for the branch overview header
 * in 00-overview.md, including stage, status, and next step metadata.
 */
export function buildOverviewStageBlock(
    branchName: string,
    sanitizedName: string,
    currentStage: string,
    currentStatus: string,
    nextStep: string,
): string {
    const todayDate = new Date().toISOString().slice(0, 10);

    return `# Branch Overview

| Field | Value |
|-------|-------|
| Branch | \`${branchName}\` |
| Sanitized ID | \`${sanitizedName}\` |
| Current stage | ${currentStage} |
| Status | ${currentStatus} |
| Next step | ${nextStep} |
| Last updated | ${todayDate} |
`;
}
