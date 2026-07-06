<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file VegaChart.svelte
   * @input Vega or Vega-Lite spec, parse/compile/view options, initial data, and Svelte theme context
   * @output Lifecycle-managed Vega View rendered into a Svelte div container
   * @position Primary component for the private @astryxdesign/svelte-vega package
   */

  import {useTheme} from '@astryxdesign/svelte/theme';
  import {compile} from 'vega-lite';
  import {parse, View} from 'vega';
  import type {Config as VegaLiteConfig} from 'vega-lite';
  import type {SchemaLibrary} from './schema.js';
  import type {AnySpec, CompileOptions, VegaChartProps, VegaLiteSpec, VegaSpec} from './types.js';
  import {parseSchema} from './schema.js';
  import {buildVegaLiteConfig} from './vegaLiteConfig.js';

  let {
    spec,
    data,
    compileOptions,
    parseConfig,
    parseOptions,
    viewOptions,
    resize = true,
    themeConfig = true,
    onReady,
    onError,
    ...rest
  }: VegaChartProps = $props();

  let container: HTMLDivElement | undefined = $state();
  const theme = useTheme();

  function toError(error: unknown): Error {
    return error instanceof Error ? error : new Error(String(error));
  }

  function mergeCompileOptions(
    options: CompileOptions | undefined,
    config: VegaLiteConfig,
  ): CompileOptions {
    if (options == null) {
      return {config};
    }

    return {
      ...options,
      config: {
        ...config,
        ...(options.config ?? {}),
      },
    };
  }

  function isVegaLiteSpec(
    chartSpec: AnySpec,
    library: SchemaLibrary,
  ): chartSpec is VegaLiteSpec & {readonly $schema: string} {
    return library === 'vega-lite';
  }

  function isVegaSpec(
    chartSpec: AnySpec,
    library: SchemaLibrary,
  ): chartSpec is VegaSpec & {readonly $schema: string} {
    return library === 'vega';
  }

  function assertNever(value: never): never {
    throw new Error(`Unsupported schema library: ${String(value)}`);
  }

  function selectVegaSpec(
    chartSpec: AnySpec,
    library: SchemaLibrary,
    options: CompileOptions | undefined,
  ): VegaSpec {
    switch (library) {
      case 'vega-lite':
        if (isVegaLiteSpec(chartSpec, library)) {
          return compile(chartSpec, options).spec;
        }
        throw new Error('Vega-Lite schema library did not match a Vega-Lite spec.');
      case 'vega':
        if (isVegaSpec(chartSpec, library)) {
          return chartSpec;
        }
        throw new Error('Vega schema library did not match a Vega spec.');
      default:
        return assertNever(library);
    }
  }

  $effect(() => {
    const target = container;
    if (target == null) {
      return;
    }

    let cancelled = false;
    let finalized = false;
    let view: View | null = null;
    let observer: ResizeObserver | null = null;

    const finalizeView = () => {
      if (!finalized) {
        finalized = true;
        view?.finalize();
      }
    };

    const fail = (error: unknown) => {
      if (!cancelled) {
        onError?.(toError(error));
      }
    };

    try {
      const schemaResult = parseSchema(spec.$schema);
      if (!schemaResult.ok) {
        fail(new Error(schemaResult.error));
        return;
      }

      const effectiveCompileOptions =
        themeConfig === true ? mergeCompileOptions(compileOptions, buildVegaLiteConfig((name) => theme.token(name))) : compileOptions;
      const vegaSpec = selectVegaSpec(spec, schemaResult.library, effectiveCompileOptions);
      const runtime = parse(vegaSpec, parseConfig, parseOptions);
      view = new View(runtime, {
        hover: true,
        ...viewOptions,
        container: target,
      });

      if (data != null) {
        for (const [name, tuples] of Object.entries(data)) {
          view.data(name, [...tuples]);
        }
      }

      if (resize && typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(() => {
          if (cancelled || view == null) {
            return;
          }
          view.resize().runAsync().catch(fail);
        });
        observer.observe(target);
      }

      view
        .runAsync()
        .then(() => {
          if (cancelled) {
            finalizeView();
            return;
          }
          if (view != null) {
            onReady?.(view);
          }
        })
        .catch(fail);
    } catch (error) {
      fail(error);
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      finalizeView();
    };
  });
</script>

<div bind:this={container} {...rest}></div>
