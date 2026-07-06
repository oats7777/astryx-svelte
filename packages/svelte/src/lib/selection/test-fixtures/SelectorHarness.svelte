<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file SelectorHarness.svelte
   * @input Selector-family change callbacks from Vitest
   * @output Controlled selection fixture that mirrors accepted changes into props
   * @position Test fixture for Todo 10 selection components
   */

  import MultiSelector from '../MultiSelector.svelte';
  import Selector from '../Selector.svelte';
  import Typeahead from '../Typeahead.svelte';
  import type {ComboOption, SearchableItem, SearchSource} from '../combo-types.js';

  let {
    selectorChange,
    multiChange,
    typeaheadChange,
    typeaheadSource,
  }: {
    readonly selectorChange: (value: string | null, event: Event) => void;
    readonly multiChange: (value: readonly string[], event: Event) => void;
    readonly typeaheadChange: (item: SearchableItem | null, event: Event) => void;
    readonly typeaheadSource: SearchSource<SearchableItem>;
  } = $props();

  let selected = $state<string | null>('apple');
  let selectedMany = $state<readonly string[]>([]);
  let assignee = $state<SearchableItem | null>(null);

  const selectorOptions: readonly ComboOption[] = [
    {label: 'Apple', value: 'apple'},
    {label: 'Banana', value: 'banana', isDisabled: true},
    {label: 'Citrus', value: 'citrus'},
    {label: 'Date', value: 'date'},
  ];

  const multiOptions: readonly ComboOption[] = [
    {
      type: 'section',
      label: 'Teams',
      options: [
        {label: 'Design', value: 'design'},
        {label: 'Engineering', value: 'engineering', isDisabled: true},
      ],
    },
    {type: 'divider'},
    {label: 'Marketing', value: 'marketing'},
  ];

  function handleSelectorChange(value: string | null, event: Event): void {
    selected = value;
    selectorChange(value, event);
  }

  function handleMultiChange(value: readonly string[], event: Event): void {
    selectedMany = value;
    multiChange(value, event);
  }

  function handleTypeaheadChange(item: SearchableItem | null, event: Event): void {
    assignee = item;
    typeaheadChange(item, event);
  }
</script>

<Selector
  id="fruit"
  label="Fruit"
  name="fruit"
  placeholder="Choose fruit"
  value={selected}
  options={selectorOptions}
  onChange={handleSelectorChange}
  data-testid="selector"
/>

<MultiSelector
  id="departments"
  label="Departments"
  name="departments"
  placeholder="Choose departments"
  value={selectedMany}
  options={multiOptions}
  onChange={handleMultiChange}
  data-testid="multi-selector"
/>

<Typeahead
  id="assignee"
  label="Assignee"
  name="assignee"
  placeholder="Search people"
  value={assignee}
  source={typeaheadSource}
  onChange={handleTypeaheadChange}
  data-testid="typeahead"
/>
