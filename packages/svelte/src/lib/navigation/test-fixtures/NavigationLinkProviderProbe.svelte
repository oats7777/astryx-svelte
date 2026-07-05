<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file NavigationLinkProviderProbe.svelte
   * @input LinkProvider plus Svelte navigation components with href-backed items
   * @output Router-link replacement fixture for navigation behavior tests
   * @position Test fixture proving navigation components consume LinkProvider
   */

  import LinkProvider from '../../actions/LinkProvider.svelte';
  import RouterLinkProbe from '../../actions/test-fixtures/RouterLinkProbe.svelte';
  import Breadcrumbs from '../Breadcrumbs.svelte';
  import MobileNav from '../MobileNav.svelte';
  import NavItem from '../NavItem.svelte';
  import SideNav from '../SideNav.svelte';
  import TopNav from '../TopNav.svelte';
</script>

<LinkProvider component={RouterLinkProbe}>
  <NavItem label="Docs" href="/docs" active data-testid="provider-nav-item" />
  <NavItem label="Disabled docs" href="/disabled-docs" disabled data-testid="provider-disabled-nav-item" />
  <TopNav
    title="Astryx"
    label="Provider top navigation"
    items={[{label: 'Home', href: '/'}]}
    endItems={[{label: 'Settings', href: '/settings'}]}
  />
  <Breadcrumbs
    data-testid="provider-breadcrumbs"
    items={[
      {label: 'Home crumb', href: '/'},
      {label: 'Project crumb', href: '/projects'},
      {label: 'Detail crumb', current: true},
    ]}
  />
  <SideNav label="Provider side navigation" items={[{label: 'Side docs', href: '/side'}]} />
  <MobileNav title="Provider mobile navigation" items={[{label: 'Mobile docs', href: '/mobile'}]} />
</LinkProvider>
