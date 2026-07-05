<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file ChartTooltip.svelte
   * @input Optional label text
   * @output SVG tooltip placeholder with accessible role
   * @position Chart utility primitive
   */

  type Props = {
    readonly label?: string;
  };

  let {label = 'Chart values'}: Props = $props();
</script>

<g aria-label={label} data-astryx-chart-tooltip role="tooltip" />
