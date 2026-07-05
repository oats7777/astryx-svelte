<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Chart.svelte
   * @input Tabular data, axis keys, dimensions, and chart children
   * @output Accessible SVG chart container with shared scale context
   * @position Root primitive for private Svelte lab cartesian charts
   */

  import type {Snippet} from 'svelte';
  import {setChartContext} from './chart-context.js';
  import {computeChartLayout} from './layout.js';
  import type {ChartDatum, ChartMargin} from './types.js';

  type Props = {
    readonly data: readonly ChartDatum[];
    readonly xKey: string;
    readonly yKeys: readonly string[];
    readonly height?: number;
    readonly width?: number;
    readonly margin?: Partial<ChartMargin>;
    readonly yDomain?: readonly [number, number];
    readonly children?: Snippet;
    readonly 'aria-label'?: string;
  };

  let {
    data,
    xKey,
    yKeys,
    height = 300,
    width = 640,
    margin,
    yDomain,
    children,
    'aria-label': ariaLabel = 'Chart',
  }: Props = $props();

  const layout = $derived(computeChartLayout({data, xKey, yKeys, width, height, margin, yDomain}));
  setChartContext(() => layout);
</script>

<svg
  aria-label={ariaLabel}
  class="astryx-chart"
  data-astryx-chart
  height={height}
  role="img"
  viewBox={`0 0 ${width} ${height}`}
  width={width}
>
  <g transform={`translate(${layout.margin.left}, ${layout.margin.top})`}>
    {#if children}
      {@render children()}
    {/if}
  </g>
</svg>
