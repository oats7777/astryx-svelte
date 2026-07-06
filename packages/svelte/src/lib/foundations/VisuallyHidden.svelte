<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file VisuallyHidden.svelte
   * @input Rendered element name, children snippet, and accessibility attributes
   * @output Content exposed to assistive technology while visually clipped
   * @position Svelte foundation accessibility primitive matching core VisuallyHidden
   */

  import type {Snippet} from 'svelte';
  import type {HTMLAttributes} from 'svelte/elements';

  type Props = Omit<HTMLAttributes<HTMLElement>, 'class' | 'style'> & {
    readonly as?: keyof HTMLElementTagNameMap;
    readonly children?: Snippet;
  };

  let {as = 'span', children, ...rest}: Props = $props();
</script>

<svelte:element this={as} {...rest} class="astryx-sr-only">
  {#if children}
    {@render children()}
  {/if}
</svelte:element>
