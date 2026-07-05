<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Grid.svelte
   * @input Column count, gap, child snippet, and div attributes
   * @output CSS-grid layout primitive
   * @position Svelte port of core Grid
   */

  import type {Snippet} from 'svelte';
  import type {HTMLAttributes} from 'svelte/elements';
  import {foundationClass, spacingVar, styleEntries, type SpacingStep} from './types.js';

  type Props = HTMLAttributes<HTMLDivElement> & {
    readonly columns?: number;
    readonly gap?: SpacingStep;
    readonly children?: Snippet;
  };

  let {columns = 1, gap = 0, children, class: className, style, ...rest}: Props = $props();
</script>

<div
  {...rest}
  class={foundationClass('grid', className)}
  data-columns={columns}
  style={styleEntries(style, [
    ['grid-template-columns', `repeat(${columns}, minmax(0, 1fr))`],
    ['gap', spacingVar(gap)],
  ])}
>
  {#if children}
    {@render children()}
  {/if}
</div>
