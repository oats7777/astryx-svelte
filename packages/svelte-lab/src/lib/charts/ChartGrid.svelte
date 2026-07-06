<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file ChartGrid.svelte
   * @input Current chart scale context
   * @output Token-colored horizontal grid lines
   * @position Chart chrome primitive
   */

  import {useChartContext} from './chart-context.js';

  const chart = useChartContext();
</script>

<g data-astryx-chart-grid>
  {#each chart.yScale.ticks(4) as tick}
    <line
      aria-hidden="true"
      stroke="var(--color-border)"
      x1="0"
      x2={chart.innerWidth}
      y1={chart.yScale(tick)}
      y2={chart.yScale(tick)}
    />
  {/each}
</g>
