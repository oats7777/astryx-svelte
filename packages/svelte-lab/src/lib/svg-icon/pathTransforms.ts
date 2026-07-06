// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file pathTransforms.ts
 * @input SVG path data and personality axes
 * @output Rounded, curved, and tension-adjusted path strings
 * @position Path utility layer for private Svelte lab SVG icons
 */

import type {PathPersonality} from './types.js';

interface Point {
  readonly x: number;
  readonly y: number;
}

type PathCommand =
  | {readonly type: 'M'; readonly x: number; readonly y: number}
  | {readonly type: 'L'; readonly x: number; readonly y: number}
  | {
      readonly type: 'C';
      readonly x1: number;
      readonly y1: number;
      readonly x2: number;
      readonly y2: number;
      readonly x: number;
      readonly y: number;
    }
  | {readonly type: 'Q'; readonly cx: number; readonly cy: number; readonly x: number; readonly y: number}
  | {readonly type: 'Z'};

function numbers(input: string): readonly number[] {
  return Array.from(input.matchAll(/-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/gi), (match) =>
    Number(match[0]),
  ).filter((value) => Number.isFinite(value));
}

function parsePath(d: string): readonly PathCommand[] {
  const commands: PathCommand[] = [];
  const parts = d.matchAll(/([MmLlHhVvCcQqZz])([^MmLlHhVvCcQqZz]*)/g);
  let current: Point = {x: 0, y: 0};
  let start: Point = {x: 0, y: 0};

  for (const part of parts) {
    const command = part[1] ?? '';
    const args = numbers(part[2] ?? '');
    const relative = command === command.toLowerCase();
    if (command === 'Z' || command === 'z') {
      commands.push({type: 'Z'});
      current = start;
      continue;
    }
    for (let index = 0; index < args.length; ) {
      const x = args[index];
      const y = args[index + 1];
      if ((command === 'M' || command === 'm') && x != null && y != null) {
        current = relative ? {x: current.x + x, y: current.y + y} : {x, y};
        start = current;
        commands.push({type: commands.length === 0 ? 'M' : 'L', ...current});
        index += 2;
      } else if ((command === 'L' || command === 'l') && x != null && y != null) {
        current = relative ? {x: current.x + x, y: current.y + y} : {x, y};
        commands.push({type: 'L', ...current});
        index += 2;
      } else if ((command === 'H' || command === 'h') && x != null) {
        current = {x: relative ? current.x + x : x, y: current.y};
        commands.push({type: 'L', ...current});
        index += 1;
      } else if ((command === 'V' || command === 'v') && x != null) {
        current = {x: current.x, y: relative ? current.y + x : x};
        commands.push({type: 'L', ...current});
        index += 1;
      } else if ((command === 'C' || command === 'c') && args[index + 5] != null) {
        const base = current;
        const c = {
          x1: args[index] ?? 0,
          y1: args[index + 1] ?? 0,
          x2: args[index + 2] ?? 0,
          y2: args[index + 3] ?? 0,
          x: args[index + 4] ?? 0,
          y: args[index + 5] ?? 0,
        };
        current = relative ? {x: base.x + c.x, y: base.y + c.y} : {x: c.x, y: c.y};
        commands.push({
          type: 'C',
          x1: relative ? base.x + c.x1 : c.x1,
          y1: relative ? base.y + c.y1 : c.y1,
          x2: relative ? base.x + c.x2 : c.x2,
          y2: relative ? base.y + c.y2 : c.y2,
          ...current,
        });
        index += 6;
      } else if ((command === 'Q' || command === 'q') && args[index + 3] != null) {
        const base = current;
        const cx = args[index] ?? 0;
        const cy = args[index + 1] ?? 0;
        const qx = args[index + 2] ?? 0;
        const qy = args[index + 3] ?? 0;
        current = relative ? {x: base.x + qx, y: base.y + qy} : {x: qx, y: qy};
        commands.push({
          type: 'Q',
          cx: relative ? base.x + cx : cx,
          cy: relative ? base.y + cy : cy,
          ...current,
        });
        index += 4;
      } else {
        index = args.length;
      }
    }
  }
  return commands;
}

function endpoint(command: PathCommand): Point | undefined {
  return command.type === 'Z' ? undefined : {x: command.x, y: command.y};
}

function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function lerp(a: Point, b: Point, t: number): Point {
  return {x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t};
}

function angle(a: Point, b: Point): number {
  const dot = a.x * b.x + a.y * b.y;
  const mag = Math.hypot(a.x, a.y) * Math.hypot(b.x, b.y);
  return mag === 0 ? Math.PI : Math.acos(Math.max(-1, Math.min(1, dot / mag)));
}

