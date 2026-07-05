<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Dialog.svelte
   * @input Modal open state, purpose, label, and content snippet
   * @output Portalled stack-owned modal dialog with focus trap and scroll lock
   * @position Svelte Dialog port for Todo 11
  */

  import {getContext, setContext, type Snippet} from 'svelte';
  import {FOCUS_LAYER_DEPTH_CONTEXT, focusTrap, isImeKeyEvent, isTopFocusLayer} from './focus-trap.js';
  import {portal} from './portal.js';
  import {scrollLock} from './scroll-lock.js';
  import type {DialogPurpose} from './types.js';

  let {
    open = false,
    label,
    role = 'dialog',
    purpose = 'info',
    onOpenChange = () => {},
    children,
    'data-testid': testId = undefined,
  } = $props<{
    readonly open?: boolean;
    readonly label: string;
    readonly role?: 'dialog' | 'alertdialog';
    readonly purpose?: DialogPurpose;
    readonly onOpenChange?: (open: boolean) => void;
    readonly children?: Snippet;
    readonly 'data-testid'?: string;
  }>();

  let panel = $state<HTMLElement>();
  const allowEscape = $derived(purpose !== 'required');
  const allowBackdropClick = $derived(purpose === 'info');
  const parentFocusLayerDepth = getContext<number>(FOCUS_LAYER_DEPTH_CONTEXT) ?? 0;
  const focusLayerDepth = parentFocusLayerDepth + 1;
  setContext(FOCUS_LAYER_DEPTH_CONTEXT, focusLayerDepth);

  function requestClose(): void {
    if (!isTopFocusLayer(panel)) {
      return;
    }
    if (allowEscape) {
      onOpenChange(false);
    }
  }

  function handlePanelKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || !isImeKeyEvent(event)) {
      return;
    }
    event.stopImmediatePropagation();
  }

  function handleBackdropClick(event: MouseEvent): void {
    if (allowBackdropClick && event.target === event.currentTarget && isTopFocusLayer(panel)) {
      onOpenChange(false);
    }
  }
</script>

{#if open}
  <div
    class="astryx-dialog-backdrop"
    data-astryx-overlay="dialog-backdrop"
    role="presentation"
    use:portal={{enabled: true}}
    use:scrollLock={true}
    onclick={handleBackdropClick}
    onkeydown={() => undefined}
  >
    <section
      bind:this={panel}
      class="astryx-dialog astryx-reduced-motion-safe"
      data-astryx-overlay="dialog"
      data-astryx-focus-layer="true"
      data-testid={testId}
      {role}
      aria-modal="true"
      aria-label={label}
      tabindex="-1"
      use:focusTrap={{active: true, onEscape: requestClose, dialogDepth: focusLayerDepth}}
      onkeydown={handlePanelKeydown}
    >
      {#if children}
        {@render children()}
      {/if}
    </section>
  </div>
{/if}
