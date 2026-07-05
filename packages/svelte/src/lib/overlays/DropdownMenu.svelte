<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file DropdownMenu.svelte
   * @input Menu button label, item data, controlled open state, and selection callbacks
   * @output Anchored menu button and keyboard-operable menu layer
   * @position Svelte DropdownMenu port for Todo 11
   */

  import {onDestroy, tick} from 'svelte';
  import Layer from './Layer.svelte';
  import type {LayerPlacement, MenuItem} from './types.js';

  let {
    buttonLabel = 'Menu',
    items = [],
    open = undefined,
    placement = 'below',
    onOpenChange = () => {},
    'data-testid': testId = undefined,
  } = $props<{
    readonly buttonLabel?: string;
    readonly items?: readonly MenuItem[];
    readonly open?: boolean;
    readonly placement?: LayerPlacement;
    readonly onOpenChange?: (open: boolean) => void;
    readonly 'data-testid'?: string;
  }>();

  let trigger = $state<HTMLElement>();
  let menu = $state<HTMLElement>();
  let localOpen = $state(false);
  let typeaheadBuffer = '';
  let typeaheadTimer: ReturnType<typeof setTimeout> | undefined;
  const isOpen = $derived(open ?? localOpen);

  const TYPEAHEAD_RESET_MS = 750;

  function setOpen(next: boolean): void {
    if (open === undefined) {
      localOpen = next;
    }
    onOpenChange(next);
  }

  async function focusFirstItem(): Promise<void> {
    await tick();
    menu?.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')?.focus();
  }

  async function toggle(): Promise<void> {
    const next = !isOpen;
    setOpen(next);
    if (next) {
      await focusFirstItem();
    }
  }

  function close(): void {
    setOpen(false);
    clearTypeahead();
    trigger?.focus();
  }

  function activate(item: MenuItem): void {
    if (item.type === 'divider' || item.disabled === true) {
      return;
    }
    item.onSelect?.(item.value);
    close();
  }

  function menuItems(): readonly HTMLElement[] {
    return Array.from(
      menu?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? [],
    );
  }

  function clearTypeahead(): void {
    typeaheadBuffer = '';
    if (typeaheadTimer == null) {
      return;
    }
    clearTimeout(typeaheadTimer);
    typeaheadTimer = undefined;
  }

  function scheduleTypeaheadReset(): void {
    if (typeaheadTimer != null) {
      clearTimeout(typeaheadTimer);
    }
    typeaheadTimer = setTimeout(() => {
      typeaheadBuffer = '';
      typeaheadTimer = undefined;
    }, TYPEAHEAD_RESET_MS);
  }

  function handleTypeahead(event: KeyboardEvent, items: readonly HTMLElement[], index: number): boolean {
    const spaceMidType = event.key === ' ' && typeaheadBuffer.length > 0;
    const printable = event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey && event.key !== ' ';
    if (!printable && !spaceMidType) {
      return false;
    }
    const char = event.key.toLowerCase();
    const repeatsSameCharacter =
      typeaheadBuffer.length > 0 && Array.from(typeaheadBuffer).every(bufferChar => bufferChar === char);
    const nextBuffer = repeatsSameCharacter ? char : `${typeaheadBuffer}${char}`;
    typeaheadBuffer = nextBuffer;
    scheduleTypeaheadReset();
    const start = index >= 0 ? index : -1;
    const offset = repeatsSameCharacter ? 1 : 0;
    for (let step = 0; step < items.length; step += 1) {
      const nextIndex = (start + offset + step + items.length) % items.length;
      const candidate = items[nextIndex];
      if (candidate?.textContent?.trim().toLowerCase().startsWith(nextBuffer) === true) {
        candidate.focus();
        return true;
      }
    }
    return true;
  }

  function handleMenuKeydown(event: KeyboardEvent): void {
    const items = menuItems();
    const index = items.findIndex(item => item === document.activeElement);
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'Tab') {
      close();
    } else if (handleTypeahead(event, items, index)) {
      event.preventDefault();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      items[Math.min(index + 1, items.length - 1)]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      items[Math.max(index - 1, 0)]?.focus();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const activeElement = document.activeElement;
      if (activeElement instanceof HTMLElement) {
        activeElement.click();
      }
    }
  }

  onDestroy(clearTypeahead);
</script>

<span class="astryx-menu-trigger" data-testid={testId}>
  <button
    bind:this={trigger}
    type="button"
    aria-haspopup="menu"
    aria-expanded={isOpen}
    onclick={() => void toggle()}
  >
    {buttonLabel}
  </button>
</span>

<Layer open={isOpen} anchor={trigger} {placement} alignment="start" overlay="dropdown-menu">
  <div
    bind:this={menu}
    class="astryx-menu"
    role="menu"
    aria-label={buttonLabel}
    tabindex="-1"
    onkeydown={handleMenuKeydown}
  >
    {#each items as item}
      {#if item.type === 'divider'}
        <div class="astryx-menu-divider" role="separator"></div>
      {:else}
        <button
          type="button"
          role="menuitem"
          aria-disabled={item.disabled === true}
          disabled={item.disabled === true}
          onclick={() => activate(item)}
        >
          {item.label}
        </button>
      {/if}
    {/each}
  </div>
</Layer>
