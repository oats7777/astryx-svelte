<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file AccessibilityHarness.svelte
   * @input Representative Todo 14 rich-surfaces components
   * @output Mounted DOM for package-local axe scan
   * @position A11y fixture for rich-surfaces
   */

  import Carousel from '../Carousel.svelte';
  import Chat from '../Chat.svelte';
  import CodeBlock from '../CodeBlock.svelte';
  import Collapsible from '../Collapsible.svelte';
  import CommandPalette from '../CommandPalette.svelte';
  import Markdown from '../Markdown.svelte';
  import Resizable from '../Resizable.svelte';

  const items = [
    {id: 'one', src: '/one.jpg', alt: 'First image', caption: 'One'},
    {id: 'two', src: '/two.jpg', alt: 'Second image', caption: 'Two'},
  ] as const;

  const messages = [
    {id: 'u1', role: 'user', content: 'Show status'},
    {id: 'a1', role: 'assistant', content: 'All systems nominal'},
  ] as const;

  const source = {
    bootstrap: () => [{id: 'open-file', label: 'Open File', auxiliaryData: {group: 'Navigate'}}],
    search: () => [{id: 'open-file', label: 'Open File', auxiliaryData: {group: 'Navigate'}}],
  };
</script>

<CommandPalette open={true} label="Commands" searchSource={source} />
<Collapsible trigger="Details" content="Diagnostic details" defaultOpen={true} />
<Markdown content={'## Notes\n\nUse `pnpm test`.'} />
<CodeBlock code={'const ok = true'} language="ts" showLineNumbers={true} />
<Chat {messages} />
<Carousel {items} label="Gallery" />
<Resizable label="Sidebar width" defaultSize={240} minSize={180} maxSize={320} />
