// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file three-d.doc.mjs
 * @input @astryxdesign/svelte-lab/three-d Svelte component exports
 * @output Docs metadata for Three D Svelte components
 * @position Source docs consumed by docsite generation and docs typecheck
 */

import {createGroupDocs} from '../docs-factory.mjs';

export const docs = createGroupDocs({
  packageName: '@astryxdesign/svelte-lab',
  dir: 'three-d',
  groupLabel: 'Three D',
  category: 'Data Visualization',
  components: ["ThreeDAxis","ThreeDBar","ThreeDChart","ThreeDGrid","ThreeDScatter","ThreeDSurface"],
});
