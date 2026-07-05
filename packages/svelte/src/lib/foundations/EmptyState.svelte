<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file EmptyState.svelte
   * @input Title, description, icon, actions, variant, and child snippets
   * @output Empty state content pattern
   * @position Svelte port of core EmptyState
   */

  import type {Snippet} from 'svelte';
  import type {HTMLAttributes} from 'svelte/elements';
  import {foundationClass} from './types.js';

  export type EmptyStateVariant = 'default' | 'compact';
  type Props = HTMLAttributes<HTMLDivElement> & {
    readonly title: string;
    readonly description?: string;
    readonly variant?: EmptyStateVariant;
    readonly icon?: Snippet;
    readonly actions?: Snippet;
    readonly children?: Snippet;
  };

  let {
    title,
    description,
    variant = 'default',
    icon,
    actions,
    children,
    class: className,
    ...rest
  }: Props = $props();
</script>

<div
  {...rest}
  class={foundationClass('empty-state', className, [`astryx-empty-state--variant-${variant}`])}
  data-variant={variant}
>
  {#if icon}
    <div class="astryx-empty-state__icon">{@render icon()}</div>
  {/if}
  <div class="astryx-empty-state__title">{title}</div>
  {#if description}
    <p class="astryx-empty-state__description">{description}</p>
  {/if}
  {#if children}
    <div class="astryx-empty-state__body">{@render children()}</div>
  {/if}
  {#if actions}
    <div class="astryx-empty-state__actions">{@render actions()}</div>
  {/if}
</div>
