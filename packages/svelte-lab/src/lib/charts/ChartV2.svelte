<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file ChartV2.svelte
   * @input Data, x key, and declarative series definitions
   * @output Accessible SVG chart with derived marks and legend-ready series
   * @position Private Svelte lab ChartV2 surface
   */

  import {computeChartLayout, xPixel} from './layout.js';
  import type {ChartDatum, SeriesDef} from './types.js';

  type Props = {
    readonly data: readonly ChartDatum[];
    readonly xKey: string;
    readonly series: readonly SeriesDef[];
    readonly height?: number;
    readonly width?: number;
    readonly 'aria-label'?: string;
  };

  let {
    data,
    xKey,
    series,
    height = 300,
    width = 640,
    'aria-label': ariaLabel = 'Chart',
  }: Props = $props();

  const yKeys = $derived(series.flatMap((item) => item.dataKeys));
  const layout = $derived(computeChartLayout({data, xKey, yKeys, width, height}));
</script>

<svg
  aria-label={ariaLabel}
  class="astryx-chart astryx-chart-v2"
  data-astryx-chart-v2
  height={height}
  role="img"
  viewBox={`0 0 ${width} ${height}`}
  width={width}
>
  <g transform={`translate(${layout.margin.left}, ${layout.margin.top})`}>
    {#each series as item}
      {@const dataKey = item.dataKeys[0] ?? ''}
      {@const color = item.color ?? 'var(--color-data-categorical-blue)'}
      {#if item.type === 'bar'}
        {#each data as datum}
          <rect
            data-astryx-chart-v2-mark={item.type}
            fill={color}
            height={Math.abs(layout.yScale(0) - layout.yScale(Number(datum[dataKey] ?? 0)))}
            width="8"
            x={xPixel(datum, xKey, layout.xScale) - 4}
            y={Math.min(layout.yScale(0), layout.yScale(Number(datum[dataKey] ?? 0)))}
          />
        {/each}
      {:else}
        <polyline
          data-astryx-chart-v2-mark={item.type}
          fill="none"
          points={data.map((datum) => `${xPixel(datum, xKey, layout.xScale)},${layout.yScale(Number(datum[dataKey] ?? 0))}`).join(' ')}
          stroke={color}
          stroke-width={item.type === 'dot' ? 0 : 2}
        />
        {#if item.type === 'dot'}
          {#each data as datum}
            <circle
              data-astryx-chart-v2-dot
              fill={color}
              r="3"
              cx={xPixel(datum, xKey, layout.xScale)}
              cy={layout.yScale(Number(datum[dataKey] ?? 0))}
            />
          {/each}
        {/if}
      {/if}
    {/each}
  </g>
</svg>
