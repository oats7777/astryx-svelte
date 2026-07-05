// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file streaming-text.ts
 * @input Target text, streaming state, and timing options
 * @output Svelte readable store that reveals text progressively
 * @position Todo 15 shared store replacement for React useStreamingText
 */

import {writable, type Readable} from 'svelte/store';

export type StreamingTextSpeed = 'natural' | 'fast' | 'instant';

export type StreamingTextOptions = {
  readonly speed?: StreamingTextSpeed;
  readonly tickMs?: number;
  readonly charsPerTick?: number;
};

export type StreamingTextStore = Readable<string> & {
  readonly setTarget: (text: string, streaming: boolean) => void;
  readonly destroy: () => void;
};

const DEFAULT_CHARS_PER_TICK: Readonly<Record<StreamingTextSpeed, number>> = {
  natural: 10,
  fast: 4,
  instant: Number.POSITIVE_INFINITY,
};

function defaultTickMs(speed: StreamingTextSpeed): number {
  if (speed === 'instant') {
    return 0;
  }
  return speed === 'fast' ? 8 : 50;
}

export function createStreamingTextStore(
  initialText: string,
  initialStreaming: boolean,
  options: StreamingTextOptions = {},
): StreamingTextStore {
  const speed = options.speed ?? 'natural';
  const charsPerTick = options.charsPerTick ?? DEFAULT_CHARS_PER_TICK[speed];
  const tickMs = options.tickMs ?? defaultTickMs(speed);
  const store = writable(initialStreaming && speed !== 'instant' ? '' : initialText);
  let target = initialText;
  let displayedLength = initialStreaming && speed !== 'instant' ? 0 : initialText.length;
  let streaming = initialStreaming;
  let interval: ReturnType<typeof setInterval> | undefined;

  function stop(): void {
    if (interval != null) {
      clearInterval(interval);
      interval = undefined;
    }
  }

  function tick(): void {
    if (!streaming || speed === 'instant') {
      return;
    }
    displayedLength = Math.min(displayedLength + charsPerTick, target.length);
    store.set(target.slice(0, displayedLength));
    if (displayedLength >= target.length) {
      stop();
    }
  }

  function start(): void {
    stop();
    if (!streaming || speed === 'instant') {
      displayedLength = target.length;
      store.set(target);
      return;
    }
    interval = setInterval(tick, Math.max(1, tickMs));
  }

  start();

  return {
    subscribe: store.subscribe,
    setTarget(text, isStreaming) {
      target = text;
      streaming = isStreaming;
      if (!streaming || speed === 'instant') {
        displayedLength = target.length;
        store.set(target);
        stop();
        return;
      }
      displayedLength = Math.min(displayedLength, target.length);
      store.set(target.slice(0, displayedLength));
      start();
    },
    destroy: stop,
  };
}
