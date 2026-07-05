#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.


/**
 * Package Boundary Check
 *
 * Keeps private Svelte parity packages from becoming publishable by accident.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REQUIRED_PRIVATE_PACKAGES = new Map([
  ['@astryxdesign/svelte-lab', 'packages/svelte-lab/package.json'],
  ['@astryxdesign/svelte-vega', 'packages/svelte-vega/package.json'],
]);

const violations = [];

function resolveFromRoot(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
}

function fixturePackageJsonPaths() {
  const fixturePaths = [];
  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] !== '--fixture') {
      continue;
    }

    const next = process.argv[i + 1];
    if (!next) {
      violations.push({
        file: '--fixture',
        message: 'Expected a package.json fixture path after --fixture.',
      });
      continue;
    }

    fixturePaths.push(resolveFromRoot(next));
    i++;
  }

  return fixturePaths;
}

function checkPrivatePackagePolicy(packageJsonPath) {
  const relPath = path.relative(ROOT, packageJsonPath);

  if (!fs.existsSync(packageJsonPath)) {
    violations.push({
      file: relPath,
      message: 'Expected private Svelte package manifest was not found.',
    });
    return;
  }

  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  if (!REQUIRED_PRIVATE_PACKAGES.has(pkg.name)) {
    return;
  }

  if (pkg.private !== true) {
    violations.push({
      file: relPath,
      message:
        `${pkg.name} must stay private/non-publishable until an explicit release decision changes it.`,
    });
  }
}

for (const packageJsonPath of REQUIRED_PRIVATE_PACKAGES.values()) {
  checkPrivatePackagePolicy(resolveFromRoot(packageJsonPath));
}
for (const packageJsonPath of fixturePackageJsonPaths()) {
  checkPrivatePackagePolicy(packageJsonPath);
}

if (violations.length === 0) {
  console.log('Package boundaries are clean.');
  process.exit(0);
}

console.log(`Found ${violations.length} package boundary violation(s):\n`);
for (const violation of violations) {
  console.log(`  ${violation.file}: ${violation.message}`);
}
console.log(
  '\nMove common shell integrations to their owning package or update the existing wrapper there.',
);
process.exit(1);
