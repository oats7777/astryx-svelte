// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Svelte temporal, selector, tokenizer, typeahead, and PowerSearch modules
 * @output Public selection-family component, type, and utility exports
 * @position Todo 10 selection entrypoint for @astryxdesign/svelte
 */

export {default as Calendar} from './Calendar.svelte';
export {default as DateInput} from './DateInput.svelte';
export {default as DateRangeInput} from './DateRangeInput.svelte';
export {default as DateTimeInput} from './DateTimeInput.svelte';
export {default as MultiSelector} from './MultiSelector.svelte';
export {default as PowerSearch} from './PowerSearch.svelte';
export {default as Selector} from './Selector.svelte';
export {default as TimeInput} from './TimeInput.svelte';
export {default as Tokenizer} from './Tokenizer.svelte';
export {default as Typeahead} from './Typeahead.svelte';
export {
  flattenedOptions,
  itemMatchesQuery,
  normalizeOption,
  searchSource,
  serializeTokens,
  splitTokenInput,
  tokenFromText,
} from './combo-utils.js';
export {
  createPowerSearchConfig,
  createPowerSearchSource,
  formatPowerSearchFilter,
  resolvePowerSearchSourceResults,
} from './power-search-utils.js';
export {
  accessibleDate,
  addDays,
  addMonths,
  calendarDays,
  compareDates,
  createPlainDate,
  dateToISO,
  dayNames,
  formatDisplayDate,
  formatDisplayTime,
  formatISOTime,
  isDateAllowed,
  isTimeInRange,
  monthLabel,
  normalizeRange,
  parseDateInput,
  parseISODate,
  parseISOTime,
  parseTimeInput,
  toLocalDate,
} from './temporal-utils.js';
export type {
  ComboDivider,
  ComboOption,
  ComboOptionData,
  ComboSection,
  MaybePromise,
  SearchableItem,
  SearchSource,
  SearchSourceInput,
  TokenizerChangeHandler,
  TokenizerToken,
  TypeaheadChangeHandler,
} from './combo-types.js';
export type {
  PowerSearchAuxData,
  PowerSearchChangeType,
  PowerSearchConfig,
  PowerSearchEnumItem,
  PowerSearchField,
  PowerSearchFieldDefinition,
  PowerSearchFieldType,
  PowerSearchFilter,
  PowerSearchFilterValue,
  PowerSearchItem,
  PowerSearchOperator,
  PowerSearchOperatorValue,
  PowerSearchProps,
  PowerSearchSource,
} from './power-search-types.js';
export type {CalendarDay} from './temporal-utils.js';
export type {
  CalendarMode,
  DateChangeHandler,
  DateRange,
  DateRangeChangeHandler,
  DateTimeChangeHandler,
  ISODateString,
  ISODateTimeString,
  ISOTimeString,
  ParsedTime,
  PlainDate,
  TimeChangeHandler,
} from './temporal-types.js';
