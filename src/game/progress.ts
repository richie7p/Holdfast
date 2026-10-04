import { readStored, writeStored } from "./storage";
import { STAGES } from "./stages";

export const KEY = "holdfast-progress-v2";
const LEGACY = "holdfast-progress-v1";
const N = STAGES.length;

export interface Progress {
  unlocked: number;
  stars: number[];
}

function bounded(value: unknown, max: number) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(max, Math.floor(value))) : 0;
}
function padStars(stars: unknown): number[] {
  return Array.from({ length: N }, (_, i) => bounded(Array.isArray(stars) ? stars[i] : 0, 3));
}
export function parseProgress(text: string): Progress {
  const parsed: unknown = JSON.parse(text);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || !("stars" in parsed) || !Array.isArray(parsed.stars)) throw new Error("Invalid progress");
  const raw = parsed as Partial<Progress>;
  return { unlocked: bounded(raw.unlocked, N - 1), stars: padStars(raw.stars) };
}
export function loadProgress(): Progress {
  return readStored(KEY, KEY + ".bak", parseProgress)
    ?? readStored(LEGACY, LEGACY + ".bak", parseProgress)
    ?? { unlocked: 0, stars: padStars([]) };
}
export function saveProgress(next: Progress): boolean {
  return writeStored(KEY, KEY + ".bak", next, parseProgress);
}

export function starsFromLives(lives: number, startLives: number): number {
  if (lives <= 0) return 0;
  const r = lives / Math.max(1, startLives);
  if (r >= 0.6) return 3;
  if (r >= 0.3) return 2;
  return 1;
}

export function recordWin(stageIndex: number, stars: number): Progress {
  const cur = loadProgress();
  if (!Number.isInteger(stageIndex) || stageIndex < 0 || stageIndex >= N) return cur;
  stars = bounded(stars, 3);
  const nextStars = padStars(cur.stars);
  nextStars[stageIndex] = Math.max(nextStars[stageIndex] ?? 0, stars);
  const unlocked = Math.max(cur.unlocked, Math.min(N - 1, stageIndex + 1));
  const next = { unlocked, stars: nextStars };
  saveProgress(next);
  return next;
}
