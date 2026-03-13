#!/usr/bin/env node

/**
 * CLI entry point for the united-we-stand command.
 * Registers all subcommands and parses process arguments.
 */

import { Command } from 'commander';
import { resolve } from 'node:path';
import { runBranchInitCommand } from './commands/branch-init.js';
import { runInstallCommand } from './commands/install.js';
import { runRefreshCommand } from './commands/refresh.js';
import { runDoctorCommand } from './commands/doctor.js';

const program = new Command();

program
    .name('united-we-stand')
    .description(
        'Repo-scoped AI workflow framework — persists branch-aware specs and agent roles as markdown files.',
    )
    .version('0.1.0');

// ---- Shared option helpers -----------------------------------------

/**
 * Resolves the working directory from the --cwd option or falls back to process.cwd().
 */
function resolveWorkingDirectory(command: Command): string {
    const globalOptions = command.optsWithGlobals();
    return resolve(globalOptions.cwd ?? process.cwd());
}

/**
 * Returns whether the --dry-run flag was set on the given command.
 */
function isDryRunEnabled(command: Command): boolean {
    return command.optsWithGlobals().dryRun === true;
}

// ---- install -------------------------------------------------------

program
    .command('install')
    .description('Install specs, agents, and framework into the current repository.')
    .option('--cwd <path>', 'run as if started in <path>')
    .option('--dry-run', 'show what would be done without writing files')
    .option('--force', 'overwrite existing framework and agent files with global defaults')
    .action(async function (this: Command) {
        const globalOptions = this.optsWithGlobals();
        await runInstallCommand({
            workingDirectory: resolveWorkingDirectory(this),
            isDryRun: isDryRunEnabled(this),
            force: globalOptions.force === true,
        });
    });

// ---- branch-init ---------------------------------------------------

program
    .command('branch-init')
    .description('Initialize branch memory under .spec-driven/<sanitized-branch> with an idea description.')
    .argument('[idea]', 'short description of the branch goal / idea')
    .option('--cwd <path>', 'run as if started in <path>')
    .option('--dry-run', 'show what would be done without writing files')
    .option('--branch <name>', 'explicit branch name override (useful in detached HEAD)')
    .option('--force', 'reset existing branch memory for this branch back to initializer bootstrap files')
    .action(async function (this: Command, ideaText: string) {
        const globalOptions = this.optsWithGlobals();
        await runBranchInitCommand({
            workingDirectory: resolveWorkingDirectory(this),
            isDryRun: isDryRunEnabled(this),
            ideaText,
            branchNameOverride: globalOptions.branch,
            force: globalOptions.force === true,
        });
    });

// ---- refresh -------------------------------------------------------

program
    .command('refresh')
    .description('Re-apply templates and update managed blocks.')
    .option('--cwd <path>', 'run as if started in <path>')
    .option('--dry-run', 'show what would be done without writing files')
    .action(function (this: Command) {
        runRefreshCommand({
            workingDirectory: resolveWorkingDirectory(this),
            isDryRun: isDryRunEnabled(this),
        });
    });

// ---- doctor --------------------------------------------------------

program
    .command('doctor')
    .description('Check repository health and report missing files.')
    .option('--cwd <path>', 'run as if started in <path>')
    .option('--dry-run', 'show what would be done without writing files')
    .option('--branch <name>', 'inspect branch memory for the provided branch name')
    .action(function (this: Command) {
        const globalOptions = this.optsWithGlobals();
        runDoctorCommand({
            workingDirectory: resolveWorkingDirectory(this),
            isDryRun: isDryRunEnabled(this),
            branchNameOverride: globalOptions.branch,
        });
    });

// ---- Parse arguments -----------------------------------------------

program.parse();
