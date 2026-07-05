// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file toast-store.ts
 * @input Toast show options from Svelte consumers
 * @output Store-compatible toast queue and imperative show/dismiss helpers
 * @position Shared transient notification store for ToastViewport
 */

import type {ToastDismissReason, ToastEntry, ToastOptions} from './types.js';

type Subscriber = (entries: readonly ToastEntry[]) => void;
type TimerState = {
  timer: ReturnType<typeof setTimeout> | undefined;
  remaining: number;
  startedAt: number;
};

const DEFAULT_AUTO_HIDE_DURATION = 5000;

let toastId = 0;

function createToastStore() {
  let entries: readonly ToastEntry[] = [];
  const subscribers = new Set<Subscriber>();
  const timers = new Map<string, TimerState>();

  function emit(next: readonly ToastEntry[]): void {
    entries = next;
    for (const subscriber of subscribers) {
      subscriber(entries);
    }
  }

  function clearTimer(id: string): void {
    const state = timers.get(id);
    if (state == null) {
      return;
    }
    if (state.timer != null) {
      clearTimeout(state.timer);
    }
    timers.delete(id);
  }

  function autoHideEnabled(options: ToastOptions): boolean {
    return options.autoHide ?? options.type !== 'error';
  }

  function scheduleAutoHide(entry: ToastEntry): void {
    if (!autoHideEnabled(entry.options)) {
      return;
    }
    const duration = entry.options.autoHideDuration ?? DEFAULT_AUTO_HIDE_DURATION;
    timers.set(entry.id, {
      remaining: duration,
      startedAt: Date.now(),
      timer: setTimeout(() => {
        toastStore.dismiss(entry.id, 'auto');
      }, duration),
    });
  }

  function pauseTimers(): void {
    for (const state of timers.values()) {
      if (state.timer == null) {
        continue;
      }
      clearTimeout(state.timer);
      state.timer = undefined;
      state.remaining = Math.max(0, state.remaining - (Date.now() - state.startedAt));
    }
  }

  function resumeTimers(): void {
    for (const [id, state] of timers) {
      if (state.timer != null) {
        continue;
      }
      state.startedAt = Date.now();
      state.timer = setTimeout(() => {
        toastStore.dismiss(id, 'auto');
      }, state.remaining);
    }
  }

  function removeEntry(id: string, reason?: ToastDismissReason): void {
    clearTimer(id);
    const entry = entries.find(item => item.id === id);
    if (entry == null) {
      return;
    }
    entry.options.onHide?.(reason ?? 'manual');
    emit(entries.filter(item => item.id !== id));
  }

  return {
    subscribe(subscriber: Subscriber): () => void {
      subscriber(entries);
      subscribers.add(subscriber);
      return () => {
        subscribers.delete(subscriber);
      };
    },
    show(options: ToastOptions): () => void {
      const entry = {id: `astryx-toast-${++toastId}`, options} as const;
      if (options.uniqueID == null) {
        emit([...entries, entry]);
        scheduleAutoHide(entry);
      } else {
        const existing = entries.find(item => item.options.uniqueID === options.uniqueID);
        if (existing == null) {
          emit([...entries, entry]);
          scheduleAutoHide(entry);
        } else if (options.collisionBehavior !== 'ignore') {
          clearTimer(existing.id);
          emit(entries.map(item => (item.options.uniqueID === options.uniqueID ? entry : item)));
          scheduleAutoHide(entry);
        }
      }
      return () => {
        toastStore.dismiss(entry.id, 'manual');
      };
    },
    dismiss(id: string, reason: ToastDismissReason): void {
      removeEntry(id, reason);
    },
    clear(): void {
      for (const id of timers.keys()) {
        clearTimer(id);
      }
      emit([]);
    },
    pauseTimers,
    resumeTimers,
  };
}

export const toastStore = createToastStore();
