// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file rich-surfaces.doc.mjs
 * @input @astryxdesign/svelte/rich-surfaces Svelte component exports
 * @output Docs metadata for Rich Surfaces Svelte components
 * @position Source docs consumed by docsite generation and docs typecheck
 */

import {createGroupDocs} from '../docs-factory.mjs';

export const docs = createGroupDocs({
  packageName: '@astryxdesign/svelte',
  dir: 'rich-surfaces',
  groupLabel: 'Rich Surfaces',
  category: 'Container',
  components: ["Carousel","Chat","Code","CodeBlock","Collapsible","CommandPalette","Lightbox","Markdown","Resizable"],
});
