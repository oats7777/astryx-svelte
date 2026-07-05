// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file types.ts
 * @input Chart, radial, and sankey data contracts
 * @output Shared private Svelte lab chart types
 * @position Type foundation for local chart primitives
 */

import type {ScaleBand, ScaleLinear} from 'd3-scale';

export type ChartDatum = Readonly<Record<string, unknown>>;

export interface ChartMargin {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
}

export type ChartScale = ScaleLinear<number, number> | ScaleBand<string>;

export interface ChartContextValue {
  readonly data: readonly ChartDatum[];
  readonly xKey: string;
  readonly yKeys: readonly string[];
  readonly width: number;
  readonly height: number;
  readonly margin: ChartMargin;
  readonly innerWidth: number;
  readonly innerHeight: number;
  readonly xScale: ChartScale;
  readonly yScale: ScaleLinear<number, number>;
}

export type ChartSeriesType =
  | 'area'
  | 'bar'
  | 'band'
  | 'candlestick'
  | 'dot'
  | 'dotGL'
  | 'dotGLInteractive'
  | 'errorBar'
  | 'heatmapGL'
  | 'line'
  | 'referenceLine'
  | 'streamGL';

export interface SeriesDef {
  readonly key: string;
  readonly type: ChartSeriesType;
  readonly dataKeys: readonly string[];
  readonly label?: string;
  readonly color?: string;
}

export interface LegendItem {
  readonly label: string;
  readonly color: string;
  readonly type?: string;
}

export interface RadialSliceLayout {
  readonly key: string;
  readonly value: number;
  readonly startAngle: number;
  readonly endAngle: number;
  readonly percentage: number;
}

export interface RadialLayout {
  readonly cx: number;
  readonly cy: number;
  readonly radius: number;
  readonly innerRadius: number;
  readonly slices: readonly RadialSliceLayout[];
  readonly axes: readonly string[];
  readonly angleByAxis: ReadonlyMap<string, number>;
  readonly axisDomains: ReadonlyMap<string, readonly [number, number]>;
}

export interface SankeyNodeDatum {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly color?: readonly [number, number, number];
}

export interface SankeyLinkDatum {
  readonly source: string;
  readonly target: string;
  readonly value: number;
}

export interface SankeyColumnDef {
  readonly ids: readonly string[];
  readonly label?: string;
}

export type SankeyColumn = readonly string[] | SankeyColumnDef;

export interface SankeyNodeLayout {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly color: readonly [number, number, number];
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly column: number;
  _sourceOffset: number;
  _targetOffset: number;
}

export interface SankeyLinkLayout {
  readonly source: SankeyNodeLayout;
  readonly target: SankeyNodeLayout;
  readonly value: number;
  readonly height: number;
  readonly sourceY: number;
  readonly targetY: number;
}

export interface SankeyColumnLayout {
  readonly x: number;
  readonly label?: string;
  readonly ids: readonly string[];
}

export interface SankeyLayout {
  readonly nodes: readonly SankeyNodeLayout[];
  readonly links: readonly SankeyLinkLayout[];
  readonly columns: readonly SankeyColumnLayout[];
  readonly valueScale: number;
  readonly maxValue: number;
}
