// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file types.ts
 * @input Overlay family public option shapes
 * @output Shared Svelte overlay TypeScript contracts
 * @position Type layer for Todo 11 overlay components and stores
 */

export type DialogPurpose = 'info' | 'form' | 'required';
export type LayerPlacement = 'above' | 'below' | 'start' | 'end';
export type LayerAlignment = 'start' | 'center' | 'end';
export type ToastType = 'info' | 'error';
export type ToastDismissReason = 'auto' | 'manual';

export type MenuItem =
  | {
      readonly type?: undefined;
      readonly label: string;
      readonly value: string;
      readonly disabled?: boolean;
      readonly onSelect?: (value: string) => void;
    }
  | {
      readonly type: 'divider';
    };

export type ToastOptions = {
  readonly body: string;
  readonly type?: ToastType;
  readonly autoHide?: boolean;
  readonly autoHideDuration?: number;
  readonly uniqueID?: string;
  readonly collisionBehavior?: 'overwrite' | 'ignore';
  readonly onHide?: (reason: ToastDismissReason) => void;
};

export type ToastEntry = {
  readonly id: string;
  readonly options: ToastOptions;
};
