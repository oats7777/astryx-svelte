// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file scroll-lock.ts
 * @input Active Svelte action state for modal surfaces
 * @output Ref-counted document body scroll locking with restoration
 * @position Todo 15 shared action replacement for React useScrollLock
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

type ActionReturn = {
  readonly update: (active: boolean) => void;
  readonly destroy: () => void;
};

let lockCount = 0;
let snapshot: Snapshot | undefined;

function lock(): void {
  if (lockCount === 0) {
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
  lockCount += 1;
}

function unlock(): void {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0 || snapshot == null) {
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

export function scrollLock(_node: HTMLElement, active: boolean): ActionReturn {
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
        isLocked = false;
      }
    },
  };
}
