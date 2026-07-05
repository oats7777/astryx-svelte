<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Toolbar.svelte
   * @input Toolbar label, orientation, action collection, and selection callback
   * @output Toolbar role with roving keyboard focus across enabled actions
   * @position Todo 12 toolbar component
   */

  import type {ToolbarAction} from './types.js';

  let {
    label,
    orientation = 'horizontal',
    actions = [],
    onSelect = undefined,
    'data-testid': testId = undefined,
  } = $props<{
    readonly label: string;
    readonly orientation?: 'horizontal' | 'vertical';
    readonly actions?: readonly ToolbarAction[];
    readonly onSelect?: (value: string) => void;
    readonly 'data-testid'?: string;
  }>();

  let focusedValue = $state<string | undefined>(undefined);
  const enabledActions = $derived(actions.filter((action: ToolbarAction) => action.disabled !== true));
  const tabbableValue = $derived(
    enabledActions.find((action: ToolbarAction) => action.value === focusedValue)?.value ?? enabledActions[0]?.value,
  );

  function focusButton(root: HTMLElement, index: number): void {
    const buttons = [...root.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
    const button = buttons[index];
    if (button == null) {
      return;
    }
    focusedValue = button.dataset.value;
    button.focus();
  }

  function moveFocus(event: KeyboardEvent): void {
    const horizontalKey = event.key === 'ArrowRight' || event.key === 'ArrowLeft';
    const verticalKey = event.key === 'ArrowDown' || event.key === 'ArrowUp';
    if (!horizontalKey && !verticalKey && event.key !== 'Home' && event.key !== 'End') {
      return;
    }
    if (orientation === 'horizontal' && verticalKey) {
      return;
    }
    if (orientation === 'vertical' && horizontalKey) {
      return;
    }
    const root = event.currentTarget;
    if (!(root instanceof HTMLElement)) {
      return;
    }
    event.preventDefault();
    const buttons = [...root.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
    const currentIndex = Math.max(0, buttons.findIndex((button) => button === document.activeElement));
    if (event.key === 'Home') {
      focusButton(root, 0);
      return;
    }
    if (event.key === 'End') {
      focusButton(root, buttons.length - 1);
      return;
    }
    const backwards = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
    focusButton(root, (currentIndex + (backwards ? -1 : 1) + buttons.length) % buttons.length);
  }
</script>

<div
  role="toolbar"
  aria-label={label}
  aria-orientation={orientation}
  tabindex="-1"
  class={orientation === 'vertical' ? 'inline-flex flex-col gap-1' : 'inline-flex items-center gap-1'}
  data-testid={testId}
  onkeydown={moveFocus}
>
  {#each actions as action}
    <button
      type="button"
      class="rounded-md px-3 py-2 text-sm"
      data-value={action.value}
      disabled={action.disabled}
      tabindex={action.value === tabbableValue ? 0 : -1}
      onfocus={() => {
        if (action.disabled !== true) {
          focusedValue = action.value;
        }
      }}
      onclick={() => {
        if (action.disabled !== true) {
          onSelect?.(action.value);
        }
      }}
    >
      {action.label}
    </button>
  {/each}
</div>
