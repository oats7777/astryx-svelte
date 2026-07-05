// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file groups.doc.mjs
 * @input Svelte package docs grouping metadata
 * @output Group metadata for docs/catalog consumers
 * @position Public docs metadata entrypoint exported as @astryxdesign/svelte/groups.doc.mjs
 */

export const groups = [
  {
    name: 'Theme',
    canonical: 'Theme',
    description: 'Theme provider, root sync, runtime CSS, and theme context for Svelte consumers.',
  },
  {
    name: 'Tokens',
    canonical: 'Tokens',
    description: 'Framework-neutral Astryx token metadata and CSS emitters re-exported for Svelte consumers.',
  },
  {
    name: 'Icons',
    canonical: 'IconRegistry',
    description: 'Semantic icon registry helpers shared by Svelte themes and components.',
  },
  {
    name: 'Foundations',
    canonical: 'Card',
    description: 'Layout, typography, media, feedback, and status primitives for Svelte surfaces.',
  },
  {
    name: 'Actions',
    canonical: 'Button',
    description: 'Buttons, links, interactive cards, tokens, items, citations, nav icons, and action utilities.',
  },
  {
    name: 'Forms',
    canonical: 'Field',
    description: 'Form fields, statuses, layouts, grouped inputs, and input controls for Svelte consumers.',
  },
  {
    name: 'Overlays',
    canonical: 'Dialog',
    description: 'Dialogs, layers, popovers, menus, tooltips, toasts, and focus actions for transient UI.',
  },
  {
    name: 'Selection',
    canonical: 'Selector',
    description: 'Date, time, combobox, tokenizer, typeahead, and PowerSearch composites for Svelte consumers.',
  },
  {
    name: 'Navigation',
    canonical: 'AppShell',
    description: 'App shell, navigation, tabs, toolbar, pagination, and layout systems for Svelte surfaces.',
  },
  {
    name: 'Data Display',
    canonical: 'Table',
    description: 'Lists, metadata, outlines, progress, tables, trees, and table helpers for structured content.',
  },
  {
    name: 'Rich Surfaces',
    canonical: 'CommandPalette',
    description: 'Carousel, chat, code, markdown, command palette, lightbox, and resizing surfaces.',
  },
  {
    name: 'Misc',
    canonical: 'SizeContext',
    description: 'Svelte replacements for miscellaneous core context helpers.',
  },
  {
    name: 'Utilities',
    canonical: 'createMediaQueryStore',
    description: 'Shared date/time, media query, resize observer, streaming text, style-key, and theme-prop utilities.',
  },
];
