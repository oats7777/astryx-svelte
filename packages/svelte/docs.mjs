// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file docs.mjs
 * @input @astryxdesign/svelte package export and distribution contract
 * @output Package-level docs metadata for the Svelte package
 * @position Public docs metadata entrypoint exported as @astryxdesign/svelte/docs.mjs
 */

export const docs = {
  title: '@astryxdesign/svelte',
  packageName: '@astryxdesign/svelte',
  description:
    'Svelte 5 entrypoints for Astryx theme runtime, plain CSS, optional Tailwind CSS, tokens, and implemented component surfaces.',
  exports: [
    '.',
    './Theme.svelte',
    './theme',
    './theme/tokens',
    './tokens',
    './icon',
    './foundations',
    './actions',
    './forms',
    './overlays',
    './selection',
    './navigation',
    './data-display',
    './rich-surfaces',
    './misc',
    './utils',
    './internal/PackageTopologyProbe.svelte',
    './styles.css',
    './tailwind.css',
    './docs.mjs',
    './groups.doc.mjs',
    './package.json',
  ],
  sections: [
    {
      title: 'Package entrypoints',
      content: [
        {
          type: 'list',
          items: [
            '`@astryxdesign/svelte` exports the root Svelte barrel.',
            '`@astryxdesign/svelte/Theme.svelte` exports the packaged Theme component.',
            '`@astryxdesign/svelte/theme` exports theme runtime helpers.',
            '`@astryxdesign/svelte/foundations` exports layout, typography, media, feedback, and status primitives.',
            '`@astryxdesign/svelte/actions` exports buttons, links, interactive cards, tokens, items, citations, nav icons, and action utilities.',
            '`@astryxdesign/svelte/forms` exports Svelte form fields and input controls.',
            '`@astryxdesign/svelte/overlays` exports Svelte dialogs, layers, menus, popovers, tooltips, toasts, and focus actions.',
            '`@astryxdesign/svelte/selection` exports date, time, combobox, tokenizer, typeahead, and PowerSearch composites.',
            '`@astryxdesign/svelte/navigation` exports app shell, nav, tabs, toolbar, pagination, and layout systems.',
            '`@astryxdesign/svelte/data-display` exports list, metadata, outline, progress, table, tree, and table plugin helpers.',
            '`@astryxdesign/svelte/rich-surfaces` exports carousel, chat, code, markdown, command palette, lightbox, and resizing surfaces.',
            '`@astryxdesign/svelte/misc` exports Svelte replacements for miscellaneous core context helpers.',
            '`@astryxdesign/svelte/utils` exports shared date/time, media query, resize observer, streaming text, style-key, and theme-prop utilities.',
            '`@astryxdesign/svelte/theme/tokens` and `/tokens` re-export framework-neutral token metadata.',
            '`@astryxdesign/svelte/styles.css` imports framework-neutral Astryx token CSS and component hook styles.',
            '`@astryxdesign/svelte/tailwind.css` layers Tailwind v4 theme variables and package source registration on top of the plain CSS entrypoint.',
          ],
        },
      ],
    },
  ],
};
