// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file overlays.doc.mjs
 * @input @astryxdesign/svelte/overlays Svelte component exports
 * @output Docs metadata for Overlays Svelte components
 * @position Source docs consumed by docsite generation and docs typecheck
 */

import {createGroupDocs} from '../docs-factory.mjs';

export const docs = createGroupDocs({
  packageName: '@astryxdesign/svelte',
  dir: 'overlays',
  groupLabel: 'Overlays',
  category: 'Overlay',
  components: ["AlertDialog","ContextMenu","Dialog","DropdownMenu","HoverCard","Layer","MoreMenu","Overlay","Popover","Toast","ToastViewport","Tooltip"],
});
