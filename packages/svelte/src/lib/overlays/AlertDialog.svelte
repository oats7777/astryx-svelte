<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file AlertDialog.svelte
   * @input Alert dialog open state, label, purpose, and content snippet
   * @output Modal alertdialog wrapper around Dialog
   * @position Svelte AlertDialog port for Todo 11
   */

  import type {Snippet} from 'svelte';
  import Dialog from './Dialog.svelte';
  import type {DialogPurpose} from './types.js';

  let {
    open = false,
    label,
    purpose = 'info',
    onOpenChange = () => {},
    children,
    'data-testid': testId = undefined,
  } = $props<{
    readonly open?: boolean;
    readonly label: string;
    readonly purpose?: DialogPurpose;
    readonly onOpenChange?: (open: boolean) => void;
    readonly children?: Snippet;
    readonly 'data-testid'?: string;
  }>();
</script>

<Dialog {open} {label} {purpose} {onOpenChange} role="alertdialog" data-testid={testId}>
  {#if children}
    {@render children()}
  {/if}
</Dialog>
