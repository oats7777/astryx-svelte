<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file SVGIcon.svelte
   * @input Role-annotated SVG icon definition and variation props
   * @output CSS-variable-driven SVG with fill/stroke role layers and bold masks
   * @position Private Svelte lab implementation for the experimental SVG icon system
   */

  import {createIconStyle} from './iconStyles.js';
  import type {IconShape, SVGIconProps} from './types.js';

  let {
    icon,
    variation = 'linear',
    size = 'md',
    color = 'primary',
    strokeWidth,
    title,
  }: SVGIconProps = $props();

  const viewBox = $derived(icon.viewBox ?? '0 0 24 24');
  const styleText = $derived(createIconStyle(variation, size, color, strokeWidth));
  const uid = `astryx-icon-${Math.random().toString(36).slice(2)}`;
  const primaryFill = $derived(icon.primary.filter((shape) => shape.role !== 'stroke'));
  const primaryStroke = $derived(icon.primary.filter((shape) => shape.role === 'stroke'));
  const secondary = $derived(icon.secondary ?? []);
  const secondaryFill = $derived(secondary.filter((shape) => shape.role !== 'stroke'));
  const secondaryStroke = $derived(secondary.filter((shape) => shape.role === 'stroke'));
  const maskId = $derived(`${uid}-mask`);
  const useMask = $derived(variation === 'bold' && primaryFill.length > 0 && secondary.length > 0);

  function layerStyle(layer: 'primary' | 'secondary', role: 'fill' | 'stroke'): string {
    if (role === 'stroke') {
      return 'fill: none; stroke: currentColor; stroke-width: var(--astryx-icon-stroke-width); stroke-linecap: round; stroke-linejoin: round; opacity: var(--astryx-icon-stroke-role-opacity)';
    }
    return `fill: var(--astryx-icon-${layer}-fill); stroke: var(--astryx-icon-${layer}-stroke); stroke-width: var(--astryx-icon-stroke-width); stroke-linecap: round; stroke-linejoin: round; opacity: var(--astryx-icon-${layer}-opacity)`;
  }

  function knockoutStyle(shape: IconShape): string {
    const width =
      shape.role === 'stroke'
        ? 'calc(var(--astryx-icon-stroke-width) + var(--astryx-icon-gap) * 2)'
        : 'var(--astryx-icon-gap)';
    return `fill: ${shape.role === 'stroke' ? 'none' : 'black'}; stroke: black; stroke-width: ${width}; stroke-linecap: round; stroke-linejoin: round`;
  }
</script>

<svg
  aria-hidden={title == null ? 'true' : undefined}
  aria-label={title}
  data-astryx-svg-icon
  role={title == null ? undefined : 'img'}
  style={styleText}
  viewBox={viewBox}
  xmlns="http://www.w3.org/2000/svg"
>
  {#if title != null}
    <title>{title}</title>
  {/if}
  {#if useMask}
    <defs>
      <mask id={maskId}>
        <rect fill="white" height="24" width="24" />
        {#each secondary as shape}
          <svelte:element this={shape.type} {...shape.attrs} style={knockoutStyle(shape)} />
        {/each}
      </mask>
    </defs>
  {/if}

  {#if primaryFill.length > 0}
    <g data-astryx-icon-layer="primary-fill" mask={useMask ? `url(#${maskId})` : undefined} style={layerStyle('primary', 'fill')}>
      {#each primaryFill as shape}
        <svelte:element this={shape.type} {...shape.attrs} />
      {/each}
    </g>
  {/if}
  {#if primaryStroke.length > 0}
    <g data-astryx-icon-layer="primary-stroke" style={layerStyle('primary', 'stroke')}>
      {#each primaryStroke as shape}
        <svelte:element this={shape.type} {...shape.attrs} />
      {/each}
    </g>
  {/if}
  {#if secondaryFill.length > 0 && !useMask}
    <g data-astryx-icon-layer="secondary-fill" style={layerStyle('secondary', 'fill')}>
      {#each secondaryFill as shape}
        <svelte:element this={shape.type} {...shape.attrs} />
      {/each}
    </g>
  {/if}
  {#if secondaryStroke.length > 0 && !useMask}
    <g data-astryx-icon-layer="secondary-stroke" style={layerStyle('secondary', 'stroke')}>
      {#each secondaryStroke as shape}
        <svelte:element this={shape.type} {...shape.attrs} />
      {/each}
    </g>
  {/if}
</svg>

<style>
  [data-astryx-svg-icon] {
    color: var(--astryx-icon-color);
    display: inline-flex;
    flex-shrink: 0;
    height: var(--astryx-icon-size);
    width: var(--astryx-icon-size);
  }
</style>
