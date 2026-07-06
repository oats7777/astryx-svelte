<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file App.svelte
   * @input Astryx Svelte components, Tailwind utilities, and local demo state
   * @output Tokenized Svelte + Tailwind example surface with deterministic test markers
   * @position Main UI for apps/example-svelte-tailwind
   */

  import {
    Button,
    Chat,
    Dialog,
    List,
    SegmentedControl,
    Switch,
    Table,
    TextInput,
    Theme,
    TopNav,
    defineTheme,
  } from '@astryxdesign/svelte';
  import type {ChatMessage, DataDisplayRow, ListItem, TableColumn} from '@astryxdesign/svelte';
  import type {ThemeMode} from '@astryxdesign/svelte/theme';

  type ExampleMode = Extract<ThemeMode, 'light' | 'dark'>;

  const exampleTheme = defineTheme({name: 'example-svelte-tailwind'});

  const navItems = [
    {label: 'Home', value: 'overview', href: '#overview', active: true},
    {label: 'UI', value: 'components', href: '#components'},
    {label: 'Data', value: 'data', href: '#data'},
  ] as const;

  const modeOptions = [
    {label: 'Light', value: 'light'},
    {label: 'Dark', value: 'dark'},
  ] as const;

  const healthItems: readonly ListItem[] = [
    {
      id: 'tokens',
      label: 'Astryx tokens loaded',
      description: 'Tailwind utilities resolve through the Astryx Tailwind CSS entrypoint.',
      meta: 'CSS contract',
    },
    {
      id: 'components',
      label: 'Svelte package scanned',
      description: 'The package Tailwind entrypoint registers package source; the app registers local source.',
      meta: 'tailwind.css',
    },
    {
      id: 'overlay',
      label: 'Overlay layer available',
      description: 'Dialog state is driven through Astryx overlay primitives.',
      meta: 'Runtime',
    },
  ];

  const tableColumns: readonly TableColumn[] = [
    {key: 'component', header: 'Component', sortable: true, filterable: true, sticky: 'start'},
    {key: 'family', header: 'Family', sortable: true, filterable: true},
    {key: 'signal', header: 'Signal', sortable: true, filterable: true},
  ];

  const tableRows: readonly DataDisplayRow[] = [
    {id: 'button', component: 'Button', family: 'Actions', signal: 'Primary and secondary commands'},
    {id: 'text-input', component: 'TextInput', family: 'Forms', signal: 'Labelled text entry'},
    {id: 'table', component: 'Table', family: 'Data display', signal: 'Sortable operational rows'},
    {id: 'dialog', component: 'Dialog', family: 'Overlays', signal: 'Focus-managed modal content'},
    {id: 'chat', component: 'Chat', family: 'Rich surfaces', signal: 'Markdown-backed message log'},
  ];

  const launchMessages: readonly ChatMessage[] = [
    {
      id: 'system-readiness',
      role: 'system',
      content: 'Token bridge and package styles are loaded before launch.',
      metadata: 'source check',
    },
    {
      id: 'assistant-readiness',
      role: 'assistant',
      content: 'Use `pnpm -F @astryxdesign/example-svelte-tailwind build` to verify the app surface.',
      metadata: 'rich surface',
    },
  ];

  let mode = $state<ExampleMode>('light');
  let activeSection = $state('overview');
  let projectName = $state('Northstar Launch');
  let compactDensity = $state(false);
  let dialogOpen = $state(false);

  const statusText = $derived(
    `${projectName} is using ${mode} mode with ${compactDensity ? 'compact' : 'comfortable'} density.`,
  );

  function setMode(nextMode: string): void {
    if (nextMode === 'light' || nextMode === 'dark') {
      mode = nextMode;
    }
  }

  function selectSection(value: string): void {
    activeSection = value;
  }
</script>

