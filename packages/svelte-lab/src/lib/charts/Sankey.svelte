<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Sankey.svelte
   * @input Sankey nodes, links, columns, and dimensions
   * @output Accessible SVG sankey diagram
   * @position Private Svelte lab sankey surface
   */

  import {computeSankeyLayout} from './layout.js';
  import type {SankeyColumn, SankeyLinkDatum, SankeyNodeDatum} from './types.js';

  type Props = {
    readonly nodes: readonly SankeyNodeDatum[];
    readonly links: readonly SankeyLinkDatum[];
    readonly columns?: readonly SankeyColumn[];
    readonly height?: number;
    readonly width?: number;
    readonly 'aria-label'?: string;
  };

  let {
    nodes,
    links,
    columns,
    height = 320,
    width = 640,
    'aria-label': ariaLabel = 'Sankey chart',
  }: Props = $props();

  const layout = $derived(computeSankeyLayout(nodes, links, {width, height, columns}));

  function colorString(color: readonly [number, number, number]): string {
    return `oklch(${color[0]} ${color[1]} ${color[2]})`;
  }
</script>

<svg
  aria-label={ariaLabel}
  class="astryx-sankey"
  data-astryx-sankey
  height={height}
  role="img"
  viewBox={`0 0 ${width} ${height}`}
  width={width}
>
  {#each layout.links as link}
    <path
      aria-label={`${link.source.label} to ${link.target.label}: ${link.value}`}
      d={`M ${link.source.x + link.source.width},${link.sourceY + link.height / 2} C ${(link.source.x + link.target.x) / 2},${link.sourceY + link.height / 2} ${(link.source.x + link.target.x) / 2},${link.targetY + link.height / 2} ${link.target.x},${link.targetY + link.height / 2}`}
      data-astryx-sankey-link
      fill="none"
      stroke="var(--color-border-emphasized)"
      stroke-opacity="0.4"
      stroke-width={Math.max(1, link.height)}
    />
  {/each}
  {#each layout.nodes as node}
    <g aria-label={`${node.label}: ${node.value}`} data-astryx-sankey-node>
      <rect fill={colorString(node.color)} height={node.height} rx="3" width={node.width} x={node.x} y={node.y} />
      <text fill="var(--color-text-secondary)" font-size="12" x={node.x + node.width + 6} y={node.y + 14}>
        {node.label}
      </text>
    </g>
  {/each}
</svg>
