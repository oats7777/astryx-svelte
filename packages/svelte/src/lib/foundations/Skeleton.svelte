<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Skeleton.svelte
   * @input Width, height, radius, and span attributes
   * @output Non-interactive loading placeholder
   * @position Svelte port of core Skeleton
   */

  import type {HTMLAttributes} from 'svelte/elements';
  import {formatSize, foundationClass, styleEntries} from './types.js';

  export type SkeletonRadius = 'element' | 'container' | 'full';
  type Props = HTMLAttributes<HTMLSpanElement> & {
    readonly width?: number | string;
    readonly height?: number | string;
    readonly radius?: SkeletonRadius;
  };

  let {
    width,
    height,
    radius = 'element',
    class: className,
    style,
    'aria-hidden': ariaHidden = 'true',
    ...rest
  }: Props = $props();
</script>

<span
  {...rest}
  class={foundationClass('skeleton', className, [
    'astryx-reduced-motion-safe',
    `astryx-skeleton--radius-${radius}`,
  ])}
  aria-hidden={ariaHidden}
  style={styleEntries(style, [
    ['width', formatSize(width)],
    ['height', formatSize(height)],
  ])}
></span>
