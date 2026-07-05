<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file ChartLegend.svelte
   * @input Legend item data
   * @output Accessible foreignObject legend list
   * @position Chart utility primitive
   */

  import type {LegendItem} from './types.js';

  type Props = {
    readonly items: readonly LegendItem[];
  };

  let {items}: Props = $props();
</script>

<foreignObject data-astryx-chart-legend height="32" width="220" x="0" y="0">
  <div role="list">
    {#each items as item}
      <span role="listitem">
        <span aria-hidden="true" style={`color: ${item.color}`}>■</span>
        {item.label}
      </span>
    {/each}
  </div>
</foreignObject>
