<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file AspectRatio.svelte
   * @input Ratio, shape, attributes, and child snippet
   * @output Tokenized aspect-ratio container for Svelte consumers
   * @position Svelte port of core AspectRatio
   */

  import type {Snippet} from 'svelte';
  import type {HTMLAttributes} from 'svelte/elements';
  import {foundationClass, styleEntries} from './types.js';

  export type AspectRatioShape = 'rectangle' | 'ellipse';
  type Props = HTMLAttributes<HTMLDivElement> & {
    readonly ratio: number;
    readonly shape?: AspectRatioShape;
    readonly children?: Snippet;
  };

  let {ratio, shape = 'rectangle', children, class: className, style, ...rest}: Props = $props();
  const aspectRatioStyle = $derived(`${ratio} / 1`);
</script>

<div
  {...rest}
  class={foundationClass('aspect-ratio', className, [`astryx-aspect-ratio--shape-${shape}`])}
  data-shape={shape}
  style={styleEntries(style, [['aspect-ratio', aspectRatioStyle]])}
>
  <div class="astryx-aspect-ratio__child">
    {#if children}
      {@render children()}
    {/if}
  </div>
</div>
