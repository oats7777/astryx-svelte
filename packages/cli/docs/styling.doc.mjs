// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file styling.doc.mjs
 * @input Svelte class props, CSS variables, and Tailwind v4 token bridge
 * @output Styling guide for Astryx Svelte consumers
 * @position Docs topic consumed by `astryx docs styling`
 */

export const docs = {
  name: 'styling',
  title: 'Styling',
  category: 'guide',
  description: 'Customize Astryx Svelte with semantic CSS variables, component props, and Tailwind v4 utilities.',
  sections: [
    {
      title: 'Preferred Order',
      content: [
        {
          type: 'list',
          items: [
            'Use component props for supported variants, sizes, density, and state.',
            'Use Tailwind v4 semantic utilities for layout and local composition.',
            'Use CSS variables for theme-level visual changes.',
            'Swizzle a component when you need to own its internal markup or behavior.',
          ],
        },
      ],
    },
    {
      title: 'Tailwind Bridge',
      content: [
        {
          type: 'code',
          lang: 'css',
          label: 'app.css',
          code: `@import "tailwindcss";
@import "@astryxdesign/svelte/styles.css";
@import "@astryxdesign/tokens/tailwind-theme.css";

@source "./**/*.{svelte,ts}";
@source "../node_modules/@astryxdesign/svelte/dist/**/*.{svelte,js}";`,
        },
      ],
    },
    {
      title: 'Do Not',
      content: [
        {
          type: 'list',
          style: 'dont',
          items: [
            'Do not reintroduce React-only `className` docs as the primary API; Svelte uses `class` and component props.',
            'Do not add StyleX imports in Svelte apps.',
            'Do not hardcode raw color, spacing, radius, typography, or shadow values when a token exists.',
          ],
        },
      ],
    },
  ],
};
