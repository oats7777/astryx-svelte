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
  class="astryx-app-shell flex min-h-dvh flex-col bg-[var(--color-background-canvas)] text-[var(--color-text-primary)]"
  data-testid={testId}
>
  <a
    href="#astryx-app-shell-main"
    data-testid="skip-to-content"
    class="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50"
  >
    Skip to content
  </a>
  {#if hasTopNav}
    <header class="sticky top-0 z-10">
      <div class="flex items-center gap-2 bg-[var(--color-background-surface)]">
        {#if displayMobile && hasSideNav}
          <button
            type="button"
            class="ml-2 rounded-md px-3 py-2 text-sm font-medium"
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
        <div class="min-w-0 flex-1">
          <TopNav title={title} items={topNavItems} />
        </div>
      </div>
    </header>
  {:else if displayMobile && hasSideNav}
    <header class="border-b border-[var(--color-border)] bg-[var(--color-background-surface)] p-2">
      <button
        type="button"
        class="rounded-md px-3 py-2 text-sm font-medium"
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

  <div class="flex min-h-0 flex-1">
    {#if hasSideNav && !displayMobile}
      <aside data-astryx-inline-sidenav="true" class="min-h-0">
        <SideNav items={sideNavItems} />
      </aside>
    {/if}
    <main id="astryx-app-shell-main" class="min-w-0 flex-1 p-4" tabindex="-1">
      {#if children}
        {@render children()}
      {:else}
        {content}
      {/if}
    </main>
  </div>
</div>
