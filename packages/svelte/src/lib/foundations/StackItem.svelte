<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file StackItem.svelte
   * @input Stack child sizing, cross-axis alignment, scrollability, and attributes
   * @output Flex item primitive for Stack layouts
   * @position Svelte port of latest core StackItem behavior
   */

  import type {Snippet} from 'svelte';
  import type {HTMLAttributes} from 'svelte/elements';
  import {foundationClass, styleEntries} from './types.js';

  export type StackItemSize = 'static' | 'fill';
  export type StackItemCrossAlignSelf = 'start' | 'center' | 'end' | 'stretch';

  type Props = HTMLAttributes<HTMLDivElement> & {
    readonly crossAlignSelf?: StackItemCrossAlignSelf;
    readonly size?: StackItemSize;
    readonly isScrollable?: boolean;
    readonly children?: Snippet;
  };

  let {
    crossAlignSelf,
    size = 'static',
    isScrollable = false,
    children,
    class: className,
    style,
    tabindex,
    ...rest
  }: Props = $props();

  const scrollTabindex = $derived(isScrollable ? tabindex ?? 0 : tabindex);
</script>

{#if isScrollable}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div
    {...rest}
    class={foundationClass('stack-item', className, [
      `astryx-stack-item--size-${size}`,
      crossAlignSelf == null ? undefined : `astryx-stack-item--align-${crossAlignSelf}`,
      'astryx-stack-item--scrollable',
    ])}
    data-size={size}
    data-scrollable="true"
    role="region"
    tabindex={scrollTabindex}
    style={styleEntries(style, [['align-self', crossAlignSelf]])}
  >
    {#if children}
      {@render children()}
    {/if}
  </div>
{:else}
<div
  {...rest}
  class={foundationClass('stack-item', className, [
    `astryx-stack-item--size-${size}`,
    crossAlignSelf == null ? undefined : `astryx-stack-item--align-${crossAlignSelf}`,
  ])}
  data-size={size}
  style={styleEntries(style, [['align-self', crossAlignSelf]])}
>
  {#if children}
    {@render children()}
  {/if}
</div>
{/if}
