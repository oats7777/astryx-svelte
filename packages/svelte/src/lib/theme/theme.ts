// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file theme.ts
 * @input Astryx Svelte theme definitions and token requests
 * @output Defined themes, token CSS, and resolved token values
 * @position Framework-neutral theme model for @astryxdesign/svelte
 */

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
} from '@astryxdesign/tokens';
import type {IconRegistryInput} from '../icon/icon-registry.js';

export type ThemeMode = 'light' | 'dark' | 'system';
export type EffectiveThemeMode = 'light' | 'dark';
export type ThemeTokenTuple = readonly [light: string, dark: string];
export type ThemeTokenValue = string | ThemeTokenTuple;
export type ThemeTokenInput = Readonly<Record<string, ThemeTokenValue>>;
export type ComponentStyleDeclaration = Readonly<Record<string, string>>;
export type ComponentStyleMap = Readonly<Record<string, Readonly<Record<string, ComponentStyleDeclaration>>>>;

export type DefineThemeInput = {
  readonly name: string;
  readonly tokens?: ThemeTokenInput;
  readonly components?: ComponentStyleMap;
  readonly icons?: IconRegistryInput;
  readonly built?: boolean;
};

export type DefinedTheme = {
  readonly name: string;
  readonly tokens: Readonly<Record<string, string>>;
  readonly components?: ComponentStyleMap;
  readonly icons?: IconRegistryInput;
  readonly __built?: true;
};

export type ResolvedTheme = {
  readonly name: string;
  readonly mode: EffectiveThemeMode;
  readonly token: (name: string) => string;
  readonly tokens: Readonly<Record<string, string>>;
};

export class ThemeRuntimeError extends Error {
  readonly reason: string;

  constructor(reason: string) {
    super(reason);
    this.name = 'ThemeRuntimeError';
    this.reason = reason;
  }
}

const themeNamePattern = /^[a-z][a-z0-9-]*$/;
const tokenNamePattern = /^--[a-z][a-z0-9-]*$/;
const cssPropertyPattern = /^[a-zA-Z][a-zA-Z0-9]*$/;
const componentNamePattern = /^[a-z][a-z0-9-]*$/;
const defaultGroups: readonly Readonly<Record<string, string>>[] = [
  colorDefaults,
  spacingDefaults,
  sizeDefaults,
  borderDefaults,
  radiusDefaults,
  shadowDefaults,
  durationDefaults,
  easeDefaults,
  transitionDefaults,
  typographyDefaults,
  textSizeDefaults,
  fontWeightDefaults,
  typeScaleDefaults,
];

function buildTokenDefaults(): Record<string, string> {
  const defaults: Record<string, string> = {};
  for (const group of defaultGroups) {
    for (const [name, value] of Object.entries(group)) {
      defaults[name] = value;
    }
  }
  return defaults;
}

export const tokenDefaults: Readonly<Record<string, string>> = buildTokenDefaults();

function assertThemeName(name: string): void {
  if (!themeNamePattern.test(name)) {
    throw new ThemeRuntimeError(`Theme name "${name}" must be kebab-case and start with a letter.`);
  }
}

function assertTokenName(name: string): void {
  if (!tokenNamePattern.test(name)) {
    throw new ThemeRuntimeError(`Theme token "${name}" must start with "--" and use kebab-case.`);
  }
}

function normalizeTokenValue(name: string, value: ThemeTokenValue): string {
  if (typeof value === 'string') {
    return value;
  }

  if (value.length !== 2 || typeof value[0] !== 'string' || typeof value[1] !== 'string') {
    throw new ThemeRuntimeError(`Theme token "${name}" must be a string or [light, dark] tuple.`);
  }

  return `light-dark(${value[0]}, ${value[1]})`;
}

function normalizeTokens(tokens: ThemeTokenInput | undefined): Record<string, string> {
  const normalized: Record<string, string> = {};
  if (tokens == null) {
    return normalized;
  }

  for (const [name, value] of Object.entries(tokens)) {
    assertTokenName(name);
    normalized[name] = normalizeTokenValue(name, value);
  }

  return normalized;
}

