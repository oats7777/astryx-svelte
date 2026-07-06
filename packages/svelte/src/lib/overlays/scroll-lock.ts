// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file scroll-lock.ts
 * @input Active modal overlay state
 * @output Body scroll lock Svelte action with restoration
 * @position Shared scroll action for Dialog and AlertDialog
 */

type Snapshot = {
  readonly overflow: string;
  readonly position: string;
  readonly top: string;
  readonly left: string;
  readonly right: string;
  readonly scrollX: number;
  readonly scrollY: number;
};

let locks = 0;
let snapshot: Snapshot | undefined;

function lock(): void {
  if (locks === 0) {
    snapshot = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    };
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${snapshot.scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
  }
  locks += 1;
}

function unlock(): void {
  locks = Math.max(0, locks - 1);
  if (locks > 0 || snapshot == null) {
    return;
  }
  document.body.style.overflow = snapshot.overflow;
  document.body.style.position = snapshot.position;
  document.body.style.top = snapshot.top;
  document.body.style.left = snapshot.left;
  document.body.style.right = snapshot.right;
  window.scrollTo(snapshot.scrollX, snapshot.scrollY);
  snapshot = undefined;
}

export function scrollLock(
  _node: HTMLElement,
  active: boolean,
): {update: (next: boolean) => void; destroy: () => void} {
  let isLocked = false;
  function sync(next: boolean): void {
    if (next === isLocked) {
      return;
    }
    isLocked = next;
    if (isLocked) {
      lock();
    } else {
      unlock();
    }
  }
  sync(active);
  return {
    update: sync,
    destroy() {
      if (isLocked) {
        unlock();
      }
    },
  };
}
