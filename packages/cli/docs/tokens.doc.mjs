// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tokens.doc.mjs
 * @input @astryxdesign/tokens outputs
 * @output Token reference for Svelte and Tailwind consumers
 * @position Docs topic consumed by `astryx docs tokens`
 */

export const docs = {
  name: 'tokens',
  title: 'Tokens',
  category: 'foundations',
  description: 'Framework-neutral Astryx token outputs for CSS variables, Tailwind v4 utilities, and JSON metadata.',
  sections: [
    {
      title: 'Outputs',
      content: [
        {
          type: 'table',
          headers: ['Export', 'Use'],
          rows: [
            ['@astryxdesign/tokens/default.css', 'Base semantic CSS variables'],
            ['@astryxdesign/tokens/tailwind-theme.css', 'Tailwind v4 `@theme inline` bridge'],
            ['@astryxdesign/tokens/tokens.json', 'Tooling and documentation metadata'],
            ['@astryxdesign/tokens', 'TypeScript token helpers and generated CSS strings'],
          ],
        },
      ],
    },
    {
      title: 'Svelte Usage',
      content: [
        {
          type: 'code',
          lang: 'css',
          label: 'app.css',
          code: '@import "@astryxdesign/svelte/styles.css";\n@import "@astryxdesign/tokens/tailwind-theme.css";',
        },
        {
          type: 'code',
          lang: 'svelte',
          label: 'Component layout',
          code: `<section class="rounded-lg border border-border bg-card p-4 text-primary shadow-sm">
  <p class="text-secondary">Token-backed Tailwind utilities follow the active Astryx theme.</p>
</section>`,
        },
      ],
    },
    {
      title: 'Token Families',
      content: [
        {
          type: 'list',
          items: [
            'Color: body, surface, card, popover, border, accent, success, warning, error, and text roles.',
            'Spacing and size: 4px-based rhythm with compact control sizes.',
            'Radius: inner, element, container, panel, and full.',
            'Typography: body, heading, code, weights, sizes, and line heights.',
            'Shadow and motion: elevation and transition primitives.',
          ],
        },
      ],
    },
  ],
};
