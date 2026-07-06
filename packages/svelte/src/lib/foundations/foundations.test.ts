// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file foundations.test.ts
 * @input Todo 7 Svelte foundation components and shared test fixtures
 * @output Parity assertions for layout, presentational, and accessibility behavior
 * @position TDD coverage for the Svelte foundation component family
 */

import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {mount, tick, unmount} from 'svelte';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import AccessibilityProbe from './test-fixtures/AccessibilityProbe.svelte';
import FoundationProbe from './test-fixtures/FoundationProbe.svelte';
import Timestamp from './Timestamp.svelte';

const stylesPath = resolve(__dirname, '../styles.css');
const tokenStylesPath = resolve(__dirname, '../../../../tokens/dist/default.css');
const requiredFoundationSelectors = [
  '.astryx-aspect-ratio',
  '.astryx-aspect-ratio--shape-ellipse',
  '.astryx-aspect-ratio__child',
  '.astryx-avatar',
  '.astryx-avatar--grouped',
  '.astryx-avatar__content',
  '.astryx-avatar__image',
  '.astryx-avatar__fallback',
  '.astryx-avatar__status',
  '.astryx-avatar-group',
  '.astryx-avatar-group-overflow',
  '.astryx-avatar-status-dot',
  '.astryx-avatar-status-dot--variant-success',
  '.astryx-badge',
  '.astryx-badge--variant-purple',
  '.astryx-badge__icon',
  '.astryx-banner',
  '.astryx-banner--status-warning',
  '.astryx-banner__body',
  '.astryx-banner__title',
  '.astryx-banner__description',
  '.astryx-banner__toggle',
  '.astryx-banner__content',
  '.astryx-blockquote',
  '.astryx-blockquote__cite',
  '.astryx-card',
  '.astryx-card--variant-muted',
  '.astryx-center',
  '.astryx-center--axis-both',
  '.astryx-divider',
  '.astryx-divider--horizontal',
  '.astryx-divider--strong',
  '.astryx-divider__label',
  '.astryx-empty-state',
  '.astryx-empty-state--variant-compact',
  '.astryx-empty-state__icon',
  '.astryx-empty-state__title',
  '.astryx-empty-state__description',
  '.astryx-empty-state__actions',
  '.astryx-grid',
  '.astryx-heading',
  '.astryx-heading--type-display-2',
  '.astryx-icon',
  '.astryx-icon--size-lg',
  '.astryx-icon--color-accent',
  '.astryx-icon__glyph',
  '.astryx-kbd',
  '.astryx-section',
  '.astryx-section--variant-section',
  '.astryx-skeleton',
  '.astryx-skeleton--radius-full',
  '.astryx-spinner',
  '.astryx-spinner--size-sm',
  '.astryx-stack',
  '.astryx-stack--horizontal',
  '.astryx-stack--scrollable',
  '.astryx-stack--vertical',
  '.astryx-stack-item',
  '.astryx-stack-item--scrollable',
  '.astryx-stack-item--size-fill',
  '.astryx-status-dot',
  '.astryx-status-dot--variant-success',
  '.astryx-text',
  '.astryx-text--type-supporting',
  '.astryx-text--color-secondary',
  '.astryx-thumbnail',
  '.astryx-thumbnail__image',
  '.astryx-thumbnail__placeholder',
  '.astryx-thumbnail__overlay',
  '.astryx-timestamp',
  '.astryx-sr-only',
] as const;

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return target;
}

