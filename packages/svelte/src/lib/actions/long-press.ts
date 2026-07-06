// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file long-press.ts
 * @input Touch events and long-press timing options
 * @output Svelte action that invokes a point callback after a stable touch hold
 * @position Shared accessibility action for touch context-menu and press-and-hold surfaces
 */

export type LongPressPoint = {
  readonly x: number;
  readonly y: number;
};

export type LongPressOptions = {
  readonly onLongPress: (point: LongPressPoint) => void;
  readonly disabled?: boolean;
  readonly delayMs?: number;
  readonly moveCancelPx?: number;
};

type ActionReturn = {
  readonly update: (next: LongPressOptions) => void;
  readonly destroy: () => void;
};

const DEFAULT_DELAY_MS = 500;
const DEFAULT_MOVE_CANCEL_PX = 10;

export function longPress(node: HTMLElement, options: LongPressOptions): ActionReturn {
  let current = options;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let start: LongPressPoint | null = null;

  function clear(): void {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
    start = null;
  }

  function handleTouchStart(event: TouchEvent): void {
    if (current.disabled === true || event.touches.length !== 1) {
      return;
    }
    const touch = event.touches[0];
    if (touch == null) {
      return;
    }

    clear();
    start = {x: touch.clientX, y: touch.clientY};
    timer = setTimeout(() => {
      if (start != null) {
        current.onLongPress({x: start.x, y: start.y});
      }
    }, current.delayMs ?? DEFAULT_DELAY_MS);
  }

  function handleTouchMove(event: TouchEvent): void {
    if (start == null || event.touches.length !== 1) {
      return;
    }
    const touch = event.touches[0];
    if (touch == null) {
      return;
    }

    const moveCancelPx = current.moveCancelPx ?? DEFAULT_MOVE_CANCEL_PX;
    if (
      Math.abs(touch.clientX - start.x) > moveCancelPx ||
      Math.abs(touch.clientY - start.y) > moveCancelPx
    ) {
      clear();
    }
  }

  node.addEventListener('touchstart', handleTouchStart);
  node.addEventListener('touchmove', handleTouchMove);
  node.addEventListener('touchend', clear);
  node.addEventListener('touchcancel', clear);

  return {
    update(next) {
      current = next;
    },
    destroy() {
      clear();
      node.removeEventListener('touchstart', handleTouchStart);
      node.removeEventListener('touchmove', handleTouchMove);
      node.removeEventListener('touchend', clear);
      node.removeEventListener('touchcancel', clear);
    },
  };
}
