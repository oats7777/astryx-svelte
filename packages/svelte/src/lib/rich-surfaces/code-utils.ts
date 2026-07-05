// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file code-utils.ts
 * @input Source code, language id, and highlighted line selections
 * @output Line-relative syntax token segments and highlight predicates
 * @position Pure helpers for CodeBlock.svelte and Markdown.svelte
 */

import type {TokenLine, TokenSegment} from './types.js';

const JS_KEYWORDS = new Set([
  'async',
  'await',
  'class',
  'const',
  'export',
  'false',
  'function',
  'if',
  'import',
  'let',
  'new',
  'null',
  'return',
  'true',
  'type',
  'undefined',
  'var',
]);

const WORD_OR_SPACE = /([A-Za-z_$][\w$]*|\d+(?:\.\d+)?|\/\/.*|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\s+|.)/g;

function classify(part: string, previous: string | undefined): string | undefined {
  if (/^\s+$/.test(part)) {
    return undefined;
  }
  if (/^\/\//.test(part)) {
    return 'comment';
  }
  if (/^["'`]/.test(part)) {
    return 'string';
  }
  if (/^\d/.test(part)) {
    return 'number';
  }
  if (JS_KEYWORDS.has(part)) {
    return 'keyword';
  }
  if (previous === '.') {
    return 'function';
  }
  if (/^[A-Z]/.test(part)) {
    return 'type';
  }
  if (/^[{}()[\];,.]$/.test(part)) {
    return 'punctuation';
  }
  if (/^[+\-*/%=!<>&|^~?:]+$/.test(part)) {
    return 'operator';
  }
  return undefined;
}

export function tokenizeCode(code: string, language: string): readonly TokenLine[] {
  const supported = ['js', 'jsx', 'ts', 'tsx', 'javascript', 'typescript'].includes(language);
  return code.split('\n').map((line, index) => ({
    number: index + 1,
    segments: supported ? tokenizeLine(line) : [{kind: 'text', text: line}],
  }));
}

function tokenizeLine(line: string): readonly TokenSegment[] {
  const segments: TokenSegment[] = [];
  let previous: string | undefined;
  for (const match of line.matchAll(WORD_OR_SPACE)) {
    const text = match[0];
    const tokenType = classify(text, previous);
    segments.push(tokenType == null ? {kind: 'text', text} : {kind: 'token', text, tokenType});
    previous = text.trim().length > 0 ? text : previous;
  }
  return segments.length > 0 ? segments : [{kind: 'text', text: ''}];
}

export function isHighlightedLine(line: number, highlightedLines: readonly number[]): boolean {
  return highlightedLines.includes(line);
}
