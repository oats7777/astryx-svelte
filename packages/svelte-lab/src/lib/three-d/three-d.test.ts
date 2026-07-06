// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file three-d.test.ts
 * @input Svelte 3D chart components and projection helpers
 * @output Vitest coverage for projection parity, malformed data, and rendered chart primitives
 * @position TDD harness for the private Svelte lab 3D slice
 */

import {mount, tick, unmount} from 'svelte';
import {describe, expect, it} from 'vitest';
import ThreeDProbe from './test-fixtures/ThreeDProbe.svelte';
import {computeDomain, normalizeValue, projectPoint} from './index.js';
import type {NormalizedPoint, ProjectedPoint, ProjectionOptions} from './index.js';

function projectShader(point: NormalizedPoint, options: ProjectionOptions): ProjectedPoint {
  const azimuth = (options.azimuth * Math.PI) / 180;
  const elevation = (options.elevation * Math.PI) / 180;
  const cosAzimuth = Math.cos(azimuth);
  const sinAzimuth = Math.sin(azimuth);
  const cosElevation = Math.cos(elevation);
  const sinElevation = Math.sin(elevation);
  const scale = Math.min(options.width, options.height) * 0.35;
  const cx = options.width / 2;
  const cy = options.height / 2;
  const x = point.nx - 0.5;
  const y = point.ny - 0.5;
  const z = point.nz - 0.5;
  const x1 = x * cosAzimuth + z * sinAzimuth;
  const z1 = -x * sinAzimuth + z * cosAzimuth;
  const y1 = y * cosElevation - z1 * sinElevation;
  const z2 = y * sinElevation + z1 * cosElevation;

  return {px: cx + x1 * scale, py: cy - y1 * scale, depth: z2};
}

describe('Svelte lab 3D projection parity', () => {
  const points = [
    {nx: 0, ny: 0, nz: 0, label: 'origin'},
    {nx: 1, ny: 1, nz: 1, label: 'corner'},
    {nx: 0.5, ny: 0.5, nz: 0.5, label: 'center'},
    {nx: 0, ny: 1, nz: 0.5, label: 'top-front'},
    {nx: 1, ny: 0, nz: 0, label: 'right-bottom-front'},
    {nx: 0.3, ny: 0.7, nz: 0.9, label: 'arbitrary'},
  ] as const;

  const cameras = [
    {azimuth: 0, elevation: 0, label: 'front'},
    {azimuth: 35, elevation: 25, label: 'default'},
    {azimuth: 90, elevation: 0, label: 'side'},
    {azimuth: 45, elevation: 45, label: 'diagonal'},
    {azimuth: -30, elevation: 15, label: 'negative azimuth'},
    {azimuth: 180, elevation: -20, label: 'behind'},
  ] as const;

  for (const camera of cameras) {
    for (const point of points) {
      it(`Given ${point.label} When projected at ${camera.label} camera Then React shader parity math is preserved`, () => {
        const options = {
          azimuth: camera.azimuth,
          elevation: camera.elevation,
          width: 600,
          height: 400,
        };
        const projected = projectPoint(point, options);
        const shader = projectShader(point, options);

        expect(projected.px).toBeCloseTo(shader.px, 6);
        expect(projected.py).toBeCloseTo(shader.py, 6);
        expect(projected.depth).toBeCloseTo(shader.depth, 6);
      });
    }
  }

  it('Given malformed data When domains and normalization run Then fallback ranges stay deterministic', () => {
    const data = [{x: 'bad'}, {y: 2}] as const;

    expect(computeDomain(data, 'x')).toEqual([0, 1]);
    expect(normalizeValue(Number.NaN, [0, 1])).toBe(0.5);
    expect(normalizeValue(2, [2, 2])).toBe(0.5);
  });
});

describe('Svelte lab 3D rendered surfaces', () => {
  it('Given chart data When rendered Then bars, scatter points, surface faces, and labels are observable', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const app = mount(ThreeDProbe, {target});

    await tick();

    expect(target.querySelector('svg[aria-label="3D operations chart"]')).not.toBeNull();
    expect(target.querySelectorAll('[data-astryx-3d-grid-line]').length).toBeGreaterThan(0);
    expect(target.querySelectorAll('[data-astryx-3d-axis]')).toHaveLength(3);
    expect(target.querySelectorAll('[data-astryx-3d-scatter-point]')).toHaveLength(3);
    expect(target.querySelectorAll('[data-astryx-3d-bar-face]').length).toBeGreaterThan(0);
    expect(target.querySelectorAll('[data-astryx-3d-surface-face]')).toHaveLength(1);

    await unmount(app);
  });
});
