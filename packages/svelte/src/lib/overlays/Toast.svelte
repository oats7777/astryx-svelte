<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Toast.svelte
   * @input Toast entry and dismiss callback
   * @output Accessible live-region toast
   * @position Svelte Toast port for Todo 11
   */

  import type {ToastDismissReason, ToastEntry} from './types.js';

  let {
    entry,
    onDismiss,
  } = $props<{
    readonly entry: ToastEntry;
    readonly onDismiss: (id: string, reason: ToastDismissReason) => void;
  }>();

  const type = $derived(entry.options.type ?? 'info');
  const role = $derived(type === 'error' ? 'alert' : 'status');
  const live = $derived(type === 'error' ? 'assertive' : 'polite');
</script>

<div
  class="astryx-toast"
  {role}
  aria-live={live}
  aria-atomic="true"
  data-toast-id={entry.id}
  data-toast-type={type}
>
  <span>{entry.options.body}</span>
  <button type="button" aria-label="Dismiss notification" onclick={() => onDismiss(entry.id, 'manual')}>
    x
  </button>
</div>
