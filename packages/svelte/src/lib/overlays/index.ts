// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Svelte overlay components and shared actions
 * @output Public overlay family exports for @astryxdesign/svelte
 * @position Todo 11 overlay package barrel
 */

export {default as AlertDialog} from './AlertDialog.svelte';
export {default as ContextMenu} from './ContextMenu.svelte';
export {default as Dialog} from './Dialog.svelte';
export {default as DropdownMenu} from './DropdownMenu.svelte';
export {default as HoverCard} from './HoverCard.svelte';
export {default as Layer} from './Layer.svelte';
export {default as MoreMenu} from './MoreMenu.svelte';
export {default as Overlay} from './Overlay.svelte';
export {default as Popover} from './Popover.svelte';
export {default as Toast} from './Toast.svelte';
export {default as ToastViewport} from './ToastViewport.svelte';
export {default as Tooltip} from './Tooltip.svelte';
export {closeTopLayer, focusTrap, isTopFocusLayer, topLayerNode} from './focus-trap.js';
export {portal} from './portal.js';
export {scrollLock} from './scroll-lock.js';
export {toastStore} from './toast-store.js';
export type {
  DialogPurpose,
  LayerAlignment,
  LayerPlacement,
  MenuItem,
  ToastEntry,
  ToastOptions,
  ToastType,
} from './types.js';
