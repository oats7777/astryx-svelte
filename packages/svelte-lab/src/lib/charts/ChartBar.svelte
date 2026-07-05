<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file ChartBar.svelte
   * @input Data key, optional color, label, and chart scale context
   * @output Token-colored bar mark series
   * @position Cartesian mark primitive
   */

  import {useChartContext} from './chart-context.js';
  import {isBandScale, xPixel} from './layout.js';

  type Props = {
    readonly dataKey: string;
    readonly color?: string;
    readonly label?: string;
  };

  let {dataKey, color = 'var(--color-data-categorical-blue)', label = dataKey}: Props = $props();
  const chart = useChartContext();
</script>

<g aria-label={label} data-astryx-chart-bar>
  {#each chart.data as datum}
    {@const value = typeof datum[dataKey] === 'number' ? Number(datum[dataKey]) : 0}
    {@const barWidth = isBandScale(chart.xScale) ? chart.xScale.bandwidth() : 8}
    {@const x = isBandScale(chart.xScale) ? (chart.xScale(String(datum[chart.xKey])) ?? 0) : xPixel(datum, chart.xKey, chart.xScale) - barWidth / 2}
    {@const y = chart.yScale(Math.max(0, value))}
    {@const zero = chart.yScale(0)}
    <rect
      fill={color}
      height={Math.abs(zero - y)}
      rx="2"
      width={barWidth}
      x={x}
      y={Math.min(y, zero)}
    />
  {/each}
</g>
