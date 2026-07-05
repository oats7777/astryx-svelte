<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file ThreeDChart.svelte
   * @input 3D data, keys, dimensions, camera angles, and child marks
   * @output Accessible SVG chart root with shared projection context
   * @position Root primitive for private Svelte lab 3D charts
   */

  import {computeDomain, normalizeValue, projectPoint} from './projection.js';
  import {setThreeDContext} from './three-d-context.js';
  import type {NormalizedPoint, ThreeDChartProps} from './types.js';

  let {
    data,
    xKey,
    yKey,
    zKey,
    xDomain: xDomainProp,
    yDomain: yDomainProp,
    zDomain: zDomainProp,
    width = 640,
    height = 400,
    azimuth = 35,
    elevation = 25,
    children,
    'aria-label': ariaLabel = '3D chart',
  }: ThreeDChartProps = $props();

  const xDomain = $derived(xDomainProp ?? computeDomain(data, xKey));
  const yDomain = $derived(yDomainProp ?? computeDomain(data, yKey));
  const zDomain = $derived(zDomainProp ?? computeDomain(data, zKey));
  const context = $derived({
    width,
    height,
    data,
    xKey,
    yKey,
    zKey,
    xDomain,
    yDomain,
    zDomain,
    azimuth,
    elevation,
    project: (point: NormalizedPoint) => projectPoint(point, {azimuth, elevation, width, height}),
    normalize: normalizeValue,
  });

  setThreeDContext(() => context);
</script>

<svg
  aria-label={ariaLabel}
  class="astryx-three-d-chart"
  data-astryx-3d-chart
  height={height}
  role="img"
  viewBox={`0 0 ${width} ${height}`}
  width={width}
>
  {#if children}
    {@render children()}
  {/if}
</svg>
