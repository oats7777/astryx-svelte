// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Upgrade command JSON responses.
 *
 * Invocation                                 -> type discriminator
 * ------------------------------------------------------------------
 * xds --json upgrade --list                 -> upgrade.list
 * xds --json upgrade [--apply]              -> upgrade.run
 * (version detection failure)               -> CLIError
 */

/** xds --json upgrade --list */
export interface UpgradeListResponse {
  type: 'upgrade.list';
  data: UpgradeListEntry[];
}

export interface UpgradeListEntry {
  name: string;
  title: string;
  version: string;
}

/** astryx --json upgrade [--apply] */
export interface UpgradeRunResponse {
  type: 'upgrade.run';
  data: {
    from: string | null;
    to: string | null;
    package: '@astryxdesign/svelte';
    apply: boolean;
    codemods: never[];
    changedFiles: string[];
    message: string;
  };
}
