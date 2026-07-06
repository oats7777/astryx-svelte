<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Banner.svelte
   * @input Status, title, description, actions, and expandable content snippets
   * @output Accessible Svelte banner with React-parity status hooks
   * @position Svelte port of core Banner for foundations
   */

  import type {Snippet} from 'svelte';
  import type {HTMLAttributes} from 'svelte/elements';
  import {foundationClass} from './types.js';

  export type BannerStatus = 'info' | 'success' | 'warning' | 'error' | 'neutral';
  type Props = HTMLAttributes<HTMLDivElement> & {
    readonly status?: BannerStatus;
    readonly title: string;
    readonly description?: string;
    readonly defaultIsExpanded?: boolean;
    readonly actions?: Snippet;
    readonly children?: Snippet;
  };

  let {
    status = 'info',
    title,
    description,
    defaultIsExpanded = false,
    actions,
    children,
    class: className,
    ...rest
  }: Props = $props();
  let isExpanded = $state(false);
  const role = $derived(status === 'error' || status === 'warning' ? 'alert' : 'status');

  $effect.pre(() => {
    isExpanded = defaultIsExpanded;
  });
</script>

<div
  {...rest}
  class={foundationClass('banner', className, [`astryx-banner--status-${status}`])}
  data-status={status}
  {role}
>
  <div class="astryx-banner__body">
    <strong class="astryx-banner__title">{title}</strong>
    {#if description}
      <div class="astryx-banner__description">{description}</div>
    {/if}
  </div>
  {#if actions}
    <div class="astryx-banner__actions">{@render actions()}</div>
  {/if}
  {#if children}
    <button class="astryx-banner__toggle" type="button" aria-expanded={isExpanded} onclick={() => (isExpanded = !isExpanded)}>
      {isExpanded ? 'Collapse' : 'Expand'}
    </button>
    {#if isExpanded}
      <div class="astryx-banner__content">{@render children()}</div>
    {/if}
  {/if}
</div>
