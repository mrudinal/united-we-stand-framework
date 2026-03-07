import { describe, it, expect } from 'vitest';
import { sanitizeBranchName } from '../src/lib/branch.js';

describe('sanitizeBranchName', () => {
    it('converts slashes to dashes', () => {
        expect(sanitizeBranchName('feature/add-login')).toBe('feature-add-login');
    });

    it('converts backslashes to dashes', () => {
        expect(sanitizeBranchName('feature\\add-login')).toBe('feature-add-login');
    });

    it('lowercases the name', () => {
        expect(sanitizeBranchName('Feature/Add-Login')).toBe('feature-add-login');
    });

    it('replaces spaces with dashes', () => {
        expect(sanitizeBranchName('my cool branch')).toBe('my-cool-branch');
    });

    it('removes special characters', () => {
        expect(sanitizeBranchName('fix@#$bug')).toBe('fix-bug');
    });

    it('collapses consecutive dashes', () => {
        expect(sanitizeBranchName('a//b///c')).toBe('a-b-c');
    });

    it('trims leading and trailing dashes', () => {
        expect(sanitizeBranchName('/leading/trailing/')).toBe('leading-trailing');
    });

    it('preserves underscores', () => {
        expect(sanitizeBranchName('fix_the_bug')).toBe('fix_the_bug');
    });

    it('handles main/master branches', () => {
        expect(sanitizeBranchName('main')).toBe('main');
        expect(sanitizeBranchName('master')).toBe('master');
    });

    it('handles complex branch names', () => {
        expect(sanitizeBranchName('user/john.doe/feat/JIRA-123--add-auth'))
            .toBe('user-john-doe-feat-jira-123-add-auth');
    });
});
