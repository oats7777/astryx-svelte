// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as fs from 'node:fs';
import * as path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createJiti} from 'jiti';
import {themeAdd} from '../api/theme-add.mjs';
import {cliError} from '../lib/cli-error.mjs';
import {humanLog, jsonOut} from '../lib/json.mjs';
import {ERROR_CODES} from '../lib/error-codes.mjs';
import {PathSafetyError, assertWithin} from '../utils/path-safety.mjs';

function importSpecifier(relDir, base) {
  const normalized = relDir === '.' ? '' : relDir;
  const withinSrc = normalized.replace(/^src\/?/, '').replace(/\/+$/, '');
  return withinSrc ? `./${withinSrc}/${base}` : `./${base}`;
}

function toIdentifier(name) {
  return name.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function isDefinedTheme(value) {
  return (
    value != null &&
    typeof value === 'object' &&
    typeof value.name === 'string' &&
    value.tokens != null &&
    typeof value.tokens === 'object'
  );
}

async function loadThemeModule(themeFile) {
  const jiti = createJiti(import.meta.url, {interopDefault: true});
  const loaded = await jiti.import(pathToFileURL(themeFile).href, {
    default: true,
  });
  return loaded && typeof loaded === 'object' ? loaded : {default: loaded};
}

function findThemeExport(moduleValue) {
  for (const [exportName, value] of Object.entries(moduleValue)) {
    if (isDefinedTheme(value)) {
      return {exportName, theme: value};
    }
  }
  return null;
}

function resolveOutPath(themeFile, outOption) {
  if (outOption != null) {
    return path.resolve(process.cwd(), outOption);
  }
  const parsed = path.parse(themeFile);
  return path.join(parsed.dir, `${parsed.name}.css`);
}

async function buildTheme(themeFile, options) {
  let resolvedThemeFile;
  try {
    resolvedThemeFile = assertWithin(themeFile, process.cwd(), {
      label: 'theme file',
    });
  } catch (err) {
    if (err instanceof PathSafetyError) {
      throw Object.assign(new Error(err.message), {
        code: ERROR_CODES.ERR_PATH_TRAVERSAL,
      });
    }
    throw err;
  }

  if (!fs.existsSync(resolvedThemeFile)) {
    throw Object.assign(new Error(`Theme file not found: ${themeFile}`), {
      code: ERROR_CODES.ERR_NO_SOURCE,
    });
  }

  const moduleValue = await loadThemeModule(resolvedThemeFile);
  const match = findThemeExport(moduleValue);
  if (match == null) {
    throw Object.assign(
      new Error(
        `Theme file "${themeFile}" must export a value created by defineTheme().`,
      ),
      {code: ERROR_CODES.ERR_INVALID_ARGUMENT},
    );
  }

  const {generateThemeCSS} = await import('@astryxdesign/svelte/theme');
  const generated = generateThemeCSS(match.theme);
  const css = [generated.prose, generated.component].filter(Boolean).join('\n\n');
  const outPath = resolveOutPath(resolvedThemeFile, options.out);

  fs.mkdirSync(path.dirname(outPath), {recursive: true});
  fs.writeFileSync(outPath, `${css}\n`);

  return {
    css,
    exportName: match.exportName === 'default'
      ? `${toIdentifier(match.theme.name)}Theme`
      : match.exportName,
    outPath,
    theme: match.theme,
  };
}

export function registerTheme(program) {
  const theme = program
    .command('theme')
    .description('Build or scaffold Astryx Svelte themes');

  theme
    .command('build <theme-file>')
    .description('Compile a Svelte defineTheme file to CSS')
    .option('-o, --out <file>', 'Output CSS file')
    .action(async (themeFile, options) => {
      const json = program.opts().json || false;
      let result;
      try {
        result = await buildTheme(themeFile, options);
      } catch (err) {
        cliError(err.message, {code: err.code});
        return;
      }

      const output = {
        name: result.theme.name,
        tokenCount: Object.keys(result.theme.tokens).length,
        componentCount: Object.keys(result.theme.components ?? {}).length,
        sizeKB: Number((Buffer.byteLength(result.css, 'utf-8') / 1024).toFixed(2)),
        outputs: {
          css: path.relative(process.cwd(), result.outPath),
        },
      };

      if (json) {
        return jsonOut('theme.build', output);
      }

      humanLog(`\n✓ ${output.outputs.css}`);
      humanLog(`  ${output.tokenCount} token overrides, ${output.componentCount} component overrides`);
      humanLog(`  ${output.sizeKB} KB`);
      humanLog(`
Use it in your app:

  import { ${result.exportName} } from '${importSpecifier(
    path.relative(process.cwd(), path.dirname(result.outPath)) || '.',
    path.basename(themeFile, path.extname(themeFile)),
  )}';
  import './${path.basename(result.outPath)}';

  <Theme theme={${result.exportName}}>
    <App />
  </Theme>
`);
    });

  theme
    .command('list')
    .description('List themes available to add')
    .action(async () => {
      const json = program.opts().json || false;
      let result;
      try {
        result = await themeAdd(undefined, {list: true, cwd: process.cwd()});
      } catch (err) {
        cliError(err.message, {suggestions: err.suggestions || [], code: err.code});
        return;
      }
      if (json) return jsonOut(result.type, result.data);

      const themes = result.data;
      if (themes.length === 0) {
        humanLog('\nNo Svelte themes are bundled with this CLI build.\n');
        return;
      }
      humanLog('\nThemes:\n');
      for (const item of themes) {
        const tag = item.maintained ? ' (maintained)' : '';
        humanLog(`  ${item.slug}${tag}`);
        if (item.description) humanLog(`    ${item.description}`);
      }
      humanLog('\nUsage:');
      humanLog('  astryx theme add <slug> [target-path]   Scaffold a theme file you own\n');
    });

  theme
    .command('add [slug] [path]')
    .description('Scaffold a theme into your project as editable source')
    .option('-f, --overwrite', 'Overwrite existing files without prompting')
    .option('--list', 'List available themes')
    .action(async (slug, targetPath, options) => {
      const json = program.opts().json || false;
      let result;
      try {
        result = await themeAdd(slug, {
          list: options.list,
          targetPath,
          overwrite: options.overwrite,
          cwd: process.cwd(),
        });
      } catch (err) {
        cliError(err.message, {suggestions: err.suggestions || [], code: err.code});
        return;
      }

      if (json) return jsonOut(result.type, result.data);
      if (result.type === 'theme.list') {
        const themes = result.data;
        if (themes.length === 0) {
          humanLog('\nNo Svelte themes are bundled with this CLI build.\n');
          return;
        }
        for (const item of themes) {
          humanLog(`  ${item.slug}`);
        }
        return;
      }

      const {displayName, outputDir, files} = result.data;
      humanLog(`\n✓ Added ${displayName} theme to ${outputDir}/`);
      for (const file of files) {
        humanLog(`  ${outputDir}/${file}`);
      }
    });
}
