// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file power-search-config.test.ts
 * @input PowerSearch config/source utilities
 * @output Failing-first coverage for Todo 10 config normalization and source behavior
 * @position Unit tests for @astryxdesign/svelte PowerSearch utilities
 */

import {describe, expect, it} from 'vitest';
import {
  createPowerSearchConfig,
  createPowerSearchSource,
  resolvePowerSearchSourceResults,
} from './power-search-utils.js';
import type {PowerSearchFilter, PowerSearchItem, PowerSearchSource} from './power-search-types.js';

const definitions = [
  {key: 'title', type: 'string', label: 'Title'},
  {
    key: 'status',
    type: 'enum',
    label: 'Status',
    enumValues: [
      {value: 'open', label: 'Open'},
      {value: 'closed', label: 'Closed'},
      {value: 'open', label: 'Duplicate Open'},
    ],
  },
  {key: 'tags', type: 'string_list', label: 'Tags'},
] satisfies Parameters<typeof createPowerSearchConfig>[0];

const rows = [
  {title: 'Design tokens', status: 'open', tags: ['system']},
  {title: 'Archived docs', status: 'closed', tags: ['docs']},
] satisfies readonly Record<string, unknown>[];

function filter(field: string, operator: string, value: PowerSearchFilter['value']): PowerSearchFilter {
  return {field, operator, value};
}

describe('createPowerSearchConfig', () => {
  it('Given field definitions When building config Then defaults and duplicate enum values are normalized', () => {
    const {config} = createPowerSearchConfig(definitions, 'Issues');
    const status = config.fields.find((field) => field.key === 'status');

    expect(config.name).toBe('Issues');
    expect(config.fields.map((field) => field.key)).toEqual(['title', 'status', 'tags']);
    expect(config.fields[0]?.operators.map((operator) => operator.key)).toEqual([
      'contains',
      'not_contains',
      'starts_with',
      'not_starts_with',
      'ends_with',
      'not_ends_with',
      'is',
      'is_not',
    ]);
    expect(status?.defaultOperator).toBe('is');
    expect(status?.operators[0]?.value).toEqual({
      type: 'enum',
      values: [
        {value: 'open', label: 'Open'},
        {value: 'closed', label: 'Closed'},
      ],
    });
  });

  it('Given malformed filters When applying filters Then unknown values do not crash or broaden results', () => {
    const {applyFilters} = createPowerSearchConfig(definitions);

    expect(applyFilters([filter('title', 'contains', {type: 'string', value: 'design'})], rows)).toEqual([rows[0]]);
    expect(applyFilters([filter('status', 'is', {type: 'enum', value: 'archived'})], rows)).toEqual([]);
    expect(applyFilters([filter('missing', 'contains', {type: 'string', value: 'design'})], rows)).toEqual([]);
    expect(applyFilters([filter('title', 'unknown', {type: 'string', value: 'design'})], rows)).toEqual([]);
    expect(createPowerSearchConfig([]).applyFilters([], rows)).toEqual(rows);
  });
});

describe('createPowerSearchSource', () => {
  it('Given a config When searching Then deterministic field/operator/value suggestions are returned', () => {
    const {config} = createPowerSearchConfig(definitions);
    const source = createPowerSearchSource({...config, contentSearchFieldKey: 'title'});

    expect(source.bootstrap()).toEqual([
      {id: 'title', label: 'Title', auxiliaryData: {fieldKey: 'title', operatorKey: 'contains'}},
      {id: 'status', label: 'Status', auxiliaryData: {fieldKey: 'status', operatorKey: 'is'}},
      {id: 'tags', label: 'Tags', auxiliaryData: {fieldKey: 'tags', operatorKey: 'is_any_of'}},
    ]);
    expect(source.search('status op')).toEqual([
      {
        id: '__content_search__:status op',
        label: '"status op"',
        auxiliaryData: {fieldKey: 'title', operatorKey: 'contains', filterValue: {type: 'string', value: 'status op'}},
      },
      {
        id: 'status:is:value:Open',
        label: 'Status is Open',
        auxiliaryData: {fieldKey: 'status', operatorKey: 'is', filterValue: {type: 'enum', value: 'open'}},
      },
      {
        id: 'status:is_not:value:Open',
        label: 'Status is not Open',
        auxiliaryData: {fieldKey: 'status', operatorKey: 'is_not', filterValue: {type: 'enum', value: 'open'}},
      },
      {
        id: 'status:is_any_of:value:Open',
        label: 'Status is any of Open',
        auxiliaryData: {fieldKey: 'status', operatorKey: 'is_any_of', filterValue: {type: 'enum_list', value: ['open']}},
      },
      {
        id: 'status:is_none_of:value:Open',
        label: 'Status is none of Open',
        auxiliaryData: {fieldKey: 'status', operatorKey: 'is_none_of', filterValue: {type: 'enum_list', value: ['open']}},
      },
    ]);
  });

  it('Given an async-like source When resolving results Then promise results are supported', async () => {
    const asyncSource: PowerSearchSource<PowerSearchItem> = {
      bootstrap: async () => [{id: 'recent', label: 'Recent'}],
      search: async (query) => [{id: query, label: query.toUpperCase()}],
    };

    await expect(resolvePowerSearchSourceResults(asyncSource, 'open')).resolves.toEqual([
      {id: 'open', label: 'OPEN'},
    ]);
  });
});
