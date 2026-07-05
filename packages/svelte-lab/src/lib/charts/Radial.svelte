<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Radial.svelte
   * @input Radial data, dimensions, and chart children
   * @output Accessible SVG radial chart container
   * @position Root primitive for private Svelte lab radial charts
   */

  import type {Snippet} from 'svelte';
  import {setRadialContext} from './chart-context.js';
  import {computeRadialLayout} from './layout.js';
  import type {ChartDatum} from './types.js';

  type Props = {
    readonly data: readonly ChartDatum[];
    readonly axes?: readonly string[];
    readonly valueKey?: string;
    readonly labelKey?: string;
    readonly height?: number;
    readonly width?: number;
    readonly innerRadius?: number;
    readonly children?: Snippet;
    readonly 'aria-label'?: string;
  };

  let {
    data,
    axes,
    valueKey,
    labelKey,
    height = 300,
    width = 300,
    innerRadius,
    children,
    'aria-label': ariaLabel = 'Radial chart',
  }: Props = $props();

  const layout = $derived(computeRadialLayout({data, axes, valueKey, labelKey, height, width, innerRadius}));
  setRadialContext(() => layout);
</script>

<svg
  aria-label={ariaLabel}
  class="astryx-radial"
  data-astryx-radial
  height={height}
  role="img"
  viewBox={`0 0 ${width} ${height}`}
  width={width}
>
  {#if children}
    {@render children()}
  {/if}
</svg>
