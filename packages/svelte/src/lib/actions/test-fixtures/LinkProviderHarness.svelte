<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file LinkProviderHarness.svelte
   * @input LinkProvider plus Link/Button/ClickableCard consumers
   * @output Router-link replacement fixture for Todo 8 tests
   * @position Test fixture proving no hardcoded framework router links
   */

  import Button from '../Button.svelte';
  import ClickableCard from '../ClickableCard.svelte';
  import Item from '../Item.svelte';
  import Link from '../Link.svelte';
  import LinkProvider from '../LinkProvider.svelte';
  import RouterLinkProbe from './RouterLinkProbe.svelte';
  import Token from '../Token.svelte';
</script>

<LinkProvider component={RouterLinkProbe}>
  <Link href="/docs" label="Docs" data-testid="provider-link" />
  <Button href="/save" label="Save" data-testid="provider-button" />
  <ClickableCard href="/card" label="Card" data-testid="provider-card">
    Card content
  </ClickableCard>
  <Token href="/token" label="Token" data-testid="provider-token" />
  <Item href="/item" label="Item" data-testid="provider-item" />
</LinkProvider>
