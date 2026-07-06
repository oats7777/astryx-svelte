// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Canonical Astryx token groups and bridge mappings
 * @output Framework-neutral token metadata, CSS emitters, and TypeScript token defaults
 * @position Public entry point for @astryxdesign/tokens
 */

export {
  borderDefaults,
  colorDefaults,
  durationDefaults,
  easeDefaults,
  fontWeightDefaults,
  radiusDefaults,
  shadowDefaults,
  sizeDefaults,
  spacingDefaults,
  textSizeDefaults,
  transitionDefaults,
  transitionRaw,
  typographyDefaults,
  typeScaleDefaults,
} from './groups.js';
export type {
  BorderVarName,
  ColorVarName,
  DurationVarName,
  EaseVarName,
  FontWeightVarName,
  RadiusVarName,
  ShadowVarName,
  SizeVarName,
  SpacingVarName,
  TextSizeVarName,
  TransitionVarName,
  TypographyVarName,
  TypeScaleVarName,
} from './groups.js';
export {renderTailwindThemeCSS, tailwindThemeCSS} from './tailwindBridge.js';

import {
  borderDefaults,
  colorDefaults,
  durationDefaults,
  easeDefaults,
  fontWeightDefaults,
  radiusDefaults,
  shadowDefaults,
  sizeDefaults,
  spacingDefaults,
  textSizeDefaults,
  transitionDefaults,
  typographyDefaults,
  typeScaleDefaults,
} from './groups.js';

export type TokenGroupKey =
  | 'color'
  | 'spacing'
  | 'size'
  | 'border'
  | 'radius'
  | 'shadow'
  | 'duration'
  | 'ease'
  | 'transition'
  | 'typography'
  | 'textSize'
  | 'fontWeight'
  | 'typeScale';

export type TokenLifecycle = 'current' | 'deprecated';

export interface TokenRecord {
  readonly name: string;
  readonly value: string;
  readonly group: TokenGroupKey;
  readonly lifecycle: TokenLifecycle;
}

export interface TokenGroup {
  readonly key: TokenGroupKey;
  readonly title: string;
  readonly tokens: readonly TokenRecord[];
  readonly lifecycle: TokenLifecycle;
  readonly deprecationReason?: string;
}

export interface TokenMetadata {
  readonly packageName: '@astryxdesign/tokens';
  readonly version: 1;
  readonly groups: readonly TokenGroup[];
  readonly tokens: readonly TokenRecord[];
}

function tokensFromDefaults(
  group: TokenGroupKey,
  defaults: Readonly<Record<string, string>>,
  lifecycle: TokenLifecycle,
): TokenRecord[] {
  return Object.entries(defaults).map(([name, value]) => ({
    group,
    lifecycle,
    name,
    value,
  }));
}

export const tokenGroups: readonly TokenGroup[] = [
  {
    key: 'color',
    title: 'Color Tokens',
    lifecycle: 'current',
    tokens: tokensFromDefaults('color', colorDefaults, 'current'),
  },
  {
    key: 'spacing',
    title: 'Spacing Tokens',
    lifecycle: 'current',
    tokens: tokensFromDefaults('spacing', spacingDefaults, 'current'),
  },
  {
    key: 'size',
    title: 'Size Tokens',
    lifecycle: 'current',
    tokens: tokensFromDefaults('size', sizeDefaults, 'current'),
  },
  {
    key: 'border',
    title: 'Border Tokens',
    lifecycle: 'current',
    tokens: tokensFromDefaults('border', borderDefaults, 'current'),
  },
  {
    key: 'radius',
    title: 'Radius Tokens',
    lifecycle: 'current',
    tokens: tokensFromDefaults('radius', radiusDefaults, 'current'),
  },
  {
    key: 'shadow',
    title: 'Shadow Tokens',
    lifecycle: 'current',
    tokens: tokensFromDefaults('shadow', shadowDefaults, 'current'),
  },
  {
    key: 'duration',
    title: 'Duration Tokens',
    lifecycle: 'current',
    tokens: tokensFromDefaults('duration', durationDefaults, 'current'),
  },
  {
    key: 'ease',
    title: 'Easing Tokens',
    lifecycle: 'current',
    tokens: tokensFromDefaults('ease', easeDefaults, 'current'),
  },
  {
    key: 'transition',
    title: 'Transition Tokens',
    lifecycle: 'deprecated',
    deprecationReason: 'Use duration and easing tokens instead.',
    tokens: tokensFromDefaults('transition', transitionDefaults, 'deprecated'),
  },
  {
    key: 'typography',
    title: 'Font Family Tokens',
    lifecycle: 'current',
    tokens: tokensFromDefaults('typography', typographyDefaults, 'current'),
  },
  {
    key: 'textSize',
    title: 'Font Size Tokens',
    lifecycle: 'current',
    tokens: tokensFromDefaults('textSize', textSizeDefaults, 'current'),
  },
  {
    key: 'fontWeight',
    title: 'Font Weight Tokens',
    lifecycle: 'current',
    tokens: tokensFromDefaults('fontWeight', fontWeightDefaults, 'current'),
  },
  {
    key: 'typeScale',
    title: 'Type Scale Tokens',
    lifecycle: 'current',
    tokens: tokensFromDefaults('typeScale', typeScaleDefaults, 'current'),
  },
];

export const documentedTokenGroups: readonly TokenGroup[] = tokenGroups.filter(
  group => group.lifecycle === 'current',
);

export const tokenMetadata: TokenMetadata = {
  packageName: '@astryxdesign/tokens',
  version: 1,
  groups: tokenGroups,
  tokens: tokenGroups.flatMap(group => group.tokens),
};

export function renderDefaultTokenCSS(): string {
  const declarations = tokenMetadata.tokens
    .map(token => `    ${token.name}: ${token.value};`)
    .join('\n');

  return `/* Copyright (c) Meta Platforms, Inc. and affiliates. */\n\n@layer astryx-base {\n  :root {\n${declarations}\n  }\n}\n`;
}

export function renderTokenJSON(): string {
  return `${JSON.stringify(tokenMetadata, null, 2)}\n`;
}