function assertComponents(components: ComponentStyleMap | undefined): void {
  if (components == null) {
    return;
  }

  for (const [component, rules] of Object.entries(components)) {
    if (!componentNamePattern.test(component)) {
      throw new ThemeRuntimeError(`Theme component "${component}" must be kebab-case.`);
    }

    for (const declaration of Object.values(rules)) {
      for (const property of Object.keys(declaration)) {
        if (!property.startsWith(':') && !cssPropertyPattern.test(property)) {
          throw new ThemeRuntimeError(`Theme CSS property "${property}" must be camelCase.`);
        }
      }
    }
  }
}

export function assertThemeMode(mode: string): ThemeMode {
  if (mode === 'light' || mode === 'dark' || mode === 'system') {
    return mode;
  }
  throw new ThemeRuntimeError(`Theme mode "${mode}" must be "light", "dark", or "system".`);
}

export function defineTheme(input: DefineThemeInput): DefinedTheme {
  assertThemeName(input.name);
  assertComponents(input.components);

  return {
    name: input.name,
    tokens: normalizeTokens(input.tokens),
    components: input.components,
    icons: input.icons,
    __built: input.built === true ? true : undefined,
  };
}

function splitTopLevelComma(value: string): readonly [string, string] | null {
  let depth = 0;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char === '(') {
      depth += 1;
    } else if (char === ')') {
      depth -= 1;
    } else if (char === ',' && depth === 0) {
      return [value.slice(0, index).trim(), value.slice(index + 1).trim()];
    }
  }
  return null;
}

function resolveTokenValue(value: string, mode: EffectiveThemeMode): string {
  const prefix = 'light-dark(';
  if (!value.startsWith(prefix) || !value.endsWith(')')) {
    return value;
  }

  const tuple = splitTopLevelComma(value.slice(prefix.length, -1));
  if (tuple == null) {
    return value;
  }

  return mode === 'light' ? tuple[0] : tuple[1];
}

export function resolveThemeTokens(
  theme: DefinedTheme | null,
  options: {readonly mode: EffectiveThemeMode},
): Readonly<Record<string, string>> {
  const resolved: Record<string, string> = {};
  const merged = {...tokenDefaults, ...(theme?.tokens ?? {})};

  for (const [name, value] of Object.entries(merged)) {
    resolved[name] = resolveTokenValue(value, options.mode);
  }

  return resolved;
}

function cssPropertyName(name: string): string {
  return name.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`);
}

function declarationsFromRecord(record: Readonly<Record<string, string>>, indent: string): string {
  return Object.entries(record)
    .map(([name, value]) => `${indent}${name}: ${value};`)
    .join('\n');
}

function selectorForTheme(themeName: string): string {
  return `[data-astryx-theme="${themeName}"]`;
}

const themeScopeBoundarySelector = '[data-astryx-theme]';

function componentSelector(component: string, key: string): string {
  if (key === 'base') {
    return `.astryx-${component}`;
  }

  const attributes = key
    .split('+')
    .map(part => {
      const separator = part.indexOf(':');
      if (separator === -1) {
        throw new ThemeRuntimeError(`Theme component selector "${key}" must use prop:value syntax.`);
      }
      const prop = part.slice(0, separator);
      const value = part.slice(separator + 1);
      return `[data-${prop}="${value}"]`;
    })
    .join('');

  return `.astryx-${component}${attributes}`;
}

function generateComponentCSS(theme: DefinedTheme): string {
  const rules: string[] = [];

  if (Object.keys(theme.tokens).length > 0) {
    rules.push(`:scope {\n${declarationsFromRecord(theme.tokens, '  ')}\n}`);
  }

  for (const [component, variants] of Object.entries(theme.components ?? {})) {
    for (const [key, declaration] of Object.entries(variants)) {
      const cssDeclaration = Object.fromEntries(
        Object.entries(declaration).map(([name, value]) => [cssPropertyName(name), value]),
      );
      rules.push(`${componentSelector(component, key)} {\n${declarationsFromRecord(cssDeclaration, '  ')}\n}`);
    }
  }

  if (rules.length === 0) {
    return '';
  }

  return `@scope (${selectorForTheme(theme.name)}) to (${themeScopeBoundarySelector}) {\n${rules.join('\n')}\n}`;
}

export function generateThemeCSS(theme: DefinedTheme): {readonly prose: string; readonly component: string} {
  return {
    prose: '',
    component: generateComponentCSS(theme),
  };
}
