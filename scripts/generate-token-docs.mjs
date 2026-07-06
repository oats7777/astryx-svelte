#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.


/**
 * @file generate-token-docs.mjs
 * @description Generates packages/cli/docs/tokens.doc.mjs from the source of
 *   truth: packages/tokens.
 *
 * Run: node scripts/generate-token-docs.mjs
 * CI:  Add to lint or build to catch drift.
 *
 * Reads canonical token metadata and writes a ReferenceDoc-shaped .doc.mjs file.
 */

import {readFileSync, writeFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {documentedTokenGroups} from '../packages/tokens/dist/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TOKENS_DOC = resolve(ROOT, 'packages/cli/docs/tokens.doc.mjs');

// ---------------------------------------------------------------------------
// 1. Describe docs groups
// ---------------------------------------------------------------------------

/** Map of group name → { exportName, title, description, headers } */
const groups = [
  {
    key: 'color',
    previewType: 'swatch',
    title: 'Color Tokens',
    description:
      'Semantic colors for consistent theming. All colors use light-dark() for automatic mode switching.',
    headers: ['Token', 'Light', 'Dark'],
    formatRow(name, value) {
      const ldMatch = value.match(
        /^light-dark\(([^,]+),\s*([^)]+)\)$/,
      );
      if (ldMatch) return [name, ldMatch[1].trim(), ldMatch[2].trim()];
      return [name, value, value];
    },
  },
  {
    key: 'spacing',
    previewType: 'spacing-bar',
    title: 'Spacing Tokens',
    description:
      'Spacing scale used for padding, gap, and margin. Component gap props map spacing steps to these tokens.',
    headers: ['Token', 'Value'],
    formatRow: (name, value) => [name, value],
  },
  {
    key: 'size',
    previewType: 'size-bar',
    title: 'Size Tokens',
    description:
      'Control heights for consistent sizing across buttons, inputs, and selectors.',
    headers: ['Token', 'Value'],
    formatRow: (name, value) => [name, value],
  },
  {
    key: 'border',
    previewType: 'border-line',
    title: 'Border Tokens',
    description: 'Border width for card and input borders.',
    headers: ['Token', 'Value'],
    formatRow: (name, value) => [name, value],
  },
  {
    key: 'radius',
    previewType: 'radius-box',
    title: 'Radius Tokens',
    description:
      "Numeric scale based on a 4dp base unit. Tokens scale with the theme's radius multiplier; --radius-none and --radius-full are fixed.",
    headers: ['Token', 'Value'],
    formatRow: (name, value) => [name, value],
  },
  {
    key: 'shadow',
    previewType: 'shadow-box',
    title: 'Shadow Tokens',
    description:
      'Elevation shadows (low to med to high) and inset shadows for input state rings.',
    headers: ['Token', 'Value'],
    formatRow: (name, value) => [name, value],
  },
  {
    key: 'duration',
    previewType: 'duration-bar',
    title: 'Duration Tokens',
    description:
      'Motion duration primitives. Three bands: fast (micro-interactions), medium (entrance/exit), slow (continuous). Min/max variants derive from base × ratio.',
    headers: ['Token', 'Value'],
    formatRow: (name, value) => [name, value],
  },
  {
    key: 'ease',
    previewType: 'easing-curve',
    title: 'Easing Tokens',
    description: 'Easing curves for animations and transitions.',
    headers: ['Token', 'Value'],
    formatRow: (name, value) => [name, value],
  },
  {
    key: 'typography',
    previewType: 'font-sample',
    title: 'Font Family Tokens',
    description: 'Font family stacks for body, code, and heading text.',
    headers: ['Token', 'Value'],
    formatRow: (name, value) => [name, value],
  },
  {
    key: 'textSize',
    previewType: 'font-sample',
    title: 'Font Size Tokens',
    description:
      'Geometric type scale: round(14 × 1.2^step). Base is 14px (--font-size-base).',
    headers: ['Token', 'Value'],
    formatRow: (name, value) => [name, value],
  },
  {
    key: 'fontWeight',
    previewType: 'font-sample',
    title: 'Font Weight Tokens',
    description: 'Font weight values for body, emphasis, and headings.',
    headers: ['Token', 'Value'],
    formatRow: (name, value) => [name, value],
  },
  {
    key: 'typeScale',
    previewType: 'font-sample',
    title: 'Type Scale Tokens',
    description:
      'Semantic tokens for headings, body, labels, code, supporting text, and display text. References font size and weight tokens. Override via typography.scale in defineTheme.',
    headers: ['Token', 'Value'],
    formatRow: (name, value) => [name, value],
  },
];

