// Copyright (c) Meta Platforms, Inc. and affiliates.

export const docs = {
  name: 'typography',
  title: 'Typography',
  category: 'foundations',
  description: 'Text hierarchy for Astryx Svelte foundations.',
  sections: [
    {
      title: 'Components',
      content: [
        {
          type: 'code',
          lang: 'svelte',
          label: 'Text hierarchy',
          code: `<script lang="ts">
  import {Heading, Text, VStack} from '@astryxdesign/svelte';
</script>

<VStack gap={2}>
  <Heading level={2}>Account settings</Heading>
  <Text tone="secondary">Manage workspace access and billing.</Text>
</VStack>`,
        },
      ],
    },
  ],
};
