// Copyright (c) Meta Platforms, Inc. and affiliates.
const schemaPattern = /schema\/([\w-]+)\/([\w.-]+)\.json$/;
export function parseSchema(schema) {
    if (schema == null) {
        return {
            ok: false,
            error: 'Spec is missing a $schema field. Add "$schema": "https://vega.github.io/schema/vega/v5.json" or the vega-lite equivalent.',
        };
    }
    if (typeof schema !== 'string') {
        return { ok: false, error: `$schema must be a string, got ${typeof schema}.` };
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
    return { ok: true, library, version };
}
