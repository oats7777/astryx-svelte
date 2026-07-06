// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file forms.doc.mjs
 * @input @astryxdesign/svelte/forms Svelte component exports
 * @output Docs metadata for Forms Svelte components
 * @position Source docs consumed by docsite generation and docs typecheck
 */

import {createGroupDocs} from '../docs-factory.mjs';

export const docs = createGroupDocs({
  packageName: '@astryxdesign/svelte',
  dir: 'forms',
  groupLabel: 'Forms',
  category: 'Data Input',
  components: ["CheckboxInput","CheckboxList","Field","FieldStatus","FileInput","FormLayout","InputGroup","NumberInput","RadioList","Slider","Switch","TextArea","TextInput"],
});
