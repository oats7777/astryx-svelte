<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file NavIcon.svelte
   * @input Icon snippet or text and span attributes
   * @output Circular accent navigation icon wrapper
   * @position Svelte port of core NavIcon
   */

  import type {Snippet} from 'svelte';
  import type {HTMLAttributes} from 'svelte/elements';
  import {actionClass} from './action-utils.js';

  type Props = HTMLAttributes<HTMLSpanElement> & {
    readonly icon: Snippet | string;
  };

  let {class: className = undefined, icon, ...rest}: Props = $props();
  const iconText = $derived(typeof icon === 'string' ? icon : undefined);
  const iconSnippet = $derived(typeof icon === 'function' ? icon : undefined);
  const rootClass = $derived(actionClass('astryx-nav-icon', className));
</script>

<span {...rest} class={rootClass}>
  {#if iconSnippet}
    {@render iconSnippet()}
  {:else}
    {iconText}
  {/if}
</span>
