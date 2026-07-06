<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file AppShellContentProbe.svelte
   * @input AppShell with normal Svelte child content
   * @output Test fixture proving children render inside the main landmark
   * @position Navigation behavior fixture for AppShell content composition
   */

  import AppShell from '../AppShell.svelte';

  const topNavItems = [{label: 'Overview', href: '#overview', active: true}];
  const sideNavItems = [{label: 'Settings', href: '#settings'}];
</script>

<AppShell
  title="Astryx"
  {topNavItems}
  {sideNavItems}
  mobileNav={{defaultIsMobile: false, breakpoint: 'none'}}
  data-testid="shell-with-children"
>
  <section id="overview" data-testid="nested-shell-content" aria-labelledby="nested-shell-title">
    <h1 id="nested-shell-title">Nested child content</h1>
    <button type="button">Child action</button>
  </section>
</AppShell>
