// Copyright (c) Meta Platforms, Inc. and affiliates.

export const docs = {
  name: 'migration',
  title: 'Migration',
  category: 'guide',
  description: 'Move an app to the Svelte-native Astryx package line.',
  sections: [
    {
      title: 'Install Svelte Package Line',
      content: [
        {
          type: 'code',
          lang: 'bash',
          label: 'Terminal',
          code: 'pnpm add @astryxdesign/svelte @astryxdesign/tokens\npnpm add -D @astryxdesign/cli',
        },
      ],
    },
    {
      title: 'Replace Runtime Assumptions',
      content: [
        {
          type: 'list',
          items: [
            'Replace React component imports with Svelte component imports from `@astryxdesign/svelte`.',
            'Replace theme package CSS imports with `@astryxdesign/svelte/styles.css` and token CSS.',
            'Use Svelte slots/events/bindings instead of React children and event props where component docs specify them.',
            'Run `astryx doctor --json` in the consumer project after migration.',
          ],
        },
      ],
    },
  ],
};
