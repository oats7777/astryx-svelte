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
          text: 'Tailwind v4 is optional. Import the Astryx Tailwind entrypoint and register local Svelte sources so utilities are generated for app markup; package source registration is included in the entrypoint.',
        },
        {
          type: 'code',
          lang: 'css',
          label: 'app.css',
          code: `@import "tailwindcss";
@import "@astryxdesign/svelte/tailwind.css";

@source "./**/*.{svelte,ts}";`,
        },
      ],
    },
    {
      title: 'Plain CSS and CSS Modules',
      content: [
        {
          type: 'prose',
          text: 'Plain CSS consumers import `@astryxdesign/svelte/styles.css` once and write app-local CSS against Astryx variables. No Tailwind plugin or `@source` directive is required.',
        },
        {
          type: 'code',
          lang: 'css',
          label: 'app.css',
          code: '@import "@astryxdesign/svelte/styles.css";',
        },
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
