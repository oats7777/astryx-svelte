// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file svg-icon.test.ts
 * @input Svelte SVGIcon component and path transform helpers
 * @output Vitest DOM and math coverage for roles, masks, token colors, and path personality
 * @position TDD harness for the private Svelte lab SVG icon slice
 */

import {mount, tick, unmount} from 'svelte';
import {describe, expect, it} from 'vitest';
import {SVGIcon, applyPersonality, homeIcon, roundCorners} from './index.js';

describe('Svelte lab SVGIcon', () => {
  it('Given a two-layer icon When bold accent rendering is requested Then token color and mask gap output are present', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const app = mount(SVGIcon, {
      target,
      props: {icon: homeIcon, variation: 'bold', size: 'lg', color: 'accent'},
    });

    await tick();

    const svg = target.querySelector('svg[data-astryx-svg-icon]');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg?.getAttribute('style')).toContain('--astryx-icon-color: var(--color-accent)');
    expect(target.querySelector('mask')).not.toBeNull();
    expect(target.querySelector('g[data-astryx-icon-layer="primary-fill"]')).not.toBeNull();
    expect(target.querySelector('g[data-astryx-icon-layer="secondary-fill"]')).toBeNull();

    await unmount(app);
  });

  it('Given path personality values When transforms run Then corners curve and malformed paths stay safe', () => {
    const square = 'M0 0 L10 0 L10 10 L0 10 Z';

    expect(roundCorners(square, 0)).toBe(square);
    expect(roundCorners(square, 0.8)).toContain('Q');
    expect(applyPersonality(square, {cornerRounding: 0.5, segmentCurvature: 0.4})).toContain('Q');
    expect(applyPersonality('not a path', {cornerRounding: 1})).toBe('');
  });
});
