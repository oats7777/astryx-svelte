// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file range.ts
 * @input Streaming chart points and range options
 * @output Mutable private range tracker for chart windows
 * @position Svelte-friendly equivalent of React lab useChartRange math
 */

export interface ChartRangeOptions {
  readonly xWindow: number;
  readonly yDomain?: readonly [number, number];
  readonly yPadding?: number;
  readonly yCenter?: boolean;
}

export interface ChartRange {
  readonly xDomain: readonly [number, number];
  readonly yDomain: readonly [number, number];
  push(x: number, y: number, stream?: {push(x: number, y: number): void}): void;
  reset(): void;
}

export function createChartRange({
  xWindow,
  yDomain: fixedYDomain,
  yPadding = 0.1,
  yCenter = false,
}: ChartRangeOptions): ChartRange {
  let xDomain: [number, number] = [0, 0];
  let yDomain: [number, number] = fixedYDomain ? [...fixedYDomain] : [0, 1];
  let yMin = fixedYDomain?.[0] ?? Infinity;
  let yMax = fixedYDomain?.[1] ?? -Infinity;

  return {
    get xDomain() {
      return xDomain;
    },
    get yDomain() {
      return fixedYDomain ?? yDomain;
    },
    push(x: number, y: number, stream?: {push(x: number, y: number): void}) {
      stream?.push(x, y);
      xDomain = x >= xWindow ? [x - xWindow, x] : [0, Math.max(x, 1)];

      if (fixedYDomain) {
        return;
      }
      yMin = Math.min(yMin, y);
      yMax = Math.max(yMax, y);
      const range = yMax - yMin || 1;
      const pad = range * yPadding;
      let min = yMin - pad;
      let max = yMax + pad;
      if (yCenter) {
        const abs = Math.max(Math.abs(min), Math.abs(max));
        min = -abs;
        max = abs;
      }
      yDomain = [min, max];
    },
    reset() {
      xDomain = [0, 0];
      yDomain = fixedYDomain ? [...fixedYDomain] : [0, 1];
      yMin = fixedYDomain?.[0] ?? Infinity;
      yMax = fixedYDomain?.[1] ?? -Infinity;
    },
  };
}
