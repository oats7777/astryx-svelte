// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as fs from 'node:fs';
import * as path from 'node:path';
import {findSvelteDir} from '../utils/paths.mjs';
import {jsonOut, humanLog} from '../lib/json.mjs';
import {installAgentDocs, discoverAgentDocs} from './agent-docs.mjs';

function readVersion(packageDir) {
  if (!packageDir) return null;
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(packageDir, 'package.json'), 'utf-8'),
    );
    return typeof pkg.version === 'string' ? pkg.version : null;
  } catch {
    return null;
  }
}

export function registerUpgrade(program) {
  program
    .command('upgrade')
    .description('Refresh Astryx Svelte agent docs after a package upgrade')
    .option('--from <version>', 'Previous version before the dependency upgrade')
    .option('--apply', 'Write agent doc refreshes to disk')
    .option('--path <dir>', 'Source directory', './src')
    .option('--force', 'Accepted for compatibility')
    .option('--codemod <name>', 'Accepted for compatibility')
    .option('--skip-codemod <name...>', 'Accepted for compatibility')
    .option('--integration <spec>', 'Accepted for compatibility')
    .option('--install-deps', 'Accepted for compatibility')
    .action(async (options) => {
      const json = program.opts().json || false;
      const svelteDir = findSvelteDir(process.cwd());
      const toVersion = readVersion(svelteDir);
      const refreshedAgentDocs =
        options.apply && discoverAgentDocs(process.cwd()).length > 0
          ? installAgentDocs(process.cwd(), {onlyReplace: true})
          : [];

      const result = {
        from: options.from ?? null,
        to: toVersion,
        package: '@astryxdesign/svelte',
        apply: Boolean(options.apply),
        codemods: [],
        changedFiles: refreshedAgentDocs,
        message:
          'No Svelte codemods are bundled for this release. Agent docs were refreshed when --apply was used.',
      };

      if (json) {
        return jsonOut('upgrade.run', result);
      }

      humanLog('\nAstryx Svelte upgrade\n');
      if (toVersion) humanLog(`  Target: @astryxdesign/svelte v${toVersion}`);
      if (options.from) humanLog(`  From: ${options.from}`);
      humanLog('  Codemods: none bundled for this release');
      if (refreshedAgentDocs.length > 0) {
        humanLog(`  Refreshed agent docs: ${refreshedAgentDocs.join(', ')}`);
      }
      humanLog('');
    });
}
