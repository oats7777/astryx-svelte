// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file schema.ts
 * @input Vega or Vega-Lite $schema URL
 * @output Parsed schema library/version or a typed parse error
 * @position Utility consumed by the Svelte VegaChart lifecycle
 */

export type SchemaLibrary = 'vega' | 'vega-lite';

export type SchemaResult =
  | {readonly ok: true; readonly library: SchemaLibrary; readonly version: string}
  | {readonly ok: false; readonly error: string};

const schemaPattern = /schema\/([\w-]+)\/([\w.-]+)\.json$/;

export function parseSchema(schema: unknown): SchemaResult {
  if (schema == null) {
    return {
      ok: false,
      error:
        'Spec is missing a $schema field. Add "$schema": "https://vega.github.io/schema/vega/v5.json" or the vega-lite equivalent.',
    };
  }

  if (typeof schema !== 'string') {
    return {ok: false, error: `$schema must be a string, got ${typeof schema}.`};
  }

  const match = schemaPattern.exec(schema);
  if (match == null) {
    return {
      ok: false,
      error: `Unrecognized $schema URL: "${schema}". Expected format: https://vega.github.io/schema/{vega|vega-lite}/{version}.json`,
    };
  }

  const library = match[1];
  const version = match[2];
  if (library !== 'vega' && library !== 'vega-lite') {
    return {
      ok: false,
      error: `Unknown schema library "${library}". Must be "vega" or "vega-lite".`,
    };
  }

  return {ok: true, library, version};
}
