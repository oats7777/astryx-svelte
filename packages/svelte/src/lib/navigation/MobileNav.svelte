<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file MobileNav.svelte
   * @input Open state, title, navigation items, and open-change callback
   * @output Native dialog drawer with cancel, backdrop, and close-button behavior
   * @position Todo 12 mobile navigation drawer
   */

  import NavItem from './NavItem.svelte';
  import type {NavItemModel} from './types.js';

  let {
    id = 'astryx-mobile-nav',
    open = false,
    title = 'Navigation',
    items = [],
    onOpenChange = undefined,
    'data-testid': testId = undefined,
  } = $props<{
    readonly id?: string;
    readonly open?: boolean;
    readonly title?: string;
    readonly items?: readonly NavItemModel[];
    readonly onOpenChange?: (open: boolean) => void;
    readonly 'data-testid'?: string;
  }>();

  let dialog = $state<HTMLDialogElement>();
  $effect(() => {
    if (dialog == null) {
      return;
    }
    if (open && !dialog.open) {
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
    } else if (!open && dialog.open) {
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
    }
  });

  function requestClose(event?: Event): void {
    event?.preventDefault();
    onOpenChange?.(false);
  }

  function handleBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      requestClose(event);
    }
  }
</script>

<dialog
  bind:this={dialog}
  id={id}
  class="m-0 h-dvh max-h-none w-80 max-w-[90vw] border-0 bg-[var(--color-background-surface)] p-0 text-[var(--color-text-primary)]"
  aria-label={title}
  data-testid={testId}
  oncancel={requestClose}
  onclick={handleBackdrop}
>
  <div class="flex h-full flex-col gap-3 p-4">
    <header class="flex min-h-10 items-center justify-between gap-3">
      <strong class="text-sm font-semibold">{title}</strong>
      <button type="button" aria-label="Close navigation" class="rounded-md px-2 py-1" onclick={requestClose}>
        Close
      </button>
    </header>
    <nav aria-label={title} class="flex flex-col gap-1">
      {#each items as item}
        <NavItem
          label={item.label}
          value={item.value}
          href={item.href}
          active={item.active}
          disabled={item.disabled}
        />
      {/each}
    </nav>
  </div>
</dialog>
