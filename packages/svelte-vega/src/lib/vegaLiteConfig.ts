// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file vegaLiteConfig.ts
 * @input Astryx Svelte theme token resolver
 * @output Vega-Lite config object themed with Astryx tokens
 * @position Theme integration utility for VegaChart.svelte
 */

import type {Config as VegaLiteConfig} from 'vega-lite';

export const DEFAULT_STROKE_WIDTH = 2;
export const DEFAULT_POINT_SIZE = 64;
export const DEFAULT_LEGEND_ORIENT = 'right' as const;
export const LEGEND_OFFSET = 16;
export const TITLE_OFFSET = 16;

type TokenResolver = (name: string) => string;

export function buildVegaLiteConfig(token: TokenResolver): VegaLiteConfig {
  return {
    axis: {
      domainColor: token('--color-icon-primary'),
      domainWidth: 0.5,
      gridColor: token('--color-background-muted'),
      labelColor: token('--color-text-secondary'),
      labelFont: token('--font-family-body'),
      labelFontSize: 12,
      labelLineHeight: 16,
      labelPadding: 8,
      tickCount: 5,
      ticks: false,
      title: null,
    },
    axisX: {
      grid: false,
    },
    axisXQuantitative: {
      domain: true,
    },
    axisY: {
      domain: false,
    },
    axisYQuantitative: {
      grid: true,
      gridWidth: 0.5,
    },
    background: token('--color-background-card'),
    legend: {
      labelColor: token('--color-text-secondary'),
      labelFont: token('--font-family-body'),
      labelFontSize: 12,
      labelPadding: 8,
      offset: LEGEND_OFFSET,
      orient: DEFAULT_LEGEND_ORIENT,
      rowPadding: 12,
      title: null,
      titleColor: token('--color-text-secondary'),
      titleFont: token('--font-family-heading'),
      titleFontSize: 16,
    },
    line: {
      strokeCap: 'round',
      strokeJoin: 'round',
      strokeWidth: DEFAULT_STROKE_WIDTH,
    },
    padding: 16,
    point: {
      shape: 'circle',
      size: DEFAULT_POINT_SIZE,
      fill: token('--color-background-card'),
    },
    range: {
      category: [
        token('--color-data-categorical-blue'),
        token('--color-data-categorical-orange'),
        token('--color-data-categorical-purple'),
        token('--color-data-categorical-green'),
        token('--color-data-categorical-pink'),
        token('--color-data-categorical-cyan'),
        token('--color-data-categorical-red'),
        token('--color-data-categorical-teal'),
        token('--color-data-categorical-brown'),
        token('--color-data-categorical-indigo'),
      ],
      diverging: [
        token('--color-data-blue-5'),
        token('--color-data-blue-4'),
        token('--color-data-blue-3'),
        token('--color-data-blue-2'),
        token('--color-data-blue-1'),
        token('--color-data-gray-1'),
        token('--color-data-red-1'),
        token('--color-data-red-2'),
        token('--color-data-red-3'),
        token('--color-data-red-4'),
        token('--color-data-red-5'),
      ],
      heatmap: [
        token('--color-data-blue-1'),
        token('--color-data-blue-2'),
        token('--color-data-blue-3'),
        token('--color-data-blue-4'),
        token('--color-data-blue-5'),
      ],
      ordinal: [
        token('--color-data-blue-5'),
        token('--color-data-blue-4'),
        token('--color-data-blue-3'),
        token('--color-data-blue-2'),
        token('--color-data-blue-1'),
      ],
      ramp: [
        token('--color-data-blue-1'),
        token('--color-data-blue-2'),
        token('--color-data-blue-3'),
        token('--color-data-blue-4'),
        token('--color-data-blue-5'),
      ],
    },
    scale: {
      bandPaddingInner: 0.1,
    },
    text: {
      color: token('--color-text-primary'),
    },
    title: {
      anchor: 'start',
      color: token('--color-text-primary'),
      offset: TITLE_OFFSET,
      subtitleColor: token('--color-text-secondary'),
      subtitleFontWeight: 'normal',
    },
    view: {
      stroke: null,
    },
  } satisfies VegaLiteConfig;
}
