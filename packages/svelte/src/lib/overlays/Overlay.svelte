<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Overlay.svelte
   * @input Base content snippet, overlay snippet, open state, and label
   * @output Scrim overlay for media or card surfaces
   * @position Svelte Overlay port for Todo 11
   */

  import type {Snippet} from 'svelte';

  let {
    open = true,
    label,
    children,
    overlay,
    'data-testid': testId = undefined,
  } = $props<{
    readonly open?: boolean;
    readonly label?: string;
    readonly children?: Snippet;
    readonly overlay?: Snippet;
    readonly 'data-testid'?: string;
  }>();
</script>

<div class="astryx-overlay" data-testid={testId} data-astryx-overlay="overlay">
  {#if children}
    {@render children()}
  {/if}
  {#if open}
    <div
      data-astryx-overlay-scrim
      class="astryx-overlay-scrim"
      role={label == null ? undefined : 'group'}
      aria-label={label}
    >
      {#if overlay}
        {@render overlay()}
      {/if}
    </div>
  {/if}
</div>
