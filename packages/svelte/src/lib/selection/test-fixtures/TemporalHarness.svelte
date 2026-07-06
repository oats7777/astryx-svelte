<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file TemporalHarness.svelte
   * @input Temporal callback props
   * @output Mounted fixture with date, range, datetime, time, and disabled controls
   * @position Test harness for Todo 10 temporal Svelte controls
   */

  import DateInput from '../DateInput.svelte';
  import DateRangeInput from '../DateRangeInput.svelte';
  import DateTimeInput from '../DateTimeInput.svelte';
  import TimeInput from '../TimeInput.svelte';
  import type {DateRange, ISODateString, ISODateTimeString, ISOTimeString} from '../temporal-types.js';

  let {
    onDateChange,
    onRangeChange,
    onDateTimeChange,
    onTimeChange,
  } = $props<{
    readonly onDateChange: (value: ISODateString | undefined, event: Event) => void;
    readonly onRangeChange: (value: DateRange | null, event: Event) => void;
    readonly onDateTimeChange: (value: ISODateTimeString | undefined, event: Event) => void;
    readonly onTimeChange: (value: ISOTimeString | undefined, event: Event) => void;
  }>();

  let dateValue = $state<ISODateString | undefined>(undefined);
  let rangeValue = $state<DateRange | null>(null);
  let dateTimeValue = $state<ISODateTimeString | undefined>(undefined);
  let timeValue = $state<ISOTimeString | undefined>(undefined);

  function handleDateChange(value: ISODateString | undefined, event: Event): void {
    dateValue = value;
    onDateChange(value, event);
  }

  function handleRangeChange(value: DateRange | null, event: Event): void {
    rangeValue = value;
    onRangeChange(value, event);
  }

  function handleDateTimeChange(value: ISODateTimeString | undefined, event: Event): void {
    dateTimeValue = value;
    onDateTimeChange(value, event);
  }

  function handleTimeChange(value: ISOTimeString | undefined, event: Event): void {
    timeValue = value;
    onTimeChange(value, event);
  }
</script>

<DateInput
  id="event-date"
  label="Event date"
  value={dateValue}
  isRequired
  status={{type: 'error', message: 'Invalid date'}}
  onChange={handleDateChange}
/>
<DateRangeInput
  id="travel-range"
  label="Travel range"
  value={rangeValue}
  isRequired
  onChange={handleRangeChange}
/>
<DateTimeInput
  id="meeting"
  label="Meeting"
  value={dateTimeValue}
  onChange={handleDateTimeChange}
/>
<TimeInput id="start-time" label="Start time" value={timeValue} onChange={handleTimeChange} />
<DateInput id="disabled-date" label="Disabled date" isDisabled />
