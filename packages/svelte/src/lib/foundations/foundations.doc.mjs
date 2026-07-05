// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file foundations.doc.mjs
 * @input @astryxdesign/svelte/foundations Svelte component exports
 * @output Docs metadata for Foundations Svelte components
 * @position Source docs consumed by docsite generation and docs typecheck
 */

import {createGroupDocs} from '../docs-factory.mjs';

export const docs = createGroupDocs({
  packageName: '@astryxdesign/svelte',
  dir: 'foundations',
  groupLabel: 'Foundations',
  category: 'Content',
  components: ["AspectRatio","Avatar","AvatarGroup","AvatarGroupOverflow","AvatarStatusDot","Badge","Banner","Blockquote","Card","Center","Divider","EmptyState","Grid","Heading","HStack","Icon","Kbd","Section","Skeleton","Spinner","Stack","StackItem","StatusDot","Text","Thumbnail","Timestamp","VisuallyHidden","VStack"],
});
