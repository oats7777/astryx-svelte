<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  type PackageInfo = {
    readonly name: string;
    readonly path: string;
    readonly purpose: string;
    readonly visibility: 'public' | 'private';
  };

  type CommandInfo = {
    readonly label: string;
    readonly command: string;
  };

  const packages: readonly PackageInfo[] = [
    {
      name: '@astryxdesign/svelte',
      path: 'packages/svelte',
      purpose: 'Svelte 5 components, theme runtime, docs metadata, and CSS entrypoint.',
      visibility: 'public',
    },
    {
      name: '@astryxdesign/tokens',
      path: 'packages/tokens',
      purpose: 'Framework-neutral token source with generated CSS, Tailwind theme CSS, and JSON.',
      visibility: 'public',
    },
    {
      name: '@astryxdesign/cli',
      path: 'packages/cli',
      purpose: 'Component docs, templates, swizzling, theme CSS generation, and agent docs.',
      visibility: 'public',
    },
    {
      name: '@astryxdesign/svelte-lab',
      path: 'packages/svelte-lab',
      purpose: 'Private parity and experimental Svelte surfaces.',
      visibility: 'private',
    },
    {
      name: '@astryxdesign/svelte-vega',
      path: 'packages/svelte-vega',
      purpose: 'Private Vega and Vega-Lite Svelte wrapper.',
      visibility: 'private',
    },
  ] as const;

  const commands: readonly CommandInfo[] = [
    {label: 'List components', command: 'astryx component --list'},
    {label: 'Inspect Button', command: 'astryx component Button --dense'},
    {label: 'Read Svelte docs', command: 'astryx docs svelte --dense'},
    {label: 'Template skeleton', command: 'astryx template app-shell --skeleton'},
    {label: 'Swizzle source', command: 'astryx swizzle Button --gap'},
    {label: 'Doctor', command: 'astryx doctor --json'},
  ] as const;

  const checks = [
    'pnpm build',
    'pnpm check:svelte',
    'pnpm test',
    'pnpm check:repo',
    'pnpm -F @astryxdesign/svelte-storybook build',
    'pnpm -F @astryxdesign/example-svelte-tailwind build',
  ] as const;
</script>

<svelte:head>
  <title>Astryx Svelte Docs</title>
</svelte:head>

<main class="docs-shell">
  <header class="hero">
    <div class="hero-copy">
      <p class="eyebrow">Svelte release line</p>
      <h1>Astryx Svelte</h1>
      <p>
        Svelte 5 + Tailwind v4 implementation of the Astryx design system, including
        components, tokens, CLI metadata, templates, and agent-facing docs.
      </p>
    </div>
    <div class="install-panel" aria-label="Install command">
      <span>Install</span>
      <code>pnpm add @astryxdesign/svelte @astryxdesign/tokens</code>
    </div>
  </header>

  <section class="section">
    <div class="section-heading">
      <h2>Packages</h2>
      <p>Public packages are publishable. Private packages stay in the repo for parity and visual coverage.</p>
    </div>
    <div class="package-grid">
      {#each packages as pkg}
        <article class="package-card">
          <div class="card-heading">
            <h3>{pkg.name}</h3>
            <span data-visibility={pkg.visibility}>{pkg.visibility}</span>
          </div>
          <p>{pkg.purpose}</p>
          <code>{pkg.path}</code>
        </article>
      {/each}
    </div>
  </section>

  <section class="split-section">
    <div class="panel">
      <h2>CLI Surface</h2>
      <div class="command-list">
        {#each commands as item}
          <div class="command-row">
            <span>{item.label}</span>
            <code>{item.command}</code>
          </div>
        {/each}
      </div>
    </div>

    <div class="panel">
      <h2>Release Checks</h2>
      <ul class="check-list">
        {#each checks as check}
          <li><code>{check}</code></li>
        {/each}
      </ul>
    </div>
  </section>
</main>
