// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file storyData.ts
 * @input Representative Astryx Svelte story rows, options, tokens, chart data, and Vega spec
 * @output Typed fixture data for the Svelte visual storybook app
 * @position Static data boundary for @astryxdesign/svelte-storybook
 */

import type {TableColumn, DataDisplayRow, TreeItem} from '@astryxdesign/svelte/data-display';
import type {SelectItem} from '@astryxdesign/svelte/forms';
import type {ChatMessage} from '@astryxdesign/svelte/rich-surfaces';
import type {ComboOption, TokenizerToken} from '@astryxdesign/svelte/selection';
import type {ChartDatum, LegendItem} from '@astryxdesign/svelte-lab/charts';

export type StoryTab = {
  readonly label: string;
  readonly value: string;
};

export type StackMilestone = {
  readonly label: string;
  readonly detail: string;
};

export const storyTabs: readonly StoryTab[] = [
  {label: 'Overview', value: 'overview'},
  {label: 'Stack', value: 'stack'},
  {label: 'Forms', value: 'forms'},
  {label: 'Data', value: 'data'},
  {label: 'Rich surfaces', value: 'rich'},
] as const;

export const densityOptions = [
  {label: 'Comfortable', value: 'comfortable'},
  {label: 'Compact', value: 'compact'},
] as const;

export const releaseChannelOptions: readonly SelectItem[] = [
  {label: 'Beta channel', value: 'beta', description: 'Early access changes staged for product QA.'},
  {label: 'Docs channel', value: 'docs', description: 'Documentation and migration notes.'},
  {label: 'Operations channel', value: 'ops', description: 'Internal rollout coordination.'},
] as const;

export const approvalCadenceOptions: readonly SelectItem[] = [
  {label: 'Weekly', value: 'weekly', description: 'Review every Friday.'},
  {label: 'Monthly', value: 'monthly', description: 'Review on the first business day.'},
  {label: 'Quarterly', value: 'quarterly', description: 'Review before planning.'},
] as const;

export const reviewerRoleOptions: readonly ComboOption[] = [
  {type: 'section', label: 'Core reviewers', options: [
    {label: 'Design', value: 'design'},
    {label: 'QA', value: 'qa'},
    {label: 'Docs', value: 'docs'},
  ]},
] as const;

export const stackMilestones: readonly StackMilestone[] = [
  {label: 'VisuallyHidden', detail: 'Screen-reader text remains mounted without adding visual noise.'},
  {label: 'Stack padding', detail: 'Inline and block padding follow latest main spacing behavior.'},
  {label: 'StackItem scroll', detail: 'Scrollable child regions expose focusable region semantics.'},
] as const;

export const tableColumns: readonly TableColumn[] = [
  {key: 'surface', header: 'Surface', sortable: true, filterable: true, width: 160},
  {key: 'status', header: 'Status', sortable: true, filterable: true, width: 120},
  {key: 'coverage', header: 'Coverage', sortable: true, align: 'end', width: 96},
] as const;

export const tableRows: readonly DataDisplayRow[] = [
  {id: 'foundation', surface: 'Foundations', status: 'Ready', coverage: 98},
  {id: 'forms', surface: 'Forms', status: 'Ready', coverage: 94},
  {id: 'navigation', surface: 'Navigation', status: 'Ready', coverage: 91},
  {id: 'overlays', surface: 'Overlays', status: 'Ready', coverage: 89},
] as const;

export const treeItems: readonly TreeItem[] = [
  {
    key: 'data-display',
    label: 'Data display parity',
    description: 'Table and TreeList manual QA coverage',
    children: [
      {key: 'table-manual-qa', label: 'Table manual QA', description: 'Sort, select, and pagination states'},
      {key: 'tree-manual-qa', label: 'TreeList manual QA', description: 'Roving focus and expand/collapse states'},
    ],
  },
  {
    key: 'layout-progress',
    label: 'Layout and progress',
    description: 'Scrollable regions and progress semantics',
    children: [
      {key: 'scroll-regions', label: 'Keyboard scroll regions'},
      {key: 'progress-role', label: 'Progress role semantics'},
    ],
  },
] as const;

export const chartData: readonly ChartDatum[] = [
  {month: 'Jan', core: 38, lab: 18},
  {month: 'Feb', core: 46, lab: 22},
  {month: 'Mar', core: 58, lab: 31},
  {month: 'Apr', core: 68, lab: 37},
  {month: 'May', core: 81, lab: 44},
] as const;

export const chartLegend: readonly LegendItem[] = [
  {label: 'Core ports', color: 'var(--color-data-categorical-blue)'},
  {label: 'Lab ports', color: 'var(--color-data-categorical-orange)'},
] as const;

export const chatMessages: readonly ChatMessage[] = [
  {
    id: 'user-1',
    role: 'user',
    content: 'Show parity gaps for full-port surfaces.',
    metadata: 'QA',
  },
  {
    id: 'assistant-1',
    role: 'assistant',
    content: 'Navigation, overlays, selection, data display, charts, and rich surfaces are mounted in one visual pass.',
    metadata: 'Astryx',
  },
] as const;

export const tokenizerValue: readonly TokenizerToken[] = [
  {id: 'token-1', label: 'theme', value: 'theme'},
  {id: 'token-2', label: 'forms', value: 'forms'},
  {id: 'token-3', label: 'charts', value: 'charts'},
] as const;

export const codeSample = `import {Theme} from '@astryxdesign/svelte';

<Theme theme={storybookTheme} mode="dark">
  <Button label="Ship surface" variant="primary" />
</Theme>`;

export const vegaSpec = {
  $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
  width: 260,
  height: 132,
  data: {
    values: [
      {group: 'Foundations', score: 98},
      {group: 'Forms', score: 94},
      {group: 'Navigation', score: 91},
      {group: 'Overlays', score: 89},
    ],
  },
  mark: {type: 'bar', cornerRadiusEnd: 4},
  encoding: {
    x: {field: 'score', type: 'quantitative', title: null},
    y: {field: 'group', type: 'nominal', title: null, sort: '-x'},
    color: {value: '#0064E0'},
  },
  config: {
    view: {stroke: null},
  },
} as const;
