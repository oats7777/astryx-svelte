// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file theme-props.ts
 * @input Component names and Astryx visual prop values
 * @output Stable className plus data-* reflection for theme selectors
 * @position Todo 15 utility parity port for theme prop helpers
 */

export type ClassValue = string | number | undefined | null;
export type ClassProps = Readonly<Record<string, ClassValue>>;
export type ThemeDataAttributes = Record<`data-${string}`, string | undefined>;
export type ThemeProps = {readonly className: string} & ThemeDataAttributes;

function stableClassName(component: string): string {
  return `astryx-${component}`;
}

function toDataAttributeName(prop: string): `data-${string}` {
  return `data-${prop.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
}

function classTokenForPropValue(prop: string, value: string): string {
  return /^\d/.test(value) ? `${prop}-${value}` : value;
}

function buildClassName(component: string, props?: ClassProps): string {
  const classes = [stableClassName(component)];
  if (props != null) {
    for (const [prop, value] of Object.entries(props)) {
      if (value != null) {
        classes.push(classTokenForPropValue(prop, String(value)));
      }
    }
  }
  return classes.join(' ');
}

export function themeDataAttributes(props?: ClassProps): ThemeDataAttributes {
  const attributes: ThemeDataAttributes = {};
  if (props == null) {
    return attributes;
  }

  for (const [prop, value] of Object.entries(props)) {
    if (value != null) {
      attributes[toDataAttributeName(prop)] = String(value);
    }
  }
  return attributes;
}

export function themeProps(component: string, props?: ClassProps): ThemeProps {
  return {
    className: buildClassName(component, props),
    ...themeDataAttributes(props),
  };
}
