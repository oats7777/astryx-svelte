// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file theme.doc.mjs
 * @input Svelte theme runtime APIs
 * @output Theme docs for Astryx Svelte
 * @position Docs topic consumed by `astryx docs theme`
 */

export const docs = {
  name: 'theme',
  title: 'Theme System',
  category: 'guide',
  description: 'Theme provider, defineTheme, light/dark mode, and CSS generation for Svelte apps.',
  sections: [
    {
      title: 'Theme Provider',
      content: [
        {
          type: 'code',
          lang: 'svelte',
          label: 'Theme.svelte',
          code: `<script lang="ts">
  import {Theme, defineTheme} from '@astryxdesign/svelte/theme';

  const theme = defineTheme({name: 'product'});
</script>

<Theme {theme} mode="light">
  <slot />
</Theme>`,
        },
      ],
    },
    {
      title: 'Build Theme CSS',
      content: [
        {
          type: 'code',
          lang: 'bash',
          label: 'CLI',
          code: 'astryx theme build ./src/theme.ts --out ./src/theme.css',
        },
        {
          type: 'prose',
          text: 'The builder loads a `defineTheme()` export and emits static CSS. This keeps SSR and app startup independent of runtime style injection.',
        },
      ],
    },
    {
      title: 'Token Overrides',
      content: [
        {
          type: 'code',
          lang: 'ts',
          label: 'theme.ts',
          code: `import {defineTheme} from '@astryxdesign/svelte/theme';

export const productTheme = defineTheme({
  name: 'product',
  tokens: {
    color: {
      accent: '#0a66c2',
    },
  },
});`,
        },
      ],
    },
  ],
};
