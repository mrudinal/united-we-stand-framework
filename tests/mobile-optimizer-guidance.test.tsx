import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

function readRepositoryFile(relativePath: string): string {
    return readFileSync(fileURLToPath(new URL(`../${relativePath}`, import.meta.url)), 'utf-8');
}

describe('mobile optimizer guidance', () => {
    it('teaches optimizer to catch common mobile Lighthouse blockers before release', () => {
        const optimizer = readRepositoryFile('.united-we-stand/agents/optimizer.md');

        expect(optimizer).toContain('mobile Lighthouse/PageSpeed on a production-like URL as a first-class release signal');
        expect(optimizer).toContain('cache-lifetime failures');
        expect(optimizer).toContain('render-blocking resources');
        expect(optimizer).toContain('late-discovered LCP assets');
        expect(optimizer).toContain('unnamed buttons');
        expect(optimizer).toContain('unused JS/CSS');
        expect(optimizer).toContain('post-deploy mobile Lighthouse/PageSpeed checks');
    });

    it('teaches code reviewer and accessibility reviewer to surface those same blockers', () => {
        const reviewer = readRepositoryFile('.united-we-stand/agents/5-code-reviewer.md');
        const accessibilityReviewer = readRepositoryFile('.united-we-stand/agents/accessibility-reviewer.md');
        const doneModel = readRepositoryFile('.united-we-stand/framework/07-definition-of-done.md');
        const reviewModel = readRepositoryFile('.united-we-stand/framework/10-review-model.md');
        const frameworkReadme = readRepositoryFile('.united-we-stand/README.md');

        expect(reviewer).toContain('cache lifetime issues');
        expect(reviewer).toContain('render-blocking requests');
        expect(reviewer).toContain('LCP breakdown/resource discovery issues');
        expect(reviewer).toContain('unnamed interactive controls');
        expect(reviewer).toContain('insufficient contrast');
        expect(accessibilityReviewer).toContain('unnamed interactive controls');
        expect(accessibilityReviewer).toContain('insufficient foreground/background contrast');
        expect(doneModel).toContain('predictable mobile Lighthouse/PageSpeed blockers');
        expect(reviewModel).toContain('unused JS/CSS and late-discovered critical resources');
        expect(frameworkReadme).toContain('mobile Lighthouse/PageSpeed risks');
        expect(frameworkReadme).toContain('accessible control names, and contrast');
    });
});
