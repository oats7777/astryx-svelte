// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file navigation.doc.mjs
 * @input @astryxdesign/svelte/navigation Svelte component exports
 * @output Docs metadata for Navigation Svelte components
 * @position Source docs consumed by docsite generation and docs typecheck
 */

import {createGroupDocs} from '../docs-factory.mjs';

export const docs = createGroupDocs({
  packageName: '@astryxdesign/svelte',
  dir: 'navigation',
  groupLabel: 'Navigation',
  category: 'Navigation',
  components: ["AppShell","Breadcrumbs","Layout","MobileNav","NavItem","NavMenu","OverflowList","NavigationPagination","Pagination","SegmentedControl","SideNav","TabList","Toolbar","TopNav"],
});
