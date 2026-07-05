// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file projection.ts
 * @input Data records, domains, camera angles, and normalized 3D points
 * @output Deterministic domain, normalization, and projection helpers
 * @position Pure math layer for private Svelte lab 3D components
 */

import type {Domain3D, NormalizedPoint, ProjectedPoint, ProjectionOptions, ThreeDDatum} from './types.js';

export function computeDomain(data: readonly ThreeDDatum[], key: string): Domain3D {
  let min = Infinity;
  let max = -Infinity;
  for (const datum of data) {
    const value = datum[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
  }
  return min === Infinity || max === -Infinity ? [0, 1] : [min, max];
}

export function normalizeValue(value: number, domain: Domain3D): number {
  if (!Number.isFinite(value)) {
    return 0.5;
  }
  const range = domain[1] - domain[0];
  return range === 0 ? 0.5 : (value - domain[0]) / range;
}

export function numericDatumValue(datum: ThreeDDatum, key: string): number {
  const value = datum[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : Number.NaN;
}

export function projectPoint(point: NormalizedPoint, options: ProjectionOptions): ProjectedPoint {
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
