<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Stack.svelte
   * @input Direction, gap, padding, scrollability, child snippet, and attributes
   * @output Flex stack layout primitive
   * @position Svelte port of core Stack
   */

  import type {Snippet} from 'svelte';
  import type {HTMLAttributes} from 'svelte/elements';
  import {
    formatSize,
    foundationClass,
    spacingVar,
    styleEntries,
    type AlignValue,
    type JustifyValue,
    type SizeValue,
    type SpacingStep,
  } from './types.js';

  export type StackDirection = 'horizontal' | 'vertical';
  export type StackWrap = 'nowrap' | 'wrap';
  type Props = HTMLAttributes<HTMLDivElement> & {
    readonly direction?: StackDirection;
    readonly gap?: SpacingStep;
    readonly padding?: SpacingStep;
    readonly paddingInline?: SpacingStep;
    readonly paddingBlock?: SpacingStep;
    readonly isScrollable?: boolean;
    readonly width?: SizeValue;
    readonly height?: SizeValue;
    readonly align?: AlignValue;
    readonly justify?: JustifyValue;
    readonly wrap?: StackWrap;
    readonly children?: Snippet;
  };

  let {
    direction = 'vertical',
    gap = 0,
    padding,
    paddingInline,
    paddingBlock,
    isScrollable = false,
    width,
    height,
    align = 'stretch',
    justify = 'start',
    wrap = 'nowrap',
    children,
    class: className,
    style,
    tabindex,
    ...rest
  }: Props = $props();

  const resolvedPaddingInline = $derived(paddingInline ?? padding);
  const resolvedPaddingBlock = $derived(paddingBlock ?? padding);
  const scrollTabindex = $derived(isScrollable ? tabindex ?? 0 : tabindex);
</script>

{#if isScrollable}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div
    {...rest}
    class={foundationClass('stack', className, [
      `astryx-stack--${direction}`,
      'astryx-stack--scrollable',
    ])}
    data-direction={direction}
    data-wrap={wrap}
    data-scrollable="true"
    role="region"
    tabindex={scrollTabindex}
    style={styleEntries(style, [
      ['width', formatSize(width)],
      ['height', formatSize(height)],
      ['gap', spacingVar(gap)],
      ['padding-inline', spacingVar(resolvedPaddingInline)],
      ['padding-block', spacingVar(resolvedPaddingBlock)],
      ['align-items', align],
      ['justify-content', justify === 'between' ? 'space-between' : justify === 'around' ? 'space-around' : justify === 'evenly' ? 'space-evenly' : justify],
      ['flex-wrap', wrap],
    ])}
  >
    {#if children}
      {@render children()}
    {/if}
  </div>
{:else}
<div
  {...rest}
  class={foundationClass('stack', className, [
    `astryx-stack--${direction}`,
  ])}
  data-direction={direction}
  data-wrap={wrap}
  style={styleEntries(style, [
    ['width', formatSize(width)],
    ['height', formatSize(height)],
    ['gap', spacingVar(gap)],
    ['padding-inline', spacingVar(resolvedPaddingInline)],
    ['padding-block', spacingVar(resolvedPaddingBlock)],
    ['align-items', align],
    ['justify-content', justify === 'between' ? 'space-between' : justify === 'around' ? 'space-around' : justify === 'evenly' ? 'space-evenly' : justify],
    ['flex-wrap', wrap],
  ])}
>
  {#if children}
    {@render children()}
  {/if}
</div>
{/if}
