// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file export-contract.ts
 * @input Implemented Svelte package family source lists and docs groups
 * @output Test-only package export contract fixtures
 * @position Shared fixture data for exports.test.ts, excluded from package files
 */

export const expectedFamilyFiles = {
  actions: [
    'Button.svelte', 'ButtonGroup.svelte', 'Citation.svelte', 'ClickableCard.svelte',
    'IconButton.svelte', 'Item.svelte', 'Link.svelte', 'LinkProvider.svelte', 'NavIcon.svelte',
    'SelectableCard.svelte', 'ToggleButton.svelte', 'Token.svelte', 'action-utils.ts',
    'button-group-context.ts', 'index.ts', 'link-context.ts',
  ],
  foundations: [
    'AspectRatio.svelte', 'Avatar.svelte', 'AvatarGroup.svelte', 'AvatarGroupOverflow.svelte',
    'AvatarStatusDot.svelte', 'Badge.svelte', 'Banner.svelte', 'Blockquote.svelte', 'Card.svelte',
    'Center.svelte', 'Divider.svelte', 'EmptyState.svelte', 'Grid.svelte', 'Heading.svelte',
    'HStack.svelte', 'Icon.svelte', 'Kbd.svelte', 'Section.svelte', 'Skeleton.svelte',
    'Spinner.svelte', 'Stack.svelte', 'StackItem.svelte', 'StatusDot.svelte', 'Text.svelte',
    'Thumbnail.svelte', 'Timestamp.svelte', 'VisuallyHidden.svelte', 'VStack.svelte',
    'avatar-context.ts', 'index.ts', 'types.ts',
  ],
  forms: [
    'CheckboxInput.svelte', 'CheckboxList.svelte', 'Field.svelte', 'FieldStatus.svelte',
    'FileInput.svelte', 'FormLayout.svelte', 'FormLayoutContext.ts', 'InputGroup.svelte',
    'NumberInput.svelte', 'RadioList.svelte', 'Slider.svelte', 'Switch.svelte', 'TextArea.svelte',
    'TextInput.svelte', 'form-utils.ts', 'index.ts', 'types.ts',
  ],
  overlays: [
    'AlertDialog.svelte', 'ContextMenu.svelte', 'Dialog.svelte', 'DropdownMenu.svelte',
    'HoverCard.svelte', 'Layer.svelte', 'MoreMenu.svelte', 'Overlay.svelte', 'Popover.svelte',
    'Toast.svelte', 'ToastViewport.svelte', 'Tooltip.svelte', 'focus-trap.ts', 'index.ts',
    'portal.ts', 'positioning.ts', 'scroll-lock.ts', 'toast-store.ts', 'types.ts',
  ],
  selection: [
    'Calendar.svelte', 'DateInput.svelte', 'DateRangeInput.svelte', 'DateTimeInput.svelte',
    'MultiSelector.svelte', 'PowerSearch.svelte', 'Selector.svelte', 'TimeInput.svelte',
    'Tokenizer.svelte', 'Typeahead.svelte', 'combo-types.ts', 'combo-utils.ts', 'index.ts',
    'power-search-types.ts', 'power-search-utils.ts', 'temporal-types.ts', 'temporal-utils.ts',
  ],
  navigation: [
    'AppShell.svelte', 'Breadcrumbs.svelte', 'Layout.svelte', 'MobileNav.svelte',
    'NavItem.svelte', 'NavMenu.svelte', 'OverflowList.svelte', 'Pagination.svelte',
    'SegmentedControl.svelte', 'SideNav.svelte', 'TabList.svelte', 'Toolbar.svelte',
    'TopNav.svelte', 'index.ts', 'navigation-utils.ts', 'types.ts',
  ],
  'data-display': [
    'List.svelte', 'MetadataList.svelte', 'Outline.svelte', 'Pagination.svelte',
    'ProgressBar.svelte', 'Table.svelte', 'TreeList.svelte', 'index.ts', 'table-utils.ts',
    'types.ts',
  ],
  'rich-surfaces': [
    'Carousel.svelte', 'Chat.svelte', 'Code.svelte', 'CodeBlock.svelte', 'Collapsible.svelte',
    'CommandPalette.svelte', 'Lightbox.svelte', 'Markdown.svelte', 'Resizable.svelte',
    'code-utils.ts', 'command-utils.ts', 'index.ts', 'markdown-utils.ts', 'media-utils.ts',
    'resize-utils.ts', 'types.ts',
  ],
  misc: ['index.ts', 'interactive-role-context.ts', 'size-context.ts'],
  utils: [
    'date-time.ts', 'index.ts', 'media-query.ts', 'parse-style-key.ts',
    'shared-resize-observer.ts', 'streaming-text.ts', 'theme-props.ts',
  ],
} as const satisfies Readonly<Record<string, readonly string[]>>;

export const expectedGroups = [
  {name: 'Theme', canonical: 'Theme', description: 'Theme provider, root sync, runtime CSS, and theme context for Svelte consumers.'},
  {name: 'Tokens', canonical: 'Tokens', description: 'Framework-neutral Astryx token metadata and CSS emitters re-exported for Svelte consumers.'},
  {name: 'Icons', canonical: 'IconRegistry', description: 'Semantic icon registry helpers shared by Svelte themes and components.'},
  {name: 'Foundations', canonical: 'Card', description: 'Layout, typography, media, feedback, and status primitives for Svelte surfaces.'},
  {name: 'Actions', canonical: 'Button', description: 'Buttons, links, interactive cards, tokens, items, citations, nav icons, and action utilities.'},
  {name: 'Forms', canonical: 'Field', description: 'Form fields, statuses, layouts, grouped inputs, and input controls for Svelte consumers.'},
  {name: 'Overlays', canonical: 'Dialog', description: 'Dialogs, layers, popovers, menus, tooltips, toasts, and focus actions for transient UI.'},
  {name: 'Selection', canonical: 'Selector', description: 'Date, time, combobox, tokenizer, typeahead, and PowerSearch composites for Svelte consumers.'},
  {name: 'Navigation', canonical: 'AppShell', description: 'App shell, navigation, tabs, toolbar, pagination, and layout systems for Svelte surfaces.'},
  {name: 'Data Display', canonical: 'Table', description: 'Lists, metadata, outlines, progress, tables, trees, and table helpers for structured content.'},
  {name: 'Rich Surfaces', canonical: 'CommandPalette', description: 'Carousel, chat, code, markdown, command palette, lightbox, and resizing surfaces.'},
  {name: 'Misc', canonical: 'SizeContext', description: 'Svelte replacements for miscellaneous core context helpers.'},
  {name: 'Utilities', canonical: 'createMediaQueryStore', description: 'Shared date/time, media query, resize observer, streaming text, style-key, and theme-prop utilities.'},
] as const;
