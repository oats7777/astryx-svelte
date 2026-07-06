<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Popover.svelte
   * @input Anchor, open state, label, placement, and child snippet
   * @output Anchored dialog popover layer
   * @position Svelte Popover port for Todo 11
   */

  import type {Snippet} from 'svelte';
  import Layer from './Layer.svelte';
  import type {LayerAlignment, LayerPlacement} from './types.js';

  let {
    anchor = undefined,
    open = false,
    label,
    placement = 'below',
    alignment = 'start',
    onOpenChange = () => {},
    children,
    'data-testid': testId = undefined,
  } = $props<{
    readonly anchor?: HTMLElement;
    readonly open?: boolean;
    readonly label: string;
    readonly placement?: LayerPlacement;
    readonly alignment?: LayerAlignment;
    readonly onOpenChange?: (open: boolean) => void;
    readonly children?: Snippet;
    readonly 'data-testid'?: string;
  }>();

  function close(): void {
    onOpenChange(false);
  }
</script>

<Layer
  {open}
  {anchor}
  {placement}
  {alignment}
  role="dialog"
  trapFocus
  onEscape={close}
  overlay="popover"
  data-testid={testId}
  aria-label={label}
>
  <div class="astryx-popover">
    {#if children}
      {@render children()}
    {/if}
  </div>
</Layer>
