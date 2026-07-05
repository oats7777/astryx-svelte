// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file stepper.doc.mjs
 * @input @astryxdesign/svelte-lab/stepper Svelte component exports
 * @output Docs metadata for Stepper Svelte components
 * @position Source docs consumed by docsite generation and docs typecheck
 */

import {createGroupDocs} from '../docs-factory.mjs';

export const docs = createGroupDocs({
  packageName: '@astryxdesign/svelte-lab',
  dir: 'stepper',
  groupLabel: 'Stepper',
  category: 'Navigation',
  components: ["Step","Stepper"],
});
