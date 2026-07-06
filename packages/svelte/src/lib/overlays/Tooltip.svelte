<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script module lang="ts">
  let tooltipIdCounter = 0;

  function nextTooltipId(): string {
    tooltipIdCounter += 1;
    return `astryx-tooltip-${tooltipIdCounter}`;
  }

  function mergeIds(...ids: readonly (string | null | undefined)[]): string | undefined {
    const filtered = ids.filter(id => id != null && id.length > 0);
    return filtered.length > 0 ? filtered.join(' ') : undefined;
  }
</script>

<script lang="ts">
  /**
   * @file Tooltip.svelte
   * @input Anchor, content, placement, alignment, open state, and trigger timing
   * @output Anchored tooltip role layer with hover/focus transient behavior
   * @position Svelte Tooltip port for Todo 11
   */

  import Layer from './Layer.svelte';
  import type {LayerAlignment, LayerPlacement} from './types.js';

  const HOVER_BRIDGE_DELAY = 100;

  let {
    anchor = undefined,
    open = false,
    content,
    placement = 'above',
    alignment = 'center',
    delay = 200,
    hideDelay = 0,
    isEnabled = true,
    onOpenChange = () => {},
    'data-testid': testId = undefined,
  } = $props<{
    readonly anchor?: HTMLElement;
    readonly open?: boolean;
    readonly content: string;
    readonly placement?: LayerPlacement;
    readonly alignment?: LayerAlignment;
    readonly delay?: number;
    readonly hideDelay?: number;
    readonly isEnabled?: boolean;
    readonly onOpenChange?: (open: boolean) => void;
    readonly 'data-testid'?: string;
  }>();

  const tooltipId = nextTooltipId();
  let transientOpen = $state(false);
  let showTimer: ReturnType<typeof setTimeout> | undefined;
  let hideTimer: ReturnType<typeof setTimeout> | undefined;
  const visible = $derived(open || transientOpen);

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

  function cancelHide(): void {
    clearHideTimer();
  }

  function setTransientOpen(nextOpen: boolean): void {
    if (transientOpen === nextOpen) {
      return;
    }
    transientOpen = nextOpen;
    onOpenChange(nextOpen);
  }

  function scheduleShow(): void {
    if (!isEnabled) {
      return;
    }
    clearHideTimer();
    clearShowTimer();
    if (delay <= 0) {
      setTransientOpen(true);
      return;
    }
    showTimer = setTimeout(() => {
      showTimer = undefined;
      setTransientOpen(true);
    }, delay);
  }

  function scheduleHide(): void {
    clearShowTimer();
    clearHideTimer();
    const effectiveHideDelay = hideDelay > 0 ? hideDelay : HOVER_BRIDGE_DELAY;
    if (effectiveHideDelay <= 0) {
      setTransientOpen(false);
      return;
    }
    hideTimer = setTimeout(() => {
      hideTimer = undefined;
      setTransientOpen(false);
    }, effectiveHideDelay);
  }

  function dismiss(): void {
    clearShowTimer();
    clearHideTimer();
    if (transientOpen) {
      setTransientOpen(false);
      return;
    }
    if (visible) {
      onOpenChange(false);
    }
  }

  $effect(() => {
    const target = anchor;
    if (target == null) {
      return;
    }

    const previousDescribedBy = target.getAttribute('aria-describedby');
    const nextDescribedBy = mergeIds(previousDescribedBy, tooltipId);
    if (nextDescribedBy != null) {
      target.setAttribute('aria-describedby', nextDescribedBy);
    }

    target.addEventListener('mouseenter', scheduleShow);
    target.addEventListener('mouseleave', scheduleHide);
    target.addEventListener('focus', scheduleShow);
    target.addEventListener('blur', scheduleHide);

    return () => {
      clearShowTimer();
      clearHideTimer();
      target.removeEventListener('mouseenter', scheduleShow);
      target.removeEventListener('mouseleave', scheduleHide);
      target.removeEventListener('focus', scheduleShow);
      target.removeEventListener('blur', scheduleHide);
      if (previousDescribedBy != null) {
        target.setAttribute('aria-describedby', previousDescribedBy);
      } else {
        target.removeAttribute('aria-describedby');
      }
    };
  });

  $effect(() => {
    if (!visible) {
      return;
    }
    function handleKeydown(event: KeyboardEvent): void {
      if (event.key !== 'Escape' || event.isComposing || event.keyCode === 229) {
        return;
      }
      event.preventDefault();
      dismiss();
    }
    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<Layer open={visible} {anchor} {placement} {alignment} overlay="tooltip">
  <div
    id={tooltipId}
    class="astryx-tooltip"
    role="tooltip"
    data-testid={testId}
    onmouseenter={cancelHide}
    onmouseleave={scheduleHide}
  >
    {content}
  </div>
</Layer>