<Theme theme={exampleTheme} {mode}>
  <div
    class="min-h-dvh bg-body text-primary"
    data-testid="example-svelte-tailwind-root"
    data-example-mode={mode}
  >
    <TopNav
      title="Astryx"
      items={navItems}
      onSelect={selectSection}
      data-testid="example-nav"
    />

    <main class="mx-auto grid w-full min-w-0 max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <section id="overview" class="grid min-w-0 gap-6" aria-labelledby="example-title">
        <div class="min-w-0 rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div class="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div class="grid min-w-0 gap-3">
              <p class="text-sm font-medium text-accent">Svelte + Tailwind v4</p>
              <h1 id="example-title" class="max-w-3xl break-words text-3xl font-semibold tracking-normal text-primary sm:text-4xl">
                A real Astryx app surface backed by package components and token CSS.
              </h1>
              <p class="max-w-2xl text-base text-secondary" data-testid="example-status-text">
                {statusText}
              </p>
            </div>
            <div class="flex flex-wrap gap-2" data-testid="example-actions">
              <Button label="Open overlay" variant="primary" onClick={() => (dialogOpen = true)} />
              <Button label="Inspect data" href="#data" variant="secondary" />
            </div>
          </div>
        </div>

        <div
          id="components"
          class="grid min-w-0 gap-4 md:grid-cols-2"
          data-testid="example-component-grid"
        >
          <section class="min-w-0 rounded-lg border border-border bg-card p-4 shadow-sm" aria-labelledby="form-title">
            <div class="mb-4 flex items-center justify-between gap-3">
              <h2 id="form-title" class="text-xl font-semibold text-primary">Form controls</h2>
              <SegmentedControl
                label="Theme mode"
                value={mode}
                options={modeOptions}
                onChange={setMode}
                data-testid="example-mode-control"
              />
            </div>
            <div class="grid gap-4" data-testid="example-form-panel">
              <TextInput
                label="Project name"
                value={projectName}
                description="Updates the dashboard summary."
                hasClear
                onChange={(nextValue) => (projectName = nextValue)}
              />
              <Switch
                label="Compact density"
                isChecked={compactDensity}
                description="Demonstrates a form primitive with controlled state."
                onChange={(nextValue) => (compactDensity = nextValue)}
              />
            </div>
          </section>

          <section class="min-w-0 rounded-lg border border-border bg-card p-4 shadow-sm" aria-labelledby="health-title">
            <div class="mb-3 flex items-center justify-between gap-3">
              <h2 id="health-title" class="text-xl font-semibold text-primary">Integration signals</h2>
              <span class="rounded-md bg-green-subtle px-2 py-1 text-sm font-medium text-green-vivid">
                Ready
              </span>
            </div>
            <List items={healthItems} data-testid="example-health-list" />
          </section>
        </div>

        <section id="data" class="min-w-0 rounded-lg border border-border bg-card p-4 shadow-sm" aria-labelledby="data-title">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="data-title" class="text-xl font-semibold text-primary">Data display</h2>
              <p class="text-sm text-secondary">Sortable rows rendered by the Astryx Svelte table.</p>
            </div>
            <Button label={`Current: ${activeSection}`} variant="ghost" />
          </div>
          <div data-testid="example-data-table">
            <Table
              rows={tableRows}
              columns={tableColumns}
              caption="Astryx Svelte components demonstrated in this example"
              pageSize={4}
              isSelectable
            />
          </div>
        </section>
      </section>

      <aside class="grid min-w-0 content-start gap-4" aria-label="Example summary">
        <section class="rounded-lg border border-border bg-card p-4 shadow-sm" data-testid="example-summary-card">
          <h2 class="text-lg font-semibold text-primary">Source contract</h2>
          <dl class="mt-4 grid gap-3 text-sm">
            <div class="flex items-center justify-between gap-3">
              <dt class="text-secondary">App sources</dt>
            <dd class="font-medium text-primary">registered</dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="text-secondary">Package sources</dt>
              <dd class="font-medium text-primary">registered</dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="text-secondary">Token bridge</dt>
              <dd class="font-medium text-primary">loaded</dd>
            </div>
          </dl>
        </section>

        <section class="rounded-lg border border-border bg-card p-4 shadow-sm" data-testid="example-rich-card">
          <h2 class="text-lg font-semibold text-primary">Rich surface smoke</h2>
          <p class="mt-2 text-sm text-secondary">
            Chat renders from the Astryx Svelte package while the shell uses Tailwind token utilities.
          </p>
          <div class="mt-4" data-testid="example-rich-chat">
            <Chat messages={launchMessages} label="Example rich surface smoke" />
          </div>
          <div class="mt-4">
            <Button label="Review launch note" variant="secondary" onClick={() => (dialogOpen = true)} />
          </div>
        </section>
      </aside>
    </main>

    <Dialog
      open={dialogOpen}
      label="Launch readiness"
      onOpenChange={(nextOpen) => (dialogOpen = nextOpen)}
      data-testid="example-overlay-dialog"
    >
      <div class="grid max-w-md gap-4" data-testid="example-overlay-content">
        <div>
          <p class="text-sm font-medium text-accent">Launch readiness</p>
          <h2 class="mt-1 text-2xl font-semibold text-primary">Svelte package styles are part of the build.</h2>
        </div>
        <p class="text-sm text-secondary">
              This dialog is rendered by an Astryx overlay component while the surrounding layout uses Tailwind utilities
          backed by the Astryx Tailwind CSS entrypoint.
        </p>
        <div class="flex justify-end gap-2">
          <Button label="Close" variant="secondary" onClick={() => (dialogOpen = false)} />
          <Button label="Keep ready" variant="primary" onClick={() => (dialogOpen = false)} />
        </div>
      </div>
    </Dialog>
  </div>
</Theme>
