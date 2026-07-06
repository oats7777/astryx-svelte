<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file PowerSearchFilterEditor.svelte
   * @input PowerSearch suggestion list state
   * @output Accessible field/operator suggestion surface
   * @position Todo 10 PowerSearch filter editor subcomponent
   */

  import type {PowerSearchItem} from './power-search-types.js';

  let {
    listboxId,
    label,
    suggestions,
    activeIndex,
    onChoose,
    onHover,
  }: {
    readonly listboxId: string;
    readonly label: string;
    readonly suggestions: readonly PowerSearchItem[];
    readonly activeIndex: number;
    readonly onChoose: (item: PowerSearchItem) => void;
    readonly onHover: (index: number) => void;
  } = $props();
</script>

<div id={listboxId} role="listbox" class="astryx-power-search__listbox" aria-label={`${label} suggestions`}>
  {#each suggestions as item, index}
    <button
      id={`${listboxId}-option-${index}`}
      type="button"
      role="option"
      aria-selected={activeIndex === index ? 'true' : 'false'}
      onclick={() => onChoose(item)}
      onmouseenter={() => onHover(index)}
    >
      {item.label}
    </button>
  {/each}
</div>

<style>
  .astryx-power-search__listbox {
    background: var(--color-background-surface);
    border: var(--border-width) solid var(--color-border);
    border-radius: var(--radius-container);
    box-shadow: var(--shadow-overlay);
    color: var(--color-text-primary);
    display: grid;
    font-family: var(--font-family-body);
    padding: var(--spacing-2);
  }

  .astryx-power-search__listbox button {
    background: transparent;
    border: 0;
    color: inherit;
    cursor: pointer;
    font: inherit;
    padding: var(--spacing-2);
  }

  .astryx-power-search__listbox [aria-selected="true"] {
    background: var(--color-background-muted);
  }
</style>
