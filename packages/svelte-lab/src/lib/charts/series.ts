// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file series.ts
 * @input Declarative ChartV2 series options
 * @output Series definitions consumed by ChartV2 and utilities
 * @position Private Svelte lab ChartV2 mark factories
 */

import type {ChartSeriesType, SeriesDef} from './types.js';

interface SeriesOptions {
  readonly key: string;
  readonly dataKey: string;
  readonly label?: string;
  readonly color?: string;
}

function series(type: ChartSeriesType, options: SeriesOptions): SeriesDef {
  return {
    key: options.key,
    type,
    dataKeys: [options.dataKey],
    label: options.label,
    color: options.color,
  };
}

export function area(options: SeriesOptions): SeriesDef {
  return series('area', options);
}

export function band(options: SeriesOptions): SeriesDef {
  return series('band', options);
}

export function bar(options: SeriesOptions): SeriesDef {
  return series('bar', options);
}

export function candlestick(options: SeriesOptions): SeriesDef {
  return series('candlestick', options);
}

export function dot(options: SeriesOptions): SeriesDef {
  return series('dot', options);
}

export function dotGL(options: SeriesOptions): SeriesDef {
  return series('dotGL', options);
}

export function dotGLInteractive(options: SeriesOptions): SeriesDef {
  return series('dotGLInteractive', options);
}

export function errorBar(options: SeriesOptions): SeriesDef {
  return series('errorBar', options);
}

export function heatmapGL(options: SeriesOptions): SeriesDef {
  return series('heatmapGL', options);
}

export function line(options: SeriesOptions): SeriesDef {
  return series('line', options);
}

export function referenceLine(options: SeriesOptions): SeriesDef {
  return series('referenceLine', options);
}

export function streamGL(options: SeriesOptions): SeriesDef {
  return series('streamGL', options);
}
