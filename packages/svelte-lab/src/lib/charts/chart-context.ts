// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file chart-context.ts
 * @input Svelte context API and computed chart layouts
 * @output Context setters/getters for chart descendants
 * @position Shared state channel for private Svelte chart primitives
 */

import {getContext, setContext} from 'svelte';
import type {ChartContextValue, RadialLayout, SankeyLayout} from './types.js';

const chartKey = Symbol('astryx-svelte-lab-chart');
const radialKey = Symbol('astryx-svelte-lab-radial');
const sankeyKey = Symbol('astryx-svelte-lab-sankey');

interface ContextSource<T> {
  read(): T;
}

export function setChartContext(read: () => ChartContextValue): void {
  setContext(chartKey, {read});
}

export function useChartContext(): ChartContextValue {
  return getContext<ContextSource<ChartContextValue>>(chartKey).read();
}

export function setRadialContext(read: () => RadialLayout): void {
  setContext(radialKey, {read});
}

export function useRadialContext(): RadialLayout {
  return getContext<ContextSource<RadialLayout>>(radialKey).read();
}

export function setSankeyContext(read: () => SankeyLayout): void {
  setContext(sankeyKey, {read});
}

export function useSankeyContext(): SankeyLayout {
  return getContext<ContextSource<SankeyLayout>>(sankeyKey).read();
}
