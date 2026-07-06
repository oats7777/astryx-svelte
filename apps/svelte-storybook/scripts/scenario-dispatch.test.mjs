// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file scenario-dispatch.test.mjs
 * @input Storybook e2e scenario dispatch arguments
 * @output Regression coverage for evidence path containment
 * @position Focused tests for Svelte Storybook e2e argument parsing
 */

import {describe, it, expect, vi, afterEach} from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {parseScenarioArgs} from './scenario-dispatch.mjs';

afterEach(() => {
  vi.restoreAllMocks();
});

function expectParseExit(action) {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(process, 'exit').mockImplementation((code) => {
    throw new Error(`process.exit:${code}`);
  });

  expect(action).toThrow('process.exit:1');
}

describe('parseScenarioArgs evidence target containment', () => {
  it('accepts default evidence under .omo/evidence', () => {
    const root = path.join('/tmp', 'astryx-storybook');

    const parsed = parseScenarioArgs(['forms'], root);

    expect(parsed.scenario).toBe('forms');
    expect(parsed.dispatchScenario).toBe('full-port');
    expect(parsed.evidenceTarget).toBe(
      path.join(root, '.omo', 'evidence', 'task-24-full-port-e2e.md'),
    );
  });

  it('accepts explicit .omo/evidence paths inside the repo', () => {
    const root = path.join('/tmp', 'astryx-storybook');

    const parsed = parseScenarioArgs([
      'forms',
      '--update-evidence',
      '.omo/evidence/storybook/forms-e2e.md',
    ], root);

    expect(parsed.evidenceTarget).toBe(
      path.join(root, '.omo', 'evidence', 'storybook', 'forms-e2e.md'),
    );
  });

  it('rejects update-evidence paths that escape the evidence root', () => {
    const root = path.join('/tmp', 'astryx-storybook');

    expectParseExit(() =>
      parseScenarioArgs(['forms', '--update-evidence', '../../outside-evidence'], root),
    );
  });

  it('rejects absolute update-evidence paths outside the repo', () => {
    const root = path.join('/tmp', 'astryx-storybook');

    expectParseExit(() =>
      parseScenarioArgs(['forms', '--update-evidence', '/tmp/outside-evidence'], root),
    );
  });

  it('rejects update-evidence paths that escape through a symlinked .omo directory', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-storybook-evidence-'));
    try {
      const root = path.join(tmpDir, 'repo');
      const escaped = path.join(tmpDir, 'escaped-omo');
      fs.mkdirSync(root);
      fs.mkdirSync(path.join(escaped, 'evidence'), {recursive: true});
      fs.symlinkSync('../escaped-omo', path.join(root, '.omo'));

      expectParseExit(() =>
        parseScenarioArgs(['forms', '--update-evidence', '.omo/evidence/out.md'], root),
      );
    } finally {
      fs.rmSync(tmpDir, {recursive: true, force: true});
    }
  });

  it('rejects an invalid scenario before accepting evidence', () => {
    const root = path.join('/tmp', 'astryx-storybook');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit:${code}`);
    });

    expect(() =>
      parseScenarioArgs(['not-a-scenario', '--update-evidence', '.omo/evidence/ok.md'], root),
    ).toThrow('process.exit:1');
    expect(errorSpy.mock.calls[0]?.[0]).toContain('Unknown scenario: not-a-scenario');
  });
});
