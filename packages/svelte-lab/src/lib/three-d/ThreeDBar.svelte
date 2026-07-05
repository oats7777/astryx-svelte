<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file ThreeDBar.svelte
   * @input Color, bar dimensions, and parent 3D projection context
   * @output Depth-sorted projected SVG bar faces
   * @position Bar primitive for private Svelte lab 3D charts
   */

  import {numericDatumValue} from './projection.js';
  import {useThreeDContext} from './three-d-context.js';
  import type {ProjectedPoint} from './types.js';

  interface BarShape {
    readonly index: number;
    readonly depth: number;
    readonly front: readonly ProjectedPoint[];
    readonly right: readonly ProjectedPoint[];
    readonly top: readonly ProjectedPoint[];
  }

  type Props = {readonly color: string; readonly barWidth?: number; readonly barDepth?: number};

  let {color, barWidth = 0.06, barDepth = 0.06}: Props = $props();
  const ctx = useThreeDContext();
  const bars = $derived.by(() =>
    ctx.data
      .map((datum, index): BarShape => {
        const nx = ctx.normalize(numericDatumValue(datum, ctx.xKey), ctx.xDomain);
        const ny = ctx.normalize(numericDatumValue(datum, ctx.yKey), ctx.yDomain);
        const nz = ctx.normalize(numericDatumValue(datum, ctx.zKey), ctx.zDomain);
        const hw = barWidth / 2;
        const hd = barDepth / 2;
        const topFL = ctx.project({nx: nx - hw, ny, nz: nz - hd});
        const topFR = ctx.project({nx: nx + hw, ny, nz: nz - hd});
        const topBL = ctx.project({nx: nx - hw, ny, nz: nz + hd});
        const topBR = ctx.project({nx: nx + hw, ny, nz: nz + hd});
        const botFL = ctx.project({nx: nx - hw, ny: 0, nz: nz - hd});
        const botFR = ctx.project({nx: nx + hw, ny: 0, nz: nz - hd});
        const botBR = ctx.project({nx: nx + hw, ny: 0, nz: nz + hd});
        return {
          index,
          depth: (topFL.depth + topBR.depth + botFL.depth + botBR.depth) / 4,
          front: [botFL, botFR, topFR, topFL],
          right: [botFR, botBR, topBR, topFR],
          top: [topFL, topFR, topBR, topBL],
        };
      })
      .sort((left, right) => left.depth - right.depth),
  );

  function points(face: readonly ProjectedPoint[]): string {
    return face.map((point) => `${point.px},${point.py}`).join(' ');
  }
</script>

<g>
  {#each bars as bar}
    <polygon data-astryx-3d-bar-face fill={color} fill-opacity="0.9" points={points(bar.front)} stroke={color} stroke-width="0.5" />
    <polygon data-astryx-3d-bar-face fill={color} fill-opacity="0.7" points={points(bar.right)} stroke={color} stroke-width="0.5" />
    <polygon data-astryx-3d-bar-face fill={color} fill-opacity="1" points={points(bar.top)} stroke={color} stroke-width="0.5" />
  {/each}
</g>
