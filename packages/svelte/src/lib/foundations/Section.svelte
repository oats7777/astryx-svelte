<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Section.svelte
   * @input Section variant, child snippet, and section attributes
   * @output Themed section container
   * @position Svelte port of core Section
   */

  import type {Snippet} from 'svelte';
  import type {HTMLAttributes} from 'svelte/elements';
  import {foundationClass} from './types.js';

  export type SectionVariant = 'section' | 'surface' | 'transparent';
  type Props = HTMLAttributes<HTMLElement> & {
    readonly variant?: SectionVariant;
    readonly children?: Snippet;
  };

  let {variant = 'section', children, class: className, ...rest}: Props = $props();
</script>

<section
  {...rest}
  class={foundationClass('section', className, [`astryx-section--variant-${variant}`])}
  data-variant={variant}
>
  {#if children}
    {@render children()}
  {/if}
</section>
