// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file iconStyles.ts
 * @input SVG icon variation, size, color, and stroke override
 * @output CSS variable string for role-aware icon rendering
 * @position Styling helper for private Svelte lab SVGIcon
 */

import type {SVGIconColor, SVGIconSize, SVGIconVariation} from './types.js';

const colorVars: Record<SVGIconColor, string> = {
  primary: 'var(--color-icon-primary)',
  secondary: 'var(--color-icon-secondary)',
  disabled: 'var(--color-icon-disabled)',
  accent: 'var(--color-accent)',
  positive: 'var(--color-success)',
  negative: 'var(--color-error)',
  warning: 'var(--color-warning)',
  inherit: 'inherit',
};

const sizeVars: Record<SVGIconSize, readonly [string, string]> = {
  xsm: ['12px', '2'],
  sm: ['16px', '1.75'],
  md: ['20px', '1.5'],
  lg: ['24px', '1.5'],
};

const variationVars: Record<SVGIconVariation, string> = {
  linear:
    '--astryx-icon-primary-fill: none; --astryx-icon-primary-stroke: currentColor; --astryx-icon-primary-opacity: 1; --astryx-icon-secondary-fill: none; --astryx-icon-secondary-stroke: currentColor; --astryx-icon-secondary-opacity: 1; --astryx-icon-stroke-role-opacity: 1;',
  bold:
    '--astryx-icon-primary-fill: currentColor; --astryx-icon-primary-stroke: none; --astryx-icon-primary-opacity: 1; --astryx-icon-secondary-fill: currentColor; --astryx-icon-secondary-stroke: none; --astryx-icon-secondary-opacity: 1; --astryx-icon-stroke-role-opacity: 1;',
  twotone:
    '--astryx-icon-primary-fill: none; --astryx-icon-primary-stroke: currentColor; --astryx-icon-primary-opacity: 1; --astryx-icon-secondary-fill: none; --astryx-icon-secondary-stroke: currentColor; --astryx-icon-secondary-opacity: 0.4; --astryx-icon-stroke-role-opacity: 0.4;',
  bulk:
    '--astryx-icon-primary-fill: currentColor; --astryx-icon-primary-stroke: none; --astryx-icon-primary-opacity: 1; --astryx-icon-secondary-fill: currentColor; --astryx-icon-secondary-stroke: none; --astryx-icon-secondary-opacity: 0.4; --astryx-icon-stroke-role-opacity: 0.4;',
  broken:
    '--astryx-icon-primary-fill: none; --astryx-icon-primary-stroke: currentColor; --astryx-icon-primary-opacity: 1; --astryx-icon-secondary-fill: none; --astryx-icon-secondary-stroke: currentColor; --astryx-icon-secondary-opacity: 0; --astryx-icon-stroke-role-opacity: 1;',
};

export function createIconStyle(
  variation: SVGIconVariation,
  size: SVGIconSize,
  color: SVGIconColor,
  strokeWidth: number | undefined,
): string {
  const sizeEntry = sizeVars[size];
  const width = strokeWidth == null ? sizeEntry[1] : String(strokeWidth);
  return [
    `--astryx-icon-color: ${colorVars[color]}`,
    `--astryx-icon-size: ${sizeEntry[0]}`,
    `--astryx-icon-stroke-width: ${width}`,
    '--astryx-icon-gap: 0.75',
    variationVars[variation],
  ].join('; ');
}
