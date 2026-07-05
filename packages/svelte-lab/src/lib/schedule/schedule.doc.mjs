// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file schedule.doc.mjs
 * @input @astryxdesign/svelte-lab/schedule Svelte component exports
 * @output Docs metadata for Schedule Svelte components
 * @position Source docs consumed by docsite generation and docs typecheck
 */

import {createGroupDocs} from '../docs-factory.mjs';

export const docs = createGroupDocs({
  packageName: '@astryxdesign/svelte-lab',
  dir: 'schedule',
  groupLabel: 'Schedule',
  category: 'Data Input',
  components: ["Schedule"],
});
