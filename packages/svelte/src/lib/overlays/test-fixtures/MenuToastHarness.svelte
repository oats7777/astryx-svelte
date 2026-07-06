<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file MenuToastHarness.svelte
   * @input Dropdown, context menu, more menu, overlay, and toast surfaces
   * @output Interactive transient UI fixture for Vitest and axe coverage
   * @position Test fixture for Todo 11 menu, overlay, and toast coverage
   */

  import ContextMenu from '../ContextMenu.svelte';
  import DropdownMenu from '../DropdownMenu.svelte';
  import MoreMenu from '../MoreMenu.svelte';
  import Overlay from '../Overlay.svelte';
  import ToastViewport from '../ToastViewport.svelte';
  import {toastStore} from '../toast-store.js';
  import type {MenuItem} from '../types.js';

  const items: readonly MenuItem[] = [
    {label: 'Edit', value: 'edit'},
    {label: 'Archive', value: 'archive'},
    {type: 'divider'},
    {label: 'Delete', value: 'delete', disabled: true},
    {label: 'Download', value: 'download'},
  ];

  function showToast(): void {
    toastStore.show({body: 'Saved changes', type: 'info', autoHide: false});
  }
</script>

<DropdownMenu buttonLabel="Actions" {items} data-testid="dropdown" />
<MoreMenu {items} label="More options" data-testid="more-menu" />
<ContextMenu {items} data-testid="context-menu">
  <div data-testid="context-target">Right click target</div>
</ContextMenu>
<Overlay label="Media actions" open data-testid="media-overlay">
  <div data-testid="media-base">Media</div>
  {#snippet overlay()}
    <button>Quick view</button>
  {/snippet}
</Overlay>
<button data-testid="show-toast" onclick={showToast}>Show toast</button>
<ToastViewport />
