// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file types.ts
 * @input SVG icon geometry, role, variation, color, and sizing options
 * @output Typed contracts for the private Svelte SVG icon system
 * @position Shared type foundation for SVGIcon, icon definitions, and transforms
 */

export type SVGIconVariation = 'linear' | 'bold' | 'twotone' | 'bulk' | 'broken';
export type SVGIconSize = 'xsm' | 'sm' | 'md' | 'lg';
export type SVGIconColor =
  | 'primary'
  | 'secondary'
  | 'disabled'
  | 'accent'
  | 'positive'
  | 'negative'
  | 'warning'
  | 'inherit';
export type IconShapeRole = 'fill' | 'stroke';
export type IconShapeType = 'path' | 'circle' | 'rect' | 'line' | 'polyline' | 'polygon';

export interface IconShape {
  readonly type: IconShapeType;
  readonly attrs: Readonly<Record<string, string>>;
  readonly role?: IconShapeRole;
}

export interface SVGIconDef {
  readonly name: string;
  readonly viewBox?: string;
  readonly primary: readonly IconShape[];
  readonly secondary?: readonly IconShape[];
}

export interface SVGIconProps {
  readonly icon: SVGIconDef;
  readonly variation?: SVGIconVariation;
  readonly size?: SVGIconSize;
  readonly color?: SVGIconColor;
  readonly strokeWidth?: number;
  readonly title?: string;
}

export interface PathPersonality {
  readonly cornerRounding?: number;
  readonly segmentCurvature?: number;
  readonly tension?: number;
}
