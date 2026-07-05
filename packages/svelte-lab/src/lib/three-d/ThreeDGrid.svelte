<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file ThreeDGrid.svelte
   * @input Division count and parent 3D projection context
   * @output Depth-sorted floor-plane SVG grid lines
   * @position Grid primitive for private Svelte lab 3D charts
   */

  import {useThreeDContext} from './three-d-context.js';

  interface GridLine {
    readonly x1: number;
    readonly y1: number;
    readonly x2: number;
    readonly y2: number;
    readonly depth: number;
  }

  type Props = {readonly divisions?: number};

  let {divisions = 5}: Props = $props();
  const ctx = useThreeDContext();
  const lines = $derived.by(() => {
    const result: GridLine[] = [];
    for (let index = 0; index <= divisions; index++) {
      const t = divisions === 0 ? 0 : index / divisions;
      const a = ctx.project({nx: t, ny: 0, nz: 0});
      const b = ctx.project({nx: t, ny: 0, nz: 1});
      const c = ctx.project({nx: 0, ny: 0, nz: t});
      const d = ctx.project({nx: 1, ny: 0, nz: t});
      result.push({x1: a.px, y1: a.py, x2: b.px, y2: b.py, depth: (a.depth + b.depth) / 2});
      result.push({x1: c.px, y1: c.py, x2: d.px, y2: d.py, depth: (c.depth + d.depth) / 2});
    }
    return result.sort((left, right) => left.depth - right.depth);
  });
</script>

<g>
  {#each lines as line}
    <line
      data-astryx-3d-grid-line
      stroke="var(--color-border)"
      stroke-opacity="0.3"
      stroke-width="1"
      x1={line.x1}
      x2={line.x2}
      y1={line.y1}
      y2={line.y2}
    />
  {/each}
</g>
