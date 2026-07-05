<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file PowerSearchValueEditor.svelte
   * @input Operator value definition and current filter value
   * @output Accessible value editor surface
   * @position Todo 10 PowerSearch value editor subcomponent
   */

  import type {PowerSearchEnumItem} from './power-search-types.js';

  let {
    fieldLabel,
    values,
    activeIndex,
    onKeydown,
    onSave,
  }: {
    readonly fieldLabel: string;
    readonly values: readonly PowerSearchEnumItem[];
    readonly activeIndex: number;
    readonly onKeydown: (event: KeyboardEvent) => void;
    readonly onSave: (index: number) => void;
  } = $props();
</script>

<div role="dialog" aria-label="Edit filter" class="astryx-power-search__dialog">
  <p>{fieldLabel}</p>
  <div role="listbox" aria-label="Filter value" tabindex="0" onkeydown={onKeydown}>
    {#each values as value, index}
      <button
        type="button"
        role="option"
        aria-selected={activeIndex === index ? 'true' : 'false'}
        onclick={() => onSave(index)}
      >
        {value.label}
      </button>
    {/each}
  </div>
</div>

<style>
  .astryx-power-search__dialog {
    background: var(--color-background-surface);
    border: var(--border-width) solid var(--color-border);
    border-radius: var(--radius-container);
    box-shadow: var(--shadow-overlay);
    color: var(--color-text-primary);
    display: grid;
    font-family: var(--font-family-body);
    padding: var(--spacing-2);
  }

  .astryx-power-search__dialog button {
    background: transparent;
    border: 0;
    color: inherit;
    cursor: pointer;
    font: inherit;
    padding: var(--spacing-2);
  }

  .astryx-power-search__dialog [aria-selected="true"] {
    background: var(--color-background-muted);
  }
</style>
