import chalk from 'chalk';

/**
 * Structured logger interface for CLI output with color-coded messages.
 */
export interface Logger {
    /** Log an informational message. */
    info(message: string): void;
    /** Log a success message. */
    success(message: string): void;
    /** Log a warning message. */
    warn(message: string): void;
    /** Log an error message. */
    error(message: string): void;
    /** Log that a file was created. */
    created(filePath: string): void;
    /** Log that a file was updated. */
    updated(filePath: string): void;
    /** Log that a file was skipped (no changes needed). */
    skipped(filePath: string): void;
    /** Log a pass/fail check result for doctor output. */
    check(label: string, passed: boolean, detail?: string): void;
}

/**
 * Creates a logger instance with optional dry-run prefix on all messages.
 */
export function createLogger(isDryRun: boolean): Logger {
    const dryRunPrefix = isDryRun ? chalk.yellow('[DRY RUN] ') : '';

    return {
        info(message: string) {
            console.log(`${dryRunPrefix}${chalk.blue('ℹ')} ${message}`);
        },

        success(message: string) {
            console.log(`${dryRunPrefix}${chalk.green('✔')} ${message}`);
        },

        warn(message: string) {
            console.log(`${dryRunPrefix}${chalk.yellow('⚠')} ${message}`);
        },

        error(message: string) {
            console.error(`${dryRunPrefix}${chalk.red('✖')} ${message}`);
        },

        created(filePath: string) {
            console.log(`${dryRunPrefix}${chalk.green('+')} ${chalk.dim('created')} ${filePath}`);
        },

        updated(filePath: string) {
            console.log(`${dryRunPrefix}${chalk.cyan('~')} ${chalk.dim('updated')} ${filePath}`);
        },

        skipped(filePath: string) {
            console.log(`${dryRunPrefix}${chalk.dim('-')} ${chalk.dim('skipped')} ${filePath}`);
        },

        check(label: string, passed: boolean, detail?: string) {
            const icon = passed ? chalk.green('✔') : chalk.red('✖');
            const text = passed ? label : chalk.red(label);
            const suffix = detail ? chalk.dim(` — ${detail}`) : '';
            console.log(`  ${icon} ${text}${suffix}`);
        },
    };
}
