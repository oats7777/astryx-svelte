<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file HoverCardHarness.svelte
   * @input HoverCard trigger timing, controlled state, callback, disabled props, and focusable content
   * @output Interactive hover-card anchor and content fixture for Vitest
   * @position Test fixture for Todo 11 HoverCard transient coverage
   */

  import HoverCard from '../HoverCard.svelte';

  let {
    open = undefined,
    delay = 0,
    hideDelay = 0,
    isEnabled = true,
    disabled = false,
    onOpenChange = () => {},
  } = $props<{
    readonly open?: boolean;
    readonly delay?: number;
    readonly hideDelay?: number;
    readonly isEnabled?: boolean;
    readonly disabled?: boolean;
    readonly onOpenChange?: (open: boolean) => void;
  }>();

  let anchor = $state<HTMLElement>();
</script>

<button bind:this={anchor} data-testid="hover-card-anchor" disabled={disabled}>Preview profile</button>
<HoverCard
  {anchor}
  {open}
  label="Profile preview"
  {delay}
  {hideDelay}
  {isEnabled}
  {disabled}
  onOpenChange={onOpenChange}
  data-testid="hover-card"
>
  <p>Riley Chen, product lead</p>
  <button type="button" data-testid="hover-card-content-action">View profile</button>
</HoverCard>
