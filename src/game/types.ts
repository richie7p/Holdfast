export type TowerKind = "bolt" | "mortar" | "frost" | "lance";
export type EnemyKind = "grunt" | "runner" | "armored" | "brute" | "swarm";
export type TargetPolicy = "first" | "last" | "strongest" | "closest";
export type Phase = "select" | "playing" | "paused" | "won" | "lost";
export type UpgradeTrack = "damage" | "rate";
export type GroundKind = "moss" | "marsh" | "dusk";

export interface Vec2 {
  x: number;
  y: number;
}

export interface TowerDef {
  kind: TowerKind;
  name: string;
  blurb: string;
  cost: number;
  range: number;
  fireRate: number;
  damage: number;
  splash: number;
  slowFactor: number;
  slowDuration: number;
  projectileSpeed: number;
  pierce: number;
  color: string;
  accent: string;
}

export interface EnemyDef {
  kind: EnemyKind;
  name: string;
  hp: number;
  speed: number;
  gold: number;
  armor: number;
  radius: number;
  lives: number;
}

export interface WaveGroup {
  kind: EnemyKind;
  count: number;
  interval: number;
  start: number;
}

export interface WaveDef {
  groups: WaveGroup[];
}

export interface SpawnJob {
  kind: EnemyKind;
  at: number;
}

export interface Enemy {
  id: number;
  alive: boolean;
  kind: EnemyKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  speed: number;
  gold: number;
  armor: number;
  radius: number;
  lives: number;
  waypoint: number;
  pathT: number;
  slowUntil: number;
  slowFactor: number;
  flash: number;
  bob: number;
}

export interface Tower {
  id: number;
  kind: TowerKind;
  col: number;
  row: number;
  x: number;
  y: number;
  damageRank: number;
  rateRank: number;
  cooldown: number;
  angle: number;
  targetId: number;
}

export interface Projectile {
  id: number;
  alive: boolean;
  kind: TowerKind;
  x: number;
  y: number;
  tx: number;
  ty: number;
  sx: number;
  sy: number;
  speed: number;
  damage: number;
  splash: number;
  slowFactor: number;
  slowDuration: number;
  pierce: number;
  targetId: number;
  ttl: number;
  age: number;
  duration: number;
  arc: boolean;
}

export interface Particle {
  alive: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  gravity: number;
}

export interface Floater {
  alive: boolean;
  x: number;
  y: number;
  vy: number;
  life: number;
  maxLife: number;
  text: string;
  color: string;
  size: number;
}

export interface HoverCell {
  col: number;
  row: number;
}
