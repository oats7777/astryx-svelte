// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file plugins.ts
 * @input Plugin options for schedule header controls
 * @output Built-in pagination and view-selector plugin descriptors
 * @position Local Svelte schedule plugin helpers
 */

import type {
  SchedulePaginationPlugin,
  SchedulePlugin,
  SchedulePluginPosition,
  ScheduleViewBase,
  ScheduleViewSelectorOption,
  ScheduleViewSelectorPlugin,
} from './types.js';

export function createSchedulePaginationPlugin({
  position = 'start',
}: {
  readonly position?: SchedulePluginPosition;
} = {}): SchedulePaginationPlugin {
  return {kind: 'pagination', position};
}

export function createScheduleViewSelectorPlugin<View extends ScheduleViewBase>(
  options: readonly ScheduleViewSelectorOption<View>[],
  {
    onChangeView,
    position = 'end',
  }: {
    readonly onChangeView?: (view: View) => void;
    readonly position?: SchedulePluginPosition;
  } = {},
): ScheduleViewSelectorPlugin<View> {
  return onChangeView == null
    ? {kind: 'view-selector', position, options}
    : {kind: 'view-selector', position, options, onChangeView};
}

export function createScheduleLabelPlugin({
  label,
  position = 'start',
}: {
  readonly label: string;
  readonly position?: SchedulePluginPosition;
}): SchedulePlugin {
  return {kind: 'label', position, label};
}

export const defaultSchedulePaginationPlugin = createSchedulePaginationPlugin();
export const defaultSchedulePlugins: readonly SchedulePlugin[] = [defaultSchedulePaginationPlugin];
