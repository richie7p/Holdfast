import { CELL, COLS, ROWS } from "./config";
import { STAGES } from "./stages";
import type { StageDef } from "./stages";
import type { Vec2 } from "./types";

export let PATH_SET = new Set<string>();
export let BLOCKED_SET = new Set<string>();
export let WAYPOINTS: Vec2[] = [];
export let PATH_LENGTH = 1;
let SEGMENT_LEN: number[] = [];

export function applyStage(stage: StageDef): void {
  PATH_SET = new Set(stage.path.map(([c, r]) => `${c},${r}`));
  BLOCKED_SET = new Set(stage.blocked.map(([c, r]) => `${c},${r}`));
  WAYPOINTS = stage.path.map(([c, r]) => ({
    x: c * CELL + CELL / 2,
    y: r * CELL + CELL / 2,
  }));
  SEGMENT_LEN = [];
  let len = 0;
  for (let i = 1; i < WAYPOINTS.length; i++) {
    const a = WAYPOINTS[i - 1]!;
    const b = WAYPOINTS[i]!;
    const d = Math.hypot(b.x - a.x, b.y - a.y);
    SEGMENT_LEN.push(d);
    len += d;
  }
  PATH_LENGTH = Math.max(1, len);
}

export function inBounds(col: number, row: number): boolean {
  return col >= 0 && row >= 0 && col < COLS && row < ROWS;
}

export function isPath(col: number, row: number): boolean {
  return PATH_SET.has(`${col},${row}`);
}

export function isBlocked(col: number, row: number): boolean {
  return BLOCKED_SET.has(`${col},${row}`);
}

export function isBuildable(col: number, row: number): boolean {
  return inBounds(col, row) && !isPath(col, row) && !isBlocked(col, row);
}

export function cellCenter(col: number, row: number): Vec2 {
  return { x: col * CELL + CELL / 2, y: row * CELL + CELL / 2 };
}

export function worldToCell(x: number, y: number): { col: number; row: number } {
  return { col: Math.floor(x / CELL), row: Math.floor(y / CELL) };
}

export function pathProgress(waypoint: number, x: number, y: number): number {
  if (waypoint >= WAYPOINTS.length - 1) return 1;
  let traveled = 0;
  for (let i = 0; i < waypoint; i++) traveled += SEGMENT_LEN[i] ?? 0;
  const from = WAYPOINTS[waypoint]!;
  const to = WAYPOINTS[waypoint + 1]!;
  const seg = SEGMENT_LEN[waypoint] ?? 1;
  const distToNext = Math.hypot(to.x - x, to.y - y);
  const along = Math.max(0, seg - distToNext);
  traveled += along;
  return traveled / PATH_LENGTH;
}

export function hash2(x: number, y: number): number {
  let n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n >>> 0) % 10000) / 10000;
}

applyStage(STAGES[0]!);
