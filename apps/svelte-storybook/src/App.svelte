<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file App.svelte
   * @input Astryx Svelte root/groups, lab surfaces, Vega wrapper, and local story fixtures
   * @output Storybook-like visual docs app covering representative full-port surfaces
   * @position Root Svelte surface for @astryxdesign/svelte-storybook
   */

  import {Theme, astryxSveltePackage, defineTheme} from '@astryxdesign/svelte';
  import {Button} from '@astryxdesign/svelte/actions';
  import {Table, TreeList} from '@astryxdesign/svelte/data-display';
  import {Badge, Card, Heading, Stack, StackItem, Text, VisuallyHidden} from '@astryxdesign/svelte/foundations';
  import {CheckboxList, FileInput, InputGroup, NumberInput, RadioList, Slider, Switch, TextInput} from '@astryxdesign/svelte/forms';
  import {TabList} from '@astryxdesign/svelte/navigation';
  import {Dialog} from '@astryxdesign/svelte/overlays';
  import {Chat, CodeBlock, CommandPalette, Markdown} from '@astryxdesign/svelte/rich-surfaces';
  import {DateInput, DateRangeInput, DateTimeInput, MultiSelector, Selector, Tokenizer} from '@astryxdesign/svelte/selection';
  import {ChatReasoning, CircularProgress, Step, Stepper, astryxSvelteLabPackage} from '@astryxdesign/svelte-lab';
  import {Chart, ChartBar, ChartGrid, ChartLegend, ChartLine} from '@astryxdesign/svelte-lab/charts';
  import {VegaChart, astryxSvelteVegaPackage} from '@astryxdesign/svelte-vega';
  import {
    chartData,
    chartLegend,
    chatMessages,
    codeSample,
    densityOptions,
    approvalCadenceOptions,
    releaseChannelOptions,
    reviewerRoleOptions,
    stackMilestones,
    storyTabs,
    tableColumns,
    tableRows,
    treeItems,
    tokenizerValue,
    vegaSpec,
  } from './storyData';

  const storybookTheme = defineTheme({name: 'svelte-storybook'});
  let mode = $state<'light' | 'dark'>('light');
  let activeStory = $state('overview');
  let workspaceName = $state('Astryx Console');
  let livePreview = $state(true);
  let confidence = $state(82);
  let density = $state<string | null>('comfortable');
  let releaseChannels = $state<readonly string[]>(['beta', 'docs']);
  let evidenceFiles = $state<readonly File[] | null>(null);
  let reviewerSeats = $state<number | null>(3);
  let approvalCadence = $state<string | undefined>('weekly');
  let budgetCode = $state('42');
  let reviewerRoles = $state<readonly string[]>(['design', 'qa']);
  let dueDate = $state<string | undefined>('2026-01-12');
  let qaWindow = $state<{readonly start: string; readonly end: string} | null>({start: '2026-01-12', end: '2026-01-15'});
  let kickoff = $state<string | undefined>('2026-01-12T09:30');
  let step = $state(1);
  let selectedCommand = $state('none');
  let commandPaletteOpen = $state(false);
  let coverageDialogOpen = $state(false);

  const vegaImportLabel = VegaChart == null ? 'VegaChart unavailable' : 'VegaChart mounted';
  const packages = [astryxSveltePackage.name, storybookTheme.name, 'Theme provider mounted', 'Dialog overlay mounted', astryxSvelteLabPackage.name, astryxSvelteVegaPackage.name] as const;
  const commandItems = [
    {id: 'open-forms', label: 'Open forms review', auxiliaryData: {group: 'Navigate'}},
    {id: 'inspect-table', label: 'Inspect table states', auxiliaryData: {group: 'Data'}},
    {id: 'capture-chart', label: 'Capture lab chart', auxiliaryData: {group: 'Charts'}},
  ] as const;
  const commandSource = {
    bootstrap: () => commandItems,
    search: (query: string) =>
      commandItems.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
  } as const;

  function toggleMode(): void {
    mode = mode === 'dark' ? 'light' : 'dark';
  }

  function setDialogOpen(open: boolean): void {
    coverageDialogOpen = open;
  }
