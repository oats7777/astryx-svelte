// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file focus-trap.ts
 * @input HTMLElement nodes and active overlay dismissal options
 * @output Svelte action for stack-owned modal and top-layer keyboard focus management
 * @position Shared focus action for Todo 11 overlay components
 */

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, audio[controls], video[controls], [contenteditable]:not([contenteditable="false"]), details > summary:first-of-type, [tabindex]:not([tabindex="-1"]):not([disabled])';
type FocusTrapOptions = {
  readonly active: boolean;
  readonly onEscape?: () => void;
  readonly dialogDepth?: number;
};

type LayerRegistration = {
  readonly node: HTMLElement;
  close?: () => void;
  dialogDepth?: number;
};

const layerStack: LayerRegistration[] = [];
export const FOCUS_LAYER_DEPTH_CONTEXT = Symbol('astryx-focus-layer-depth');

function visibleFocusableElements(node: HTMLElement): readonly HTMLElement[] {
  return Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    element =>
      !element.hasAttribute('inert') &&
      element.closest('[inert]') == null &&
      !element.hidden &&
      element.closest('[hidden]') == null &&
      !element.hasAttribute('hidden') &&
      element.getAttribute('aria-hidden') !== 'true' &&
      window.getComputedStyle(element).visibility !== 'hidden' &&
      window.getComputedStyle(element).display !== 'none',
  );
}

function focusFirst(node: HTMLElement): void {
  const first = visibleFocusableElements(node)[0] ?? node;
  first.focus();
}

function focusLast(node: HTMLElement): void {
  const focusable = visibleFocusableElements(node);
  const last = focusable[focusable.length - 1] ?? node;
  last.focus();
}

function removeLayer(node: HTMLElement): void {
  const index = layerStack.findIndex(layer => layer.node === node);
  if (index >= 0) {
    layerStack.splice(index, 1);
  }
}

function shouldDeferFocusHandling(node: HTMLElement): boolean {
  return topLayerNode() !== node;
}

export function topLayerNode(): HTMLElement | undefined {
  const topNonDialogLayer = layerStack.reduce<LayerRegistration | undefined>((topLayer, layer) => {
    if (layer.dialogDepth != null) {
      return topLayer;
    }
    return layer;
  }, undefined);
  if (topNonDialogLayer != null) {
    return topNonDialogLayer.node;
  }
  return layerStack.reduce<LayerRegistration | undefined>((topDialog, layer) => {
    if (layer.dialogDepth == null) {
      return topDialog;
    }
    if (topDialog == null || layer.dialogDepth >= (topDialog.dialogDepth ?? -1)) {
      return layer;
    }
    return topDialog;
  }, undefined)?.node;
}

export function isTopFocusLayer(node: HTMLElement | undefined): boolean {
  return node != null && topLayerNode() === node;
}

export function closeTopLayer(): boolean {
  const node = topLayerNode();
  const layer = layerStack.find(registration => registration.node === node);
  if (layer?.close == null) {
    return false;
  }
  layer.close();
  return true;
}

export function isImeKeyEvent(event: {readonly isComposing?: boolean; readonly keyCode?: number}): boolean {
  return event.isComposing === true || event.keyCode === 229;
}

export function focusTrap(
  node: HTMLElement,
  options: FocusTrapOptions,
): {update: (next: FocusTrapOptions) => void; destroy: () => void} {
  let current = options;
  let focusFrame: number | undefined;

  function cancelPendingFocus(): void {
    if (focusFrame == null) {
      return;
    }
    cancelAnimationFrame(focusFrame);
    focusFrame = undefined;
  }

  function syncLayer(): void {
    if (!current.active) {
      removeLayer(node);
      node.removeAttribute('data-astryx-focus-layer');
      cancelPendingFocus();
      return;
    }
    const index = layerStack.findIndex(layer => layer.node === node);
    node.setAttribute('data-astryx-focus-layer', 'true');
    if (index >= 0) {
      layerStack[index].close = current.onEscape;
      layerStack[index].dialogDepth = current.dialogDepth;
      return;
    }
    layerStack.push({node, close: current.onEscape, dialogDepth: current.dialogDepth});
    cancelPendingFocus();
    focusFrame = requestAnimationFrame(() => {
      focusFrame = undefined;
      if (topLayerNode() === node) {
        focusFirst(node);
      }
    });
  }

  function handleFocus(event: FocusEvent): void {
    if (!current.active || shouldDeferFocusHandling(node)) {
      return;
    }
    const target = event.target;
    if (target instanceof Node && node.contains(target)) {
      return;
    }
    focusFirst(node);
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (!current.active || shouldDeferFocusHandling(node)) {
      return;
    }
    if (event.key === 'Escape') {
      if (isImeKeyEvent(event)) {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      current.onEscape?.();
      return;
    }
    if (event.key !== 'Tab') {
      return;
    }
    const focusable = visibleFocusableElements(node);
    if (focusable.length === 0) {
      event.preventDefault();
      node.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      focusLast(node);
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      focusFirst(node);
    }
  }

  document.addEventListener('focusin', handleFocus);
  document.addEventListener('keydown', handleKeydown);
  syncLayer();

  return {
    update(next) {
      current = next;
      syncLayer();
    },
    destroy() {
      removeLayer(node);
      node.removeAttribute('data-astryx-focus-layer');
      cancelPendingFocus();
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('keydown', handleKeydown);
    },
  };
}
