<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file ThreeDScatter.svelte
   * @input Color, radius, opacity, and parent 3D projection context
   * @output Depth-sorted projected SVG scatter marks
   * @position Scatter primitive for private Svelte lab 3D charts
   */

  import {numericDatumValue} from './projection.js';
  import {useThreeDContext} from './three-d-context.js';

  type Props = {readonly color: string; readonly radius?: number; readonly opacity?: number};

  let {color, radius = 4, opacity = 0.85}: Props = $props();
  const ctx = useThreeDContext();
  const points = $derived.by(() =>
    ctx.data
      .map((datum, index) => {
        const point = {
          nx: ctx.normalize(numericDatumValue(datum, ctx.xKey), ctx.xDomain),
          ny: ctx.normalize(numericDatumValue(datum, ctx.yKey), ctx.yDomain),
          nz: ctx.normalize(numericDatumValue(datum, ctx.zKey), ctx.zDomain),
        };
        return {...ctx.project(point), index};
      })
      .sort((left, right) => left.depth - right.depth),
  );
</script>

<g>
  {#each points as point}
    {@const depthFactor = 0.75 + (point.depth + 0.5) * 0.25}
    <circle
      cx={point.px}
      cy={point.py}
      data-astryx-3d-scatter-point
      fill={color}
      fill-opacity={opacity * depthFactor}
      r={radius * depthFactor}
    />
  {/each}
</g>
