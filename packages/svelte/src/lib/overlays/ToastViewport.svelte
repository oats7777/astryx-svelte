<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file ToastViewport.svelte
   * @input Shared toast store entries and viewport options
   * @output Fixed notification region rendering Toast instances
   * @position Svelte ToastViewport port for Todo 11
   */

  import {onDestroy, tick} from 'svelte';
  import Toast from './Toast.svelte';
  import {toastStore} from './toast-store.js';
  import type {ToastDismissReason, ToastEntry} from './types.js';

  let {maxVisible = 5} = $props<{readonly maxVisible?: number}>();
  let entries = $state<readonly ToastEntry[]>([]);
  let viewport = $state<HTMLElement>();
  let previousFocus: HTMLElement | undefined;

  const unsubscribe = toastStore.subscribe(next => {
    entries = next;
  });
  onDestroy(unsubscribe);

  function focusTargetInToast(toast: HTMLElement | null | undefined): void {
    const target = toast?.querySelector<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])',
    ) ?? toast ?? viewport;
    target?.focus();
  }

  function focusNewestToast(): void {
    const toasts = viewport?.querySelectorAll<HTMLElement>('[data-toast-id]');
    const newest = toasts?.[toasts.length - 1];
    focusTargetInToast(newest);
  }

  function dismiss(id: string, reason: ToastDismissReason): void {
    const active = document.activeElement;
    const toastNodes = Array.from(viewport?.querySelectorAll<HTMLElement>('[data-toast-id]') ?? []);
    const dismissedIndex = toastNodes.findIndex(toast => toast.dataset.toastId === id);
    const dismissedToast = toastNodes[dismissedIndex];
    const shouldMoveFocus = dismissedToast != null && active instanceof Node && dismissedToast.contains(active);
    const nextToast = toastNodes[dismissedIndex + 1] ?? toastNodes[dismissedIndex - 1];
    toastStore.dismiss(id, reason);
    if (!shouldMoveFocus) {
      return;
    }
    void tick().then(() => {
      const nextId = nextToast?.dataset.toastId;
      if (nextId != null) {
        focusTargetInToast(viewport?.querySelector<HTMLElement>(`[data-toast-id="${nextId}"]`));
        return;
      }
      if (previousFocus?.isConnected === true) {
        previousFocus.focus();
        previousFocus = undefined;
        return;
      }
      viewport?.focus();
    });
  }

  $effect(() => {
    if (entries.length === 0) {
      return;
    }
    function handleKeydown(event: KeyboardEvent): void {
      if (event.key !== 'F6' || viewport == null) {
        return;
      }
      const active = document.activeElement;
      if (active instanceof Node && viewport.contains(active)) {
        return;
      }
      event.preventDefault();
      previousFocus = active instanceof HTMLElement ? active : undefined;
      focusNewestToast();
    }
    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  });

  $effect(() => {
    if (entries.length === 0) {
      return;
    }
    window.addEventListener('blur', toastStore.pauseTimers);
    window.addEventListener('focus', toastStore.resumeTimers);
    return () => {
      window.removeEventListener('blur', toastStore.pauseTimers);
      window.removeEventListener('focus', toastStore.resumeTimers);
    };
  });
</script>

<div bind:this={viewport} class="astryx-toast-viewport" role="region" aria-label="Notifications" tabindex="-1">
  {#each entries.slice(-maxVisible) as entry (entry.id)}
    <Toast {entry} onDismiss={dismiss} />
  {/each}
</div>
