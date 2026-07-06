<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file page.svelte
   * @input Astryx Svelte navigation components and plain CSS token variables
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
      class="astryx-template-shell"
      aria-labelledby="app-shell-title"
    >
      <div class="astryx-template-card">
        <p class="astryx-template-eyebrow">Svelte + CSS</p>
        <h1 id="app-shell-title" class="astryx-template-title">
          Operational app shell
        </h1>
        <p class="astryx-template-copy">
          Compose Astryx Svelte navigation with package CSS and app-local token variables for dense internal tools.
        </p>
        <div class="astryx-template-actions">
          <Button label="Create report" variant="primary" />
          <Button label="View settings" href="#settings" variant="secondary" />
        </div>
      </div>

      <aside class="astryx-template-card astryx-template-status">
        <h2 class="astryx-template-status-title">Status</h2>
        <dl class="astryx-template-list">
          <div class="astryx-template-row">
            <dt>Framework</dt>
            <dd>Svelte</dd>
          </div>
          <div class="astryx-template-row">
            <dt>Styling</dt>
            <dd>Plain CSS</dd>
          </div>
        </dl>
      </aside>
    </section>
  </AppShell>
</Theme>

<style>
  .astryx-template-shell {
    display: grid;
    gap: var(--spacing-4);
    inline-size: 100%;
    margin-inline: auto;
    max-inline-size: 72rem;
    padding: var(--spacing-6) var(--spacing-4);
  }

  .astryx-template-card {
    background: var(--color-background-card);
    border: var(--border-width) solid var(--color-border);
    border-radius: var(--radius-container);
    box-shadow: var(--shadow-low);
    min-inline-size: 0;
    padding: var(--spacing-5);
  }

  .astryx-template-eyebrow {
    color: var(--color-text-accent);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    margin: 0;
  }

  .astryx-template-title {
    color: var(--color-text-primary);
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-semibold);
    line-height: var(--line-height-tight);
    margin: var(--spacing-2) 0 0;
  }

  .astryx-template-copy {
    color: var(--color-text-secondary);
    font-size: var(--font-size-base);
    line-height: var(--line-height-normal);
    margin: var(--spacing-3) 0 0;
    max-inline-size: 42rem;
  }

  .astryx-template-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-2);
    margin-block-start: var(--spacing-5);
  }

  .astryx-template-status {
    background: var(--color-background-surface);
  }

  .astryx-template-status-title {
    color: var(--color-text-primary);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    margin: 0;
  }

  .astryx-template-list {
    display: grid;
    gap: var(--spacing-3);
    margin: var(--spacing-4) 0 0;
  }

  .astryx-template-row {
    align-items: center;
    display: flex;
    gap: var(--spacing-3);
    justify-content: space-between;
  }

  .astryx-template-row dt {
    color: var(--color-text-secondary);
  }

  .astryx-template-row dd {
    color: var(--color-text-primary);
    font-weight: var(--font-weight-medium);
    margin: 0;
  }

  @media (min-width: 48rem) {
    .astryx-template-shell {
      grid-template-columns: minmax(0, 1fr) 18rem;
    }
  }
</style>
