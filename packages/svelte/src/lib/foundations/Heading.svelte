<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Heading.svelte
   * @input Heading level, type, child snippet, and heading attributes
   * @output Semantic heading with design-system text classes
   * @position Svelte port of core Heading
   */

  import type {Snippet} from 'svelte';
  import type {HTMLAttributes} from 'svelte/elements';
  import {foundationClass} from './types.js';

  export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
  export type HeadingType = 'display-1' | 'display-2' | 'display-3' | 'title' | 'subtitle';
  type Props = HTMLAttributes<HTMLHeadingElement> & {
    readonly level?: HeadingLevel;
    readonly type?: HeadingType;
    readonly children?: Snippet;
  };

  let {level = 2, type = 'display-2', children, class: className, ...rest}: Props = $props();
  const tag = $derived(`h${level}`);
</script>

<svelte:element
  this={tag}
  {...rest}
  class={foundationClass('heading', className, [`astryx-heading--type-${type}`])}
  data-level={level}
  data-type={type}
>
  {#if children}
    {@render children()}
  {/if}
</svelte:element>
