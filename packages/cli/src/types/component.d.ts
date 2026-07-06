// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Component command JSON responses.
 *
 * Detail-level contract for list views (brief < compact < full):
 *   --detail brief    Names only. Smallest, most scannable. (DEFAULT for --list)
 *   --detail compact  Names + 1-line description + import path.
 *   --detail full     Full ComponentDoc per entry (props, theming, examples, etc.).
 *
 * Invocation                                 -> type discriminator
 * ------------------------------------------------------------------
 * xds --json component                      -> component.list
 * xds --json component --list               -> component.list
 * xds --json component --category Form      -> component.list (filtered)
 * xds --json component --list --detail compact -> component.brief
 * xds --json component --list --detail full -> component.full
 * xds --json component Button               -> component.detail
 * xds --json component Button --props       -> component.detail.props
 * xds --json component Button --source      -> component.detail.source
 * xds --json component Button --showcase    -> component.detail.showcase
 * xds --json component Button --blocks      -> component.detail.blocks
 * (not found)                               -> CLIError
 */

export interface PropDoc {
  name: string;
  type?: string;
  required?: boolean;
  default?: string;
  description?: string;
}

export interface ComponentDoc {
  name: string;
  displayName?: string;
  description?: string;
  import?: string;
  usage?: {
    description?: string;
    examples?: unknown[];
  };
  props?: PropDoc[];
  components?: Array<ComponentDoc & {props?: PropDoc[]}>;
  theming?: unknown;
}

export type ComponentFramework = 'svelte';

/** xds --json component [--list] [--category X] [--detail brief] */
export interface ComponentListResponse {
  type: 'component.list';
  data: Record<string, ComponentListEntry[] | string[]>;
}

/**
 * A single entry in a `component.list` group. Pre-1.0 the list moved from bare
 * strings to package-qualified objects so consumers can disambiguate ownership
 * (core vs. an integration package).
 */
export interface ComponentListEntry {
  name: string;
  /** Owner package, e.g. '@astryxdesign/svelte' or '@acme/astryx-meta'. */
  package: string;
}

/** xds --json component --list --detail compact */
export interface ComponentBriefResponse {
  type: 'component.brief';
  data: Record<string, ComponentBriefEntry[]>;
}

export interface ComponentBriefEntry {
  name: string;
  description: string;
  import: string;
  framework?: ComponentFramework;
}

/** xds --json component --list --detail full */
export interface ComponentFullResponse {
  type: 'component.full';
  data: Record<string, ComponentDoc[]>;
}

/** xds --json component <name> */
export interface ComponentDetailResponse {
  type: 'component.detail';
  data: ComponentDoc & Partial<ComponentOwnership> & {framework?: ComponentFramework};
}

/**
 * Ownership metadata attached to every `component.detail` payload. Exposes the
 * owner package, the import specifier, and whether a swizzleable source file is
 * available — the inputs the integration-component swizzle (a later PR) needs.
 */
export interface ComponentOwnership {
  /** Owner package, e.g. '@astryxdesign/svelte' or an integration package name. */
  package: string;
  /** Import specifier for the component (e.g. '@astryxdesign/svelte/actions'). */
  import: string;
  /** Whether a component source file exists for `--source` / swizzle. */
  sourceAvailable: boolean;
}

/** xds --json component <name> --props */
export interface ComponentDetailPropsResponse {
  type: 'component.detail.props';
  data: PropDoc[];
}

/** xds --json component <name> --source */
export interface ComponentDetailSourceResponse {
  type: 'component.detail.source';
  data: {component: string; framework?: ComponentFramework; source: string};
}

/** xds --json component <name> --showcase */
export interface ComponentDetailShowcaseResponse {
  type: 'component.detail.showcase';
  data: {component: string; framework?: ComponentFramework; aspectRatio: number; source: string};
}

/** xds --json component <name> --blocks */
export interface ComponentDetailBlocksResponse {
  type: 'component.detail.blocks';
  data: {
    component: string;
    framework?: ComponentFramework;
    showcase: BlockEntry | null;
    examples: BlockEntry[];
    related: BlockEntry[];
  };
}

export interface BlockEntry {
  name: string;
  displayName: string;
  description: string;
  isShowcase: boolean;
  category: string;
}
