<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  import {
    AspectRatio,
    Avatar,
    AvatarGroup,
    AvatarGroupOverflow,
    AvatarStatusDot,
    Badge,
    Banner,
    Blockquote,
    Card,
    Center,
    Divider,
    EmptyState,
    Grid,
    HStack,
    Heading,
    Icon,
    Kbd,
    Section,
    Skeleton,
    Spinner,
    Stack,
    StatusDot,
    Text,
    Thumbnail,
    Timestamp,
    VStack,
  } from '../index.js';
</script>

<AspectRatio ratio={16 / 9} shape="ellipse" data-testid="aspect">
  <img src="/media/demo.jpg" alt="Demo media" />
</AspectRatio>

<Avatar name="Ada Lovelace" alt="Ada Lovelace" data-testid="avatar">
  {#snippet status()}
    <AvatarStatusDot variant="success" label="Online" />
  {/snippet}
</Avatar>

<AvatarGroup size="small" data-testid="avatar-group">
  <Avatar name="Grace Hopper" />
  <Avatar name="Katherine Johnson" />
  <AvatarGroupOverflow count={3} />
</AvatarGroup>

<Badge variant="purple" label="Engineering" data-testid="badge">
  {#snippet icon()}
    <Icon icon="check" size="xsm" />
  {/snippet}
</Badge>

<Banner
  status="warning"
  title="Scheduled maintenance"
  description="Write operations pause briefly."
  defaultIsExpanded
  data-testid="banner"
>
  <Text>Databases remain readable.</Text>
</Banner>

<Blockquote cite="Grace Hopper" data-testid="blockquote">
  The most dangerous phrase is, we have always done it this way.
</Blockquote>

<Card variant="muted" width={320} data-testid="card">Card content</Card>

<Center axis="both" minHeight={120} data-testid="center">Centered</Center>

<Divider label="Details" variant="strong" data-testid="divider" />

<EmptyState
  title="No projects"
  description="Create a project to start tracking work."
  variant="compact"
  data-testid="empty-state"
>
  {#snippet icon()}
    <Icon icon="search" label="Search" />
  {/snippet}
  {#snippet actions()}
    <Badge label="New" variant="info" />
  {/snippet}
</EmptyState>

<Grid columns={3} gap={2} data-testid="grid">
  <span>One</span>
  <span>Two</span>
  <span>Three</span>
</Grid>

<HStack gap={2} align="center" data-testid="hstack">
  <span>A</span>
  <span>B</span>
</HStack>

<Heading level={2} type="display-2" data-testid="heading">Usage</Heading>

<Icon icon="calendar" label="Calendar" color="accent" size="lg" data-testid="icon" />

<Kbd keys={['Command', 'K']} data-testid="kbd" />

<Section variant="section" data-testid="section">Section content</Section>

<Skeleton width={96} height={16} radius="full" data-testid="skeleton" />

<Spinner label="Loading results" size="sm" data-testid="spinner" />

<Stack direction="horizontal" gap={1} wrap="wrap" data-testid="stack">
  <span>Stacked</span>
</Stack>

<StatusDot variant="success" label="Live" isPulsing data-testid="status-dot" />

<Text type="supporting" color="secondary" maxLines={1} data-testid="text">
  Supporting text that can truncate.
</Text>

<Thumbnail src="/media/thumb.jpg" alt="Preview thumbnail" ratio={4 / 3} data-testid="thumbnail" />

<Timestamp value="2026-03-25T10:00:00Z" format="system_date_time" data-testid="timestamp" />

<VStack gap={1} align="stretch" data-testid="vstack">
  <span>Top</span>
  <span>Bottom</span>
</VStack>
