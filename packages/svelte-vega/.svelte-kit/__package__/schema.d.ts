/**
 * @file schema.ts
 * @input Vega or Vega-Lite $schema URL
 * @output Parsed schema library/version or a typed parse error
 * @position Utility consumed by the Svelte VegaChart lifecycle
 */
export type SchemaLibrary = 'vega' | 'vega-lite';
export type SchemaResult = {
    readonly ok: true;
    readonly library: SchemaLibrary;
    readonly version: string;
} | {
    readonly ok: false;
    readonly error: string;
};
export declare function parseSchema(schema: unknown): SchemaResult;
//# sourceMappingURL=schema.d.ts.map