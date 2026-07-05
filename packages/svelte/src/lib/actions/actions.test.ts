// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file actions.test.ts
 * @input Todo 8 Svelte action components and DOM-driven interactions
 * @output Parity assertions for actions, links, cards, tokens, and item primitives
 * @position Failing-first coverage for the Svelte actions component family
 */

import {mount, tick, unmount} from 'svelte';
import {describe, expect, it, vi} from 'vitest';
import ActionsProbe from './test-fixtures/ActionsProbe.svelte';
import LinkProviderHarness from './test-fixtures/LinkProviderHarness.svelte';
import {
  Button,
  Item,
  Link,
  SelectableCard,
  computeTargetAndRel,
  resolveInteractiveRole,
} from './index.js';

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return target;
}

describe('Svelte actions and links', () => {
  it('Given href is absent When Link renders Then it falls back to an accessible button', async () => {
    const target = createTarget();
    const onClick = vi.fn();
    const app = mount(Link, {
      target,
      props: {label: 'Open command', onClick},
    });

    await tick();

    const button = target.querySelector('button');
    expect(button?.textContent).toContain('Open command');
    expect(button?.type).toBe('button');
    expect(target.querySelector('a')).toBeNull();

    button?.click();
    expect(onClick).toHaveBeenCalledTimes(1);

    await unmount(app);
  });

  it('Given external navigation When Link renders Then target and rel are hardened', async () => {
    const target = createTarget();
    const app = mount(Link, {
      target,
      props: {href: 'https://example.com', label: 'Example', isExternalLink: true},
    });

    await tick();

    const anchor = target.querySelector('a');
    expect(anchor?.target).toBe('_blank');
    expect(anchor?.rel.split(/\s+/).sort()).toEqual(['noopener', 'noreferrer']);

    await unmount(app);
  });

  it('Given provider custom link component When links render Then router-compatible to props mirror href', async () => {
    const target = createTarget();
    const app = mount(LinkProviderHarness, {target});

    await tick();

    expect(target.querySelectorAll('[data-router-link="true"]')).toHaveLength(5);
    expect(target.querySelector('[data-testid="provider-link"]')?.getAttribute('href')).toBe('/docs');
    expect(target.querySelector('[data-testid="provider-link"]')?.getAttribute('data-to')).toBe(
      '/docs',
    );
    expect(target.querySelector('[data-testid="provider-button"]')?.getAttribute('href')).toBe(
      '/save',
    );
    expect(target.querySelector('[data-testid="provider-button"]')?.getAttribute('data-to')).toBe(
      '/save',
    );
    expect(target.querySelector('[data-testid="provider-card-link"]')?.getAttribute('href')).toBe(
      '/card',
    );
    expect(target.querySelector('[data-testid="provider-card-link"]')?.getAttribute('data-to')).toBe(
      '/card',
    );
    expect(target.querySelector('[data-testid="provider-token"]')?.getAttribute('data-to')).toBe(
      '/token',
    );
    expect(
      target.querySelector('[data-testid="provider-item"] [data-router-link="true"]')?.getAttribute(
        'data-to',
      ),
    ).toBe('/item');

    await unmount(app);
  });

  it('Given ButtonGroup is disabled When child buttons are activated Then all children are disabled', async () => {
    const target = createTarget();
    const disabledGroupClick = vi.fn();
    const app = mount(ActionsProbe, {
      target,
      props: {disabledGroupClick},
    });

    await tick();

    const group = target.querySelector('[data-testid="disabled-button-group"]');
    const buttons = group?.querySelectorAll('button');
    expect(group?.getAttribute('aria-disabled')).toBe('true');
    expect(buttons).toHaveLength(2);
    buttons?.forEach((button) => {
      expect(button.hasAttribute('disabled')).toBe(true);
      button.click();
    });
    expect(disabledGroupClick).not.toHaveBeenCalled();

    await unmount(app);
  });

  it('Given disabled and loading buttons When activated Then clicks are suppressed and disabled links render as buttons', async () => {
    const target = createTarget();
    const disabledClick = vi.fn();
    const loadingClick = vi.fn();
    const app = mount(ActionsProbe, {
      target,
      props: {disabledClick, loadingClick},
    });

    await tick();

    const disabledLinkButton = target.querySelector('[data-testid="disabled-link-button"]');
    const loadingButton = target.querySelector('[data-testid="loading-button"]');
    expect(disabledLinkButton?.tagName).toBe('BUTTON');
    expect(disabledLinkButton?.hasAttribute('disabled')).toBe(true);
    expect(loadingButton?.getAttribute('aria-busy')).toBe('true');

    (disabledLinkButton as HTMLButtonElement | null)?.click();
    (loadingButton as HTMLButtonElement | null)?.click();
    expect(disabledClick).not.toHaveBeenCalled();
    expect(loadingClick).not.toHaveBeenCalled();

    await unmount(app);
  });

  it('Given selectable card names When rendered and toggled Then hidden checkbox provides accessible form state', async () => {
    const target = createTarget();
    const onChange = vi.fn();
    const app = mount(SelectableCard, {
      target,
      props: {
        label: 'Plan Team',
        name: 'plan',
        value: 'team',
        isSelected: true,
        onChange,
      },
    });

    await tick();

    const input = target.querySelector<HTMLInputElement>('input[type="checkbox"][name="plan"]');
    const card = target.querySelector('[data-testid="selectable-card"]');
    expect(input?.className).toContain('astryx-sr-only');
    expect(input?.checked).toBe(true);
    expect(input?.value).toBe('team');
    expect(input?.getAttribute('aria-label')).toBe('Plan Team');

    card?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    expect(onChange).toHaveBeenCalledWith(false, expect.any(MouseEvent));

    await unmount(app);
  });

  it('Given tooltip and composed primitives When rendered Then boundaries and roles stay intact', async () => {
    const target = createTarget();
    const app = mount(ActionsProbe, {target, props: {}});

    await tick();

    expect(target.querySelector('[data-testid="tooltip-button"]')?.getAttribute('aria-describedby')).toBe(
      'tip-save',
    );
    expect(target.querySelector('#tip-save')?.getAttribute('role')).toBe('tooltip');
    expect(target.querySelector('[data-testid="clickable-card"] button')?.getAttribute('aria-label')).toBe(
      'Open report',
    );
    expect(target.querySelector('[data-testid="token-remove"]')?.getAttribute('aria-label')).toBe(
      'Remove Alpha',
    );
    expect(target.querySelector('[data-testid="citation"]')?.getAttribute('role')).toBe(
      'doc-noteref',
    );
    expect(target.querySelector('[data-testid="nav-icon"]')?.className).toContain('astryx-nav-icon');

    await unmount(app);
  });

  it('Given a tooltip button is disabled When rendered and activated Then it remains focusable and suppresses activation', async () => {
    const target = createTarget();
    const onClick = vi.fn();
    const app = mount(Button, {
      target,
      props: {
        label: 'Explain disabled',
        tooltip: 'Requires permission',
        isDisabled: true,
        onClick,
      },
    });

    await tick();

    const button = target.querySelector('button');
    expect(button?.hasAttribute('disabled')).toBe(false);
    expect(button?.getAttribute('aria-disabled')).toBe('true');
    button?.focus();
    expect(document.activeElement).toBe(button);
    button?.click();
    expect(onClick).not.toHaveBeenCalled();

    await unmount(app);
  });

  it('Given tooltip has no explicit id When trigger receives focus Then tooltip is described and shown', async () => {
    const target = createTarget();
    const app = mount(Button, {
      target,
      props: {label: 'Save', tooltip: 'Save changes'},
    });

    await tick();

    const button = target.querySelector('button');
    const tooltip = target.querySelector('[role="tooltip"]');
    expect(tooltip?.id).toBeTruthy();
    expect(button?.getAttribute('aria-describedby')).toBe(tooltip?.id);
    expect(tooltip?.hasAttribute('hidden')).toBe(true);

    button?.focus();
    await tick();

    expect(tooltip?.hasAttribute('hidden')).toBe(false);

    await unmount(app);
  });

  it('Given Link tooltip has no explicit id When trigger receives focus Then tooltip is described and shown', async () => {
    const target = createTarget();
    const app = mount(Link, {
      target,
      props: {href: '/docs', label: 'Docs', tooltip: 'Open docs'},
    });

    await tick();

    const link = target.querySelector('a');
    const tooltip = target.querySelector('[role="tooltip"]');
    expect(tooltip?.id).toBeTruthy();
    expect(link?.getAttribute('aria-describedby')).toBe(tooltip?.id);
    expect(tooltip?.hasAttribute('hidden')).toBe(true);

    link?.focus();
    await tick();

    expect(tooltip?.hasAttribute('hidden')).toBe(false);

    await unmount(app);
  });

  it('Given disabled href Item When activated Then it leaves tab order and cancels navigation', async () => {
    const target = createTarget();
    const app = mount(Item, {
      target,
      props: {label: 'Billing', href: '/billing', isDisabled: true},
    });

    await tick();

    const anchor = target.querySelector('a');
    const clickWasNotCanceled = anchor?.dispatchEvent(
      new MouseEvent('click', {bubbles: true, cancelable: true}),
    );
    expect(anchor?.getAttribute('aria-disabled')).toBe('true');
    expect(anchor?.tabIndex).toBe(-1);
    expect(clickWasNotCanceled).toBe(false);

    await unmount(app);
  });

  it('Given pure action utilities When called Then role and rel normalization match React parity', () => {
    expect(resolveInteractiveRole({href: '/docs'})).toBe('link');
    expect(resolveInteractiveRole({href: '/docs', isDisabled: true})).toBe('button');
    expect(resolveInteractiveRole({onClick: () => undefined})).toBe('button');
    expect(resolveInteractiveRole({contextRole: 'button'})).toBe('button');
    expect(resolveInteractiveRole({})).toBe('inert');
    expect(computeTargetAndRel('_blank', 'nofollow')).toEqual({
      target: '_blank',
      rel: 'nofollow noopener noreferrer',
    });
  });
});
