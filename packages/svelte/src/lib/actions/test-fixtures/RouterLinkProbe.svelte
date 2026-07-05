<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file RouterLinkProbe.svelte
   * @input Link-like props from LinkProvider
   * @output Anchor tagged as a router-provided link for package tests
   * @position Test fixture for custom link provider parity
   */

  import type {Snippet} from 'svelte';
  import type {HTMLAnchorAttributes} from 'svelte/elements';

  type Props = HTMLAnchorAttributes & {
    readonly children?: Snippet;
    readonly to?: string;
  };

  let {children, to = undefined, ...rest}: Props = $props();
</script>

<a {...rest} data-router-link="true" data-to={to}>
  {#if children}
    {@render children()}
  {/if}
</a>
