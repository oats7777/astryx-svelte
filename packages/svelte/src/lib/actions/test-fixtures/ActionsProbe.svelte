<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file ActionsProbe.svelte
   * @input Action-family components and optional click spies
   * @output Representative DOM for action component parity tests
   * @position Test fixture for Todo 8 actions family
   */

  import Button from '../Button.svelte';
  import ButtonGroup from '../ButtonGroup.svelte';
  import Citation from '../Citation.svelte';
  import ClickableCard from '../ClickableCard.svelte';
  import IconButton from '../IconButton.svelte';
  import Item from '../Item.svelte';
  import NavIcon from '../NavIcon.svelte';
  import ToggleButton from '../ToggleButton.svelte';
  import Token from '../Token.svelte';

  let {
    disabledClick = undefined,
    disabledGroupClick = undefined,
    loadingClick = undefined,
  }: {
    readonly disabledClick?: (event: MouseEvent) => void;
    readonly disabledGroupClick?: (event: MouseEvent) => void;
    readonly loadingClick?: (event: MouseEvent) => void;
  } = $props();
</script>

<Button
  href="/disabled"
  label="Disabled link"
  isDisabled
  onclick={disabledClick}
  data-testid="disabled-link-button"
/>
<Button label="Loading" isLoading onclick={loadingClick} data-testid="loading-button" />
<Button label="Save" tooltip="Save changes" tooltipId="tip-save" data-testid="tooltip-button" />

<ButtonGroup label="Grouped actions" data-testid="button-group">
  <Button label="One" />
  <IconButton label="Settings" icon="S" />
</ButtonGroup>

<ButtonGroup label="Disabled grouped actions" isDisabled data-testid="disabled-button-group">
  <Button label="Disabled one" onclick={disabledGroupClick} />
  <IconButton label="Disabled settings" icon="S" onclick={disabledGroupClick} />
</ButtonGroup>

<ClickableCard label="Open report" data-testid="clickable-card">
  Report
</ClickableCard>

<ToggleButton label="Bold" isPressed data-testid="toggle-button" />
<Token label="Alpha" onRemove={() => undefined} data-testid="token" />
<Item label="Invoice" description="Ready" href="/invoice" data-testid="item" />
<Citation source={{title: 'Source', url: 'https://example.com'}} number={1} data-testid="citation" />
<NavIcon icon="N" data-testid="nav-icon" />
