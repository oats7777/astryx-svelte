<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file FormLayout.svelte
   * @input Layout direction and child snippet
   * @output Semantic form layout wrapper and layout context
   * @position Svelte form layout primitive
   */

  import type {Snippet} from 'svelte';
  import {setFormLayoutDirection} from './FormLayoutContext.js';
  import type {FormLayoutDirection} from './types.js';

  let {direction = 'vertical', children = undefined, class: className = undefined} = $props<{
    readonly direction?: FormLayoutDirection;
    readonly children?: Snippet;
    readonly class?: string;
  }>();

  setFormLayoutDirection(() => direction);
</script>

<div class={['astryx-form-layout', className].filter(Boolean).join(' ')} data-direction={direction}>
  {#if children}
    {@render children()}
  {/if}
</div>