describe('Svelte foundation components', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-25T12:00:00Z'));
    document.body.textContent = '';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('Given the Todo 7 component family When rendered together Then exposes React-parity DOM hooks and token classes', async () => {
    const target = createTarget();
    const app = mount(FoundationProbe, {target});

    await tick();

    const aspect = target.querySelector('[data-testid="aspect"]');
    expect(aspect?.className).toContain('astryx-aspect-ratio');
    expect(aspect?.getAttribute('data-shape')).toBe('ellipse');
    expect((aspect as HTMLElement).style.aspectRatio).toBe('1.7777777777777777 / 1');
    expect(aspect?.querySelector('img')?.alt).toBe('Demo media');

    expect(target.querySelector('[data-testid="avatar"]')?.textContent).toContain('AL');
    expect(target.querySelector('[data-testid="avatar-group"]')?.className).toContain(
      'astryx-avatar-group',
    );
    expect(target.textContent).toContain('+3');

    expect(target.querySelector('[data-testid="badge"]')?.className).toContain('purple');
    expect(target.querySelector('[data-testid="banner"]')?.getAttribute('role')).toBe('alert');
    expect(target.textContent).toContain('Databases remain readable.');
    expect(target.querySelector('[data-testid="blockquote"]')?.tagName).toBe('BLOCKQUOTE');
    expect(target.querySelector('[data-testid="card"]')?.className).toContain('muted');
    expect(target.querySelector('[data-testid="center"]')?.className).toContain('astryx-center');
    expect(target.querySelector('[data-testid="divider"]')?.getAttribute('role')).toBe('separator');
    expect(target.querySelector('[data-testid="empty-state"]')?.textContent).toContain('No projects');
    expect(target.querySelector('[data-testid="grid"]')?.getAttribute('data-columns')).toBe('3');
    expect(target.querySelector('[data-testid="hstack"]')?.getAttribute('data-direction')).toBe(
      'horizontal',
    );
    expect(target.querySelector('[data-testid="heading"]')?.tagName).toBe('H2');
    expect(target.querySelector('[data-testid="icon"]')?.getAttribute('aria-label')).toBe(
      'Calendar',
    );
    expect(target.querySelector('[data-testid="kbd"]')?.textContent).toBe('⌘K');
    expect(target.querySelector('[data-testid="section"]')?.className).toContain('section');
    expect(target.querySelector('[data-testid="skeleton"]')?.getAttribute('aria-hidden')).toBe(
      'true',
    );
    expect(target.querySelector('[data-testid="spinner"]')?.getAttribute('role')).toBe('status');
    expect(target.querySelector('[data-testid="stack"]')?.getAttribute('data-direction')).toBe(
      'horizontal',
    );
    expect(target.querySelector('[data-testid="status-dot"]')?.getAttribute('aria-label')).toBe(
      'Live',
    );
    expect(target.querySelector('[data-testid="text"]')?.getAttribute('data-max-lines')).toBe('1');
    expect(target.querySelector('[data-testid="thumbnail"]')?.querySelector('img')?.alt).toBe(
      'Preview thumbnail',
    );
    expect(target.querySelector('[data-testid="timestamp"]')?.tagName).toBe('TIME');
    expect(target.querySelector('[data-testid="timestamp"]')?.textContent).toMatch(
      /2026-03-\d{2} \d{2}:\d{2}:\d{2}/,
    );
    expect(target.querySelector('[data-testid="vstack"]')?.getAttribute('data-direction')).toBe(
      'vertical',
    );

    await unmount(app);
  });

  it('Given required non-text indicators When rendered Then exposes accessible names', async () => {
    const target = createTarget();
    const app = mount(AccessibilityProbe, {target});

    await tick();

    const statusDot = target.querySelector('[data-testid="status-dot"]');
    const spinner = target.querySelector('[data-testid="spinner"]');
    expect(statusDot?.getAttribute('role')).toBe('img');
    expect(statusDot?.getAttribute('aria-label')).toBe('Online');
    expect(spinner?.getAttribute('role')).toBe('status');
    expect(spinner?.getAttribute('aria-label')).toBe('Loading profile');

    await unmount(app);
  });

  it('Given foundation components emit stable CSS hooks When styles are loaded Then every hook has tokenized rules', () => {
    const css = readFileSync(stylesPath, 'utf8');
    const tokenCss = readFileSync(tokenStylesPath, 'utf8');

    for (const selector of requiredFoundationSelectors) {
      expect(css, `${selector} must have a stylesheet rule`).toMatch(
        new RegExp(`${selector.replaceAll('-', '\\-').replace('.', '\\.')}[\\s,{:]`),
      );
    }

    expect(css).toMatch(/\.astryx-grid\s*\{[^}]*display:\s*grid;/s);
    expect(css).toMatch(/\.astryx-stack\s*\{[^}]*display:\s*flex;/s);
    expect(css).toMatch(/\.astryx-stack--scrollable\s*\{[^}]*overflow:\s*auto;/s);
    expect(css).toMatch(/\.astryx-stack-item--size-fill\s*\{[^}]*flex:\s*1 1 0;/s);
    expect(css).toMatch(/\.astryx-stack-item--scrollable\s*\{[^}]*overflow:\s*auto;/s);
    expect(css).toMatch(/\.astryx-sr-only\s*\{[^}]*clip:\s*rect\(0,\s*0,\s*0,\s*0\);/s);
    expect(css).toMatch(/\.astryx-sr-only\s*\{[^}]*pointer-events:\s*none;/s);
    expect(css).toMatch(/\.astryx-badge--variant-purple\s*\{[^}]*var\(--color-background-purple\)/s);
    expect(css).toMatch(/\.astryx-banner--status-warning\s*\{[^}]*var\(--color-warning-muted\)/s);
    expect(css).toMatch(/\.astryx-status-dot--variant-success\s*\{[^}]*var\(--color-success\)/s);
    expect(css).toMatch(/\.astryx-avatar\s*\{[^}]*var\(--color-text-primary\)/s);
    expect(tokenCss).toContain('--color-background-surface: light-dark(');
    expect(tokenCss).toContain('--color-text-primary: light-dark(');
  });

  it('Given recent timestamps When relative and auto formats render Then labels are not collapsed to now', async () => {
    const target = createTarget();
    const relative = mount(Timestamp, {
      target,
      props: {
        value: Date.now() / 1000 - 7200,
        format: 'relative',
        'data-testid': 'relative',
      },
    });

    await tick();

    expect(target.querySelector('[data-testid="relative"]')?.textContent).toBe('2 hours ago');

    await unmount(relative);

    const autoTarget = createTarget();
    const autoRecent = mount(Timestamp, {
      target: autoTarget,
      props: {
        value: Date.now() / 1000 - 3600,
        format: 'auto',
        'data-testid': 'auto-recent',
      },
    });

    await tick();

    expect(autoTarget.querySelector('[data-testid="auto-recent"]')?.textContent).toBe('1 hour ago');

    await unmount(autoRecent);
  });

  it('Given an old timestamp When auto format renders Then it uses an absolute date-time label', async () => {
    const target = createTarget();
    const app = mount(Timestamp, {
      target,
      props: {
        value: '2026-01-01T12:00:00Z',
        format: 'auto',
        'data-testid': 'auto-old',
      },
    });

    await tick();

    const label = target.querySelector('[data-testid="auto-old"]')?.textContent;
    expect(label).toContain('2026');
    expect(label).not.toContain('ago');

    await unmount(app);
  });
});
