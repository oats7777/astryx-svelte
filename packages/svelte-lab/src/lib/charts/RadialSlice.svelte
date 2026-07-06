<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file RadialSlice.svelte
   * @input Radial slice layout context
   * @output Token-colored pie or donut paths
   * @position Radial chart mark primitive
   */

  import {useRadialContext} from './chart-context.js';

  const radial = useRadialContext();

  function point(angle: number, radius: number): string {
    return `${radial.cx + Math.cos(angle) * radius},${radial.cy + Math.sin(angle) * radius}`;
  }

  function slicePath(startAngle: number, endAngle: number): string {
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M ${radial.cx},${radial.cy} L ${point(startAngle, radial.radius)} A ${radial.radius},${radial.radius} 0 ${largeArc} 1 ${point(endAngle, radial.radius)} Z`;
  }
</script>

<g data-astryx-radial-slices>
  {#each radial.slices as slice, index}
    <path
      aria-label={`${slice.key}: ${Math.round(slice.percentage * 100)}%`}
      d={slicePath(slice.startAngle, slice.endAngle)}
      data-astryx-radial-slice
      fill={`var(--color-data-categorical-${['blue', 'orange', 'purple', 'green'][index % 4]})`}
    />
  {/each}
</g>
