import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

function readRepositoryFile(relativePath: string): string {
    return readFileSync(fileURLToPath(new URL(`../${relativePath}`, import.meta.url)), 'utf-8');
}

describe('security and vulnerability guidance', () => {
    it('requires early-stage security and dependency planning', () => {
        const initializer = readRepositoryFile('.united-we-stand/agents/1-initializer.md');
        const planner = readRepositoryFile('.united-we-stand/agents/2-planner.md');
        const designer = readRepositoryFile('.united-we-stand/agents/3-designer.md');
        const initTemplate = readRepositoryFile('.united-we-stand/spec-driven/branch-template/01-init.md');
        const planTemplate = readRepositoryFile('.united-we-stand/spec-driven/branch-template/02-plan.md');
        const designTemplate = readRepositoryFile('.united-we-stand/spec-driven/branch-template/03-design.md');

        expect(initializer).toContain('Security / dependency concerns');
        expect(planner).toContain('Security / dependency risk plan');
        expect(designer).toContain('Security boundaries / attack surface');
        expect(initTemplate).toContain('## Security / dependency concerns');
        expect(planTemplate).toContain('## Security / dependency risk plan');
        expect(designTemplate).toContain('## Security boundaries / attack surface');
    });

    it('requires high-priority vulnerability reporting, audit commands, and post-fix verification', () => {
        const reviewer = readRepositoryFile('.united-we-stand/agents/5-code-reviewer.md');
        const implementer = readRepositoryFile('.united-we-stand/agents/4-implementer.md');
        const reviewModel = readRepositoryFile('.united-we-stand/framework/10-review-model.md');
        const doneModel = readRepositoryFile('.united-we-stand/framework/07-definition-of-done.md');
        const jsProfile = readRepositoryFile('.united-we-stand/framework/profiles/javascript-typescript.md');
        const matrix = readRepositoryFile('.united-we-stand/framework/13-vulnerability-audit-matrix.md');
        const reactChecklist = readRepositoryFile('.united-we-stand/framework/12-react-frontend-review-checklist.md');
        const reviewTemplate = readRepositoryFile('.united-we-stand/spec-driven/branch-template/05-code-review.md');

        expect(reviewer).toContain('Run the proper repo-native vulnerability audit command');
        expect(reviewer).toContain('Report all detected dependency vulnerabilities as high priority');
        expect(reviewer).toContain('Review code for injection and attack risks');
        expect(implementer).toContain('re-verify afterward that the project still builds/compiles');
        expect(reviewModel).toContain('dependency vulnerability audit findings');
        expect(doneModel).toContain('all detected dependency vulnerabilities are surfaced as high priority');
        expect(jsProfile).toContain('package-lock.json');
        expect(matrix).toContain('composer audit');
        expect(matrix).toContain('dotnet list package --vulnerable');
        expect(reactChecklist).toContain('State And Effects');
        expect(reviewTemplate).toContain('## Vulnerability audit findings');
        expect(reviewTemplate).toContain('## Lint/parser/static-analysis observations');
        expect(reviewTemplate).toContain('## Residual risks');
    });
});