export function roundCorners(d: string, cornerRounding: number): string {
  if (cornerRounding <= 0) {
    return d;
  }
  const commands = parsePath(d);
  const rounded: PathCommand[] = [];
  const amount = Math.min(1, cornerRounding);

  for (let index = 0; index < commands.length; index++) {
    const previous = index > 0 ? commands[index - 1] : undefined;
    const current = commands[index];
    const next = index + 1 < commands.length ? commands[index + 1] : undefined;
    if (current?.type !== 'L' || previous == null || next == null) {
      if (current != null) {
        rounded.push(current);
      }
      continue;
    }
    const prevPoint = endpoint(previous);
    const nextPoint = endpoint(next);
    if (prevPoint == null || nextPoint == null) {
      rounded.push(current);
      continue;
    }
    const corner = {x: current.x, y: current.y};
    const prevDistance = distance(prevPoint, corner);
    const nextDistance = distance(corner, nextPoint);
    const radius =
      (Math.min(prevDistance, nextDistance) / 2) *
      amount *
      (1 - angle({x: prevPoint.x - corner.x, y: prevPoint.y - corner.y}, {x: nextPoint.x - corner.x, y: nextPoint.y - corner.y}) / Math.PI) *
      0.85;
    if (radius < 0.1) {
      rounded.push(current);
      continue;
    }
    rounded.push({type: 'L', ...lerp(corner, prevPoint, radius / prevDistance)});
    rounded.push({type: 'Q', cx: corner.x, cy: corner.y, ...lerp(corner, nextPoint, radius / nextDistance)});
  }
  return serializePath(rounded);
}

export function addCurvature(d: string, curvature: number): string {
  if (curvature <= 0) {
    return d;
  }
  const curved: PathCommand[] = [];
  const commands = parsePath(d);
  for (let index = 0; index < commands.length; index++) {
    const current = commands[index];
    const previous = index > 0 ? commands[index - 1] : undefined;
    const start = previous == null ? undefined : endpoint(previous);
    if (current?.type !== 'L' || start == null) {
      if (current != null) {
        curved.push(current);
      }
      continue;
    }
    const end = {x: current.x, y: current.y};
    const length = distance(start, end);
    if (length < 2) {
      curved.push(current);
      continue;
    }
    const mid = lerp(start, end, 0.5);
    const offset = length * Math.min(1, curvature) * 0.25;
    curved.push({
      type: 'Q',
      cx: mid.x + ((start.y - end.y) / length) * offset,
      cy: mid.y + ((end.x - start.x) / length) * offset,
      x: end.x,
      y: end.y,
    });
  }
  return serializePath(curved);
}

export function adjustTension(d: string, tension: number): string {
  if (tension === 0.5) {
    return d;
  }
  const scale = 1.5 - tension;
  return serializePath(
    parsePath(d).map((command, index, commands) => {
      const previous = index > 0 ? endpoint(commands[index - 1]) : undefined;
      if (command.type !== 'Q' || previous == null) {
        return command;
      }
      const mid = lerp(previous, {x: command.x, y: command.y}, 0.5);
      return {
        type: 'Q',
        cx: mid.x + (command.cx - mid.x) * scale,
        cy: mid.y + (command.cy - mid.y) * scale,
        x: command.x,
        y: command.y,
      };
    }),
  );
}

export function applyPersonality(d: string, personality: PathPersonality): string {
  let result = d;
  if (personality.cornerRounding != null) {
    result = roundCorners(result, personality.cornerRounding);
  }
  if (personality.segmentCurvature != null) {
    result = addCurvature(result, personality.segmentCurvature);
  }
  if (personality.tension != null) {
    result = adjustTension(result, personality.tension);
  }
  return result;
}

function numeric(value: number): string {
  return Number(value.toFixed(3)).toString();
}

function serializePath(commands: readonly PathCommand[]): string {
  return commands
    .map((command) => {
      switch (command.type) {
        case 'M':
        case 'L':
          return `${command.type}${numeric(command.x)} ${numeric(command.y)}`;
        case 'C':
          return `C${numeric(command.x1)} ${numeric(command.y1)} ${numeric(command.x2)} ${numeric(command.y2)} ${numeric(command.x)} ${numeric(command.y)}`;
        case 'Q':
          return `Q${numeric(command.cx)} ${numeric(command.cy)} ${numeric(command.x)} ${numeric(command.y)}`;
        case 'Z':
          return 'Z';
      }
    })
    .join(' ');
}
