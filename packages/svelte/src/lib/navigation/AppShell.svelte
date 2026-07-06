<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file AppShell.svelte
   * @input Top nav, side nav, mobile breakpoint, and main content models
   * @output Application shell with skip link, responsive drawer, and main landmark
   * @position Todo 12 app shell component
   */

  import MobileNav from './MobileNav.svelte';
  import SideNav from './SideNav.svelte';
  import TopNav from './TopNav.svelte';
  import {breakpointQuery} from './navigation-utils.js';
  import type {Snippet} from 'svelte';
  import type {MobileNavConfig, NavItemModel} from './types.js';

  let {
    title = undefined,
    topNavItems = [],
    sideNavItems = [],
    mobileNav = {},
    children = undefined,
    content = '',
    'data-testid': testId = undefined,
  } = $props<{
    readonly title?: string;
    readonly topNavItems?: readonly NavItemModel[];
    readonly sideNavItems?: readonly NavItemModel[];
    readonly mobileNav?: MobileNavConfig;
    readonly children?: Snippet;
    readonly content?: string;
    readonly 'data-testid'?: string;
  }>();

  let measuredIsMobile = $state(false);
  let hasMeasuredMedia = $state(false);
  let mobileOpen = $state(false);
  const hasTopNav = $derived(title != null || topNavItems.length > 0);
  const hasSideNav = $derived(sideNavItems.length > 0);
  const drawerItems = $derived([...topNavItems, ...sideNavItems]);
  const displayMobile = $derived(hasMeasuredMedia ? measuredIsMobile : mobileNav.defaultIsMobile === true);

  function mediaQueryAction(_node: HTMLElement): {readonly destroy?: () => void} {
    if (mobileNav.breakpoint === 'none') {
      measuredIsMobile = false;
      hasMeasuredMedia = true;
      return {};
    }
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return {};
    }
    const matcher = window.matchMedia(breakpointQuery(mobileNav.breakpoint));
    const update = (event: MediaQueryList | MediaQueryListEvent): void => {
      measuredIsMobile = event.matches;
      hasMeasuredMedia = true;
      if (!event.matches) {
        mobileOpen = false;
      }
    };
    update(matcher);
    matcher.addEventListener('change', update);
    return {destroy: () => matcher.removeEventListener('change', update)};
  }
</script>

<div
  use:mediaQueryAction
  class="astryx-app-shell"
  data-testid={testId}
>
  <a
    href="#astryx-app-shell-main"
    data-testid="skip-to-content"
    class="astryx-skip-link"
  >
    Skip to content
  </a>
  {#if hasTopNav}
    <header class="astryx-app-shell__header">
      <div class="astryx-app-shell__topbar">
        {#if displayMobile && hasSideNav}
          <button
            type="button"
            class="astryx-nav-button astryx-app-shell__menu-button"
            aria-label="Open navigation"
            aria-controls="astryx-mobile-nav"
            aria-expanded={mobileOpen ? 'true' : 'false'}
            onclick={() => {
              mobileOpen = true;
            }}
          >
            Menu
          </button>
        {/if}
        <div class="astryx-app-shell__topnav">
          <TopNav title={title} items={topNavItems} />
        </div>
      </div>
    </header>
  {:else if displayMobile && hasSideNav}
    <header class="astryx-app-shell__mobile-header">
      <button
        type="button"
        class="astryx-nav-button"
        aria-label="Open navigation"
        aria-controls="astryx-mobile-nav"
        aria-expanded={mobileOpen ? 'true' : 'false'}
        onclick={() => {
          mobileOpen = true;
        }}
      >
        Menu
      </button>
    </header>
  {/if}

  {#if displayMobile && hasSideNav}
    <MobileNav open={mobileOpen} items={drawerItems} onOpenChange={(next) => (mobileOpen = next)} />
  {/if}

  <div class="astryx-app-shell__body">
    {#if hasSideNav && !displayMobile}
      <aside data-astryx-inline-sidenav="true" class="astryx-app-shell__sidenav">
        <SideNav items={sideNavItems} />
      </aside>
    {/if}
    <main id="astryx-app-shell-main" class="astryx-app-shell__main" tabindex="-1">
      {#if children}
        {@render children()}
      {:else}
        {content}
      {/if}
    </main>
  </div>
</div>
