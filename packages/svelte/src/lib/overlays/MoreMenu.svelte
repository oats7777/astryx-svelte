<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file MoreMenu.svelte
   * @input More-menu label and item data
   * @output DropdownMenu configured for overflow actions
   * @position Svelte MoreMenu port for Todo 11
   */

  import DropdownMenu from './DropdownMenu.svelte';
  import type {MenuItem} from './types.js';

  let {
    items = [],
    label = 'More options',
    'data-testid': testId = undefined,
  } = $props<{
    readonly items?: readonly MenuItem[];
    readonly label?: string;
    readonly 'data-testid'?: string;
  }>();
</script>

<DropdownMenu buttonLabel={label} {items} data-testid={testId} />