// ---------------------------------------------------------------------------
// 2. Build sections
// ---------------------------------------------------------------------------

const sections = [];
const tokenGroupsByKey = new Map(
  documentedTokenGroups.map(group => [group.key, group]),
);

for (const group of groups) {
  const metadataGroup = tokenGroupsByKey.get(group.key);
  const pairs = metadataGroup?.tokens.map(token => [token.name, token.value]) ?? [];
  if (pairs.length === 0) continue;

  const rows = pairs.map(([name, value]) => group.formatRow(name, value));

  const content = [
    {type: 'prose', text: group.description},
    {type: 'table', headers: group.headers, rows},
  ];

  const section = {title: group.title, content};
  if (group.previewType) section.previewType = group.previewType;
  sections.push(section);
}

// Add a usage section at the end (hand-written, not generated)
sections.push({
  title: 'Usage in Svelte',
  content: [
    {
      type: 'code',
      lang: 'css',
      label: 'Plain CSS app.css',
      code: '@import "@astryxdesign/svelte/styles.css";',
    },
    {
      type: 'code',
      lang: 'css',
      label: 'Tailwind app.css',
      code: `@import "tailwindcss";
@import "@astryxdesign/svelte/tailwind.css";

@source "./**/*.{svelte,ts}";`,
    },
    {
      type: 'code',
      lang: 'svelte',
      label: 'Token-backed utilities',
      code: `<section class="rounded-lg border border-border bg-card p-4 text-primary shadow-sm">
  <p class="text-secondary">Token-backed utilities follow the active Astryx theme.</p>
</section>`,
    },
    {
      type: 'prose',
      text: 'See `npx astryx docs styling` for plain CSS, Tailwind, and component styling rules. See `npx astryx docs theme` for overriding tokens with defineTheme.',
    },
  ],
});

// ---------------------------------------------------------------------------
// 3. Write output (or check for drift)
// ---------------------------------------------------------------------------

const isCheck = process.argv.includes('--check');

// Count current tokens for the header comment. Deprecated compatibility tokens
// stay in packages/tokens metadata but are intentionally omitted from docs.
const totalTokens = groups.reduce(
  (sum, g) => sum + (tokenGroupsByKey.get(g.key)?.tokens.length ?? 0),
  0,
);
const totalGroups = groups.filter(group => tokenGroupsByKey.has(group.key))
  .length;

const output = `\
// Copyright (c) Meta Platforms, Inc. and affiliates.

// AUTO-GENERATED - do not edit manually.
// Source: packages/tokens
// Run: node scripts/generate-token-docs.mjs
// Total: ${totalTokens} current tokens across ${totalGroups} categories.
// Deprecated transition shorthands remain in packages/tokens metadata for compatibility.

export const docs = ${JSON.stringify(
  {
    name: 'tokens',
    title: 'All Tokens',
    category: 'foundations',
    description:
      'Complete reference for spacing, color, radius, typography, shadow, motion, and size tokens.',
    sections,
  },
  null,
  2,
)};
`;

if (isCheck) {
  // CI mode: compare generated output to existing file
  let existing = '';
  try {
    existing = readFileSync(TOKENS_DOC, 'utf-8');
  } catch {
    console.error('✗ tokens.doc.mjs does not exist. Run: node scripts/generate-token-docs.mjs');
    process.exit(1);
  }
  if (existing !== output) {
    console.error('✗ tokens.doc.mjs is out of date. Run: node scripts/generate-token-docs.mjs');
    process.exit(1);
  }
  console.log(`✓ tokens.doc.mjs is up to date (${totalTokens} tokens)`);
} else {
  writeFileSync(TOKENS_DOC, output);
  const lineCount = output.split('\n').length;
  console.log(
    `✓ Generated ${TOKENS_DOC} (${totalTokens} tokens, ${lineCount} lines)`,
  );
}
