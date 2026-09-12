import type { EnemyDef, TargetPolicy, TowerDef, WaveDef } from "./types";

export const COLS = 14;
export const ROWS = 10;
export const CELL = 48;
export const WORLD_W = COLS * CELL;
export const WORLD_H = ROWS * CELL;

export const START_GOLD = 180;
export const START_LIVES = 20;
export const MAX_UPGRADE = 3;
export const SELL_RATIO = 0.6;
export const STEP = 1 / 60;

export const UPGRADE_COST = [55, 85, 130];
export const DAMAGE_PER_RANK = 0.4;
export const RATE_PER_RANK = 0.28;

export const TOWERS: Record<TowerDef["kind"], TowerDef> = {
  bolt: {
    kind: "bolt",
    name: "迅矢",
    blurb: "廉價連射，單點優先清線。",
    cost: 80,
    range: 2.55,
    fireRate: 1.75,
    damage: 13,
    splash: 0,
    slowFactor: 0,
    slowDuration: 0,
    projectileSpeed: 430,
    pierce: 0,
    color: "#8ea089",
    accent: "#d5ddd0",
  },
  frost: {
    kind: "frost",
    name: "霜縛",
    blurb: "降速控場，拖住突襲。",
    cost: 115,
    range: 2.25,
    fireRate: 1.1,
    damage: 8,
    splash: 0,
    slowFactor: 0.45,
    slowDuration: 1.8,
    projectileSpeed: 340,
    pierce: 0,
    color: "#6e8b96",
    accent: "#c5e0e8",
  },
  mortar: {
    kind: "mortar",
    name: "崩砲",
    blurb: "慢速濺射，專門打堆。",
    cost: 165,
    range: 3.35,
    fireRate: 0.5,
    damage: 38,
    splash: 1.2,
    slowFactor: 0,
    slowDuration: 0,
    projectileSpeed: 210,
    pierce: 0,
    color: "#7a6a58",
    accent: "#c4b49a",
  },
  lance: {
    kind: "lance",
    name: "裂光",
    blurb: "遠距穿刺，專剋重甲。",
    cost: 190,
    range: 4.2,
    fireRate: 0.62,
    damage: 52,
    splash: 0,
    slowFactor: 0,
    slowDuration: 0,
    projectileSpeed: 560,
    pierce: 0.85,
    color: "#b8b4a4",
    accent: "#ece8d8",
  },
};

export const ENEMIES: Record<EnemyDef["kind"], EnemyDef> = {
  grunt: {
    kind: "grunt",
    name: "甲蟲",
    hp: 34,
    speed: 54,
    gold: 9,
    armor: 0,
    radius: 11,
    lives: 1,
  },
  runner: {
    kind: "runner",
    name: "疾足",
    hp: 20,
    speed: 98,
    gold: 11,
    armor: 0,
    radius: 9,
    lives: 1,
  },
  armored: {
    kind: "armored",
    name: "重甲",
    hp: 110,
    speed: 40,
    gold: 18,
    armor: 0.38,
    radius: 13,
    lives: 1,
  },
  swarm: {
    kind: "swarm",
    name: "群蟲",
    hp: 11,
    speed: 124,
    gold: 6,
    armor: 0,
    radius: 7,
    lives: 1,
  },
  brute: {
    kind: "brute",
    name: "巨獸",
    hp: 780,
    speed: 30,
    gold: 90,
    armor: 0.18,
    radius: 20,
    lives: 3,
  },
};

export const POLICY_LABEL: Record<TargetPolicy, string> = {
  first: "最先",
  last: "最後",
  strongest: "最強",
  closest: "最近",
};

export const ENEMY_LABEL: Record<EnemyDef["kind"], string> = {
  grunt: "甲蟲",
  runner: "疾足",
  armored: "重甲",
  swarm: "群蟲",
  brute: "巨獸",
};

export function hpScale(waveIndex: number, mul = 1): number {
  return (1 + waveIndex * 0.14) * mul;
}

export function goldScale(waveIndex: number): number {
  return 1 + waveIndex * 0.04;
}

export function earlyCallBonus(waveIndex: number): number {
  return 10 + waveIndex * 2;
}

export function towerStats(kind: TowerDef["kind"], damageRank: number, rateRank: number) {
  const def = TOWERS[kind];
  return {
    damage: def.damage * (1 + damageRank * DAMAGE_PER_RANK),
    fireRate: def.fireRate * (1 + rateRank * RATE_PER_RANK),
    range: def.range,
    splash: def.splash,
    slowFactor: def.slowFactor,
    slowDuration: def.slowDuration,
    pierce: def.pierce,
  };
}

export function investedCost(kind: TowerDef["kind"], damageRank: number, rateRank: number): number {
  let total = TOWERS[kind].cost;
  for (let i = 0; i < damageRank; i++) total += UPGRADE_COST[i] ?? 0;
  for (let i = 0; i < rateRank; i++) total += UPGRADE_COST[i] ?? 0;
  return total;
}

export function sellValue(kind: TowerDef["kind"], damageRank: number, rateRank: number): number {
  return Math.floor(investedCost(kind, damageRank, rateRank) * SELL_RATIO);
}

export function waveHint(wave: WaveDef | undefined): string {
  if (!wave) return "";
  const counts: Partial<Record<EnemyDef["kind"], number>> = {};
  for (const g of wave.groups) counts[g.kind] = (counts[g.kind] ?? 0) + g.count;
  const order: EnemyDef["kind"][] = ["grunt", "runner", "swarm", "armored", "brute"];
  return order
    .filter((k) => counts[k])
    .map((k) => `${ENEMY_LABEL[k]} ${counts[k]}`)
    .join(" · ");
}
