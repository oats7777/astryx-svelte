// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file check-svelte-port-parity.ts
 * @input Svelte package surfaces plus the Svelte port parity ledger
 * @output JSON parity report and non-zero exit codes for untracked port obligations
 * @position Release guard for the Svelte + Tailwind package surface
 */

import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

import {buildInitialLedger, readFixture, sourceInventory} from '../internal/svelte-port-parity/inventory';
import {CliError, isScope, type CliOptions, type Scope, uniqueEntries} from '../internal/svelte-port-parity/model';
import {buildReport, readLedger, writeJson} from '../internal/svelte-port-parity/report';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const labExperimentalPattern =
  /^packages\/svelte-lab\/src\/lib\/(?:chat-reasoning|circular-progress|code-editor|schedule|stepper|svg-icon|three-d)\//;

function parseArgs(args: readonly string[]): CliOptions {
  let failOnMissing = false;
  let failOnMvp = false;
  let failOnUnverifiedDeprecations = false;
  let families: readonly string[] | undefined;
  let fixturePath: string | undefined;
  let requiredScopes: readonly Scope[] = [];
  let writePath: string | undefined;
  let writeLedgerPath: string | undefined;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--fail-on-missing') {
      failOnMissing = true;
    } else if (arg === '--fail-on-mvp') {
      failOnMvp = true;
    } else if (arg === '--fail-on-unverified-deprecations') {
      failOnUnverifiedDeprecations = true;
    } else if (
      arg === '--fixture' ||
      arg === '--write' ||
      arg === '--write-ledger' ||
      arg === '--families' ||
      arg === '--require-scope'
    ) {
      const value = args[index + 1];
      if (value == null || value.startsWith('--')) {
        throw new CliError(`${arg} requires a value`);
      }
      index += 1;
      if (arg === '--fixture') {
        fixturePath = value;
      } else if (arg === '--families') {
        families = value
          .split(',')
          .map((family) => family.trim())
          .filter(Boolean);
      } else if (arg === '--require-scope') {
        requiredScopes = parseRequiredScopes(value);
      } else if (arg === '--write') {
        writePath = value;
      } else {
        writeLedgerPath = value;
      }
    } else {
      throw new CliError(`Unknown option: ${arg}`);
    }
  }
  return {failOnMissing, failOnMvp, failOnUnverifiedDeprecations, families, fixturePath, requiredScopes, writePath, writeLedgerPath};
}

function parseRequiredScopes(value: string): readonly Scope[] {
  return uniqueStrings(
    value
      .split(',')
      .map((scope) => scope.trim())
      .filter(Boolean)
      .map((scope) => {
        if (!isScope(scope)) {
          throw new CliError(`Unknown scope: ${scope}`);
        }
        return scope;
      }),
  );
}

function uniqueStrings<T extends string>(values: readonly T[]): readonly T[] {
  return [...new Set(values)];
}

function run(): number {
  const options = parseArgs(process.argv.slice(2));
  const fixture = options.fixturePath == null ? {sourceEntries: [], ledgerEntries: []} : readFixture(ROOT, options.fixturePath);
  const sourceEntries = filterEntriesByFamilies(uniqueEntries([
    ...sourceInventory(ROOT),
    ...fixture.sourceEntries,
  ]), options.families);
  if (options.writeLedgerPath != null) {
    writeJson(ROOT, options.writeLedgerPath, {
      schemaVersion: 1,
      description: 'Full-port parity ledger for the Astryx Svelte + Tailwind rewrite.',
      entries: buildInitialLedger(sourceEntries),
    });
    return 0;
  }
  const ledgerEntries = filterEntriesByFamilies([...readLedger(ROOT), ...fixture.ledgerEntries], options.families);
  const report = buildReport(sourceEntries, ledgerEntries, options.requiredScopes);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (options.writePath != null) {
    writeJson(ROOT, options.writePath, report);
  }
  if (report.scopes.missing.length > 0) {
    process.stderr.write(`Svelte port parity guard failed: missingRequiredScopes=${report.scopes.missing.join(',')}\n`);
    return 1;
  }
  if (options.failOnMissing && !report.ok) {
    process.stderr.write(
      `Svelte port parity guard failed: missing=${report.summary.missing} unclassified=${report.summary.unclassified} mvpOnly=${report.summary.mvpOnly} placeholderEquivalent=${report.summary.placeholderEquivalent} deprecatedWithoutRationale=${report.summary.deprecatedWithoutRationale} stale=${report.summary.stale}\n`,
    );
    return 1;
  }
  if (options.failOnUnverifiedDeprecations && report.summary.deprecatedWithoutRationale > 0) {
    process.stderr.write(
      `Svelte port parity guard failed: deprecatedWithoutRationale=${report.summary.deprecatedWithoutRationale}\n`,
    );
    return 1;
  }
  if (options.failOnMvp && report.summary.mvpOnly > 0) {
    process.stderr.write(`Svelte port parity guard failed: mvpOnly=${report.summary.mvpOnly}\n`);
    return 1;
  }
  return 0;
}

