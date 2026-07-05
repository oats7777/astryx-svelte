<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file NavMenu.svelte
   * @input Menu label, item collection, selected value, and selection callback
   * @output Keyboard-operable menu button and role="menu" item list
   * @position Todo 12 navigation menu primitive
   */

  import {tick} from 'svelte';
  import {cx, nextNavigationId} from './navigation-utils.js';
  import type {MenuItemModel} from './types.js';

  let {
    id = nextNavigationId('nav-menu'),
    label,
    items = [],
    onSelect = undefined,
  } = $props<{
    readonly id?: string;
    readonly label: string;
    readonly items?: readonly MenuItemModel[];
    readonly onSelect?: (value: string) => void;
  }>();

  let trigger = $state<HTMLButtonElement>();
  let menu = $state<HTMLElement>();
  let open = $state(false);

  const menuClass = cx(
    'mt-1 min-w-44 rounded-md border border-[var(--color-border)] bg-[var(--color-background-surface)] p-1 shadow-lg',
  );

  function enabledMenuItems(): readonly HTMLElement[] {
    return [...(menu?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])].filter(
      (item) => item.getAttribute('aria-disabled') !== 'true',
    );
  }

  async function focusFirstItem(): Promise<void> {
    await tick();
    enabledMenuItems()[0]?.focus();
  }

  function close(): void {
    open = false;
    trigger?.focus();
  }

  function choose(item: MenuItemModel): void {
    if (item.disabled === true) {
      return;
    }
    onSelect?.(item.value);
    close();
  }

  async function toggle(): Promise<void> {
    open = !open;
    if (open) {
      await focusFirstItem();
    }
  }

  function moveFocus(event: KeyboardEvent, direction: number): void {
    event.preventDefault();
    const enabled = enabledMenuItems();
    const index = Math.max(0, enabled.findIndex((item) => item === document.activeElement));
    enabled[(index + direction + enabled.length) % enabled.length]?.focus();
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === 'ArrowDown') {
      moveFocus(event, 1);
      return;
    }
    if (event.key === 'ArrowUp') {
      moveFocus(event, -1);
      return;
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const enabled = enabledMenuItems();
      enabled[event.key === 'Home' ? 0 : enabled.length - 1]?.focus();
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.click();
      }
    }
  }
</script>

<span class="relative inline-flex">
  <button
    bind:this={trigger}
    type="button"
    class="inline-flex min-h-9 items-center rounded-md px-3 text-sm font-medium"
    aria-haspopup="menu"
    aria-expanded={open ? 'true' : 'false'}
    aria-controls={id}
    onclick={() => void toggle()}
  >
    {label}
  </button>
  {#if open}
    <div bind:this={menu} id={id} class={menuClass} role="menu" aria-label={label} tabindex="-1" onkeydown={handleKeydown}>
      {#each items as item}
        <button
          type="button"
          role="menuitem"
          class="flex min-h-8 w-full items-center rounded px-2 text-left text-sm"
          aria-disabled={item.disabled ? 'true' : undefined}
          disabled={item.disabled}
          data-value={item.value}
          onclick={() => choose(item)}
        >
          {item.label}
        </button>
      {/each}
    </div>
  {/if}
</span>
