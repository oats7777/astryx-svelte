// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file types.ts
 * @input Vega/Vega-Lite public types and Svelte wrapper callbacks
 * @output TypeScript API for the private @astryxdesign/svelte-vega package
 * @position Type definitions imported by VegaChart.svelte and package consumers
 */

import type {HTMLAttributes} from 'svelte/elements';
import type {Config, Spec as VegaSpec, View, ViewOptions} from 'vega';
import type {LoggerInterface} from 'vega-util';
import type {Config as VegaLiteConfig, TopLevelSpec as VegaLiteSpec} from 'vega-lite';

export type {Config, LoggerInterface, VegaLiteConfig, VegaLiteSpec, VegaSpec, View, ViewOptions};

export interface CompileOptions {
  readonly config?: VegaLiteConfig;
  readonly logger?: LoggerInterface;
  readonly fieldTitle?: (...args: readonly unknown[]) => string;
}

export type AnySpec = (VegaSpec | VegaLiteSpec) & {readonly $schema: string};

export interface ParseOptions {
  readonly ast?: boolean;
}

export type ViewData = Readonly<Record<string, readonly unknown[]>>;

export type VegaChartReadyHandler = (view: View) => void;
export type VegaChartErrorHandler = (error: Error) => void;

export type VegaChartProps = Omit<HTMLAttributes<HTMLDivElement>, 'onerror'> & {
  readonly spec: AnySpec;
  readonly data?: ViewData;
  readonly compileOptions?: CompileOptions;
  readonly parseConfig?: Config;
  readonly parseOptions?: ParseOptions;
  readonly viewOptions?: Omit<ViewOptions, 'container'>;
  readonly resize?: boolean;
  readonly themeConfig?: boolean;
  readonly onReady?: VegaChartReadyHandler;
  readonly onError?: VegaChartErrorHandler;
};
