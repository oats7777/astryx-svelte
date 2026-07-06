<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file ChartGL.svelte
   * @input WebGL chart variant label
   * @output SVG marker for canvas-backed chart variants
   * @position Shared fallback renderer for private WebGL chart marks
   */

  type Props = {
    readonly kind: string;
    readonly label?: string;
  };

  let {kind, label = kind}: Props = $props();
</script>

<g aria-label={label} data-astryx-chart-gl={kind} />
