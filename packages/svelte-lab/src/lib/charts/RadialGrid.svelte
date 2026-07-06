<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file RadialGrid.svelte
   * @input Radial layout context
   * @output Token-colored radial grid rings and axes
   * @position Radial chart chrome primitive
   */

  import {useRadialContext} from './chart-context.js';

  const radial = useRadialContext();
  const rings = [0.25, 0.5, 0.75, 1] as const;
</script>

<g data-astryx-radial-grid>
  {#each rings as ring}
    <circle
      aria-hidden="true"
      cx={radial.cx}
      cy={radial.cy}
      fill="none"
      r={radial.innerRadius + (radial.radius - radial.innerRadius) * ring}
      stroke="var(--color-border)"
    />
  {/each}
  {#each radial.axes as axis}
    {@const angle = radial.angleByAxis.get(axis) ?? 0}
    <line
      aria-hidden="true"
      stroke="var(--color-border)"
      x1={radial.cx}
      x2={radial.cx + Math.cos(angle) * radial.radius}
      y1={radial.cy}
      y2={radial.cy + Math.sin(angle) * radial.radius}
    />
  {/each}
</g>
