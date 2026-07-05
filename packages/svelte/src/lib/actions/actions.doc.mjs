// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file actions.doc.mjs
 * @input @astryxdesign/svelte/actions Svelte component exports
 * @output Docs metadata for Actions Svelte components
 * @position Source docs consumed by docsite generation and docs typecheck
 */

import {createGroupDocs} from '../docs-factory.mjs';

export const docs = createGroupDocs({
  packageName: '@astryxdesign/svelte',
  dir: 'actions',
  groupLabel: 'Actions',
  category: 'Action',
  components: ["Button","ButtonGroup","Citation","ClickableCard","IconButton","Item","Link","LinkProvider","NavIcon","SelectableCard","ToggleButton","Token"],
});
