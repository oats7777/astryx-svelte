// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file selection.doc.mjs
 * @input @astryxdesign/svelte/selection Svelte component exports
 * @output Docs metadata for Selection Svelte components
 * @position Source docs consumed by docsite generation and docs typecheck
 */

import {createGroupDocs} from '../docs-factory.mjs';

export const docs = createGroupDocs({
  packageName: '@astryxdesign/svelte',
  dir: 'selection',
  groupLabel: 'Selection',
  category: 'Data Input',
  components: ["Calendar","DateInput","DateRangeInput","DateTimeInput","MultiSelector","PowerSearch","Selector","TimeInput","Tokenizer","Typeahead"],
});
