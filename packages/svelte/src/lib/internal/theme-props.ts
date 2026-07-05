// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file theme-props.ts
 * @input Svelte component name, Tailwind variant maps, state maps, and consumer classes
 * @output Stable astryx-* classes plus data/ARIA state reflection
 * @position Tailwind-oriented styling primitive for @astryxdesign/svelte internals
 */

import {classNames, type ClassValue} from './class-names.js';

type VariantValue = string | number | null | undefined;
type VariantDefinitions = Readonly<Record<string, Readonly<Record<string, string>>>>;
type VariantSelection = Readonly<Record<string, VariantValue>>;
type StateClassDefinitions = Readonly<Record<string, string>>;

export type ThemePropsConfig = {
  readonly variants?: VariantDefinitions;
  readonly states?: StateClassDefinitions;
};

export type ThemePropsInput = {
  readonly variants?: VariantSelection;
  readonly states?: unknown;
  readonly class?: ClassValue;
};

export type ThemePropsResult = {
  class: string;
  disabled?: boolean;
  [attribute: string]: string | boolean | undefined;
};

export class ThemePropsError extends Error {
  readonly component: string;
  readonly reason: string;

  constructor(component: string, reason: string) {
    super(reason);
    this.name = 'ThemePropsError';
    this.component = component;
    this.reason = reason;
  }
}

const componentSegmentPattern = /^[a-z][a-z0-9-]*$/;
const variantNamePattern = /^[a-z][a-zA-Z0-9]*$/;
const classSegmentPattern = /^[a-z0-9][a-z0-9-]*$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toKebabCase(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function assertComponentName(component: string): void {
  if (!componentSegmentPattern.test(component)) {
    throw new ThemePropsError(
      component,
      `Component name "${component}" must be kebab-case and start with a letter.`,
    );
  }
}

function assertVariantName(component: string, variantName: string): void {
  if (!variantNamePattern.test(variantName)) {
    throw new ThemePropsError(
      component,
      `Variant name "${variantName}" must be camelCase and start with a letter.`,
    );
  }
}

function assertClassSegment(component: string, segment: string, label: string): void {
  if (!classSegmentPattern.test(segment)) {
    throw new ThemePropsError(
      component,
      `${label} "${segment}" must contain only lowercase letters, numbers, and hyphens.`,
    );
  }
}

function dataAttributeName(name: string): string {
  return `data-${toKebabCase(name)}`;
}

function modifierClass(component: string, name: string, value?: string): string {
  const kebabName = toKebabCase(name);
  assertClassSegment(component, kebabName, 'Modifier');

  if (value == null) {
    return `astryx-${component}--${kebabName}`;
  }

  assertClassSegment(component, value, 'Modifier value');
  return `astryx-${component}--${kebabName}-${value}`;
}

function stateEntries(component: string, states: unknown): readonly [string, boolean][] {
  if (states == null) {
    return [];
  }

  if (!isRecord(states)) {
    throw new ThemePropsError(component, `States on "${component}" must be a record.`);
  }

  const entries: [string, boolean][] = [];
  for (const [name, active] of Object.entries(states)) {
    assertVariantName(component, name);
    if (typeof active !== 'boolean') {
      throw new ThemePropsError(component, `State "${name}" on "${component}" must be boolean.`);
    }
    entries.push([name, active]);
  }

  return entries;
}

function reflectStateAttributes(result: ThemePropsResult, stateName: string): void {
  result[dataAttributeName(stateName)] = 'true';

  if (stateName === 'disabled') {
    result.disabled = true;
    result['aria-disabled'] = 'true';
  }

  if (stateName === 'loading') {
    result['aria-busy'] = 'true';
  }

  if (stateName === 'invalid') {
    result['aria-invalid'] = 'true';
  }
}

export function themeProps(
  component: string,
  config: ThemePropsConfig,
  input: ThemePropsInput = {},
): ThemePropsResult {
  assertComponentName(component);

  const variants = config.variants ?? {};
  const selectedVariants = input.variants ?? {};
  const classes: ClassValue[] = [`astryx-${component}`];
  const result: ThemePropsResult = {class: ''};

  for (const [variantName, value] of Object.entries(selectedVariants)) {
    assertVariantName(component, variantName);

    if (value == null) {
      continue;
    }

    const variantValues = variants[variantName];
    if (!variantValues) {
      throw new ThemePropsError(
        component,
        `Unknown variant "${variantName}" on "${component}".`,
      );
    }

    const valueName = String(value);
    const mappedClasses = variantValues[valueName];
    if (!mappedClasses) {
      throw new ThemePropsError(
        component,
        `Unknown value "${valueName}" for variant "${variantName}" on "${component}".`,
      );
    }

    result[dataAttributeName(variantName)] = valueName;
    classes.push(modifierClass(component, variantName, valueName), mappedClasses);
  }

  for (const [stateName, active] of stateEntries(component, input.states)) {
    if (!active) {
      continue;
    }

    const stateClasses = config.states?.[stateName];
    classes.push(modifierClass(component, stateName), stateClasses);
    reflectStateAttributes(result, stateName);
  }

  result.class = classNames(classes, input.class);
  return result;
}
