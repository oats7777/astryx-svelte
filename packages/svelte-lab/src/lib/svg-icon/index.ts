// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Private Svelte lab SVG icon modules
 * @output Local SVGIcon exports without root package integration
 * @position Package-local barrel for the experimental Svelte SVG icon system
 */

export {default as SVGIcon} from './SVGIcon.svelte';
export {bellIcon, checkIcon, homeIcon} from './icons.js';
export {addCurvature, adjustTension, applyPersonality, roundCorners} from './pathTransforms.js';
export type {
  IconShape,
  IconShapeRole,
  IconShapeType,
  PathPersonality,
  SVGIconColor,
  SVGIconDef,
  SVGIconProps,
  SVGIconSize,
  SVGIconVariation,
} from './types.js';
