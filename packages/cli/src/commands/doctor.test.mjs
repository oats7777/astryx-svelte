// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {Command} from 'commander';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import {doctor as doctorApi, runChecks} from '../api/doctor.mjs';
import {registerDoctor} from './doctor.mjs';

let tmpDir;
let logCalls;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-doctor-test-'));
  logCalls = [];
  vi.spyOn(console, 'log').mockImplementation((...args) => {
    logCalls.push(args.join(' '));
  });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
  vi.restoreAllMocks();
});

function writePackageJson(data) {
  fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify(data, null, 2));
}

function installPackage(name, version = '0.0.0') {
  const dir = path.join(tmpDir, 'node_modules', ...name.split('/'));
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({name, version}));
  return dir;
}

function find(checks, id) {
  return checks.find(check => check.id === id);
}

function createProgram() {
  const program = new Command();
  program.exitOverride();
  program.option('--json', 'Output as typed JSON');
  registerDoctor(program);
  return program;
}

describe('doctor — Svelte project checks', () => {
  it('reports missing @astryxdesign/svelte in a bare directory', async () => {
    const report = await runChecks({cwd: tmpDir});

    expect(find(report.checks, 'svelte-package')?.status).toBe('fail');
    expect(report.summary.fail).toBeGreaterThan(0);
  });

  it('passes peer dependency checks when Svelte and tokens are declared', async () => {
    writePackageJson({
      dependencies: {
        '@astryxdesign/svelte': '0.0.0',
        '@astryxdesign/tokens': '0.0.0',
        svelte: '5.0.0',
      },
      devDependencies: {
        tailwindcss: '4.0.0',
      },
    });
    installPackage('@astryxdesign/svelte', '0.0.0');
    fs.writeFileSync(path.join(tmpDir, 'pnpm-lock.yaml'), '');

    const report = await runChecks({cwd: tmpDir});

    expect(find(report.checks, 'svelte-package')?.status).toBe('pass');
    expect(find(report.checks, 'peer-dependencies')?.status).toBe('pass');
    expect(find(report.checks, 'tailwind')?.status).toBe('pass');
    expect(find(report.checks, 'package-manager')?.message).toContain('pnpm');
    expect(report.summary.fail).toBe(0);
  });

  it('warns when styles are not imported but keeps doctor non-fatal', async () => {
    writePackageJson({
      dependencies: {
        '@astryxdesign/svelte': '0.0.0',
        '@astryxdesign/tokens': '0.0.0',
        svelte: '5.0.0',
      },
    });
    installPackage('@astryxdesign/svelte', '0.0.0');

    const report = await runChecks({cwd: tmpDir});

    expect(find(report.checks, 'styles-import')?.status).toBe('warn');
    expect(report.summary.fail).toBe(0);
  });

  it('api doctor() returns the typed envelope', async () => {
    const result = await doctorApi({cwd: tmpDir});

    expect(result.type).toBe('doctor');
    expect(Array.isArray(result.data.checks)).toBe(true);
    expect(result.data.summary).toHaveProperty('fail');
  });
});

describe('doctor — command', () => {
  it('--json emits a doctor envelope', async () => {
    const program = createProgram();

    await program.parseAsync(['node', 'astryx', '--json', 'doctor']);

    const parsed = JSON.parse(logCalls.join('\n'));
    expect(parsed.apiVersion).toBe(1);
    expect(parsed.type).toBe('doctor');
    expect(Array.isArray(parsed.data.checks)).toBe(true);
  });

  it('sets exit code 1 when a check fails', async () => {
    const previousCwd = process.cwd();
    const previousExit = process.exitCode;
    process.exitCode = undefined;
    process.chdir(tmpDir);
    try {
      const program = createProgram();
      await program.parseAsync(['node', 'astryx', 'doctor']);
      expect(process.exitCode).toBe(1);
    } finally {
      process.chdir(previousCwd);
      process.exitCode = previousExit;
    }
  });
});
