// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file package-export-contract.mjs
 * @input Svelte package export surface and docs group contract
 * @output Shared package export contract data for the Svelte verifier
 * @position Data-only companion for check-package-exports.mjs
 */

export const requiredSvelteExports = {
  '.': {types: './dist/index.d.ts', svelte: './dist/index.js', source: 'src/lib/index.ts'},
  './Theme.svelte': {
    types: './dist/theme/Theme.svelte.d.ts',
    svelte: './dist/theme/Theme.svelte',
    source: 'src/lib/theme/Theme.svelte',
  },
  './theme': {types: './dist/theme/index.d.ts', svelte: './dist/theme/index.js', source: 'src/lib/theme/index.ts'},
  './theme/tokens': {
    types: './dist/theme/tokens.d.ts',
    svelte: './dist/theme/tokens.js',
    source: 'src/lib/theme/tokens.ts',
  },
  './tokens': {types: './dist/tokens.d.ts', svelte: './dist/tokens.js', source: 'src/lib/tokens.ts'},
  './icon': {types: './dist/icon/index.d.ts', svelte: './dist/icon/index.js', source: 'src/lib/icon/index.ts'},
  './foundations': {
    types: './dist/foundations/index.d.ts',
    svelte: './dist/foundations/index.js',
    source: 'src/lib/foundations/index.ts',
  },
  './actions': {
    types: './dist/actions/index.d.ts',
    svelte: './dist/actions/index.js',
    source: 'src/lib/actions/index.ts',
  },
  './forms': {types: './dist/forms/index.d.ts', svelte: './dist/forms/index.js', source: 'src/lib/forms/index.ts'},
  './overlays': {
    types: './dist/overlays/index.d.ts',
    svelte: './dist/overlays/index.js',
    source: 'src/lib/overlays/index.ts',
  },
  './selection': {
    types: './dist/selection/index.d.ts',
    svelte: './dist/selection/index.js',
    source: 'src/lib/selection/index.ts',
  },
  './navigation': {
    types: './dist/navigation/index.d.ts',
    svelte: './dist/navigation/index.js',
    source: 'src/lib/navigation/index.ts',
  },
  './data-display': {
    types: './dist/data-display/index.d.ts',
    svelte: './dist/data-display/index.js',
    source: 'src/lib/data-display/index.ts',
  },
  './rich-surfaces': {
    types: './dist/rich-surfaces/index.d.ts',
    svelte: './dist/rich-surfaces/index.js',
    source: 'src/lib/rich-surfaces/index.ts',
  },
  './misc': {types: './dist/misc/index.d.ts', svelte: './dist/misc/index.js', source: 'src/lib/misc/index.ts'},
  './utils': {types: './dist/utils/index.d.ts', svelte: './dist/utils/index.js', source: 'src/lib/utils/index.ts'},
  './internal/PackageTopologyProbe.svelte': {
    types: './dist/internal/PackageTopologyProbe.svelte.d.ts',
    svelte: './dist/internal/PackageTopologyProbe.svelte',
    source: 'src/lib/internal/PackageTopologyProbe.svelte',
  },
};

export const requiredDefaultExports = {
  './styles.css': {default: './dist/styles.css', source: 'src/lib/styles.css'},
  './tailwind.css': {default: './dist/tailwind.css', source: 'src/lib/tailwind.css'},
};

export const requiredStringExports = {
  './docs.mjs': './docs.mjs',
  './groups.doc.mjs': './groups.doc.mjs',
  './package.json': './package.json',
};

export const requiredGroups = [
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
