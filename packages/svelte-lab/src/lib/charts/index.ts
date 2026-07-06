// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Private Svelte lab chart component modules and utilities
 * @output Local chart/data-viz exports for @astryxdesign/svelte-lab
 * @position Package-local chart barrel; not wired to shared parity exports
 */

export {default as Chart} from './Chart.svelte';
export {default as ChartArea} from './ChartArea.svelte';
export {default as ChartAxis} from './ChartAxis.svelte';
export {default as ChartBar} from './ChartBar.svelte';
export {default as ChartDotGL} from './ChartGL.svelte';
export {default as ChartDotGLInteractive} from './ChartGL.svelte';
export {default as ChartGrid} from './ChartGrid.svelte';
export {default as ChartHeatmapGL} from './ChartGL.svelte';
export {default as ChartLegend} from './ChartLegend.svelte';
export {default as ChartLine} from './ChartLine.svelte';
export {default as ChartStreamGL} from './ChartGL.svelte';
export {default as ChartTooltip} from './ChartTooltip.svelte';
export {default as ChartV2} from './ChartV2.svelte';
export {default as Radial} from './Radial.svelte';
export {default as RadialArea} from './RadialArea.svelte';
export {default as RadialGrid} from './RadialGrid.svelte';
export {default as RadialSlice} from './RadialSlice.svelte';
export {default as Sankey} from './Sankey.svelte';
export {getChartColors, type ChartColors, type SequentialHue} from './colors.js';
export {computeChartLayout, computeRadialLayout, computeSankeyLayout, isBandScale, xPixel} from './layout.js';
export {createChartRange, type ChartRange, type ChartRangeOptions} from './range.js';
export {
  area,
  band,
  bar,
  candlestick,
  dot,
  dotGL,
  dotGLInteractive,
  errorBar,
  heatmapGL,
  line,
  referenceLine,
  streamGL,
} from './series.js';
export type {
  ChartContextValue,
  ChartDatum,
  ChartMargin,
  ChartScale,
  LegendItem,
  RadialLayout,
  SankeyColumn,
  SankeyColumnDef,
  SankeyLayout,
  SankeyLinkDatum,
  SankeyNodeDatum,
  SeriesDef,
} from './types.js';
export {getCanvasDPR, getWebGLContext, hexToGL, mountCanvasOverSVG, sizeCanvas} from './webgl.js';
