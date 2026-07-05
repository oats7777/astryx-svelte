// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file docs.mjs
 * @input @astryxdesign/svelte-lab package docs contract
 * @output Package-level docs metadata
 * @position Public docs metadata entrypoint exported as @astryxdesign/svelte-lab/docs.mjs
 */

export const docs = {
  title: '@astryxdesign/svelte-lab',
  packageName: '@astryxdesign/svelte-lab',
  description: 'Private Svelte lab surfaces for experimental Astryx charts, editors, schedules, steppers, SVG icons, and 3D charts.',
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
        {type: 'paragraph', text: 'Private Svelte lab surfaces for experimental Astryx charts, editors, schedules, steppers, SVG icons, and 3D charts.'},
      ],
    },
  ],
};
