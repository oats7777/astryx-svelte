// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file playwright.config.ts
 * @input Package-local Playwright invocations
 * @output E2E configuration for Svelte SSR/hydration scenarios
 * @position Test tooling for @astryxdesign/svelte browser QA
 */

import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir: './src/lib/theme/e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:4265',
  },
  webServer: {
    command: 'node src/lib/theme/e2e/server.mjs',
    url: 'http://127.0.0.1:4265',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
