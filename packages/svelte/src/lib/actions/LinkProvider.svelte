<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file LinkProvider.svelte
   * @input Svelte router-compatible link component and children snippet
   * @output Context provider for custom link rendering
   * @position Svelte equivalent of core LinkProvider
   */

  import type {Snippet} from 'svelte';
  import type {LinkComponent} from './action-utils.js';
  import {setLinkProviderValue} from './link-context.js';

  type Props = {
    readonly component: LinkComponent;
    readonly children?: Snippet;
  };

  let {component, children}: Props = $props();
  setLinkProviderValue({
    get component() {
      return component;
    },
  });
</script>

{#if children}
  {@render children()}
{/if}
