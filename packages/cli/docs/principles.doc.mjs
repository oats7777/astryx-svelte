// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file principles.doc.mjs
 * @input Astryx Svelte component and token conventions
 * @output Design-system principles for Svelte consumers and agents
 * @position Docs topic consumed by `astryx docs principles`
 */

export const docs = {
  name: 'principles',
  title: 'Principles',
  category: 'guide',
  description: 'Rules that keep Astryx Svelte components, tokens, and generated code consistent.',
  sections: [
    {
      title: 'Rules',
      content: [
        {
          type: 'list',
          items: [
            'Use Astryx Svelte components for supported UI primitives before custom markup.',
            'Use semantic tokens for color, spacing, radius, typography, and shadow.',
            'Use Svelte component props and slots for composition.',
            'Use Tailwind v4 utilities for layout only when they resolve through Astryx tokens.',
            'Use CLI docs and component metadata before inventing component APIs.',
          ],
        },
      ],
    },
    {
      title: 'Agent Workflow',
      content: [
        {
          type: 'list',
          items: [
            'Run `astryx component --list` to discover components.',
            'Run `astryx component <Name> --dense` before editing or generating usage.',
            'Run `astryx template --list` before scaffolding screens.',
            'Run `astryx doctor --json` when a consumer project has setup problems.',
          ],
        },
      ],
    },
  ],
};
