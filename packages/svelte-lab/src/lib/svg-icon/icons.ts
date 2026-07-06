// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file icons.ts
 * @input Lucide-derived SVG path geometry
 * @output Role-annotated icon definitions for SVGIcon
 * @position Small private Svelte lab icon set used by tests and examples
 */

import type {SVGIconDef} from './types.js';

export const checkIcon: SVGIconDef = {
  name: 'Check',
  primary: [{type: 'path', attrs: {d: 'M20 6 9 17l-5-5'}, role: 'stroke'}],
};

export const homeIcon: SVGIconDef = {
  name: 'Home',
  primary: [
    {
      type: 'path',
      attrs: {
        d: 'M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      },
      role: 'fill',
    },
  ],
  secondary: [
    {
      type: 'path',
      attrs: {d: 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8'},
      role: 'fill',
    },
  ],
};

export const bellIcon: SVGIconDef = {
  name: 'Bell',
  primary: [
    {
      type: 'path',
      attrs: {d: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9'},
      role: 'fill',
    },
  ],
  secondary: [
    {type: 'path', attrs: {d: 'M10.3 21a1.94 1.94 0 0 0 3.4 0'}, role: 'stroke'},
  ],
};
