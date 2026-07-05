// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Private Svelte lab 3D chart modules and utilities
 * @output Local 3D chart exports without root package integration
 * @position Package-local barrel for the experimental Svelte 3D slice
 */

export {default as ThreeDAxis} from './ThreeDAxis.svelte';
export {default as ThreeDBar} from './ThreeDBar.svelte';
export {default as ThreeDChart} from './ThreeDChart.svelte';
export {default as ThreeDGrid} from './ThreeDGrid.svelte';
export {default as ThreeDScatter} from './ThreeDScatter.svelte';
export {default as ThreeDSurface} from './ThreeDSurface.svelte';
export {computeDomain, normalizeValue, numericDatumValue, projectPoint} from './projection.js';
export type {
  Domain3D,
  NormalizedPoint,
  ProjectedPoint,
  ProjectionOptions,
  ThreeDChartProps,
  ThreeDContextValue,
  ThreeDDatum,
} from './types.js';
