// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file getting-started.doc.mjs
 * @input Astryx Svelte package setup and CLI bootstrap commands
 * @output Svelte-first getting started reference
 * @position Docs topic consumed by `astryx docs getting-started`
 */

export const docs = {
  name: 'getting-started',
  title: 'Getting Started',
  category: 'guide',
  description: 'Install Astryx Svelte and start building with token-backed components.',
  sections: [
    {
      title: 'Install',
      content: [
        {
          type: 'code',
          lang: 'bash',
          label: 'Terminal',
          code: 'pnpm add @astryxdesign/svelte @astryxdesign/tokens\npnpm add -D @astryxdesign/cli',
        },
        {
          type: 'prose',
          text: 'Use Svelte 5. Tailwind v4 is optional for layout utilities. Plain CSS consumers only need `@astryxdesign/svelte/styles.css`; Tailwind consumers can use `@astryxdesign/svelte/tailwind.css`.',
        },
      ],
    },
    {
      title: 'CSS Entry',
      content: [
        {
          type: 'code',
          lang: 'css',
          label: 'src/app.css',
          code: '@import "@astryxdesign/svelte/styles.css";',
        },
        {
          type: 'code',
          lang: 'css',
          label: 'src/app.css with Tailwind',
          code: '@import "tailwindcss";\n@import "@astryxdesign/svelte/tailwind.css";\n\n@source "./**/*.{svelte,ts}";',
        },
      ],
    },
    {
      title: 'First Component',
      content: [
        {
          type: 'code',
          lang: 'svelte',
          label: 'App.svelte',
          code: `<script lang="ts">
  import {Button, Theme, defineTheme} from '@astryxdesign/svelte';

  const theme = defineTheme({name: 'product'});
</script>

<Theme {theme} mode="light">
  <Button label="Create report" variant="primary" />
</Theme>`,
        },
      ],
    },
    {
      title: 'CLI Bootstrap',
      content: [
        {
          type: 'list',
          items: [
            '`astryx docs svelte --dense` for Svelte setup rules.',
            '`astryx component --list` to inspect available components.',
            '`astryx component Button --dense` before editing or swizzling.',
            '`astryx template app-shell --skeleton` to inspect the Svelte app-shell template.',
            '`astryx doctor --json` to check package, styles, Tailwind, and version alignment.',
          ],
        },
      ],
    },
  ],
};
