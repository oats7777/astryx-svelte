// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file vitest.config.ts
 * @input Uses vitest/config plus package-local Svelte test ownership
 * @output Root Vitest configuration for CLI, token, script, and internal guard tests
 * @position Svelte-first root test config; Svelte packages use their local Vite configs
 *
 * SYNC: When modified, update root README.md
 */

import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'packages/cli/src/**/*.test.mjs',
      'packages/tokens/src/**/*.test.ts',
      'internal/**/*.test.{ts,mjs}',
      'scripts/**/*.test.ts',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.svelte-kit/**',
      'internal/vibe-tests/app/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['packages/{cli,tokens}/src/**/*.{ts,mjs}'],
      exclude: ['**/*.test.{ts,mjs}', '**/index.ts'],
    },
    setupFiles: ['./internal/test-utils/src/setup.ts'],
    poolOptions: {
      forks: {
        execArgv: ['--max-old-space-size=4096'],
      },
    },
  },
});
