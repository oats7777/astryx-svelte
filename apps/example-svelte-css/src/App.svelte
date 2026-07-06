<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file App.svelte
   * @input Astryx Svelte components and app-authored plain CSS classes
   * @output Consumer-style Svelte app proving Tailwind-free Astryx usage
   * @position Main UI for apps/example-svelte-css
   */

  import {
    AppShell,
    Button,
    Card,
    Heading,
    List,
    SegmentedControl,
    Table,
    Text,
    TextInput,
    Theme,
    defineTheme,
  } from '@astryxdesign/svelte';
  import type {DataDisplayRow, ListItem, NavItemModel, TableColumn} from '@astryxdesign/svelte';
  import type {ThemeMode} from '@astryxdesign/svelte/theme';

  type ExampleMode = Extract<ThemeMode, 'light' | 'dark'>;

  const cssTheme = defineTheme({name: 'example-svelte-css'});

  const topNavItems: readonly NavItemModel[] = [
    {label: 'Overview', value: 'overview', href: '#overview', active: true},
    {label: 'Controls', value: 'controls', href: '#controls'},
    {label: 'Data', value: 'data', href: '#data'},
  ];

  const sideNavItems: readonly NavItemModel[] = [
    {label: 'Plain CSS', value: 'plain-css', active: true},
    {label: 'Components', value: 'components'},
    {label: 'Tokens', value: 'tokens'},
  ];

  const modeOptions = [
    {label: 'Light', value: 'light'},
    {label: 'Dark', value: 'dark'},
  ] as const;

  const readinessItems: readonly ListItem[] = [
    {
      id: 'styles',
      label: 'Package styles loaded',
      description: 'The app imports only @astryxdesign/svelte/styles.css.',
      meta: 'plain CSS',
    },
    {
      id: 'tokens',
      label: 'Semantic tokens available',
      description: 'Local CSS reads Astryx custom properties directly.',
      meta: 'variables',
    },
    {
      id: 'navigation',
      label: 'Navigation is package-styled',
      description: 'AppShell, TopNav, SideNav, and NavItem do not require Tailwind utilities.',
      meta: 'CSS-only',
    },
  ];

  const tableColumns: readonly TableColumn[] = [
    {key: 'surface', header: 'Surface', sortable: true, filterable: true},
    {key: 'style', header: 'Style source', sortable: true, filterable: true},
    {key: 'status', header: 'Status', sortable: true, filterable: true},
  ];

  const tableRows: readonly DataDisplayRow[] = [
    {id: 'shell', surface: 'AppShell', style: 'Package CSS', status: 'Ready'},
    {id: 'forms', surface: 'TextInput', style: 'Package CSS', status: 'Ready'},
    {id: 'layout', surface: 'Example shell', style: 'App CSS', status: 'Ready'},
    {id: 'table', surface: 'Table', style: 'Package CSS', status: 'Ready'},
  ];

  let mode = $state<ExampleMode>('light');
  let projectName = $state('CSS-only rollout');
  const summary = $derived(`${projectName} is running ${mode} mode with no Tailwind dependency.`);

  function setMode(nextMode: string): void {
    if (nextMode === 'light' || nextMode === 'dark') {
      mode = nextMode;
    }
  }
</script>

<svelte:head>
  <title>Astryx Svelte CSS Example</title>
</svelte:head>

<Theme theme={cssTheme} {mode}>
  <AppShell
    title="Astryx CSS"
    {topNavItems}
    {sideNavItems}
    mobileNav={{defaultIsMobile: false}}
    data-testid="example-svelte-css-shell"
  >
    <div class="css-example-page" id="overview" data-testid="example-svelte-css-root">
      <section class="css-example-hero" aria-labelledby="css-example-title">
        <div class="css-example-stack">
          <p class="css-example-eyebrow">Plain CSS consumer</p>
          <Heading level={1} type="display-2" id="css-example-title" class="css-example-title">
            Astryx Svelte without Tailwind
          </Heading>
          <Text class="css-example-copy">
            This app imports the package CSS once, then uses app-local CSS classes backed by Astryx variables.
          </Text>
        </div>
        <div class="css-example-actions">
          <Button label="Primary action" variant="primary" />
          <Button label="Secondary action" variant="secondary" />
        </div>
      </section>

      <section class="css-example-grid" id="controls">
        <div class="css-example-stack">
          <Card variant="elevated" class="css-example-panel">
            <div class="css-example-panel-header">
              <div class="css-example-section-heading">
                <Heading level={2} type="title">Controls</Heading>
                <Text>{summary}</Text>
              </div>
              <SegmentedControl
                label="Theme mode"
                value={mode}
                options={modeOptions}
                onChange={setMode}
                data-testid="css-example-mode"
              />
            </div>
            <div class="css-example-form">
              <TextInput
                label="Project name"
                value={projectName}
                description="Updates the CSS-only summary."
                hasClear
                onChange={(nextValue) => (projectName = nextValue)}
              />
            </div>
          </Card>

          <Card variant="default" class="css-example-panel" id="data">
            <div class="css-example-section-heading">
              <Heading level={2} type="title">Data Display</Heading>
              <Text>Table styles come from the package; the frame around it is ordinary CSS.</Text>
            </div>
            <div class="css-example-table">
              <Table
                rows={tableRows}
                columns={tableColumns}
                caption="Astryx Svelte plain CSS component readiness"
                pageSize={4}
              />
            </div>
          </Card>
        </div>

        <aside class="css-example-sidebar" aria-label="Plain CSS status">
          <Heading level={2} type="title">Status</Heading>
          <List items={readinessItems} />
          <dl class="css-example-stack">
            <div class="css-example-stat">
              <dt>Tailwind plugin</dt>
              <dd>absent</dd>
            </div>
            <div class="css-example-stat">
              <dt>CSS entry</dt>
              <dd>styles.css</dd>
            </div>
            <div class="css-example-stat">
              <dt>Theme mode</dt>
              <dd>{mode}</dd>
            </div>
          </dl>
        </aside>
      </section>
    </div>
  </AppShell>
</Theme>
