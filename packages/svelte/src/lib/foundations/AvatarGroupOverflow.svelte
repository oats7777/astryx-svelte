<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file AvatarGroupOverflow.svelte
   * @input Overflow count and optional custom child snippet
   * @output AvatarGroup overflow count badge
   * @position Svelte port of core AvatarGroupOverflow
   */

  import type {Snippet} from 'svelte';
  import type {HTMLAttributes} from 'svelte/elements';
  import {getAvatarGroup, resolveAvatarSize} from './avatar-context.js';
  import {foundationClass, styleEntries} from './types.js';

  type Props = Omit<HTMLAttributes<HTMLElement>, 'onclick'> & {
    readonly count: number;
    readonly children?: Snippet;
    readonly onClick?: (event: MouseEvent) => void;
    readonly onclick?: (event: MouseEvent) => void;
  };

  let {
    count,
    children,
    class: className,
    style,
    onClick = undefined,
    onclick = undefined,
    ...rest
  }: Props = $props();
  const group = getAvatarGroup();
  const resolvedSize = $derived(resolveAvatarSize(group?.size ?? 'small'));
  const clickHandler = $derived(onclick ?? onClick);
</script>

{#if clickHandler}
  <button
    {...rest}
    type="button"
    onclick={clickHandler}
    class={foundationClass('avatar-group-overflow', className)}
    aria-label={`${count} more`}
    style={styleEntries(style, [['--astryx-avatar-size', `${resolvedSize}px`]])}
  >
    {#if children}
      {@render children()}
    {:else}
      +{count}
    {/if}
  </button>
{:else}
  <div
    {...rest}
    class={foundationClass('avatar-group-overflow', className)}
    aria-label={`${count} more`}
    style={styleEntries(style, [['--astryx-avatar-size', `${resolvedSize}px`]])}
  >
    {#if children}
      {@render children()}
    {:else}
      +{count}
    {/if}
  </div>
{/if}
