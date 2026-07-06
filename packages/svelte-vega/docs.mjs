// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file docs.mjs
 * @input @astryxdesign/svelte-vega package docs contract
 * @output Package-level docs metadata
 * @position Public docs metadata entrypoint exported as @astryxdesign/svelte-vega/docs.mjs
 */

export const docs = {
  title: '@astryxdesign/svelte-vega',
  packageName: '@astryxdesign/svelte-vega',
  description: 'Private Svelte Vega and Vega-Lite chart wrapper metadata for Astryx documentation.',
  exports: [
  ".",
  "./docs.mjs",
  "./groups.doc.mjs",
  "./package.json"
],
  sections: [
    {
      title: 'Svelte documentation',
      content: [
        {type: 'paragraph', text: 'Private Svelte Vega and Vega-Lite chart wrapper metadata for Astryx documentation.'},
      ],
    },
  ],
};
