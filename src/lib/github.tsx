/**
 * GitHub integration: attempts to star the united-we-stand-framework repository
 * as a best-effort, non-blocking operation during init.
 */

import { execSync } from 'node:child_process';
import https from 'node:https';
import type { Logger } from './logger.js';

const GITHUB_OWNER = 'mrudinal';
const GITHUB_REPO = 'united-we-stand-framework';
const GITHUB_REPO_DISPLAY = `${GITHUB_OWNER}/${GITHUB_REPO}`;
const API_TIMEOUT_MS = 5000;
const CLI_TIMEOUT_MS = 10000;

/**
 * Attempts to star the united-we-stand-framework repository on GitHub.
 *
 * Checks for GITHUB_TOKEN / GH_TOKEN env vars first, then falls back
 * to the `gh` CLI. Logs the result in all cases.
 */
export async function tryStarRepository(logger: Logger): Promise<void> {
    const authToken = getTokenFromEnvironment();

    if (authToken) {
        await starRepositoryViaRestApi(authToken, logger);
        return;
    }

    if (isGitHubCliAuthenticated()) {
        starRepositoryViaGitHubCli(logger);
        return;
    }

    // No authentication method available.
    logger.info('GitHub auth not detected, skipping repo star.');
}

// ---- Environment token extraction ----------------------------------

/**
 * Reads a GitHub token from well-known environment variables.
 */
function getTokenFromEnvironment(): string | null {
    return process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN ?? null;
}

// ---- GitHub CLI authentication check -------------------------------

/**
 * Checks whether the GitHub CLI (`gh`) is installed and authenticated.
 */
function isGitHubCliAuthenticated(): boolean {
    try {
        execSync('gh auth status', { stdio: 'pipe', timeout: API_TIMEOUT_MS });
        return true;
    } catch {
        return false;
    }
}

// ---- Star via REST API ---------------------------------------------

/**
 * Stars the repository using the GitHub REST API with bearer token auth.
 */
function starRepositoryViaRestApi(authToken: string, logger: Logger): Promise<void> {
    return new Promise((resolve) => {
        const requestOptions: https.RequestOptions = {
            hostname: 'api.github.com',
            path: `/user/starred/${GITHUB_OWNER}/${GITHUB_REPO}`,
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${authToken}`,
                Accept: 'application/vnd.github+json',
                'User-Agent': 'united-we-stand-cli',
                'X-GitHub-Api-Version': '2022-11-28',
                'Content-Length': '0',
            },
        };

        const request = https.request(requestOptions, (response) => {
            // 204 = starred successfully, 304 = was already starred.
            if (response.statusCode === 204 || response.statusCode === 304) {
                logger.success(`Project ${GITHUB_REPO_DISPLAY} successfully starred.`);
            } else {
                logger.warn('Error during starring of the repo, skipping to the next step...');
            }
            response.resume();
            resolve();
        });

        request.on('error', () => {
            logger.warn('Error during starring of the repo, skipping to the next step...');
            resolve();
        });

        request.setTimeout(API_TIMEOUT_MS, () => {
            logger.warn('Error during starring of the repo, skipping to the next step...');
            request.destroy();
            resolve();
        });

        request.end();
    });
}

// ---- Star via GitHub CLI -------------------------------------------

/**
 * Stars the repository using the `gh` CLI tool.
 */
function starRepositoryViaGitHubCli(logger: Logger): void {
    try {
        execSync(
            `gh api -X PUT /user/starred/${GITHUB_OWNER}/${GITHUB_REPO}`,
            { stdio: 'pipe', timeout: CLI_TIMEOUT_MS },
        );
        logger.success(`Project ${GITHUB_REPO_DISPLAY} successfully starred.`);
    } catch {
        logger.warn('Error during starring of the repo, skipping to the next step...');
    }
}
