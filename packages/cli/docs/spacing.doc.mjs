// Copyright (c) Meta Platforms, Inc. and affiliates.

export const docs = {
  name: 'spacing',
  title: 'Spacing',
  category: 'foundations',
  description: 'Spacing tokens for Svelte layout, component gaps, and Tailwind utilities.',
  sections: [
    {
      title: 'Scale',
      content: [
        {
          type: 'prose',
          text: 'Astryx spacing follows a compact 4px rhythm with smaller steps for dense component internals. Prefer component gap props when available and token-backed Tailwind utilities for page layout.',
        },
      ],
    },
    {
      title: 'Usage',
      content: [
        {
          type: 'code',
          lang: 'svelte',
          label: 'Svelte layout',
          code: '<VStack gap={4}>\\n  <Card>...</Card>\\n  <Card>...</Card>\\n</VStack>',
        },
      ],
    },
  ],
};
