// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file theme.doc.mjs
 * @input @astryxdesign/svelte/theme Svelte component exports
 * @output Docs metadata for Theme Svelte components
 * @position Source docs consumed by docsite generation and docs typecheck
 */

import {createGroupDocs} from '../docs-factory.mjs';

export const docs = createGroupDocs({
  packageName: '@astryxdesign/svelte',
  dir: 'theme',
  groupLabel: 'Theme',
  category: 'Utility',
  components: ["Theme"],
});
