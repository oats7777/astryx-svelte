// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file svg-icon.doc.mjs
 * @input @astryxdesign/svelte-lab/svg-icon Svelte component exports
 * @output Docs metadata for SVG Icon Svelte components
 * @position Source docs consumed by docsite generation and docs typecheck
 */

import {createGroupDocs} from '../docs-factory.mjs';

export const docs = createGroupDocs({
  packageName: '@astryxdesign/svelte-lab',
  dir: 'svg-icon',
  groupLabel: 'SVG Icon',
  category: 'Content',
  components: ["SVGIcon"],
});
