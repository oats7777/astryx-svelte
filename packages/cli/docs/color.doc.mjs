// Copyright (c) Meta Platforms, Inc. and affiliates.

export const docs = {
  name: 'color',
  title: 'Color',
  category: 'foundations',
  description: 'Semantic color roles for Astryx Svelte components and Tailwind utilities.',
  sections: [
    {
      title: 'Roles',
      content: [
        {
          type: 'list',
          items: [
            '`bg-body`, `bg-surface`, `bg-card`, and `bg-popover` separate page and layered surfaces.',
            '`text-primary`, `text-secondary`, `text-disabled`, and `text-accent` describe content hierarchy.',
            '`border-border`, `border-emphasized`, `accent`, `success`, `warning`, and `error` roles carry state.',
          ],
        },
      ],
    },
    {
      title: 'Usage',
      content: [
        {
          type: 'code',
          lang: 'svelte',
          label: 'Token-backed utilities',
          code: '<section class="border border-border bg-card text-primary">\\n  <p class="text-secondary">Secondary text follows the active theme.</p>\\n</section>',
        },
      ],
    },
  ],
};
