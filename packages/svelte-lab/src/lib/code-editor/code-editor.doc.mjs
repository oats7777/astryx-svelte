// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file code-editor.doc.mjs
 * @input @astryxdesign/svelte-lab/code-editor Svelte component exports
 * @output Docs metadata for Code Editor Svelte components
 * @position Source docs consumed by docsite generation and docs typecheck
 */

import {createGroupDocs} from '../docs-factory.mjs';

export const docs = createGroupDocs({
  packageName: '@astryxdesign/svelte-lab',
  dir: 'code-editor',
  groupLabel: 'Code Editor',
  category: 'Content',
  components: ["CodeEditor"],
});
