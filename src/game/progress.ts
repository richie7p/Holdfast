import { STAGES } from "./stages";

const KEY = "holdfast-progress-v2";
const LEGACY = "holdfast-progress-v1";
const N = STAGES.length;

export interface Progress {
  unlocked: number;
  stars: number[];
}

function padStars(stars: number[] | undefined): number[] {
  return Array.from({ length: N }, (_, i) => Math.max(0, Math.min(3, stars?.[i] ?? 0)));
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY);
    if (!raw) return { unlocked: 0, stars: padStars([]) };
    const parsed = JSON.parse(raw) as Progress;
    return {
      unlocked: Math.max(0, Math.min(N - 1, parsed.unlocked ?? 0)),
      stars: padStars(parsed.stars),
    };
  } catch {
    return { unlocked: 0, stars: padStars([]) };
  }
}

export function saveProgress(next: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
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
  const nextStars = padStars(cur.stars);
  nextStars[stageIndex] = Math.max(nextStars[stageIndex] ?? 0, stars);
  const unlocked = Math.max(cur.unlocked, Math.min(N - 1, stageIndex + 1));
  const next = { unlocked, stars: nextStars };
  saveProgress(next);
  return next;
}
