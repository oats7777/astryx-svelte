// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file markdown-utils.ts
 * @input Markdown source text
 * @output Small AST for semantic Svelte rendering
 * @position Parser helpers for Markdown.svelte
 */

export type InlineNode =
  | {readonly type: 'text'; readonly text: string}
  | {readonly type: 'code'; readonly text: string}
  | {readonly type: 'bold'; readonly children: readonly InlineNode[]}
  | {readonly type: 'italic'; readonly children: readonly InlineNode[]}
  | {readonly type: 'span'; readonly children: readonly InlineNode[]}
  | {readonly type: 'link'; readonly href: string; readonly children: readonly InlineNode[]};

export type MarkdownBlock =
  | {readonly type: 'heading'; readonly level: 1 | 2 | 3 | 4 | 5 | 6; readonly children: readonly InlineNode[]}
  | {readonly type: 'paragraph'; readonly children: readonly InlineNode[]}
  | {readonly type: 'codeblock'; readonly language: string; readonly code: string}
  | {readonly type: 'blockquote'; readonly children: readonly InlineNode[]}
  | {readonly type: 'list'; readonly ordered: boolean; readonly items: readonly (readonly InlineNode[])[]}
  | {
      readonly type: 'table';
      readonly headers: readonly (readonly InlineNode[])[];
      readonly rows: readonly (readonly (readonly InlineNode[])[])[];
    }
  | {readonly type: 'hr'};

function headingLevel(markers: string): 1 | 2 | 3 | 4 | 5 | 6 {
  const level = Math.min(6, Math.max(1, markers.length));
  if (level === 1 || level === 2 || level === 3 || level === 4 || level === 5 || level === 6) {
    return level;
  }
  return 1;
}

export function parseMarkdown(content: string): readonly MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const lines = content.replace(/\r\n?/g, '\n').split('\n');
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? '';
    if (line.trim().length === 0) {
      index += 1;
      continue;
    }
    if (line.trim() === '---') {
      blocks.push({type: 'hr'});
      index += 1;
      continue;
    }
    if (line.startsWith('```')) {
      const language = line.slice(3).trim();
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index]?.startsWith('```')) {
        code.push(lines[index] ?? '');
        index += 1;
      }
      blocks.push({type: 'codeblock', language, code: code.join('\n')});
      index += 1;
      continue;
    }
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading != null) {
      blocks.push({type: 'heading', level: headingLevel(heading[1] ?? '#'), children: parseInline(heading[2] ?? '')});
      index += 1;
      continue;
    }
    if (line.startsWith('> ')) {
      blocks.push({type: 'blockquote', children: parseInline(line.slice(2))});
      index += 1;
      continue;
    }
    const table = collectTable(lines, index);
    if (table != null) {
      blocks.push(table.block);
      index = table.nextIndex;
      continue;
    }
    const list = collectList(lines, index);
    if (list != null) {
      blocks.push(list.block);
      index = list.nextIndex;
      continue;
    }
    const paragraph: string[] = [];
    while (index < lines.length && lines[index]?.trim() !== '') {
      const next = lines[index] ?? '';
      if (
        next.startsWith('```') ||
        /^(#{1,6})\s+/.test(next) ||
        /^[-*]\s+/.test(next) ||
        collectTable(lines, index) != null
      ) {
        break;
      }
      paragraph.push(next);
      index += 1;
    }
    blocks.push({type: 'paragraph', children: parseInline(paragraph.join('\n'))});
  }

  return blocks;
}

function collectTable(
  lines: readonly string[],
  startIndex: number,
): {readonly block: MarkdownBlock; readonly nextIndex: number} | null {
  const headerLine = lines[startIndex] ?? '';
  const separatorLine = lines[startIndex + 1] ?? '';
  if (!isTableRow(headerLine) || !isTableSeparator(separatorLine)) {
    return null;
  }

  const headers = splitTableCells(headerLine).map(parseInline);
  const separatorCells = splitTableCells(separatorLine);
  if (headers.length === 0 || separatorCells.length !== headers.length) {
    return null;
  }

  const rows: (readonly InlineNode[])[][] = [];
  let index = startIndex + 2;
  while (index < lines.length && isTableRow(lines[index] ?? '')) {
    const cells = splitTableCells(lines[index] ?? '');
    if (cells.length !== headers.length) {
      break;
    }
    rows.push(cells.map(parseInline));
    index += 1;
  }

  if (rows.length === 0) {
    return null;
  }

  return {block: {type: 'table', headers, rows}, nextIndex: index};
}

function isTableRow(line: string): boolean {
  return line.includes('|') && splitTableCells(line).length > 1;
}

function isTableSeparator(line: string): boolean {
  const cells = splitTableCells(line);
  return cells.length > 1 && cells.every((cell) => /^:?-{3,}:?$/.test(cell.trim()));
}

