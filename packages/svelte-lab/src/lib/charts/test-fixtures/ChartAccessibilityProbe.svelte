<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file ChartAccessibilityProbe.svelte
   * @input Fixed chart data for DOM and accessibility tests
   * @output Rendered chart primitives with stable test hooks
   * @position Test fixture for private Svelte lab charts
   */

  import {
    Chart,
    ChartArea,
    ChartAxis,
    ChartBar,
    ChartGrid,
    ChartLegend,
    ChartLine,
    ChartTooltip,
    ChartV2,
    dot,
    line,
  } from '../index.js';

  const data = [
    {month: 'Jan', revenue: 12, cost: 8},
    {month: 'Feb', revenue: 18, cost: 10},
    {month: 'Mar', revenue: 14, cost: 9},
  ] as const;

  const series = [
    line({
      key: 'revenue',
      dataKey: 'revenue',
      label: 'Revenue',
      color: 'var(--color-data-categorical-blue)',
    }),
    dot({
      key: 'cost',
      dataKey: 'cost',
      label: 'Cost',
      color: 'var(--color-data-categorical-orange)',
    }),
  ] as const;
</script>

<Chart
  aria-label="Quarterly revenue chart"
  data={data}
  height={240}
  xKey="month"
  yKeys={['revenue', 'cost']}
>
  <ChartGrid />
  <ChartAxis position="bottom" />
  <ChartAxis position="left" />
  <ChartBar dataKey="revenue" label="Revenue bars" />
  <ChartLine dataKey="cost" label="Cost line" />
  <ChartArea dataKey="cost" label="Cost area" />
  <ChartTooltip />
  <ChartLegend items={[{label: 'Revenue', color: 'var(--color-data-categorical-blue)', type: 'bar'}]} />
</Chart>

<ChartV2 aria-label="Operations trend chart" data={data} height={220} series={series} xKey="month" />
