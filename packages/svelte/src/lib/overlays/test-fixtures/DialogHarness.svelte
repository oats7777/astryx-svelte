<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file DialogHarness.svelte
   * @input Dialog and nested Popover/Dialog props for Vitest fixtures
   * @output Mounted modal controls around a nested overlay
   * @position Test fixture for Todo 11 focus and dismissal coverage
   */

  import Dialog from '../Dialog.svelte';
  import AlertDialog from '../AlertDialog.svelte';
  import HoverCard from '../HoverCard.svelte';
  import Popover from '../Popover.svelte';
  import type {DialogPurpose} from '../types.js';

  let {
    open = true,
    nestedOpen = false,
    nestedDialogOpen = false,
    nonTrappingNestedOpen = false,
    purpose = 'info',
    onOpenChange = () => {},
    onNestedOpenChange = () => {},
    onNestedDialogOpenChange = () => {},
  } = $props<{
    readonly open?: boolean;
    readonly nestedOpen?: boolean;
    readonly nestedDialogOpen?: boolean;
    readonly nonTrappingNestedOpen?: boolean;
    readonly purpose?: DialogPurpose;
    readonly onOpenChange?: (open: boolean) => void;
    readonly onNestedOpenChange?: (open: boolean) => void;
    readonly onNestedDialogOpenChange?: (open: boolean) => void;
  }>();

  let nestedAnchor = $state<HTMLElement>();
</script>

<button data-testid="before-dialog">Before dialog</button>
<Dialog {open} {purpose} label="Edit settings" onOpenChange={onOpenChange}>
  <button data-testid="first-dialog-control">First</button>
  <button bind:this={nestedAnchor} data-testid="nested-anchor">Nested anchor</button>
  <Popover
    anchor={nestedAnchor}
    open={nestedOpen}
    label="Nested actions"
    onOpenChange={onNestedOpenChange}
  >
    <button data-testid="nested-popover-control">Nested item</button>
  </Popover>
  <HoverCard anchor={nestedAnchor} open={nonTrappingNestedOpen} label="Nested preview">
    <button data-testid="nested-hover-card-control">Preview item</button>
  </HoverCard>
  <AlertDialog
    open={nestedDialogOpen}
    label="Confirm nested change"
    onOpenChange={onNestedDialogOpenChange}
  >
    <button data-testid="first-nested-dialog-control">Nested first</button>
    <button data-testid="last-nested-dialog-control">Nested last</button>
  </AlertDialog>
  <button data-testid="last-dialog-control">Last</button>
</Dialog>
<button data-testid="after-dialog">After dialog</button>
