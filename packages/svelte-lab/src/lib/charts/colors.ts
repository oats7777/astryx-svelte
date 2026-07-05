// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file colors.ts
 * @input Astryx token variable names and optional resolver
 * @output Chart color ramps backed by design tokens
 * @position Token integration for private Svelte lab charts
 */

export type SequentialHue =
  | 'blue'
  | 'gray'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'red'
  | 'shamrock'
  | 'teal'
  | 'yellow';

export interface ChartColors {
  categorical(n: number): string[];
  readonly sequential: Record<SequentialHue, (n: number) => string[]>;
  readonly semantic: {
    readonly positive: string;
    readonly negative: string;
    readonly warning: string;
    readonly neutral: string;
  };
  readonly structural: {
    readonly axis: string;
    readonly grid: string;
    readonly tick: string;
    readonly label: string;
  };
  alpha(hex: string, opacity: number): string;
}

type TokenResolver = (name: string) => string;

const categoricalTokens = [
  '--color-data-categorical-blue',
  '--color-data-categorical-orange',
  '--color-data-categorical-purple',
  '--color-data-categorical-green',
  '--color-data-categorical-pink',
  '--color-data-categorical-cyan',
  '--color-data-categorical-red',
  '--color-data-categorical-teal',
] as const;

const hues = [
  'blue',
  'shamrock',
  'orange',
  'pink',
  'purple',
  'red',
  'teal',
  'yellow',
  'gray',
] as const satisfies readonly SequentialHue[];

function tokenVar(name: string): string {
  return `var(${name})`;
}

function ramp(resolve: TokenResolver, hue: SequentialHue): string[] {
  return [5, 4, 3, 2, 1].map((step) => resolve(`--color-data-${hue}-${step}`));
}

function pickFromRamp(stops: readonly string[], n: number): string[] {
  if (n <= 0) {
    return [];
  }
  if (n >= stops.length) {
    return [...stops];
  }
  if (n === 1) {
    return [stops[2] ?? stops[0] ?? ''];
  }
  return Array.from({length: n}, (_, index) => stops[Math.round((index * 4) / (n - 1))] ?? '');
}

export function alpha(hex: string, opacity: number): string {
  const match = /^#?([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/.exec(hex);
  if (!match) {
    return hex;
  }
  const clamped = Math.max(0, Math.min(1, opacity));
  return `rgba(${Number.parseInt(match[1] ?? '0', 16)},${Number.parseInt(
    match[2] ?? '0',
    16,
  )},${Number.parseInt(match[3] ?? '0', 16)},${clamped})`;
}

export function getChartColors(resolve: TokenResolver = tokenVar): ChartColors {
  const sequential = Object.fromEntries(
    hues.map((hue) => [hue, (n: number): string[] => pickFromRamp(ramp(resolve, hue), n)]),
  ) as Record<SequentialHue, (n: number) => string[]>;

  return {
    categorical(n: number): string[] {
      return categoricalTokens.slice(0, Math.max(0, n)).map(resolve);
    },
    sequential,
    semantic: {
      positive: resolve('--color-data-categorical-green'),
      negative: resolve('--color-data-categorical-red'),
      warning: resolve('--color-data-categorical-orange'),
      neutral: resolve('--color-data-neutral'),
    },
    structural: {
      axis: resolve('--color-border-emphasized'),
      grid: resolve('--color-border'),
      tick: resolve('--color-border-emphasized'),
      label: resolve('--color-text-secondary'),
    },
    alpha,
  };
}
