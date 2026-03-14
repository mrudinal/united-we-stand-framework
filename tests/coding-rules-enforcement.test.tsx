import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

function readRepositoryFile(relativePath: string): string {
    return readFileSync(fileURLToPath(new URL(`../${relativePath}`, import.meta.url)), 'utf-8');
}

describe('mandatory coding rule wording', () => {
    it('requires comments and small functions in coding steering', () => {
        const codingSteering = readRepositoryFile('.united-we-stand/steering/coding-steering.md');

        expect(codingSteering).toContain('Every changed code file must contain at least one intent-focused code comment.');
        expect(codingSteering).toContain('If a file contains only one small function, that file still must include at least one short comment explaining what the function does.');
        expect(codingSteering).toContain('Add `//` inline comments before each non-trivial block to explain intent, boundary handling, or reasoning.');
        expect(codingSteering).toContain('Avoid large functions.');
    });

    it('requires implementer and reviewer to enforce those rules', () => {
        const implementer = readRepositoryFile('.united-we-stand/agents/4-implementer.md');
        const reviewer = readRepositoryFile('.united-we-stand/agents/5-code-reviewer.md');
        const reviewModel = readRepositoryFile('.united-we-stand/framework/10-review-model.md');
        const doneModel = readRepositoryFile('.united-we-stand/framework/07-definition-of-done.md');
        const jsTsProfile = readRepositoryFile('.united-we-stand/framework/profiles/javascript-typescript.md');

        expect(implementer).toContain('Add the required file-level/function/block comments from coding steering during implementation');
        expect(implementer).toContain('Do not leave large multi-responsibility functions behind');
        expect(implementer).toContain('Follow repository linting, parser-based analysis, and static-analysis rules during implementation');
        expect(reviewer).toContain('Treat coding-steering violations as real findings');
        expect(reviewer).toContain('Run repository linting, parser-based analysis, and static-analysis checks when they are available');
        expect(reviewModel).toContain('required comment coverage from coding steering');
        expect(reviewModel).toContain('lint/parser/static-analysis observations and whether those checks were run');
        expect(doneModel).toContain('mandatory coding-steering requirements were skipped in the implemented code');
        expect(doneModel).toContain('available lint/parser/static-analysis checks relevant to the changed scope were run');
        expect(jsTsProfile).toContain('Treat ESLint, parser-based AST analysis, and similar static-analysis tooling as mandatory quality inputs');
    });
});
