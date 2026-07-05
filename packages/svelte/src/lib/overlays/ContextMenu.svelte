<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file ContextMenu.svelte
   * @input Context menu target snippet and item data
   * @output Fixed-position context menu with scoped keyboard dismissal
   * @position Svelte ContextMenu port for Todo 11
   */

  import {tick, type Snippet} from 'svelte';
  import Layer from './Layer.svelte';
  import type {MenuItem} from './types.js';

  const LONG_PRESS_DELAY_MS = 500;
  const LONG_PRESS_MOVE_CANCEL_PX = 10;

  let {
    items = [],
    children,
    'data-testid': testId = undefined,
  } = $props<{
    readonly items?: readonly MenuItem[];
    readonly children?: Snippet;
    readonly 'data-testid'?: string;
  }>();

  let open = $state(false);
  let x = $state(0);
  let y = $state(0);
  let menu = $state<HTMLElement>();
  let previousFocus: HTMLElement | undefined;
  let longPressTimer: ReturnType<typeof setTimeout> | undefined;
  let longPressStart: {readonly x: number; readonly y: number} | undefined;

  async function focusFirstItem(): Promise<void> {
    await tick();
    menu?.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')?.focus();
  }

  function clearLongPress(): void {
    if (longPressTimer != null) {
      clearTimeout(longPressTimer);
      longPressTimer = undefined;
    }
    longPressStart = undefined;
  }

  function openAt(nextX: number, nextY: number, restoreFocus: HTMLElement | undefined): void {
    previousFocus = restoreFocus ?? (document.activeElement instanceof HTMLElement ? document.activeElement : undefined);
    x = nextX;
    y = nextY;
    open = true;
    void focusFirstItem();
  }

  function close(): void {
    open = false;
    const focusTarget = previousFocus;
    previousFocus = undefined;
    void tick().then(() => {
      focusTarget?.focus();
    });
  }

  function handleContextMenu(event: MouseEvent): void {
    event.preventDefault();
    const restoreFocus = event.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
    const keyboardInvoked = event.clientX === 0 && event.clientY === 0 && event.detail === 0;
    if (keyboardInvoked && event.currentTarget instanceof HTMLElement) {
      const rect = event.currentTarget.getBoundingClientRect();
      openAt(rect.left, rect.bottom, restoreFocus);
      return;
    }
    openAt(event.clientX, event.clientY, restoreFocus);
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey)) {
      event.preventDefault();
      if (event.currentTarget instanceof HTMLElement) {
        const rect = event.currentTarget.getBoundingClientRect();
        openAt(rect.left, rect.bottom, event.currentTarget);
      }
    }
  }

  function handleTouchStart(event: TouchEvent): void {
    if (event.touches.length !== 1) {
      return;
    }
    const touch = event.touches[0];
    if (touch == null) {
      return;
    }
    clearLongPress();
    longPressStart = {x: touch.clientX, y: touch.clientY};
    const restoreFocus = event.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
    longPressTimer = setTimeout(() => {
      const point = longPressStart;
      if (point == null) {
        return;
      }
      longPressTimer = undefined;
      openAt(point.x, point.y, restoreFocus);
    }, LONG_PRESS_DELAY_MS);
  }

  function handleTouchMove(event: TouchEvent): void {
    const start = longPressStart;
    const touch = event.touches[0];
    if (start == null || touch == null) {
      return;
    }
    if (
      Math.abs(touch.clientX - start.x) > LONG_PRESS_MOVE_CANCEL_PX ||
      Math.abs(touch.clientY - start.y) > LONG_PRESS_MOVE_CANCEL_PX
    ) {
      clearLongPress();
    }
  }

  function activate(item: MenuItem): void {
    if (item.type === 'divider' || item.disabled === true) {
      return;
    }
    item.onSelect?.(item.value);
    close();
  }

  $effect(() => {
    return () => {
      clearLongPress();
    };
  });
</script>

<div
  data-testid={testId}
  role="button"
  tabindex="0"
  aria-haspopup="menu"
  oncontextmenu={handleContextMenu}
  onkeydown={handleKeydown}
  ontouchstart={handleTouchStart}
  ontouchmove={handleTouchMove}
  ontouchend={clearLongPress}
  ontouchcancel={clearLongPress}
>
  {#if children}
    {@render children()}
  {/if}
</div>

<Layer {open} {x} {y} trapFocus onEscape={close} overlay="context-menu">
  <div bind:this={menu} class="astryx-menu" role="menu" aria-label="Context menu" tabindex="-1">
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
