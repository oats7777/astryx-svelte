// Copyright (c) Meta Platforms, Inc. and affiliates.
/**
 * @file index.ts
 * @input Package metadata for @astryxdesign/svelte-vega
 * @output Public Svelte Vega package marker value and type
 * @position Entry point for @astryxdesign/svelte-vega
 */
export const astryxSvelteVegaPackage = {
    name: "@astryxdesign/svelte-vega",
    surface: "svelte-vega",
};
export { default as VegaChart } from './VegaChart.svelte';
export { parseSchema } from './schema.js';
export { buildVegaLiteConfig, DEFAULT_LEGEND_ORIENT, DEFAULT_POINT_SIZE, DEFAULT_STROKE_WIDTH, LEGEND_OFFSET, TITLE_OFFSET, } from './vegaLiteConfig.js';
