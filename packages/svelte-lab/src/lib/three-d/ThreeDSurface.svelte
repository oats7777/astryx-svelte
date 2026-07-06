<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file ThreeDSurface.svelte
   * @input Color range, opacity, wireframe flag, and parent 3D projection context
   * @output Depth-sorted projected surface mesh faces
   * @position Surface primitive for private Svelte lab 3D charts
   */

  import {numericDatumValue} from './projection.js';
  import {useThreeDContext} from './three-d-context.js';
  import type {ThreeDDatum} from './types.js';

  interface Face {
    readonly points: string;
    readonly color: string;
    readonly depth: number;
  }

  type Props = {
    readonly colorRange: readonly string[];
    readonly opacity?: number;
    readonly wireframe?: boolean;
  };

  let {colorRange, opacity = 0.8, wireframe = false}: Props = $props();
  const ctx = useThreeDContext();
  const faces = $derived.by(() => {
    const xValues = uniqueSorted(ctx.data, ctx.xKey);
    const zValues = uniqueSorted(ctx.data, ctx.zKey);
    const grid = new Map<string, ThreeDDatum>();
    for (const datum of ctx.data) {
      grid.set(`${numericDatumValue(datum, ctx.xKey)},${numericDatumValue(datum, ctx.zKey)}`, datum);
    }
    const result: Face[] = [];
    for (let row = 0; row < zValues.length - 1; row++) {
      for (let column = 0; column < xValues.length - 1; column++) {
        const corners = [
          grid.get(`${xValues[column]},${zValues[row]}`),
          grid.get(`${xValues[column + 1]},${zValues[row]}`),
          grid.get(`${xValues[column + 1]},${zValues[row + 1]}`),
          grid.get(`${xValues[column]},${zValues[row + 1]}`),
        ];
        if (corners.some((corner) => corner == null)) {
          continue;
        }
        const projected = corners.map((corner) => {
          const datum = corner ?? {};
          const point = {
            nx: ctx.normalize(numericDatumValue(datum, ctx.xKey), ctx.xDomain),
            ny: ctx.normalize(numericDatumValue(datum, ctx.yKey), ctx.yDomain),
            nz: ctx.normalize(numericDatumValue(datum, ctx.zKey), ctx.zDomain),
          };
          return {...ctx.project(point), ny: point.ny};
        });
        const avgY = projected.reduce((sum, point) => sum + point.ny, 0) / projected.length;
        const avgDepth = projected.reduce((sum, point) => sum + point.depth, 0) / projected.length;
        result.push({
          points: projected.map((point) => `${point.px},${point.py}`).join(' '),
          color: colorAt(colorRange, avgY),
          depth: avgDepth,
        });
      }
    }
    return result.sort((left, right) => left.depth - right.depth);
  });

  function uniqueSorted(data: readonly ThreeDDatum[], key: string): readonly number[] {
    return Array.from(new Set(data.map((datum) => numericDatumValue(datum, key)).filter(Number.isFinite))).sort(
      (left, right) => left - right,
    );
  }

  function colorAt(colors: readonly string[], value: number): string {
    if (colors.length === 0) {
      return 'currentColor';
    }
    const scaled = Math.max(0, Math.min(1, value)) * (colors.length - 1);
    const index = Math.min(colors.length - 1, Math.round(scaled));
    return colors[index] ?? 'currentColor';
  }
</script>

<g>
  {#each faces as face}
    <polygon
      data-astryx-3d-surface-face
      fill={wireframe ? 'none' : face.color}
      fill-opacity={opacity}
      points={face.points}
      stroke={face.color}
      stroke-opacity={wireframe ? 0.8 : 0.3}
      stroke-width={wireframe ? 1 : 0.5}
    />
  {/each}
</g>
