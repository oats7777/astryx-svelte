// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file data-display.doc.mjs
 * @input @astryxdesign/svelte/data-display Svelte component exports
 * @output Docs metadata for Data Display Svelte components
 * @position Source docs consumed by docsite generation and docs typecheck
 */

import {createGroupDocs} from '../docs-factory.mjs';

export const docs = createGroupDocs({
  packageName: '@astryxdesign/svelte',
  dir: 'data-display',
  groupLabel: 'Data Display',
  category: 'Table & List',
  components: ["List","MetadataList","Outline","DataDisplayPagination","Pagination","ProgressBar","Table","TreeList"],
});
