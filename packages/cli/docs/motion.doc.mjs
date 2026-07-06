// Copyright (c) Meta Platforms, Inc. and affiliates.

export const docs = {
  name: 'motion',
  title: 'Motion',
  category: 'foundations',
  description: 'Motion tokens and interaction rules for Svelte components.',
  sections: [
    {
      title: 'Rules',
      content: [
        {
          type: 'list',
          items: [
            'Use component-provided transitions before adding custom animation.',
            'Animate transform, opacity, or color; avoid layout animation for routine UI state.',
            'Respect reduced-motion preferences for non-essential motion.',
          ],
        },
      ],
    },
  ],
};
