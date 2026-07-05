<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file TooltipHarness.svelte
   * @input Tooltip trigger timing and callback props
   * @output Interactive tooltip anchor fixture for Vitest
   * @position Test fixture for Todo 11 tooltip transient coverage
   */

  import Tooltip from '../Tooltip.svelte';

  let {
    delay = 0,
    hideDelay = 0,
    onOpenChange = () => {},
  } = $props<{
    readonly delay?: number;
    readonly hideDelay?: number;
    readonly onOpenChange?: (open: boolean) => void;
  }>();

  let anchor = $state<HTMLElement>();
</script>

<button bind:this={anchor} data-testid="tooltip-anchor">Save</button>
<Tooltip
  {anchor}
  content="Persists changes"
  {delay}
  {hideDelay}
  onOpenChange={onOpenChange}
  data-testid="tooltip"
/>
