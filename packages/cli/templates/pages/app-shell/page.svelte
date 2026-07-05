<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file page.svelte
   * @input Astryx Svelte navigation components and Tailwind token utilities
   * @output Svelte app shell starter page
   * @position Framework-specific template source for `astryx template app-shell --framework svelte`
   */

  import {AppShell, Button, Theme, defineTheme} from '@astryxdesign/svelte';
  import '@astryxdesign/svelte/styles.css';

  const appTheme = defineTheme({name: 'svelte-app-shell'});

  const topNavItems = [
    {label: 'Overview', value: 'overview', href: '#overview', active: true},
    {label: 'Reports', value: 'reports', href: '#reports'},
    {label: 'Settings', value: 'settings', href: '#settings'},
  ];

  const sideNavItems = [
    {label: 'Dashboard', value: 'dashboard', href: '#dashboard', active: true},
    {label: 'Customers', value: 'customers', href: '#customers'},
    {label: 'Automations', value: 'automations', href: '#automations'},
  ];
</script>

<Theme theme={appTheme} mode="light">
  <AppShell
    title="Astryx"
    {topNavItems}
    {sideNavItems}
    mobileNav={{breakpoint: 'md'}}
    data-testid="svelte-app-shell"
  >
    <section
      id="overview"
      class="mx-auto grid w-full max-w-6xl gap-4 px-4 py-6 md:grid-cols-[minmax(0,1fr)_18rem]"
      aria-labelledby="app-shell-title"
    >
      <div class="min-w-0 rounded-lg border border-border bg-card p-5 shadow-sm">
        <p class="text-sm font-medium text-accent">Svelte + Tailwind</p>
        <h1 id="app-shell-title" class="mt-2 text-3xl font-semibold tracking-normal text-primary">
          Operational app shell
        </h1>
        <p class="mt-3 max-w-2xl text-base text-secondary">
          Compose Astryx Svelte navigation with token-backed Tailwind utilities for dense internal tools.
        </p>
        <div class="mt-5 flex flex-wrap gap-2">
          <Button label="Create report" variant="primary" />
          <Button label="View settings" href="#settings" variant="secondary" />
        </div>
      </div>

      <aside class="min-w-0 rounded-lg border border-border bg-surface p-4 shadow-sm">
        <h2 class="text-lg font-semibold text-primary">Status</h2>
        <dl class="mt-4 grid gap-3 text-sm">
          <div class="flex items-center justify-between gap-3">
            <dt class="text-secondary">Framework</dt>
            <dd class="font-medium text-primary">Svelte</dd>
          </div>
          <div class="flex items-center justify-between gap-3">
            <dt class="text-secondary">Styling</dt>
            <dd class="font-medium text-primary">Tailwind tokens</dd>
          </div>
        </dl>
      </aside>
    </section>
  </AppShell>
</Theme>
