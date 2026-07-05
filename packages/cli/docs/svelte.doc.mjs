// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file svelte.doc.mjs
 * @input @astryxdesign/svelte package metadata and CLI framework options
 * @output Svelte/Tailwind CLI reference docs
 * @position Docs topic consumed by `astryx docs svelte`
 */

export const docs = {
  name: 'svelte',
  title: 'Svelte and Tailwind',
  category: 'guide',
  description: 'Use Astryx Svelte components with Tailwind v4 token utilities and Svelte-first CLI commands.',
  sections: [
    {
      title: 'Package Setup',
      content: [
        {
          type: 'list',
          items: [
            'Install `@astryxdesign/svelte`, `@astryxdesign/tokens`, and Svelte 5.',
            'Import `@astryxdesign/svelte/styles.css` once from the app entry or root layout.',
            'Import `@astryxdesign/tokens/tailwind-theme.css` when using Tailwind utilities.',
            'Use semantic utilities such as `bg-card`, `text-primary`, `border-border`, `rounded-lg`, and `shadow-sm`.',
          ],
        },
      ],
    },
    {
      title: 'Component Imports',
      content: [
        {
          type: 'code',
          lang: 'svelte',
          label: 'Grouped imports',
          code: `<script lang="ts">
  import {Button, Card, Heading, Text, VStack} from '@astryxdesign/svelte';
</script>

<Card>
  <VStack gap={3}>
    <Heading level={2}>Svelte native</Heading>
    <Text>Components render with Astryx token-backed classes.</Text>
    <Button label="Continue" />
  </VStack>
</Card>`,
        },
      ],
    },
    {
      title: 'CLI Examples',
      content: [
        {
          type: 'list',
          items: [
            '`astryx component Button --dense` prints Svelte docs and import hints.',
            '`astryx template app-shell --skeleton` prints a `.svelte` layout skeleton.',
            '`astryx template app-shell ./src/routes` scaffolds `page.svelte`.',
            '`astryx swizzle Button --gap` copies Svelte component source for local ownership.',
          ],
        },
      ],
    },
  ],
};
