// Copyright (c) Meta Platforms, Inc. and affiliates.

export const docs = {
  name: 'working-with-ai',
  title: 'Working With AI',
  category: 'guide',
  description: 'Use branch-local CLI docs so agents generate correct Astryx Svelte code.',
  sections: [
    {
      title: 'Agent Bootstrap',
      content: [
        {
          type: 'code',
          lang: 'bash',
          label: 'Terminal',
          code: 'XDS="node packages/cli/bin/astryx.mjs"\n$XDS docs svelte --dense\n$XDS component --list\n$XDS template --list',
        },
      ],
    },
    {
      title: 'Rules',
      content: [
        {
          type: 'list',
          items: [
            'Have the agent inspect `astryx component <Name> --dense` before generating component usage.',
            'Prefer documented props and slots over invented APIs.',
            'Require `astryx doctor --json` output when setup fails.',
            'Use `internal/vibe-tests/AGENTS.svelte.md` for Svelte target evaluation.',
          ],
        },
      ],
    },
  ],
};
