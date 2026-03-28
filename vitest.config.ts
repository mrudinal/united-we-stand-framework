import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['tests/**/*.test.tsx'],
        hookTimeout: 30000,
    },
});
