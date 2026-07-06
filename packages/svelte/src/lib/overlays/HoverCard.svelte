<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script module lang="ts">
  let hoverCardIdCounter = 0;

  function nextHoverCardId(): string {
    hoverCardIdCounter += 1;
    return `astryx-hover-card-${hoverCardIdCounter}`;
  }

  function mergeIds(...ids: readonly (string | null | undefined)[]): string | undefined {
    const filtered = ids.filter(id => id != null && id.length > 0);
    return filtered.length > 0 ? filtered.join(' ') : undefined;
  }

  function removeId(ids: string | null, id: string): string | undefined {
    const filtered = ids?.split(/\s+/).filter(value => value.length > 0 && value !== id) ?? [];
    return filtered.length > 0 ? filtered.join(' ') : undefined;
  }
</script>

<script lang="ts">
  /**
   * @file HoverCard.svelte
   * @input Anchor, label, open state, trigger timing, disabled state, and content snippet
   * @output Anchored hover preview dialog layer with transient hover/focus behavior
   * @position Svelte HoverCard port for Todo 11
   */

  import type {Snippet} from 'svelte';
  import Layer from './Layer.svelte';
  import type {LayerAlignment, LayerPlacement} from './types.js';

  let {
    anchor = undefined,
    open = undefined,
    label,
    placement = 'below',
    alignment = 'start',
    delay = 300,
    hideDelay = 200,
    isEnabled = true,
    disabled = false,
    onOpenChange = () => {},
    children,
    'data-testid': testId = undefined,
  } = $props<{
    readonly anchor?: HTMLElement | string;
    readonly open?: boolean;
    readonly label: string;
    readonly placement?: LayerPlacement;
    readonly alignment?: LayerAlignment;
    readonly delay?: number;
    readonly hideDelay?: number;
    readonly isEnabled?: boolean;
    readonly disabled?: boolean;
    readonly onOpenChange?: (open: boolean) => void;
    readonly children?: Snippet;
    readonly 'data-testid'?: string;
  }>();

  const hoverCardId = nextHoverCardId();
  let resolvedAnchor = $state<HTMLElement>();
  let contentElement = $state<HTMLElement>();
  let transientOpen = $state(false);
  let suppressNextTriggerFocus = false;
  let showTimer: ReturnType<typeof setTimeout> | undefined;
  let hideTimer: ReturnType<typeof setTimeout> | undefined;
  const isControlled = $derived(open !== undefined);
  const triggersEnabled = $derived(isEnabled && !disabled);
  const visible = $derived(open ?? transientOpen);

  function clearShowTimer(): void {
    if (showTimer != null) {
      clearTimeout(showTimer);
      showTimer = undefined;
    }
  }

  function clearHideTimer(): void {
    if (hideTimer != null) {
      clearTimeout(hideTimer);
      hideTimer = undefined;
    }
  }

  function clearTimers(): void {
    clearShowTimer();
    clearHideTimer();
  }

  function requestOpen(nextOpen: boolean): void {
    if (nextOpen && !triggersEnabled) {
      return;
    }
    if (isControlled) {
      if (open !== nextOpen) {
        onOpenChange(nextOpen);
      }
      return;
    }
    if (transientOpen === nextOpen) {
      return;
    }
    transientOpen = nextOpen;
    onOpenChange(nextOpen);
  }

  function scheduleShow(): void {
    if (!triggersEnabled) {
      return;
    }
    clearTimers();
    if (delay <= 0) {
      requestOpen(true);
      return;
    }
    showTimer = setTimeout(() => { showTimer = undefined; requestOpen(true); }, delay);
  }

  function scheduleHide(): void {
    clearTimers();
    if (hideDelay <= 0) {
      requestOpen(false);
      return;
    }
    hideTimer = setTimeout(() => { hideTimer = undefined; requestOpen(false); }, hideDelay);
  }

  function shouldRetainForFocusTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Node)) {
      return false;
    }
    return contentElement?.contains(target) === true || resolvedAnchor?.contains(target) === true;
  }

  function handleTriggerFocus(): void {
    if (suppressNextTriggerFocus) {
      suppressNextTriggerFocus = false;
      return;
    }
    scheduleShow();
  }

  function handleTriggerBlur(event: FocusEvent): void {
    if (shouldRetainForFocusTarget(event.relatedTarget)) {
      return;
    }
    scheduleHide();
  }

  function retainContent(): void {
    clearTimers();
  }

  function handleContentBlur(event: FocusEvent): void {
    if (shouldRetainForFocusTarget(event.relatedTarget)) {
      return;
    }
    scheduleHide();
  }

  function handleContentKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') {
      return;
    }
    event.stopPropagation();
    clearTimers();
    suppressNextTriggerFocus = true;
    requestOpen(false);
    if (resolvedAnchor == null) {
      suppressNextTriggerFocus = false;
      return;
    }
    resolvedAnchor.focus();
    if (document.activeElement !== resolvedAnchor) {
      suppressNextTriggerFocus = false;
    }
  }

  $effect(() => {
    if (typeof anchor === 'string') {
      resolvedAnchor = document.querySelector<HTMLElement>(anchor) ?? undefined;
      return;
    }
    resolvedAnchor = anchor;
  });

  $effect(() => {
    if (isControlled && transientOpen) {
      transientOpen = false;
    }
  });

  $effect(() => {
    if (!triggersEnabled) {
      clearTimers();
      if (!isControlled && transientOpen) {
        requestOpen(false);
      }
    }
  });

  $effect(() => {
    const target = resolvedAnchor;
    if (target == null) {
      return;
    }

    target.addEventListener('mouseenter', scheduleShow);
    target.addEventListener('mouseleave', scheduleHide);
    target.addEventListener('focus', handleTriggerFocus);
    target.addEventListener('blur', handleTriggerBlur);

    return () => {
      clearTimers();
      target.removeEventListener('mouseenter', scheduleShow);
      target.removeEventListener('mouseleave', scheduleHide);
      target.removeEventListener('focus', handleTriggerFocus);
      target.removeEventListener('blur', handleTriggerBlur);
    };
  });

  $effect(() => {
    const target = contentElement;
    if (target == null) {
      return;
    }

    target.addEventListener('mouseenter', retainContent);
    target.addEventListener('mouseleave', scheduleHide);
    target.addEventListener('focusin', retainContent);
    target.addEventListener('focusout', handleContentBlur);
    target.addEventListener('keydown', handleContentKeydown);

    return () => {
      target.removeEventListener('mouseenter', retainContent);
      target.removeEventListener('mouseleave', scheduleHide);
      target.removeEventListener('focusin', retainContent);
      target.removeEventListener('focusout', handleContentBlur);
      target.removeEventListener('keydown', handleContentKeydown);
    };
  });

  $effect(() => {
    const target = resolvedAnchor;
    if (target == null || !visible) {
      return;
    }

    const nextDescribedBy = mergeIds(target.getAttribute('aria-describedby'), hoverCardId);
    if (nextDescribedBy != null) {
      target.setAttribute('aria-describedby', nextDescribedBy);
    }

    return () => {
      const restoredDescribedBy = removeId(target.getAttribute('aria-describedby'), hoverCardId);
      if (restoredDescribedBy != null) {
        target.setAttribute('aria-describedby', restoredDescribedBy);
      } else {
        target.removeAttribute('aria-describedby');
      }
    };
  });
</script>

<Layer
  open={visible}
  anchor={resolvedAnchor}
  {placement}
  {alignment}
  role="dialog"
  overlay="hover-card"
  data-testid={testId}
  aria-label={label}
>
  <div
    bind:this={contentElement}
    id={hoverCardId}
    class="astryx-hover-card"
  >
    {#if children}
      {@render children()}
    {/if}
  </div>
</Layer>
