<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file HStack.svelte
   * @input Horizontal stack props and child snippet
   * @output Stack with horizontal direction
   * @position Svelte port of core HStack
   */

  import type {Snippet} from 'svelte';
  import type {HTMLAttributes} from 'svelte/elements';
  import Stack from './Stack.svelte';
  import type {AlignValue, JustifyValue, SizeValue, SpacingStep} from './types.js';

  type Props = HTMLAttributes<HTMLDivElement> & {
    readonly gap?: SpacingStep;
    readonly padding?: SpacingStep;
    readonly paddingInline?: SpacingStep;
    readonly paddingBlock?: SpacingStep;
    readonly isScrollable?: boolean;
    readonly width?: SizeValue;
    readonly height?: SizeValue;
    readonly align?: AlignValue;
    readonly justify?: JustifyValue;
    readonly wrap?: 'nowrap' | 'wrap';
    readonly children?: Snippet;
  };

  let {
    gap = 0,
    padding,
    paddingInline,
    paddingBlock,
    isScrollable,
    width,
    height,
    align = 'center',
    justify = 'start',
    wrap = 'nowrap',
    children,
    ...rest
  }: Props = $props();
</script>

<Stack {...rest} direction="horizontal" {gap} {padding} {paddingInline} {paddingBlock} {isScrollable} {width} {height} {align} {justify} {wrap}>
  {#snippet children()}
    {#if children}
      {@render children()}
    {/if}
  {/snippet}
</Stack>
