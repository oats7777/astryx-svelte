// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file form-utils.ts
 * @input Form control props, generated IDs, and async callbacks
 * @output Shared IDs, ARIA composition, validation helpers, and pending-state runner
 * @position Runtime utility layer for @astryxdesign/svelte form controls
 */

import type {FieldStatusInput} from './types.js';

let idCounter = 0;

export function nextFormId(prefix: string): string {
  idCounter += 1;
  return `astryx-${prefix}-${idCounter}`;
}

export function statusRole(status: FieldStatusInput | undefined): 'alert' | 'status' | undefined {
  if (status?.message == null) {
    return undefined;
  }
  return status.type === 'error' ? 'alert' : 'status';
}

export function statusLive(status: FieldStatusInput | undefined): 'assertive' | 'polite' | undefined {
  if (status?.message == null) {
    return undefined;
  }
  return status.type === 'error' ? 'assertive' : 'polite';
}

export function describedBy(...ids: readonly (string | undefined | false)[]): string | undefined {
  const value = ids.filter((id): id is string => typeof id === 'string' && id.length > 0).join(' ');
  return value.length > 0 ? value : undefined;
}

export function isPromiseLike(value: unknown): value is PromiseLike<void> {
  return typeof value === 'object' && value !== null && 'then' in value;
}

export function coerceNumber(value: string): number | null {
  if (value.trim() === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function formatFiles(files: readonly File[]): string {
  if (files.length === 0) {
    return '';
  }
  return files.map((file) => file.name).join(', ');
}

export function fileMatchesAccept(file: File, accept: string | undefined): boolean {
  if (accept == null || accept.trim() === '') {
    return true;
  }
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return accept
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .some((pattern) => {
      if (pattern.endsWith('/*')) {
        return type.startsWith(pattern.slice(0, -1));
      }
      return pattern === type || name.endsWith(pattern);
    });
}
