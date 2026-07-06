<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file ChartLine.svelte
   * @input Data key, optional color, label, and chart scale context
   * @output SVG polyline series
   * @position Cartesian mark primitive
   */

  import {useChartContext} from './chart-context.js';
  import {xPixel} from './layout.js';

  type Props = {
    readonly dataKey: string;
    readonly color?: string;
    readonly label?: string;
  };

  let {dataKey, color = 'var(--color-data-categorical-orange)', label = dataKey}: Props = $props();
  const chart = useChartContext();
  const points = $derived(chart.data
    .map((datum) => `${xPixel(datum, chart.xKey, chart.xScale)},${chart.yScale(Number(datum[dataKey] ?? 0))}`)
    .join(' '));
</script>

<polyline
  aria-label={label}
  data-astryx-chart-line
  fill="none"
  points={points}
  stroke={color}
  stroke-linecap="round"
  stroke-linejoin="round"
  stroke-width="2"
/>
