#!/usr/bin/env node

/**
 * CLI entry point for the united-we-stand command.
 * Registers all subcommands and parses process arguments.
 */

import { Command } from 'commander';
import { resolve } from 'node:path';
import { runInitCommand } from './commands/init.js';
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

// ---- init ----------------------------------------------------------

program
    .command('init')
    .description('Initialize the current branch with an idea description and scaffold spec files.')
    .argument('[idea]', 'short description of the branch goal / idea')
    .option('--cwd <path>', 'run as if started in <path>')
    .option('--dry-run', 'show what would be done without writing files')
    .action(async function (this: Command, ideaText: string) {
        await runInitCommand({
            workingDirectory: resolveWorkingDirectory(this),
            isDryRun: isDryRunEnabled(this),
            ideaText,
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
    .action(function (this: Command) {
        runDoctorCommand({
            workingDirectory: resolveWorkingDirectory(this),
            isDryRun: isDryRunEnabled(this),
        });
    });

// ---- Parse arguments -----------------------------------------------

program.parse();
