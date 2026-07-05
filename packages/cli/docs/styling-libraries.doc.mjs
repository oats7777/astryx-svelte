// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file styling-libraries.doc.mjs
 * @input Tailwind v4 and CSS variable interop guidance
 * @output Styling library integration docs for Astryx Svelte
 * @position Docs topic consumed by `astryx docs styling-libraries`
 */

export const docs = {
  name: 'styling-libraries',
  title: 'Styling Libraries',
  category: 'guide',
  description: 'Integrate Astryx Svelte tokens with Tailwind, plain CSS, CSS Modules, and visualization libraries.',
  sections: [
    {
      title: 'Tailwind v4',
      content: [
        {
          type: 'prose',
          text: 'Tailwind v4 is the primary utility layer. Import the token bridge and register local Svelte sources so utilities are generated for app and package markup.',
        },
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
      title: 'Plain CSS and CSS Modules',
      content: [
        {
          type: 'code',
          lang: 'css',
          label: 'component.css',
          code: `.panel {
  background: var(--color-background-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-element);
  color: var(--color-text-primary);
}`,
        },
      ],
    },
    {
      title: 'Charts and Canvas',
      content: [
        {
          type: 'prose',
          text: 'For non-CSS renderers, read CSS variables from the document root or consume `tokens.json`. Keep color role names in chart code instead of hardcoding theme-specific values.',
        },
      ],
    },
  ],
};
