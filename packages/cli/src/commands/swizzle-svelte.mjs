// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Svelte swizzle copy implementation.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as p from '@clack/prompts';
import {
  findSvelteComponentSource,
  normalizeSvelteComponentName,
} from '../lib/component-discovery.mjs';
import {
  assertWithin,
  PathSafetyError,
  isNonInteractive,
} from '../utils/path-safety.mjs';
import {jsonOut, humanLog} from '../lib/json.mjs';
import {cliError} from '../lib/cli-error.mjs';
import {ERROR_CODES} from '../lib/error-codes.mjs';

function isCancel(value) {
  if (p.isCancel(value)) {
    p.cancel('Cancelled.');
    process.exit(0);
  }
  return value;
}

export async function swizzleSvelteComponent(request) {
  const {component, components, svelteDir, output, overwrite, json} = request;
  const componentName = normalizeSvelteComponentName(component);
  if (!componentName) {
    cliError(`Invalid Svelte component name "${component}".`, {
      code: ERROR_CODES.ERR_INVALID_ARGUMENT,
    });
    return;
  }

  const sourcePath = findSvelteComponentSource(svelteDir, componentName);
  if (!sourcePath) {
    cliError(`Component "${component}" not found.`, {
      suggestions: components.slice(0, 10).map(name => ({name})),
      code: ERROR_CODES.ERR_UNKNOWN_COMPONENT,
    });
    return;
  }

  let outputBase;
  try {
    outputBase = assertWithin(output, process.cwd(), {
      label: 'output directory',
    });
  } catch (err) {
    if (err instanceof PathSafetyError) {
      cliError(err.message, {code: ERROR_CODES.ERR_PATH_TRAVERSAL});
      return;
    }
    throw err;
  }

  let outputDir;
  try {
    outputDir = assertWithin(componentName, outputBase, {
      label: 'component output directory',
    });
  } catch (err) {
    if (err instanceof PathSafetyError) {
      cliError(err.message, {code: ERROR_CODES.ERR_PATH_TRAVERSAL});
      return;
    }
    throw err;
  }

  const outputFile = path.basename(sourcePath);
  let outputFilePath;
  try {
    outputFilePath = assertWithin(outputFile, outputDir, {
      label: 'component output file',
    });
  } catch (err) {
    if (err instanceof PathSafetyError) {
      cliError(err.message, {code: ERROR_CODES.ERR_PATH_TRAVERSAL});
      return;
    }
    throw err;
  }

  if (fs.existsSync(outputFilePath) && !overwrite) {
    const relOutputForMsg = path.relative(process.cwd(), outputDir) || '.';
    if (json || isNonInteractive({json})) {
      const msg =
        `Refusing to overwrite existing file in ${relOutputForMsg}/. ` +
        'Re-run with --overwrite (or -f) to replace it.';
      cliError(msg, {code: ERROR_CODES.ERR_FILE_EXISTS});
      return;
    }
    const confirmed = isCancel(
      await p.confirm({
        message: `Overwrite existing file ${path.join(relOutputForMsg, outputFile)}?`,
        initialValue: false,
      }),
    );
    if (!confirmed) {
      humanLog('Aborted. Re-run with --overwrite to replace files.');
      return;
    }
  }

  fs.mkdirSync(outputDir, {recursive: true});
  fs.writeFileSync(outputFilePath, fs.readFileSync(sourcePath, 'utf-8'));

  const relOutput = path.relative(process.cwd(), outputDir);
  if (json) {
    return jsonOut('swizzle.copy', {
      component: componentName,
      framework: 'svelte',
      outputDir: relOutput,
      filesCopied: 1,
      files: [outputFile],
    });
  }

  humanLog(`\n✓ Copied 1 file to ${relOutput}/\n`);
  humanLog('Svelte source was copied without React import rewrites.\n');
}
