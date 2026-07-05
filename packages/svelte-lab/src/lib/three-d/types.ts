// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file types.ts
 * @input 3D chart data, camera, and projected geometry contracts
 * @output Shared private Svelte lab 3D types
 * @position Type foundation for Svelte 3D projection and chart primitives
 */

import type {Snippet} from 'svelte';

export type ThreeDDatum = Readonly<Record<string, unknown>>;
export type Domain3D = readonly [number, number];

export interface NormalizedPoint {
  readonly nx: number;
  readonly ny: number;
  readonly nz: number;
}

export interface ProjectedPoint {
  readonly px: number;
  readonly py: number;
  readonly depth: number;
}

export interface ProjectionOptions {
  readonly azimuth: number;
  readonly elevation: number;
  readonly width: number;
  readonly height: number;
}

export interface ThreeDContextValue {
  readonly width: number;
  readonly height: number;
  readonly data: readonly ThreeDDatum[];
  readonly xKey: string;
  readonly yKey: string;
  readonly zKey: string;
  readonly xDomain: Domain3D;
  readonly yDomain: Domain3D;
  readonly zDomain: Domain3D;
  readonly azimuth: number;
  readonly elevation: number;
  readonly project: (point: NormalizedPoint) => ProjectedPoint;
  readonly normalize: (value: number, domain: Domain3D) => number;
}

export interface ThreeDChartProps {
  readonly data: readonly ThreeDDatum[];
  readonly xKey: string;
  readonly yKey: string;
  readonly zKey: string;
  readonly xDomain?: Domain3D;
  readonly yDomain?: Domain3D;
  readonly zDomain?: Domain3D;
  readonly width?: number;
  readonly height?: number;
  readonly azimuth?: number;
  readonly elevation?: number;
  readonly children?: Snippet;
  readonly 'aria-label'?: string;
}
