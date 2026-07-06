<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file ButtonContent.svelte
   * @input Button icon, label, loading, and auxiliary content snippets
   * @output Shared inner content for Button render variants
   * @position Private Button presentation helper for the actions family
   */

  import type {Snippet} from 'svelte';

  type Props = {
    readonly children?: Snippet;
    readonly endContent?: Snippet;
    readonly iconSnippet?: Snippet;
    readonly iconText?: string;
    readonly isIconOnly: boolean;
    readonly isLoading?: boolean;
    readonly label: string;
  };

  let {
    children = undefined,
    endContent = undefined,
    iconSnippet = undefined,
    iconText = undefined,
    isIconOnly,
    isLoading = false,
    label,
  }: Props = $props();
</script>

{#if isLoading}
  <span class="astryx-button__spinner" aria-hidden="true"></span>
{/if}
{#if iconSnippet}
  <span class="astryx-button__icon">{@render iconSnippet()}</span>
{:else if iconText}
  <span class="astryx-button__icon" aria-hidden="true">{iconText}</span>
{/if}
{#if !isIconOnly}
  <span class="astryx-button__label">
    {#if children}
      {@render children()}
    {:else}
      {label}
    {/if}
  </span>
{/if}
{#if endContent && !isIconOnly}
  <span class="astryx-button__end">{@render endContent()}</span>
{/if}
