// Copyright (c) Meta Platforms, Inc. and affiliates.

import {findSvelteDir} from '../utils/paths.mjs';
import {discoverSvelteComponents} from '../lib/component-discovery.mjs';
import {jsonOut, humanLog} from '../lib/json.mjs';
import {cliError} from '../lib/cli-error.mjs';
import {ERROR_CODES} from '../lib/error-codes.mjs';
import {
  resolveFramework as resolveFrameworkOption,
  supportedFrameworksLabel,
} from '../lib/frameworks.mjs';
import {swizzleSvelteComponent} from './swizzle-svelte.mjs';

function resolveFramework(framework) {
  return resolveFrameworkOption(framework);
}

export function rewriteImports(content) {
  return content;
}

export function registerSwizzle(program) {
  program
    .command('swizzle [component]')
    .description('Copy Svelte component source for customization')
    .option('--output <dir>', 'Output directory', './components/astryx')
    .option('--framework <framework>', 'Component framework: svelte', 'svelte')
    .option('--package <pkg>', 'Reserved for integration-owned components')
    .option('--no-report', 'Deprecated no-op; swizzle no longer files reports')
    .option('--list', 'List available components')
    .option('-f, --overwrite', 'Overwrite existing files without prompting')
    .action(async (component, options) => {
      const json = program.opts().json || false;
      const framework = resolveFramework(options.framework);

      if (!framework) {
        cliError(
          `Invalid --framework value "${options.framework}". Valid frameworks: ${supportedFrameworksLabel()}`,
          {code: ERROR_CODES.ERR_INVALID_ARGUMENT},
        );
        return;
      }

      const svelteDir = findSvelteDir(process.cwd());
      if (!svelteDir) {
        cliError(
          'Could not find @astryxdesign/svelte package. Make sure you are inside the monorepo or have @astryxdesign/svelte installed.',
          {code: ERROR_CODES.ERR_UNKNOWN_PACKAGE},
        );
        return;
      }

      const components = Object.values(discoverSvelteComponents(svelteDir))
        .flat()
        .sort();

      if (options.list || !component) {
        if (json) return jsonOut('swizzle.list', components);
        humanLog('\nAvailable components:\n');
        for (const name of components) {
          humanLog(`  ${name}`);
        }
        humanLog('\nUsage: astryx swizzle <component> --framework svelte\n');
        humanLog('Example: astryx swizzle Button --framework svelte');
        humanLog('         astryx swizzle AppShell --framework svelte\n');
        return;
      }

      return swizzleSvelteComponent({
        component,
        components,
        svelteDir,
        output: options.output,
        overwrite: options.overwrite,
        json,
      });
    });
}
