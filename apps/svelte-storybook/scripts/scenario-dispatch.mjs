// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file scenario-dispatch.mjs
 * @input Raw Storybook e2e CLI arguments and repository root
 * @output Parsed scenario, dispatch target, and evidence destination
 * @position Shared scenario dispatch parser for Svelte Storybook e2e tests
 */

import fs from 'node:fs';
import path from 'node:path';

const scenarioDispatch = Object.freeze({
  'full-port': 'full-port',
  forms: 'full-port',
  'selection-date-time': 'full-port',
  'overlays-keyboard': 'full-port',
  'navigation-data-layout': 'full-port',
  'navigation-shells': 'full-port',
  'table-tree': 'full-port',
  'observer-rich-foundation': 'full-port',
  'rich-media-chat-command-palette': 'full-port',
  'lab-vega': 'full-port',
  'lab-experimental': 'full-port',
  'lab-charts': 'full-port',
  vega: 'full-port',
});

const acceptedScenarios = new Set(Object.keys(scenarioDispatch));

function formatAcceptedScenarios() {
  return [...acceptedScenarios].sort().join(', ');
}

function failArgumentParse(message) {
  console.error(`${message}\nAccepted scenarios: ${formatAcceptedScenarios()}`);
  process.exit(1);
}

function isWithinPath(childPath, parentPath) {
  const relative = path.relative(parentPath, childPath);
  return (
    relative === '' ||
    (relative.length > 0 &&
      !relative.startsWith('..') &&
      !path.isAbsolute(relative))
  );
}

function pathExists(pathToCheck) {
  try {
    fs.lstatSync(pathToCheck);
    return true;
  } catch (error) {
    if (error && error.code === 'ENOENT') return false;
    throw error;
  }
}

function canonicalizeThroughExistingAncestors(absPath) {
  const missingSegments = [];
  let cursor = path.resolve(absPath);

  while (!pathExists(cursor)) {
    const parent = path.dirname(cursor);
    if (parent === cursor) break;
    missingSegments.unshift(path.basename(cursor));
    cursor = parent;
  }

  return path.join(fs.realpathSync(cursor), ...missingSegments);
}

function resolveEvidenceTarget(root, evidence) {
  const repoRoot = path.resolve(root);
  const evidenceRoot = path.join(repoRoot, '.omo', 'evidence');
  const evidenceTarget = evidence == null
    ? path.join(evidenceRoot, 'task-24-full-port-e2e.md')
    : path.resolve(repoRoot, evidence);

  const realRepoRoot = canonicalizeThroughExistingAncestors(repoRoot);
  const realEvidenceRoot = canonicalizeThroughExistingAncestors(evidenceRoot);
  const realEvidenceTarget = canonicalizeThroughExistingAncestors(evidenceTarget);
  if (
    !isWithinPath(realEvidenceTarget, realRepoRoot) ||
    !isWithinPath(realEvidenceTarget, realEvidenceRoot)
  ) {
    failArgumentParse(
      `Invalid --update-evidence path: ${evidenceTarget}. Evidence paths must stay under .omo/evidence.`,
    );
  }

  return evidenceTarget;
}

export function parseScenarioArgs(rawArgs, root) {
  const args = rawArgs.filter((arg) => arg !== '--');
  const scenarioArgs = [];
  let evidence = null;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--update-evidence') {
      const value = args[index + 1];
      if (value == null || value.startsWith('--')) {
        failArgumentParse('Missing value for --update-evidence.');
      }
      evidence = value;
      index += 1;
      continue;
    }
    if (arg.startsWith('--')) {
      failArgumentParse(`Unsupported flag: ${arg}.`);
    }
    scenarioArgs.push(arg);
  }

  if (scenarioArgs.length > 1) {
    failArgumentParse(`Unknown or extra scenario argument(s): ${scenarioArgs.slice(1).join(', ')}.`);
  }

  const scenario = scenarioArgs[0] ?? 'full-port';
  if (!acceptedScenarios.has(scenario)) {
    failArgumentParse(`Unknown scenario: ${scenario}.`);
  }

  return {
    scenario,
    dispatchScenario: scenarioDispatch[scenario],
    evidenceTarget: resolveEvidenceTarget(root, evidence),
  };
}
