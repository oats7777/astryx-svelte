// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file charts.test.ts
 * @input Todo 16 private Svelte lab chart and data-viz requirements
 * @output Vitest coverage for range math, mapping, accessibility, tokens, and WebGL fallback
 * @position TDD harness for packages/svelte-lab chart primitives
 */

import {mount, tick, unmount} from 'svelte';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import ChartAccessibilityProbe from './test-fixtures/ChartAccessibilityProbe.svelte';
import RadialSankeyProbe from './test-fixtures/RadialSankeyProbe.svelte';
import {
  computeRadialLayout,
  computeSankeyLayout,
  createChartRange,
  getChartColors,
  hexToGL,
  mountCanvasOverSVG,
  sizeCanvas,
} from './index.js';

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return target;
}

describe('Svelte lab chart primitives', () => {
  beforeEach(() => {
    document.body.textContent = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Given streaming points When chart range is updated Then x slides and y pads deterministically', () => {
    const range = createChartRange({xWindow: 100, yPadding: 0.1});

    range.push(50, 10);
    expect(range.xDomain).toEqual([0, 50]);
    expect(range.yDomain[0]).toBeCloseTo(9.9);
    expect(range.yDomain[1]).toBeCloseTo(10.1);

    range.push(150, 60);
    expect(range.xDomain).toEqual([50, 150]);
    expect(range.yDomain).toEqual([5, 65]);

    range.reset();
    expect(range.xDomain).toEqual([0, 0]);
    expect(range.yDomain).toEqual([0, 1]);
  });

  it('Given radial and sankey data When layouts are computed Then angles, percentages, and flow columns match the data', () => {
    const radial = computeRadialLayout({
      data: [
        {name: 'A', value: 30, speed: 10, safety: 4},
        {name: 'B', value: 10, speed: 5, safety: 8},
      ],
      height: 200,
      width: 200,
      labelKey: 'name',
      valueKey: 'value',
      axes: ['speed', 'safety'],
    });

    expect(radial.slices.map((slice) => slice.key)).toEqual(['A', 'B']);
    expect(radial.slices[0]?.percentage).toBeCloseTo(0.75);
    expect(radial.angleByAxis.get('speed')).toBeCloseTo(-Math.PI / 2);
    expect(radial.axisDomains.get('speed')).toEqual([0, 10]);

    const sankey = computeSankeyLayout(
      [
        {id: 'source', label: 'Source', value: 30},
        {id: 'target', label: 'Target', value: 30},
      ],
      [{source: 'source', target: 'target', value: 30}],
      {width: 320, height: 180, columns: [['source'], ['target']]},
    );

    expect(sankey.columns.map((column) => column.ids)).toEqual([['source'], ['target']]);
    expect(sankey.links[0]?.source.id).toBe('source');
    expect(sankey.links[0]?.target.id).toBe('target');
    expect(sankey.links[0]?.height).toBeGreaterThan(0);
  });

  it('Given chart surfaces When rendered Then SVG roles, labels, tooltips, legends, and token colors are present', async () => {
    const target = createTarget();
    const app = mount(ChartAccessibilityProbe, {target});

    await tick();

    const charts = target.querySelectorAll('svg[role="img"]');
    expect(charts).toHaveLength(2);
    expect(charts[0]?.getAttribute('aria-label')).toBe('Quarterly revenue chart');
    expect(target.querySelector('[data-astryx-chart-grid]')).not.toBeNull();
    expect(target.querySelector('[data-astryx-chart-axis="bottom"]')).not.toBeNull();
    expect(target.querySelector('[data-astryx-chart-bar]')?.getAttribute('aria-label')).toBe(
      'Revenue bars',
    );
    expect(target.querySelector('[data-astryx-chart-tooltip]')?.getAttribute('role')).toBe(
      'tooltip',
    );
    expect(target.querySelector('[data-astryx-chart-legend]')?.textContent).toContain('Revenue');
    expect(target.innerHTML).toContain('var(--color-data-categorical-blue)');

    await unmount(app);
  });

  it('Given radial and sankey surfaces When rendered Then accessible SVG labels and mapped shapes are present', async () => {
    const target = createTarget();
    const app = mount(RadialSankeyProbe, {target});

    await tick();

    expect(target.querySelector('svg[aria-label="Portfolio allocation"]')).not.toBeNull();
    expect(target.querySelector('path[data-astryx-radial-slice]')).not.toBeNull();
    expect(target.querySelector('path[data-astryx-radial-area]')).not.toBeNull();
    expect(target.querySelector('svg[aria-label="Delivery flow"]')).not.toBeNull();
    expect(target.querySelectorAll('[data-astryx-sankey-node]')).toHaveLength(3);
    expect(target.querySelectorAll('[data-astryx-sankey-link]')).toHaveLength(2);

    await unmount(app);
  });

  it('Given token colors and WebGL helpers When used without a working GL context Then fallback values and cleanup remain safe', () => {
    const colors = getChartColors();
    expect(colors.categorical(2)).toEqual([
      'var(--color-data-categorical-blue)',
      'var(--color-data-categorical-orange)',
    ]);
    expect(colors.sequential.blue(1)).toEqual(['var(--color-data-blue-3)']);
    expect(colors.alpha('#336699', 0.5)).toBe('rgba(51,102,153,0.5)');
    expect(hexToGL('#336699')).toEqual([0.2, 0.4, 0.6]);

    const parent = document.createElement('div');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const canvas = document.createElement('canvas');
    parent.appendChild(svg);
    svg.appendChild(marker);
    document.body.appendChild(parent);

    const cleanup = mountCanvasOverSVG(marker, canvas, 120, 80);
    expect(parent.querySelector('canvas')).toBe(canvas);
    cleanup?.();
    expect(parent.querySelector('canvas')).toBeNull();

    const dpr = sizeCanvas(canvas, 40, 20, 2);
    expect(dpr).toBe(2);
    expect(canvas.width).toBe(80);
    expect(canvas.height).toBe(40);
  });
});
