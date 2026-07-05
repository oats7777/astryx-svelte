// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as fs from 'node:fs';
import * as path from 'node:path';
import {MIN_NODE_VERSION, isNodeVersionSupported} from '../lib/node-version.mjs';
import {CLI_ROOT, findSvelteDir} from '../utils/paths.mjs';
import {detectPackageManager} from '../utils/package-manager.mjs';
import {semverCompare} from '../utils/semver.mjs';

function readPkg(pkgPath) {
  try {
    return JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  } catch {
    return null;
  }
}

function pkgVersion(dir) {
  if (!dir) return null;
  const pkg = readPkg(path.join(dir, 'package.json'));
  return pkg?.version ?? null;
}

function nearestPackageJson(cwd) {
  let dir = cwd;
  for (let index = 0; index < 6; index += 1) {
    const candidate = path.join(dir, 'package.json');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function mergedDeps(cwd) {
  const pkgPath = nearestPackageJson(cwd);
  const pkg = pkgPath ? readPkg(pkgPath) : null;
  return {...pkg?.dependencies, ...pkg?.devDependencies};
}

function hasStylesImport(cwd) {
  const candidates = [
    'src/main.ts',
    'src/main.js',
    'src/App.svelte',
    'src/routes/+layout.svelte',
    'src/routes/+layout.ts',
    'src/app.css',
    'src/styles.css',
  ];
  return candidates.some(file => {
    const full = path.join(cwd, file);
    return (
      fs.existsSync(full) &&
      fs.readFileSync(full, 'utf-8').includes('@astryxdesign/svelte/styles.css')
    );
  });
}

function checkNodeVersion(ctx) {
  const ok = isNodeVersionSupported(ctx.nodeVersion);
  return {
    id: 'node-version',
    label: 'Node.js version',
    status: ok ? 'pass' : 'fail',
    message: ok
      ? `Node ${ctx.nodeVersion} satisfies >=${MIN_NODE_VERSION}.`
      : `Node ${ctx.nodeVersion} is below the required >=${MIN_NODE_VERSION}.`,
    fix: ok ? undefined : `Install Node ${MIN_NODE_VERSION} or newer.`,
  };
}

function checkSvelteInstalled(ctx) {
  const version = pkgVersion(ctx.svelteDir);
  return {
    id: 'svelte-package',
    label: '@astryxdesign/svelte installed',
    status: ctx.svelteDir ? 'pass' : 'fail',
    message: ctx.svelteDir
      ? `@astryxdesign/svelte resolved${version ? ` (v${version})` : ''}.`
      : '@astryxdesign/svelte could not be resolved from this project.',
    fix: ctx.svelteDir
      ? undefined
      : 'Install the design system: `pnpm add @astryxdesign/svelte @astryxdesign/tokens`.',
  };
}

function checkVersionAlignment(ctx) {
  const svelteVersion = pkgVersion(ctx.svelteDir);
  const cliVersion = pkgVersion(path.resolve(CLI_ROOT));
  if (!svelteVersion || !cliVersion) {
    return {
      id: 'version-alignment',
      label: '@astryxdesign/svelte <-> @astryxdesign/cli alignment',
      status: 'warn',
      message: 'Skipped — could not read both package versions.',
    };
  }

  const [sMajor, sMinor] = svelteVersion.split('.');
  const [cliMajor, cliMinor] = cliVersion.split('.');
  const aligned = sMajor === cliMajor && sMinor === cliMinor;
  return {
    id: 'version-alignment',
    label: '@astryxdesign/svelte <-> @astryxdesign/cli alignment',
    status: aligned ? 'pass' : 'warn',
    message: aligned
      ? `@astryxdesign/svelte v${svelteVersion} is in step with @astryxdesign/cli v${cliVersion}.`
      : `@astryxdesign/svelte v${svelteVersion} drifts from @astryxdesign/cli v${cliVersion}.`,
    fix: aligned
      ? undefined
      : semverCompare(svelteVersion, cliVersion) < 0
        ? `Update @astryxdesign/svelte to ${cliMajor}.${cliMinor}.x to match the CLI.`
        : `Update @astryxdesign/cli to ${sMajor}.${sMinor}.x to match @astryxdesign/svelte.`,
  };
}

function checkPeerDeps(ctx) {
  const deps = mergedDeps(ctx.cwd);
  const missing = [];
  if (!('svelte' in deps)) missing.push('svelte');
  if (!('@astryxdesign/tokens' in deps)) missing.push('@astryxdesign/tokens');

  return {
    id: 'peer-dependencies',
    label: '@astryxdesign/svelte peer dependencies',
    status: missing.length === 0 ? 'pass' : 'fail',
    message:
      missing.length === 0
        ? 'Svelte runtime and token package are declared.'
        : `Missing dependency declarations: ${missing.join(', ')}.`,
    fix:
      missing.length === 0
        ? undefined
        : `Install missing dependencies: pnpm add ${missing.join(' ')}.`,
  };
}

function checkStylesImport(ctx) {
  const ok = hasStylesImport(ctx.cwd);
  return {
    id: 'styles-import',
    label: 'Astryx Svelte styles imported',
    status: ok ? 'pass' : 'warn',
    message: ok
      ? '@astryxdesign/svelte/styles.css is imported by the app.'
      : 'Could not find an @astryxdesign/svelte/styles.css import in common app entry files.',
    fix: ok
      ? undefined
      : 'Import `@astryxdesign/svelte/styles.css` once in your Svelte app entry.',
  };
}

function checkTailwind(ctx) {
  const deps = mergedDeps(ctx.cwd);
  const hasTailwind =
    'tailwindcss' in deps ||
    '@tailwindcss/vite' in deps ||
    '@tailwindcss/postcss' in deps;
  return {
    id: 'tailwind',
    label: 'Tailwind availability',
    status: hasTailwind ? 'pass' : 'warn',
    message: hasTailwind
      ? 'Tailwind is declared for token-backed utilities.'
      : 'Tailwind is not declared. Components still work, but token utility examples require Tailwind.',
    fix: hasTailwind ? undefined : 'Install Tailwind when using Astryx utility recipes.',
  };
}

function checkPackageManager(ctx) {
  const detected = detectPackageManager(ctx.cwd);
  return {
    id: 'package-manager',
    label: 'Package manager',
    status: 'info',
    message: detected !== 'npx'
      ? `Detected package manager: ${detected}.`
      : 'No lockfile detected — defaulting to npm/npx.',
  };
}

export const SYNC_CHECKS = [
  checkNodeVersion,
  checkSvelteInstalled,
  checkVersionAlignment,
  checkPeerDeps,
  checkStylesImport,
  checkTailwind,
  checkPackageManager,
];

export async function runChecks(options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const ctx = {
    cwd,
    nodeVersion: process.versions.node,
    svelteDir: findSvelteDir(cwd),
  };

  const checks = SYNC_CHECKS.map(fn => fn(ctx));
  const summary = {pass: 0, warn: 0, fail: 0, info: 0};
  for (const check of checks) summary[check.status] += 1;

  return {checks, summary};
}

export async function doctor(options = {}) {
  const report = await runChecks(options);
  return {type: 'doctor', data: report};
}
