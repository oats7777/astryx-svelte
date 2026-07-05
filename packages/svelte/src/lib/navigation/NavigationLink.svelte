<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file NavigationLink.svelte
   * @input Navigation href, label, classes, DOM attributes, and children snippet
   * @output Provider-aware link element for navigation components
   * @position Shared navigation adapter for LinkProvider router integration
   */

  import type {Snippet} from 'svelte';
  import type {HTMLAnchorAttributes} from 'svelte/elements';
  import {getLinkProviderValue} from '../actions/link-context.js';

  type Props = HTMLAnchorAttributes & {
    readonly children?: Snippet;
    readonly href: string;
    readonly label?: string;
    readonly onClick?: (event: MouseEvent) => void;
    readonly onclick?: (event: MouseEvent) => void;
  };

  let {
    children = undefined,
    href,
    label = undefined,
    onClick = undefined,
    onclick = undefined,
    ...rest
  }: Props = $props();

  const provider = getLinkProviderValue();
  const CustomLink = $derived(provider?.component);
  const clickHandler = $derived(onclick ?? onClick);
</script>

{#if CustomLink}
  <CustomLink {...rest} {href} to={href} aria-label={label} onclick={clickHandler}>
    {#if children}
      {@render children()}
    {/if}
  </CustomLink>
{:else}
  <a {...rest} {href} aria-label={label} onclick={clickHandler}>
    {#if children}
      {@render children()}
    {/if}
  </a>
{/if}
