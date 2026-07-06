// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file accessibility.test.ts
 * @input Svelte foundation non-text indicators
 * @output Required accessible-name regression coverage for adversarial verification
 * @position Accessibility-focused Todo 7 foundation test
 */

import {mount, tick, unmount} from 'svelte';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import Avatar from './Avatar.svelte';
import AvatarGroupOverflow from './AvatarGroupOverflow.svelte';
import Kbd from './Kbd.svelte';
import Skeleton from './Skeleton.svelte';
import AccessibilityProbe from './test-fixtures/AccessibilityProbe.svelte';

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return target;
}

describe('Svelte foundation accessibility', () => {
  beforeEach(() => {
    document.body.textContent = '';
  });

  it('Given status indicators and spinners When rendered Then required labels become accessible names', async () => {
    const target = createTarget();
    const app = mount(AccessibilityProbe, {target});

    await tick();

    expect(target.querySelector('[data-testid="status-dot"]')?.getAttribute('aria-label')).toBe(
      'Online',
    );
    expect(target.querySelector('[data-testid="spinner"]')?.getAttribute('aria-label')).toBe(
      'Loading profile',
    );

    await unmount(app);
  });

  it('Given overflow receives a click handler When rendered Then it is a focusable named button that invokes the handler', async () => {
    const target = createTarget();
    const handleClick = vi.fn();
    const app = mount(AvatarGroupOverflow, {
      target,
      props: {
        count: 3,
        onclick: handleClick,
      },
    });

    await tick();

    const overflow = target.querySelector('[aria-label="3 more"]');
    expect(overflow?.tagName).toBe('BUTTON');
    expect(overflow?.getAttribute('type')).toBe('button');
    expect(overflow?.getAttribute('role')).toBeNull();

    expect(overflow).toBeInstanceOf(HTMLElement);
    if (overflow instanceof HTMLElement) {
      overflow.focus();
    }
    expect(document.activeElement).toBe(overflow);

    overflow?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    expect(handleClick).toHaveBeenCalledOnce();

    await unmount(app);
  });

  it('Given overflow has no click handler When rendered Then it stays a non-focusable visual indicator', async () => {
    const target = createTarget();
    const app = mount(AvatarGroupOverflow, {
      target,
      props: {
        count: 2,
      },
    });

    await tick();

    const overflow = target.querySelector('[aria-label="2 more"]');
    expect(overflow?.tagName).not.toBe('BUTTON');
    expect(overflow?.getAttribute('tabindex')).toBeNull();

    await unmount(app);
  });

  it('Given unnamed avatar When rendered Then it is decorative and not announced as an image', async () => {
    const target = createTarget();
    const app = mount(Avatar, {target, props: {'data-testid': 'avatar'}});

    await tick();

    const avatar = target.querySelector('[data-testid="avatar"]');
    expect(avatar?.getAttribute('aria-hidden')).toBe('true');
    expect(avatar?.getAttribute('role')).toBeNull();
    expect(avatar?.getAttribute('aria-label')).toBeNull();
    expect(target.querySelector('img')).toBeNull();

    await unmount(app);
  });

  it('Given named avatar with an image When rendered Then the wrapper is named and the inner image is decorative', async () => {
    const target = createTarget();
    const app = mount(Avatar, {
      target,
      props: {name: 'Ada Lovelace', src: '/ada.png', 'data-testid': 'avatar'},
    });

    await tick();

    const avatar = target.querySelector('[data-testid="avatar"]');
    const image = target.querySelector('img');
    expect(avatar?.getAttribute('role')).toBe('img');
    expect(avatar?.getAttribute('aria-label')).toBe('Ada Lovelace');
    expect(image?.getAttribute('alt')).toBe('');

    await unmount(app);
  });

  it('Given keyboard shortcut glyphs When rendered Then spoken accessible name is exposed without double-announcing glyphs', async () => {
    const target = createTarget();
    const app = mount(Kbd, {target, props: {keys: ['Command', 'Shift', 'K']}});

    await tick();

    const wrapper = target.querySelector('[role="img"]');
    expect(wrapper?.getAttribute('aria-label')).toBe('Command + Shift + K');
    expect(wrapper?.querySelector('kbd')?.getAttribute('aria-hidden')).toBe('true');
    expect(wrapper?.textContent).toBe('⌘⇧K');

    await unmount(app);
  });

  it('Given skeleton defaults and explicit overrides When rendered Then assistive hiding and reduced-motion hooks are stable', async () => {
    const target = createTarget();
    const first = mount(Skeleton, {target, props: {'data-testid': 'default'}});
    const second = mount(Skeleton, {
      target,
      props: {'aria-hidden': 'false', 'data-testid': 'override'},
    });

    await tick();

    const defaultSkeleton = target.querySelector('[data-testid="default"]');
    const overrideSkeleton = target.querySelector('[data-testid="override"]');
    expect(defaultSkeleton?.getAttribute('aria-hidden')).toBe('true');
    expect(defaultSkeleton?.className).toContain('astryx-reduced-motion-safe');
    expect(overrideSkeleton?.getAttribute('aria-hidden')).toBe('false');

    await unmount(first);
    await unmount(second);
  });
});
