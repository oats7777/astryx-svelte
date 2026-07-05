/**
 * @file index.ts
 * @input Package metadata for @astryxdesign/svelte-vega
 * @output Public Svelte Vega package marker value and type
 * @position Entry point for @astryxdesign/svelte-vega
 */
export declare const astryxSvelteVegaPackage: {
    readonly name: "@astryxdesign/svelte-vega";
    readonly surface: "svelte-vega";
};
export type AstryxSvelteVegaPackage = typeof astryxSvelteVegaPackage;
export { default as VegaChart } from './VegaChart.svelte';
export { parseSchema } from './schema.js';
export { buildVegaLiteConfig, DEFAULT_LEGEND_ORIENT, DEFAULT_POINT_SIZE, DEFAULT_STROKE_WIDTH, LEGEND_OFFSET, TITLE_OFFSET, } from './vegaLiteConfig.js';
export type { AnySpec, CompileOptions, Config, LoggerInterface, ParseOptions, VegaChartErrorHandler, VegaChartProps, VegaChartReadyHandler, VegaLiteConfig, VegaLiteSpec, VegaSpec, View, ViewData, ViewOptions, } from './types.js';
export type { SchemaLibrary, SchemaResult } from './schema.js';
//# sourceMappingURL=index.d.ts.map