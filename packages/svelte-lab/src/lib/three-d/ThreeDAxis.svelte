<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file ThreeDAxis.svelte
   * @input Parent 3D projection context and label visibility
   * @output SVG axis lines and optional endpoint labels
   * @position Axis primitive for private Svelte lab 3D charts
   */

  import {useThreeDContext} from './three-d-context.js';

  type Props = {readonly labels?: boolean};

  let {labels = true}: Props = $props();
  const ctx = useThreeDContext();
  const origin = $derived(ctx.project({nx: 0, ny: 0, nz: 0}));
  const xEnd = $derived(ctx.project({nx: 1, ny: 0, nz: 0}));
  const yEnd = $derived(ctx.project({nx: 0, ny: 1, nz: 0}));
  const zEnd = $derived(ctx.project({nx: 0, ny: 0, nz: 1}));
</script>

<g>
  <line data-astryx-3d-axis="x" stroke="var(--color-border-emphasized)" stroke-width="1.5" x1={origin.px} x2={xEnd.px} y1={origin.py} y2={xEnd.py} />
  <line data-astryx-3d-axis="y" stroke="var(--color-border-emphasized)" stroke-width="1.5" x1={origin.px} x2={yEnd.px} y1={origin.py} y2={yEnd.py} />
  <line data-astryx-3d-axis="z" stroke="var(--color-border-emphasized)" stroke-width="1.5" x1={origin.px} x2={zEnd.px} y1={origin.py} y2={zEnd.py} />
  {#if labels}
    <text dominant-baseline="central" fill="var(--color-text-secondary)" font-size="11" x={xEnd.px + 8} y={xEnd.py}>{ctx.xKey} [{ctx.xDomain[0]}-{ctx.xDomain[1]}]</text>
    <text dominant-baseline="central" fill="var(--color-text-secondary)" font-size="11" x={yEnd.px + 8} y={yEnd.py}>{ctx.yKey} [{ctx.yDomain[0]}-{ctx.yDomain[1]}]</text>
    <text dominant-baseline="central" fill="var(--color-text-secondary)" font-size="11" x={zEnd.px + 8} y={zEnd.py}>{ctx.zKey} [{ctx.zDomain[0]}-{ctx.zDomain[1]}]</text>
  {/if}
</g>
