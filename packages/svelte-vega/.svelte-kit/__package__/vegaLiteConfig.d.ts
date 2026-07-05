/**
 * @file vegaLiteConfig.ts
 * @input Astryx Svelte theme token resolver
 * @output Vega-Lite config object themed with Astryx tokens
 * @position Theme integration utility for VegaChart.svelte
 */
import type { Config as VegaLiteConfig } from 'vega-lite';
export declare const DEFAULT_STROKE_WIDTH = 2;
export declare const DEFAULT_POINT_SIZE = 64;
export declare const DEFAULT_LEGEND_ORIENT: "right";
export declare const LEGEND_OFFSET = 16;
export declare const TITLE_OFFSET = 16;
type TokenResolver = (name: string) => string;
export declare function buildVegaLiteConfig(token: TokenResolver): VegaLiteConfig;
export {};
//# sourceMappingURL=vegaLiteConfig.d.ts.map