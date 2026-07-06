// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layout.ts
 * @input Raw chart, radial, and sankey data
 * @output Deterministic coordinate layouts
 * @position D3-backed math for private Svelte lab chart rendering
 */

import {scaleBand, scaleLinear} from 'd3-scale';
import type {
  ChartContextValue,
  ChartDatum,
  ChartMargin,
  RadialLayout,
  SankeyColumn,
  SankeyColumnDef,
  SankeyLayout,
  SankeyLinkDatum,
  SankeyNodeDatum,
  SankeyNodeLayout,
} from './types.js';

const palette = [
  [0.65, 0.2, 270],
  [0.6, 0.17, 235],
  [0.62, 0.16, 190],
  [0.64, 0.18, 155],
] as const;

export const defaultChartMargin: ChartMargin = {top: 16, right: 16, bottom: 32, left: 48};

export function isBandScale(scale: ChartContextValue['xScale']): scale is ReturnType<typeof scaleBand<string>> {
  return 'bandwidth' in scale;
}

export function xPixel(datum: ChartDatum, xKey: string, scale: ChartContextValue['xScale']): number {
  const raw = datum[xKey];
  if (isBandScale(scale)) {
    return (scale(String(raw)) ?? 0) + scale.bandwidth() / 2;
  }
  return scale(Number(raw));
}

export function computeChartLayout(input: {
  readonly data: readonly ChartDatum[];
  readonly xKey: string;
  readonly yKeys: readonly string[];
  readonly width: number;
  readonly height: number;
  readonly margin?: Partial<ChartMargin>;
  readonly yDomain?: readonly [number, number];
}): ChartContextValue {
  const margin = {...defaultChartMargin, ...input.margin};
  const innerWidth = Math.max(0, input.width - margin.left - margin.right);
  const innerHeight = Math.max(0, input.height - margin.top - margin.bottom);
  const xValues = input.data.map((datum) => datum[input.xKey]);
  const hasNumericX = xValues.length > 0 && xValues.every((value) => typeof value === 'number');
  const numericXValues = xValues.filter((value): value is number => typeof value === 'number');
  const xScale = hasNumericX
    ? scaleLinear()
        .domain([Math.min(...numericXValues), Math.max(...numericXValues)])
        .range([0, innerWidth])
        .nice()
    : scaleBand<string>()
        .domain(xValues.map(String))
        .range([0, innerWidth])
        .padding(0.2);

  const yValues = input.data.flatMap((datum) =>
    input.yKeys.map((key) => datum[key]).filter((value): value is number => typeof value === 'number'),
  );
  const yDomain = input.yDomain ?? [Math.min(0, ...yValues), Math.max(0, ...yValues)];
  const yScale = scaleLinear().domain(yDomain).range([innerHeight, 0]).nice();
  return {...input, margin, innerWidth, innerHeight, xScale, yScale};
}

export function computeRadialLayout(input: {
  readonly data: readonly ChartDatum[];
  readonly width: number;
  readonly height: number;
  readonly axes?: readonly string[];
  readonly valueKey?: string;
  readonly labelKey?: string;
  readonly innerRadius?: number;
  readonly padAngle?: number;
}): RadialLayout {
  const size = Math.min(input.width, input.height);
  const radius = Math.max(0, size / 2 - 40);
  const innerRadius = radius * (input.innerRadius ?? 0);
  const axes = input.axes ?? [];
  const angleByAxis = new Map<string, number>();
  axes.forEach((axis, index) => angleByAxis.set(axis, -Math.PI / 2 + ((2 * Math.PI) / axes.length) * index));
  const axisDomains = new Map<string, readonly [number, number]>();
  for (const axis of axes) {
    const values = input.data.map((datum) => datum[axis]).filter((value): value is number => typeof value === 'number');
    axisDomains.set(axis, [Math.min(0, ...values), Math.max(...values)]);
  }

  const total = input.valueKey
    ? input.data.reduce((sum, datum) => sum + (typeof datum[input.valueKey ?? ''] === 'number' ? Number(datum[input.valueKey ?? '']) : 0), 0)
    : 0;
  let currentAngle = -Math.PI / 2;
  const padAngle = input.padAngle ?? 0.02;
  const available = Math.max(0, 2 * Math.PI - padAngle * input.data.length);
  const slices = total > 0 && input.valueKey
    ? input.data.map((datum) => {
        const value = typeof datum[input.valueKey ?? ''] === 'number' ? Number(datum[input.valueKey ?? '']) : 0;
        const percentage = value / total;
        const startAngle = currentAngle;
        const endAngle = startAngle + percentage * available;
        currentAngle = endAngle + padAngle;
        return {
          key: input.labelKey ? String(datum[input.labelKey]) : String(value),
          value,
          startAngle,
          endAngle,
          percentage,
        };
      })
    : [];
  return {cx: input.width / 2, cy: input.height / 2, radius, innerRadius, slices, axes, angleByAxis, axisDomains};
}

function isColumnIds(column: SankeyColumn): column is readonly string[] {
  return Array.isArray(column);
}

function normalizeColumns(columns: readonly SankeyColumn[]): SankeyColumnDef[] {
  return columns.map((column) => (isColumnIds(column) ? {ids: column} : column));
}

export function computeSankeyLayout(
  nodes: readonly SankeyNodeDatum[],
  links: readonly SankeyLinkDatum[],
  options: {readonly width: number; readonly height: number; readonly columns?: readonly SankeyColumn[]; readonly nodeWidth?: number; readonly nodeGap?: number},
): SankeyLayout {
  const nodeWidth = options.nodeWidth ?? 20;
  const nodeGap = options.nodeGap ?? 14;
  const columns = normalizeColumns(options.columns ?? [nodes.map((node) => node.id)]);
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const maxValue = Math.max(...columns.map((column) => column.ids.reduce((sum, id) => sum + (nodeMap.get(id)?.value ?? 0), 0)), 1);
  const maxNodes = Math.max(...columns.map((column) => column.ids.length), 1);
  const valueScale = (options.height - (maxNodes - 1) * nodeGap - 44) / maxValue;
  const colSpacing = columns.length > 1 ? (options.width - nodeWidth) / (columns.length - 1) : 0;
  const layoutNodes = new Map<string, SankeyNodeLayout>();
  columns.forEach((column, columnIndex) => {
    let y = 22;
    for (const id of column.ids) {
      const node = nodeMap.get(id);
      if (!node) {
        continue;
      }
      layoutNodes.set(id, {
        id,
        label: node.label,
        value: node.value,
        color: node.color ?? palette[layoutNodes.size % palette.length],
        x: columnIndex * colSpacing,
        y,
        width: nodeWidth,
        height: node.value * valueScale,
        column: columnIndex,
        _sourceOffset: 0,
        _targetOffset: 0,
      });
      y += node.value * valueScale + nodeGap;
    }
  });
  const layoutLinks = links.flatMap((link) => {
    const source = layoutNodes.get(link.source);
    const target = layoutNodes.get(link.target);
    if (!source || !target) {
      return [];
    }
    const height = link.value * valueScale;
    const sourceY = source.y + source._sourceOffset;
    const targetY = target.y + target._targetOffset;
    source._sourceOffset += height;
    target._targetOffset += height;
    return [{source, target, value: link.value, height, sourceY, targetY}];
  });
  return {
    nodes: [...layoutNodes.values()],
    links: layoutLinks,
    columns: columns.map((column, index) => ({x: index * colSpacing, label: column.label, ids: column.ids})),
    valueScale,
    maxValue,
  };
}
