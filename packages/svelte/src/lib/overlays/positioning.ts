// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file positioning.ts
 * @input Anchor elements and layer placement values
 * @output CSS anchor names and position-area values
 * @position Shared positioning utility for Todo 11 anchored overlays
 */

import type {LayerAlignment, LayerPlacement} from './types.js';

let anchorCounter = 0;

export function ensureAnchorName(anchor: HTMLElement | undefined): string {
  if (anchor == null) {
    return '';
  }
  const existing = anchor.style.getPropertyValue('anchor-name');
  if (existing.startsWith('--astryx-layer-')) {
    return existing;
  }
  const next = `--astryx-layer-${++anchorCounter}`;
  anchor.style.setProperty('anchor-name', next);
  return next;
}

export function positionArea(placement: LayerPlacement, alignment: LayerAlignment): string {
  const placementMap: Readonly<Record<LayerPlacement, string>> = {
    above: 'top',
    below: 'bottom',
    start: 'left',
    end: 'right',
  };
  const cssPlacement = placementMap[placement];
  if (placement === 'above' || placement === 'below') {
    if (alignment === 'start') {
      return `${cssPlacement} span-right`;
    }
    if (alignment === 'end') {
      return `${cssPlacement} span-left`;
    }
    return cssPlacement;
  }
  if (alignment === 'start') {
    return `${cssPlacement} span-bottom`;
  }
  if (alignment === 'end') {
    return `${cssPlacement} span-top`;
  }
  return `${cssPlacement} center`;
}
