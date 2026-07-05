<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file ChartArea.svelte
   * @input Data key, optional color, label, and chart scale context
   * @output Token-colored closed area path
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
  const line = $derived(chart.data.map((datum) => `${xPixel(datum, chart.xKey, chart.xScale)},${chart.yScale(Number(datum[dataKey] ?? 0))}`));
  const path = $derived(line.length > 0
    ? `M ${line.join(' L ')} L ${xPixel(chart.data[chart.data.length - 1] ?? {}, chart.xKey, chart.xScale)},${chart.yScale(0)} L ${xPixel(chart.data[0] ?? {}, chart.xKey, chart.xScale)},${chart.yScale(0)} Z`
    : '');
</script>

<path aria-label={label} d={path} data-astryx-chart-area fill={color} fill-opacity="0.18" />
