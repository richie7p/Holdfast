import { create } from "zustand";
import type { Phase, TargetPolicy, Tower, TowerKind } from "./types";
import { MAX_UPGRADE, TOWERS, UPGRADE_COST, sellValue, towerStats, waveHint } from "./config";
import { STAGES } from "./stages";

export interface SelectedInfo {
  id: number;
  kind: TowerKind;
  name: string;
  damageRank: number;
  rateRank: number;
  damage: number;
  fireRate: number;
  range: number;
  sell: number;
  nextDamageCost: number | null;
  nextRateCost: number | null;
}

export interface GameHud {
  phase: Phase;
  gold: number;
  lives: number;
  wave: number;
  totalWaves: number;
  enemiesAlive: number;
  spawning: boolean;
  canCallWave: boolean;
  prepLeft: number;
  nextHint: string;
  selectedShop: TowerKind | null;
  selectedTower: SelectedInfo | null;
  policy: TargetPolicy;
  speed: 1 | 2;
  muted: boolean;
  waveKills: number;
  leakFlash: number;
  stageIndex: number;
  stageName: string;
  stageCount: number;
  startLives: number;
  lastStars: number;
  unlocked: number;
  stars: number[];
}

const first = STAGES[0]!;

const emptyHud: GameHud = {
  phase: "select",
  gold: first.startGold,
  lives: first.startLives,
  wave: 0,
  totalWaves: first.waves.length,
  enemiesAlive: 0,
  spawning: false,
  canCallWave: false,
  prepLeft: 0,
  nextHint: waveHint(first.waves[0]),
  selectedShop: null,
  selectedTower: null,
  policy: "first",
  speed: 1,
  muted: false,
  waveKills: 0,
  leakFlash: 0,
  stageIndex: 0,
  stageName: first.name,
  stageCount: STAGES.length,
  startLives: first.startLives,
  lastStars: 0,
  unlocked: 0,
  stars: STAGES.map(() => 0),
};

export const useGameStore = create<GameHud>(() => ({ ...emptyHud }));

export function resetHud(): void {
  useGameStore.setState({ ...emptyHud, muted: useGameStore.getState().muted });
}

export function selectedFromTower(t: Tower): SelectedInfo {
  const def = TOWERS[t.kind];
  const stats = towerStats(t.kind, t.damageRank, t.rateRank);
  return {
    id: t.id,
    kind: t.kind,
    name: def.name,
    damageRank: t.damageRank,
    rateRank: t.rateRank,
    damage: stats.damage,
    fireRate: stats.fireRate,
    range: stats.range,
    sell: sellValue(t.kind, t.damageRank, t.rateRank),
    nextDamageCost: t.damageRank < MAX_UPGRADE ? (UPGRADE_COST[t.damageRank] ?? null) : null,
    nextRateCost: t.rateRank < MAX_UPGRADE ? (UPGRADE_COST[t.rateRank] ?? null) : null,
  };
}