</script>

<Theme theme={storybookTheme} mode={mode}>
  <main class="storybook-shell" data-testid="visual-surface" data-storybook-mode={mode}>
    <header class="storybook-hero">
      <div class="hero-copy">
        <Badge label="Svelte visual surface" variant="blue" />
        <Heading level={1} type="display-1">Astryx Svelte Storybook</Heading>
        <Text color="secondary">
          Representative full-port surfaces rendered from real Astryx Svelte packages, lab charts, Vega, and token CSS.
        </Text>
      </div>
      <div class="hero-actions" aria-label="Storybook controls">
        <Button label={mode === 'dark' ? 'Light mode' : 'Dark mode'} variant="primary" onClick={toggleMode} />
        <Button label="Open workflow details" onClick={() => setDialogOpen(true)} />
      </div>
    </header>

    <section class="package-strip" aria-label="Resolved packages">
      {#each packages as packageName}
        <span>{packageName}</span>
      {/each}
    </section>

    <TabList
      label="Story groups"
      value={activeStory}
      tabs={storyTabs}
      onChange={(value) => (activeStory = value)}
      data-testid="story-tabs"
    />
    <p class="active-story">Active story: <strong data-testid="active-story">{storyTabs.find((tab) => tab.value === activeStory)?.label}</strong></p>

    <div class="story-grid">
      <Card variant="elevated" class="story-panel story-panel--wide" data-story-group="foundations-actions">
        <div class="panel-heading">
          <Heading level={2} type="title">Foundations and actions</Heading>
          <Badge label="root + foundations + actions" variant="green" />
        </div>
        <div class="status-banner" role="status">
          <strong>Runtime token CSS is mounted</strong>
          <span>Root exports, token CSS, cards, badges, text, headings, and buttons share one surface.</span>
        </div>
        <div class="button-row">
          <Button label="Primary action" variant="primary" />
          <Button label="Secondary action" variant="secondary" />
          <Button label="Destructive action" variant="destructive" />
        </div>
      </Card>

      <Card variant="default" class="story-panel story-panel--wide" data-story-group="foundation-visibility-stack">
        <div class="panel-heading">
          <Heading level={2} type="title">Visibility and Stack layout</Heading>
          <Badge label="VisuallyHidden + Stack" variant="cyan" />
        </div>
        <Stack
          direction="horizontal"
          gap={3}
          paddingInline={4}
          paddingBlock={2}
          wrap="wrap"
          isScrollable
          height="10rem"
          aria-label="Stack latest-main scroll region"
          data-testid="stack-story-region"
        >
          <StackItem size="fill" isScrollable aria-label="StackItem scrollable milestone list" data-testid="stack-item-scroll-region">
            <VisuallyHidden data-testid="visually-hidden-label">
              Stack story includes visually hidden assistive text for screen-reader parity.
            </VisuallyHidden>
            <ul class="stack-milestone-list">
              {#each stackMilestones as milestone}
                <li>
                  <strong>{milestone.label}</strong>
                  <span>{milestone.detail}</span>
                </li>
              {/each}
            </ul>
          </StackItem>
          <StackItem crossAlignSelf="end" data-testid="stack-item-static">
            <Badge label="Scrollable" variant="green" />
          </StackItem>
        </Stack>
      </Card>

      <Card variant="default" class="story-panel" data-story-group="forms-selection">
        <div class="panel-heading">
          <Heading level={2} type="title">Forms and selection</Heading>
          <Badge label="interactive" variant="purple" />
        </div>
        <TextInput label="Workspace name" value={workspaceName} hasClear onChange={(value) => (workspaceName = value)} />
        <Switch label="Live preview" isChecked={livePreview} description="Toggles visual refresh state." onChange={(value) => (livePreview = value)} />
        <Slider label="Confidence" value={confidence} min={0} max={100} step={1} onChange={(value) => (confidence = typeof value === 'number' ? value : value[0])} />
        <Selector label="Density" value={density} options={densityOptions} onChange={(value) => (density = value)} data-testid="density-selector" />
        <span class="density-readout" data-testid="density-value">{density}</span>
        <Tokenizer label="Story tags" value={tokenizerValue} onChange={() => undefined} />
        <div class="todo6-control-stack" data-testid="todo6-forms-controls">
          <CheckboxList
            id="todo6-release-channels"
            label="Release channels"
            name="releaseChannels"
            value={releaseChannels}
            items={releaseChannelOptions}
            description="Channels serialized for Todo 6 manual QA."
            onChange={(value) => (releaseChannels = value)}
          />
          <FileInput
            id="todo6-evidence-upload"
            label="QA evidence upload"
            value={evidenceFiles}
            accept="application/pdf,.txt"
            placeholder="Attach PDF or text evidence"
            onChange={(value) => (evidenceFiles = value)}
          />
          <InputGroup id="todo6-budget-group" label="Budget estimate" prefix="$" suffix="k">
            <TextInput id="todo6-budget-code" label="Budget code" value={budgetCode} isLabelHidden onChange={(value) => (budgetCode = value)} />
          </InputGroup>
          <NumberInput
            id="todo6-reviewer-seats"
            label="Reviewer seats"
            name="reviewerSeats"
            value={reviewerSeats}
            min={1}
            max={9}
            step={1}
            isIntegerOnly
            onChange={(value) => (reviewerSeats = value)}
          />
          <RadioList
            id="todo6-approval-cadence"
            label="Approval cadence"
            name="approvalCadence"
            value={approvalCadence}
            items={approvalCadenceOptions}
            onChange={(value) => (approvalCadence = value)}
          />
        </div>
        <div class="todo6-control-stack" data-testid="todo6-selection-date-time-controls">
          <MultiSelector
            id="todo6-reviewers"
            label="Todo 6 reviewers"
            name="reviewerRoles"
            value={reviewerRoles}
            options={reviewerRoleOptions}
            placeholder="Choose reviewers"
            onChange={(value) => (reviewerRoles = value)}
            data-testid="todo6-multi-selector"
          />
          <DateInput
            id="todo6-due-date"
            label="Todo 6 due date"
            value={dueDate}
            onChange={(value) => (dueDate = value)}
          />
          <DateRangeInput
            id="todo6-qa-window"
            label="Todo 6 QA window"
            value={qaWindow}
            onChange={(value) => (qaWindow = value)}
          />
          <span class="density-readout" data-testid="todo6-time-label">Hora de inicio</span>
          <DateTimeInput
            id="todo6-kickoff"
            label="Todo 6 kickoff"
            timeLabel="Hora de inicio"
            value={kickoff}
            onChange={(value) => (kickoff = value)}
          />
        </div>
      </Card>

      <Card variant="default" class="story-panel" data-story-group="navigation-overlays">
        <div class="panel-heading">
          <Heading level={2} type="title">Navigation and overlays</Heading>
          <Badge label="keyboard" variant="cyan" />
        </div>
        <Stepper activeStep={step} onStepClick={(nextStep) => (step = nextStep)} label="Port workflow">
          <Step step={0} label="Map" description="Exports and token CSS" />
          <Step step={1} label="Render" description="Visual stories" />
          <Step step={2} label="Verify" description="Screenshots and e2e" />
        </Stepper>
        <Button label="Open details" variant="primary" onClick={() => setDialogOpen(true)} data-testid="open-coverage-dialog" />
      </Card>

      <Card variant="default" class="story-panel story-panel--wide" data-story-group="data-display">
        <div class="panel-heading">
          <Heading level={2} type="title">Data display</Heading>
          <Badge label="table + tree" variant="orange" />
        </div>
        <Table rows={tableRows} columns={tableColumns} caption="Svelte port readiness" pageSize={4} isSelectable />
        <div class="status-banner" data-testid="tree-list-surface">
          <strong>TreeList manual QA</strong>
          <Text color="secondary">Nested readiness items use the public TreeList export and ARIA tree keyboard model.</Text>
          <TreeList items={treeItems} label="TreeList manual QA" />
        </div>
      </Card>

      <Card variant="default" class="story-panel" data-story-group="lab-charts">
        <div class="panel-heading">
          <Heading level={2} type="title">Lab charts</Heading>
          <Badge label="svelte-lab/charts" variant="teal" />
        </div>
        <Chart data={chartData} xKey="month" yKeys={['core', 'lab']} width={420} height={220} aria-label="Port coverage chart">
          <ChartGrid />
          <ChartBar dataKey="core" label="Core ports" />
          <ChartLine dataKey="lab" label="Lab ports" />
          <ChartLegend items={chartLegend} />
        </Chart>
      </Card>

      <Card variant="default" class="story-panel" data-story-group="svelte-vega">
        <div class="panel-heading">
          <Heading level={2} type="title">Vega wrapper</Heading>
          <Badge label="svelte-vega" variant="blue" />
        </div>
        <div class="vega-frame" data-testid="vega-chart">
          <VegaChart
            spec={vegaSpec}
            themeConfig={false}
            aria-label="Vega coverage chart"
            data-testid="vega-render"
          />
          <div class="vega-fallback" role="img" aria-label="Vega fallback coverage chart">
            <span style="--bar-size: 98%">Foundations</span>
            <span style="--bar-size: 94%">Forms</span>
            <span style="--bar-size: 91%">Navigation</span>
            <span style="--bar-size: 89%">Overlays</span>
          </div>
          <Text color="secondary">{vegaImportLabel}; deterministic fallback remains visible for screenshot stability.</Text>
        </div>
      </Card>

      <Card variant="default" class="story-panel story-panel--wide" data-story-group="rich-surfaces">
        <div class="panel-heading">
          <Heading level={2} type="title">Rich surfaces</Heading>
          <Badge label="chat + code" variant="pink" />
        </div>
        <ChatReasoning label="Port reasoning" duration="1.2s" defaultIsExpanded>
          Imports resolve through public root and subpath exports before the preview is captured.
        </ChatReasoning>
        <Chat messages={chatMessages} />
        <Markdown content={'## Markdown QA\n\nUse **Svelte** docs with [release notes](#release).'} />
        <Button label="Open command palette" variant="secondary" onClick={() => (commandPaletteOpen = true)} />
        <CommandPalette
          open={commandPaletteOpen}
          label="Story command palette"
          searchSource={commandSource}
          value={selectedCommand}
          onOpenChange={(open) => (commandPaletteOpen = open)}
          onValueChange={(value) => (selectedCommand = value)}
          data-testid="story-command-palette"
        />
        <span class="density-readout" data-testid="selected-command">{selectedCommand}</span>
        <CodeBlock code={codeSample} language="svelte" showLineNumbers highlightedLines={[1, 4]} />
      </Card>

      <Card variant="muted" class="story-panel" data-story-group="experimental-progress">
        <div class="panel-heading">
          <Heading level={2} type="title">Experimental progress</Heading>
          <Badge label="lab root" variant="yellow" />
        </div>
        <div class="progress-row">
          <CircularProgress value={confidence} label="Visual confidence" isLabelHidden={false} size="lg">{confidence}%</CircularProgress>
          <Text color="secondary">The visual and e2e scripts assert this surface through DOM, interaction, and nonblank screenshot observables.</Text>
        </div>
      </Card>
    </div>
  </main>

  <Dialog open={coverageDialogOpen} label="Port coverage details" onOpenChange={setDialogOpen} data-testid="coverage-dialog">
    <div class="dialog-content">
      <button type="button" class="dialog-close" aria-label="Close dialog" onclick={() => setDialogOpen(false)}>Close</button>
      <Heading level={2} type="title">Port coverage details</Heading>
      <Text color="secondary">Theme, forms, navigation, overlays, data display, selection, rich surfaces, lab charts, and Vega are mounted from real imports.</Text>
      <Button label="Close details" variant="primary" onClick={() => setDialogOpen(false)} />
    </div>
  </Dialog>
</Theme>
