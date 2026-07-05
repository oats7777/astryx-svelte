<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file ChartAxis.svelte
   * @input Axis position and chart scale context
   * @output Accessible SVG axis hooks
   * @position Chart chrome primitive
   */

  import {useChartContext} from './chart-context.js';
  import {isBandScale, xPixel} from './layout.js';

  type Props = {
    readonly position: 'bottom' | 'left';
  };

  let {position}: Props = $props();
  const chart = useChartContext();
</script>

<g data-astryx-chart-axis={position}>
  {#if position === 'bottom'}
    <line stroke="var(--color-border-emphasized)" x1="0" x2={chart.innerWidth} y1={chart.innerHeight} y2={chart.innerHeight} />
    {#each chart.data as datum}
      <text fill="var(--color-text-secondary)" font-size="12" text-anchor="middle" x={xPixel(datum, chart.xKey, chart.xScale)} y={chart.innerHeight + 18}>
        {String(datum[chart.xKey])}
      </text>
    {/each}
  {:else}
    <line stroke="var(--color-border-emphasized)" x1="0" x2="0" y1="0" y2={chart.innerHeight} />
    {#each chart.yScale.ticks(4) as tick}
      <text fill="var(--color-text-secondary)" font-size="12" text-anchor="end" x="-8" y={chart.yScale(tick)}>
        {tick}
      </text>
    {/each}
  {/if}
</g>