const familyPatterns = {
  actions:
    /(?:Button|ButtonGroup|ButtonGroupContext|IconButton|Link|LinkProvider|ClickableCard|SelectableCard|ToggleButton|ToggleButtonGroup|Token|Item|Citation|NavIcon|useInteractiveRole|useClickableContainer)(?:[/.#]|$)/,
  foundations:
    /(?:AspectRatio|Avatar|AvatarGroup|AvatarGroupOverflow|AvatarStatusDot|Badge|Banner|Blockquote|Card|Center|Divider|EmptyState|Grid|GridSpan|HStack|Heading|Icon|Kbd|Section|Skeleton|Spinner|Stack|StackItem|StatusDot|Text|Thumbnail|Timestamp|VStack)/,
  forms:
    /(?:CheckboxInput|CheckboxList|CheckboxListItem|Field|FieldLabel|FieldStatus|FileInput|FormLayout|InputGroup|InputGroupText|NumberInput|RadioList|RadioListItem|Slider|Switch|TextArea|TextInput|useInputGroup)/,
  overlays:
    /(?:AlertDialog|ContextMenu|Dialog|DropdownMenu|HoverCard|Layer|MoreMenu|Overlay|Popover|Toast|Tooltip|useFocusTrap|useScrollLock|useEntryAnimation|useImperativeAlertDialog|useImperativeDialog)/,
  selection:
    /^(?!packages\/svelte-lab\/).*(?:MultiSelector|PowerSearch|Selector|Tokenizer|Typeahead|BaseTypeahead|createPowerSearchConfig|usePowerSearchConfig)(?:[/.#]|$)/,
  temporal:
    /^(?!packages\/svelte-lab\/).*(?:Calendar|DateInput|DateRangeInput|DateTimeInput|TimeInput|parseDateInput|parseTimeInput|useCalendar)(?:[/.#]|$)/,
  navigation:
    /^(?!packages\/svelte-lab\/).*(?:AppShell|Breadcrumbs|BreadcrumbItem|Layout|MobileNav|NavItem|NavMenu|OverflowList|Pagination|SegmentedControl|SideNav|TabList|Toolbar|TopNav|useAppShellMobile)(?:[/.#]|$)/,
  'data-display':
    /^(?!packages\/svelte-lab\/).*(?:List|MetadataList|Outline|ProgressBar|Table|TableCell|TableHeaderCell|TableRow|TreeList|useTableColumnResize|useTableColumnSettings|useTableFiltering|useTableFilterState|useTablePagination|useTableSelection|useTableSelectionState|useTableSortable|useTableStickyColumns)(?:[/.#]|$)/,
  'rich-surfaces':
    /^(?!packages\/svelte-lab\/).*(?:Carousel|Chat|Code|CodeBlock|Collapsible|CommandPalette|Lightbox|Markdown|Resizable|useCommandPaletteContext)(?:[/.#]|$)/,
  hooks:
    /^(?!packages\/svelte-lab\/).*(?:hooks\/|useClickableContainer|useEntryAnimation|useFocusTrap|useGridFocus|useImageMode|useInputContainer|useListFocus|useMediaQuery|useOverflow|useScrollLock|useScrollOverflow|useStreamingText|useInteractiveRole)(?:[/.#]|$)/,
  utils:
    /^(?!packages\/svelte-lab\/).*(?:utils\/|InteractiveRole|InteractiveRoleContext|SizeContext|dateParser|dateTypes|getKey|parseStyleKey|plainDate|sharedResizeObserver|themeProps|timeParser)(?:[/.#]|$)/,
  'lab-charts':
    /^packages\/svelte-lab\/src\/lib\/charts\//,
  'lab-experimental': labExperimentalPattern,
  tokens: /^packages\/tokens\//,
  vega: /^packages\/svelte-vega\//,
} as const;

function filterEntriesByFamilies<T extends {readonly source: string}>(
  entries: readonly T[],
  families: readonly string[] | undefined,
): readonly T[] {
  if (families == null || families.length === 0) {
    return entries;
  }
  const patterns = families.map((family) => {
    const pattern = familyPatterns[family as keyof typeof familyPatterns];
    if (pattern == null) {
      throw new CliError(`Unknown family: ${family}`);
    }
    return pattern;
  });
  return entries.filter((entry) => patterns.some((pattern) => pattern.test(entry.source)));
}

try {
  process.exitCode = run();
} catch (error) {
  if (error instanceof CliError) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = error.exitCode;
  } else {
    throw error;
  }
}
