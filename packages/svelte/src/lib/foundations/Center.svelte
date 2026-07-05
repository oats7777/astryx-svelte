<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Center.svelte
   * @input Axis, minimum height, child snippet, and div attributes
   * @output Centering layout primitive
   * @position Svelte port of core Center
   */

  import type {Snippet} from 'svelte';
  import type {HTMLAttributes} from 'svelte/elements';
  import {formatSize, foundationClass, styleEntries} from './types.js';

  export type CenterAxis = 'horizontal' | 'vertical' | 'both';
  type Props = HTMLAttributes<HTMLDivElement> & {
    readonly axis?: CenterAxis;
    readonly minHeight?: number | string;
    readonly children?: Snippet;
  };

  let {axis = 'both', minHeight, children, class: className, style, ...rest}: Props = $props();
</script>

<div
  {...rest}
  class={foundationClass('center', className, [`astryx-center--axis-${axis}`])}
  data-axis={axis}
  style={styleEntries(style, [['min-height', formatSize(minHeight)]])}
>
  {#if children}
    {@render children()}
  {/if}
</div>
