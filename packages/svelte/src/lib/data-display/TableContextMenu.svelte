<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file TableContextMenu.svelte
   * @input Open table context-menu model and action callback
   * @output Svelte menu for plugin-contributed table context actions
   * @position Extracted Todo 8 context-menu renderer for Table.svelte
   */

  import type {TableContextAction} from './types.js';

  let {
    actions,
    x,
    y,
    onSelect,
  }: {
    readonly actions: readonly TableContextAction[];
    readonly x: number;
    readonly y: number;
    readonly onSelect: (action: TableContextAction) => void;
  } = $props();
</script>

<div
  role="menu"
  aria-label="Table context menu"
  class="astryx-table-context-menu"
  style={`left: ${x}px; top: ${y}px`}
>
  {#each actions as action (action.id)}
    <button
      type="button"
      role="menuitem"
      data-action-id={action.id}
      aria-disabled={action.disabled ? 'true' : undefined}
      data-checked={action.checked ? 'true' : undefined}
      disabled={action.disabled}
      onclick={() => onSelect(action)}
    >
      {action.label}
    </button>
  {/each}
</div>

<style>
  .astryx-table-context-menu {
    background: var(--color-background-surface);
    border: var(--border-width) solid var(--color-border);
    border-radius: var(--radius-element);
    box-shadow: var(--shadow-lg);
    display: grid;
    min-inline-size: 12rem;
    padding: var(--spacing-1);
    position: fixed;
    z-index: var(--z-index-popover, 1000);
  }

  .astryx-table-context-menu button {
    background: transparent;
    border: 0;
    color: var(--color-text-primary);
    font: inherit;
    padding: var(--spacing-2);
    text-align: start;
  }

  .astryx-table-context-menu button:disabled {
    color: var(--color-text-disabled);
  }
</style>
