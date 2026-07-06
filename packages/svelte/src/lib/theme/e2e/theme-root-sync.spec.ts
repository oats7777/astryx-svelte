// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file theme-root-sync.spec.ts
 * @input SSR page served by the package-local Playwright web server
 * @output Hydration, root attribute, and console-error assertions
 * @position Manual QA evidence scenario for Todo 5
 */

import {expect, test, type Page} from '@playwright/test';
import {mkdirSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

type ThemeRootSyncEvidence = {
  readonly hydrated: boolean;
  readonly initial: {
    readonly dataTheme: string | null;
    readonly dataAstryxTheme: string | null;
  };
  readonly afterDark: {
    readonly dataTheme: string | null;
    readonly dataAstryxTheme: string | null;
  };
  readonly afterSystem: {
    readonly dataTheme: string | null;
    readonly dataAstryxTheme: string | null;
  };
  readonly afterLight: {
    readonly dataTheme: string | null;
    readonly dataAstryxTheme: string | null;
  };
  readonly consoleErrors: readonly string[];
};

async function rootAttrs(page: Page) {
  return page.locator('html').evaluate(element => ({
    dataTheme: element.getAttribute('data-theme'),
    dataAstryxTheme: element.getAttribute('data-astryx-theme'),
  }));
}

test('theme-root-sync SSR page hydrates and syncs root attrs', async ({page}) => {
  const consoleErrors: string[] = [];
  page.on('console', message => {
    const text = message.text();
    if (message.type() === 'error' || text.toLowerCase().includes('hydration')) {
      consoleErrors.push(text);
    }
  });
  page.on('pageerror', error => {
    consoleErrors.push(error.message);
  });

  const response = await page.goto('/');
  expect(response?.ok()).toBe(true);

  await expect(page.getByTestId('theme-root-sync')).toHaveAttribute('data-hydrated', 'true');

  const initial = await rootAttrs(page);
  expect(initial).toEqual({dataTheme: 'light', dataAstryxTheme: 'e2e'});

  await page.getByTestId('dark').click();
  const afterDark = await rootAttrs(page);
  expect(afterDark).toEqual({dataTheme: 'dark', dataAstryxTheme: 'e2e'});

  await page.getByTestId('system').click();
  const afterSystem = await rootAttrs(page);
  expect(afterSystem).toEqual({dataTheme: null, dataAstryxTheme: 'e2e'});

  await page.getByTestId('light').click();
  const afterLight = await rootAttrs(page);
  expect(afterLight).toEqual({dataTheme: 'light', dataAstryxTheme: 'e2e'});

  expect(consoleErrors).toEqual([]);

  const evidence: ThemeRootSyncEvidence = {
    hydrated: true,
    initial,
    afterDark,
    afterSystem,
    afterLight,
    consoleErrors,
  };
  const evidenceDir = resolve(process.cwd(), '../../.omo/evidence');
  mkdirSync(evidenceDir, {recursive: true});
  writeFileSync(
    resolve(evidenceDir, 'task-5-theme-root-sync-e2e-state.json'),
    `${JSON.stringify(evidence, null, 2)}\n`,
  );
});