function splitTableCells(line: string): readonly string[] {
  const trimmed = line.trim();
  const withoutLeading = trimmed.startsWith('|') ? trimmed.slice(1) : trimmed;
  const withoutEdges = withoutLeading.endsWith('|') ? withoutLeading.slice(0, -1) : withoutLeading;
  return withoutEdges.split('|').map((cell) => cell.trim());
}

function collectList(
  lines: readonly string[],
  startIndex: number,
): {readonly block: MarkdownBlock; readonly nextIndex: number} | null {
  const first = /^(\d+\.|[-*])\s+(.+)$/.exec(lines[startIndex] ?? '');
  if (first == null) {
    return null;
  }
  const ordered = /^\d+\./.test(first[1] ?? '');
  const items: (readonly InlineNode[])[] = [];
  let index = startIndex;
  while (index < lines.length) {
    const match = /^(\d+\.|[-*])\s+(.+)$/.exec(lines[index] ?? '');
    if (match == null || /^\d+\./.test(match[1] ?? '') !== ordered) {
      break;
    }
    items.push(parseInline(match[2] ?? ''));
    index += 1;
  }
  return {block: {type: 'list', ordered, items}, nextIndex: index};
}

export function parseInline(text: string): readonly InlineNode[] {
  const nodes: InlineNode[] = [];
  let cursor = 0;
  while (cursor < text.length) {
    const next = findNextInline(text, cursor);
    if (next == null) {
      nodes.push({type: 'text', text: text.slice(cursor)});
      break;
    }
    if (next.start > cursor) {
      nodes.push({type: 'text', text: text.slice(cursor, next.start)});
    }
    nodes.push(next.node);
    cursor = next.end;
  }
  return mergeTextNodes(nodes);
}

function findNextInline(
  text: string,
  start: number,
): {readonly start: number; readonly end: number; readonly node: InlineNode} | null {
  const candidates = [inlineCode(text, start), inlineBold(text, start), inlineItalic(text, start), inlineLink(text, start)]
    .filter((candidate) => candidate != null)
    .sort((a, b) => a.start - b.start);
  return candidates[0] ?? null;
}

function inlineCode(text: string, start: number): ReturnType<typeof findNextInline> {
  const open = text.indexOf('`', start);
  const close = open < 0 ? -1 : text.indexOf('`', open + 1);
  return open >= 0 && close > open ? {start: open, end: close + 1, node: {type: 'code', text: text.slice(open + 1, close)}} : null;
}

function inlineBold(text: string, start: number): ReturnType<typeof findNextInline> {
  const open = text.indexOf('**', start);
  const close = open < 0 ? -1 : text.indexOf('**', open + 2);
  return open >= 0 && close > open
    ? {start: open, end: close + 2, node: {type: 'bold', children: parseInline(text.slice(open + 2, close))}}
    : null;
}

function inlineItalic(text: string, start: number): ReturnType<typeof findNextInline> {
  const open = text.indexOf('*', start);
  if (open < 0 || text[open + 1] === '*') {
    return null;
  }
  const close = text.indexOf('*', open + 1);
  return close > open ? {start: open, end: close + 1, node: {type: 'italic', children: parseInline(text.slice(open + 1, close))}} : null;
}

function inlineLink(text: string, start: number): ReturnType<typeof findNextInline> {
  const match = /\[([^\]]+)\]\(([^)]+)\)/g;
  match.lastIndex = start;
  const found = match.exec(text);
  if (found == null) {
    return null;
  }
  const children = parseInline(found[1] ?? '');
  const safeHref = sanitizeUrl(found[2] ?? '');
  return {
    start: found.index,
    end: found.index + found[0].length,
    node: safeHref == null ? {type: 'span', children} : {type: 'link', href: safeHref, children},
  };
}

const DANGEROUS_URL_PATTERN = /^(javascript|data|vbscript):/i;
const ASCII_CONTROL_PATTERN = /[\u0000-\u001F\u007F]/g;

function sanitizeUrl(url: string): string | null {
  const normalized = url.trim().replace(ASCII_CONTROL_PATTERN, '');
  if (normalized.length === 0) {
    return null;
  }
  return DANGEROUS_URL_PATTERN.test(normalized) ? null : normalized;
}

function mergeTextNodes(nodes: readonly InlineNode[]): readonly InlineNode[] {
  const merged: InlineNode[] = [];
  for (const node of nodes) {
    const previous = merged.at(-1);
    if (node.type === 'text' && previous?.type === 'text') {
      merged.splice(merged.length - 1, 1, {type: 'text', text: previous.text + node.text});
    } else if (node.type !== 'text' || node.text.length > 0) {
      merged.push(node);
    }
  }
  return merged;
}
