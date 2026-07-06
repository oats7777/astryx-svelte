// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tokens.ts
 * @input Framework-neutral Astryx token metadata from @astryxdesign/tokens
 * @output Token defaults and metadata re-exported for Svelte consumers
 * @position Public token subpath for @astryxdesign/svelte/theme/tokens
 */

export {
  borderDefaults,
  colorDefaults,
  documentedTokenGroups,
  durationDefaults,
  easeDefaults,
  fontWeightDefaults,
  radiusDefaults,
  renderDefaultTokenCSS,
  renderTailwindThemeCSS,
  renderTokenJSON,
  shadowDefaults,
  sizeDefaults,
  spacingDefaults,
  tailwindThemeCSS,
  textSizeDefaults,
  tokenGroups,
  tokenMetadata,
  transitionDefaults,
  transitionRaw,
  typographyDefaults,
  typeScaleDefaults,
} from '@astryxdesign/tokens';
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
  TokenGroup,
  TokenGroupKey,
  TokenLifecycle,
  TokenMetadata,
  TokenRecord,
  TransitionVarName,
  TypographyVarName,
  TypeScaleVarName,
} from '@astryxdesign/tokens';
