// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file styles-css.test.ts
 * @input Svelte package CSS entrypoint
 * @output Token-contract assertions for Astryx Svelte styles
 * @position Regression tests for Svelte CSS token usage
 */

import {readdir, readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {describe, expect, it} from 'vitest';

const stylesPath = resolve(process.cwd(), 'src/lib/styles.css');
const workspaceRoot = resolve(process.cwd(), '../..');
const tokenDefinitionSources = [
  resolve(workspaceRoot, 'packages/tokens/src/groups.ts'),
  stylesPath,
] as const;
const productionStyleRoots = [
  resolve(workspaceRoot, 'packages/svelte/src/lib'),
  resolve(workspaceRoot, 'packages/svelte-lab/src/lib'),
  resolve(workspaceRoot, 'packages/svelte-vega/src/lib'),
] as const;
const designTokenPrefixes = [
  '--border-',
  '--color-',
  '--duration-',
  '--ease-',
  '--font-',
  '--radius-',
  '--shadow-',
  '--size-',
  '--spacing-',
  '--text-',
  '--transition-',
] as const;

interface CustomPropertyReference {
  readonly filePath: string;
  readonly line: number;
  readonly name: string;
}

async function listStyleSurfaceFiles(directoryPath: string): Promise<string[]> {
  const entries = await readdir(directoryPath, {withFileTypes: true});
  const nestedFiles = await Promise.all(
    entries.map(async entry => {
      const entryPath = resolve(directoryPath, entry.name);

      if (entry.isDirectory()) {
        if (entry.name === 'e2e' || entry.name === 'test-fixtures') {
          return [];
        }

        return listStyleSurfaceFiles(entryPath);
      }

      if (entry.isFile() && /\.(?:css|svelte)$/u.test(entry.name)) {
        return [entryPath];
      }

      return [];
    }),
  );

  return nestedFiles.flat();
}

function collectCustomPropertyDefinitions(source: string): Set<string> {
  const definitions = new Set<string>();
  const definitionPattern = /['"]?(--[a-z0-9_-]+)['"]?\s*:/giu;
  let match: RegExpExecArray | null;

  while ((match = definitionPattern.exec(source)) !== null) {
    const [, name] = match;

    if (name !== undefined) {
      definitions.add(name);
    }
  }

  return definitions;
}

function hasCustomPropertyFallback(callBody: string): boolean {
  return /^\s*--[a-z0-9_-]+\s*,/iu.test(callBody);
}

function isDesignTokenReference(name: string): boolean {
  return designTokenPrefixes.some(prefix => name.startsWith(prefix));
}

function lineForOffset(source: string, offset: number): number {
  return source.slice(0, offset).split('\n').length;
}

function collectNoFallbackReferences(
  filePath: string,
  source: string,
): CustomPropertyReference[] {
  const references: CustomPropertyReference[] = [];
  let searchOffset = 0;

  while (searchOffset < source.length) {
    const callStart = source.indexOf('var(', searchOffset);

    if (callStart === -1) {
      break;
    }

    let depth = 1;
    let callEnd = callStart + 'var('.length;

    while (callEnd < source.length && depth > 0) {
      const character = source[callEnd];

      if (character === '(') {
        depth += 1;
      } else if (character === ')') {
        depth -= 1;
      }

      callEnd += 1;
    }

    if (depth === 0) {
      const callBody = source.slice(callStart + 'var('.length, callEnd - 1);
      const referenceMatch = /^\s*(--[a-z0-9_-]+)/iu.exec(callBody);
      const [, name] = referenceMatch ?? [];

      if (
        name !== undefined &&
        isDesignTokenReference(name) &&
        !callBody.includes('${') &&
        !hasCustomPropertyFallback(callBody)
      ) {
        references.push({
          filePath,
          line: lineForOffset(source, callStart),
          name,
        });
      }
    }

    searchOffset = callEnd;
  }

  return references;
}

function formatUnresolvedReferences(
  references: readonly CustomPropertyReference[],
): string {
  return references
    .map(reference => `${reference.filePath}:${reference.line} ${reference.name}`)
    .join('\n');
}

describe('styles.css token contract', () => {
  it('Given Svelte component CSS When borders are declared Then border width uses the Astryx token', async () => {
    const css = await readFile(stylesPath, 'utf8');

    expect(css).toContain('border: var(--border-width) solid var(--color-border);');
    expect(css).not.toMatch(/\bborder(?:-width)?:\s*1px\b/u);
  });

  it('Given Svelte CSS and markup When custom properties are referenced without fallbacks Then each reference resolves to an emitted token or central alias', async () => {
    const definitionSources = await Promise.all(
      tokenDefinitionSources.map(sourcePath => readFile(sourcePath, 'utf8')),
    );
    const definitions = definitionSources.reduce<Set<string>>(
      (knownDefinitions, source) => {
        for (const definition of collectCustomPropertyDefinitions(source)) {
          knownDefinitions.add(definition);
        }

        return knownDefinitions;
      },
      new Set<string>(),
    );
    const surfaceFiles = (
      await Promise.all(productionStyleRoots.map(root => listStyleSurfaceFiles(root)))
    ).flat();
    const unresolvedReferences = (
      await Promise.all(
        surfaceFiles.map(async filePath => {
          const source = await readFile(filePath, 'utf8');

          return collectNoFallbackReferences(filePath, source);
        }),
      )
    )
      .flat()
      .filter(reference => !definitions.has(reference.name));

    expect(
      unresolvedReferences.length,
      formatUnresolvedReferences(unresolvedReferences),
    ).toBe(0);
  });
});
