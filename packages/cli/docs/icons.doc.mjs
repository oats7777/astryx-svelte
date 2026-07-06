// Copyright (c) Meta Platforms, Inc. and affiliates.

export const docs = {
  name: 'icons',
  title: 'Icons',
  category: 'foundations',
  description: 'Icon rendering guidance for Astryx Svelte.',
  sections: [
    {
      title: 'Usage',
      content: [
        {
          type: 'prose',
          text: 'Use the Svelte `Icon` and icon registry APIs exposed by `@astryxdesign/svelte/icon`. Keep icon names stable so components, docs, and agent output agree.',
        },
        {
          type: 'code',
          lang: 'svelte',
          label: 'Icon',
          code: `<script lang="ts">
  import {Icon} from '@astryxdesign/svelte';
</script>

<Icon name="search" label="Search" />`,
        },
      ],
    },
  ],
};
