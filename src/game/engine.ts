import {
  CELL,
  ENEMIES,
  MAX_UPGRADE,
  TOWERS,
  UPGRADE_COST,
  WORLD_H,
  WORLD_W,
  earlyCallBonus,
  goldScale,
  hpScale,
  sellValue,
  towerStats,
  waveHint,
} from "./config";
import { WAYPOINTS, applyStage, cellCenter, isBuildable, pathProgress, worldToCell } from "./map";
import { sfxPlay } from "./audio";
import { loadProgress, recordWin, starsFromLives } from "./progress";
import { STAGES, type StageDef } from "./stages";
import { selectedFromTower, useGameStore } from "./store";
import type {
  Enemy,
  EnemyKind,
  Floater,
  HoverCell,
  Particle,
  Phase,
  Projectile,
  SpawnJob,
  TargetPolicy,
  Tower,
  TowerKind,
  UpgradeTrack,
} from "./types";

const ENEMY_CAP = 160;
const PROJ_CAP = 220;
const PART_CAP = 420;
const FLOAT_CAP = 80;

export class GameEngine {
  phase: Phase = "select";
  gold = STAGES[0]!.startGold;
  lives = STAGES[0]!.startLives;
  wave = 0;
  time = 0;
  speed: 1 | 2 = 1;
  policy: TargetPolicy = "first";
  selectedShop: TowerKind | null = null;
  selectedTowerId = 0;
  hover: HoverCell | null = null;
  prepLeft = STAGES[0]!.prep;
  spawnQueue: SpawnJob[] = [];
  spawnClock = 0;
  reducedMotion = false;
  waveActive = false;
  stageIndex = 0;
  lastStars = 0;
  unlocked = 0;
  stars = STAGES.map(() => 0);

  towers: Tower[] = [];
  enemies: Enemy[] = [];
  projectiles: Projectile[] = [];
  particles: Particle[] = [];
  floaters: Floater[] = [];

  nextEnemyId = 1;
  nextTowerId = 1;
  nextProjId = 1;
  occupied = new Set<string>();

  trauma = 0;
  hitstop = 0;
  shakeX = 0;
  shakeY = 0;
  leakFlash = 0;
  waveKills = 0;

  constructor() {
    this.enemies = Array.from({ length: ENEMY_CAP }, () => emptyEnemy());
    this.projectiles = Array.from({ length: PROJ_CAP }, () => emptyProj());
    this.particles = Array.from({ length: PART_CAP }, () => emptyPart());
    this.floaters = Array.from({ length: FLOAT_CAP }, () => emptyFloat());
    if (typeof window !== "undefined") {
      this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const p = loadProgress();
      this.unlocked = p.unlocked;
      this.stars = p.stars;
    }
    applyStage(this.stage);
  }

  get stage(): StageDef {
    return STAGES[this.stageIndex] ?? STAGES[0]!;
  }

  get totalWaves(): number {
    return this.stage.waves.length;
  }

  previewStage(index: number): void {
    if (this.phase !== "select") return;
    if (index < 0 || index >= STAGES.length) return;
    this.stageIndex = index;
    applyStage(this.stage);
    this.pushHud();
  }

  startStage(index: number): void {
    if (index > this.unlocked) return;
    this.stageIndex = index;
    applyStage(this.stage);
    this.resetSim();
    this.phase = "playing";
    this.prepLeft = this.stage.prep;
    this.pushHud();
    sfxPlay.click();
  }

  startGame(): void {
    this.startStage(this.stageIndex);
  }

  gotoSelect(): void {
    this.resetSim();
    this.phase = "select";
    applyStage(this.stage);
    this.pushHud();
    sfxPlay.click();
  }

  nextStage(): void {
    const next = this.stageIndex + 1;
    if (next >= STAGES.length || next > this.unlocked) {
      this.gotoSelect();
      return;
    }
    this.startStage(next);
  }

  restart(): void {
    this.startGame();
  }

  togglePause(): void {
    if (this.phase === "playing") {
      this.phase = "paused";
      this.pushHud();
    } else if (this.phase === "paused") {
      this.phase = "playing";
      this.pushHud();
    }
  }

  setSpeed(speed: 1 | 2): void {
    this.speed = speed;
    this.pushHud();
  }

  setPolicy(policy: TargetPolicy): void {
    this.policy = policy;
    this.pushHud();
  }

  selectShop(kind: TowerKind | null): void {
    this.selectedShop = kind;
    this.selectedTowerId = 0;
    this.pushHud();
    if (kind) sfxPlay.click();
  }

  canCallWave(): boolean {
    return this.phase === "playing" && this.spawnQueue.length === 0 && this.wave < this.totalWaves;
  }

  callWave(): void {
    if (!this.canCallWave()) return;
    if (this.prepLeft > 0.2) {
      this.gold += earlyCallBonus(this.wave);
    }
    this.beginWave();
  }

  beginWave(): void {
    const index = this.wave;
    const def = this.stage.waves[index];
    if (!def) return;
    this.wave += 1;
    this.spawnClock = 0;
    this.spawnQueue = [];
    this.waveKills = 0;
    this.prepLeft = 0;
    this.waveActive = true;
    for (const g of def.groups) {
      for (let i = 0; i < g.count; i++) {
        this.spawnQueue.push({ kind: g.kind, at: g.start + i * g.interval });
      }
    }
    this.spawnQueue.sort((a, b) => a.at - b.at);
    sfxPlay.wave();
    this.pushHud();
  }

  pointerMove(x: number, y: number): void {
    if (x < 0 || y < 0 || x >= WORLD_W || y >= WORLD_H) {
      this.hover = null;
      return;
    }
    const cell = worldToCell(x, y);
    this.hover = cell;
  }

  pointerLeave(): void {
    this.hover = null;
  }

  pointerDown(x: number, y: number): void {
    if (this.phase !== "playing" && this.phase !== "paused") return;
    const { col, row } = worldToCell(x, y);
    const key = `${col},${row}`;
    const existing = this.towers.find((t) => t.col === col && t.row === row);
    if (existing) {
      this.selectedTowerId = existing.id;
      this.selectedShop = null;
      sfxPlay.click();
      this.pushHud();
      return;
    }
    if (this.selectedShop && isBuildable(col, row) && !this.occupied.has(key)) {
      this.place(this.selectedShop, col, row);
      return;
    }
    this.selectedTowerId = 0;
    this.pushHud();
  }

  place(kind: TowerKind, col: number, row: number): boolean {
    const def = TOWERS[kind];
    if (this.gold < def.cost) return false;
    if (!isBuildable(col, row)) return false;
    const key = `${col},${row}`;
    if (this.occupied.has(key)) return false;
    const c = cellCenter(col, row);
    const tower: Tower = {
      id: this.nextTowerId++,
      kind,
      col,
      row,
      x: c.x,
      y: c.y,
      damageRank: 0,
      rateRank: 0,
      cooldown: 0.15,
      angle: -Math.PI / 2,
      targetId: 0,
    };
    this.towers.push(tower);
    this.occupied.add(key);
    this.gold -= def.cost;
    this.selectedTowerId = tower.id;
    this.burst(c.x, c.y, def.accent, 10, 40);
    sfxPlay.place();
    this.pushHud();
    return true;
  }

  upgrade(track: UpgradeTrack): void {
    const t = this.towers.find((x) => x.id === this.selectedTowerId);
    if (!t) return;
    const rank = track === "damage" ? t.damageRank : t.rateRank;
    if (rank >= MAX_UPGRADE) return;
    const cost = UPGRADE_COST[rank] ?? 9999;
    if (this.gold < cost) return;
    this.gold -= cost;
    if (track === "damage") t.damageRank += 1;
    else t.rateRank += 1;
    this.burst(t.x, t.y, TOWERS[t.kind].accent, 14, 70);
    sfxPlay.upgrade();
    this.pushHud();
  }

  sell(): void {
    const idx = this.towers.findIndex((x) => x.id === this.selectedTowerId);
    if (idx < 0) return;
    const t = this.towers[idx]!;
    this.gold += sellValue(t.kind, t.damageRank, t.rateRank);
    this.occupied.delete(`${t.col},${t.row}`);
    this.towers.splice(idx, 1);
    this.selectedTowerId = 0;
    this.burst(t.x, t.y, "#8a9188", 12, 50);
    sfxPlay.sell();
    this.pushHud();
  }

  fixedUpdate(dt: number): void {
    if (this.phase !== "playing") {
      this.tickFx(dt);
      return;
    }
    if (this.hitstop > 0) {
      this.hitstop -= dt;
      this.tickFx(dt);
      return;
    }
    this.time += dt;
    if (this.leakFlash > 0) this.leakFlash = Math.max(0, this.leakFlash - dt * 2.2);

    if (this.spawnQueue.length === 0 && this.wave < this.totalWaves && this.aliveCount() === 0) {
      if (this.waveActive) {
        this.waveActive = false;
        this.prepLeft = this.stage.prep;
        this.pushHud();
      } else {
        this.prepLeft = Math.max(0, this.prepLeft - dt);
        if (this.prepLeft <= 0) this.beginWave();
      }
    }

    this.tickSpawns(dt);
    this.tickEnemies(dt);
    this.tickTowers(dt);
    this.tickProjectiles(dt);
    this.tickFx(dt);
    this.checkEnd();
  }

  frameFx(dt: number): void {
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - dt * 2.4);
      const mag = this.trauma * this.trauma * (this.reducedMotion ? 0 : 10);
      this.shakeX = (Math.random() * 2 - 1) * mag;
      this.shakeY = (Math.random() * 2 - 1) * mag;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }
  }

  private tickSpawns(dt: number): void {
    if (this.spawnQueue.length === 0) return;
    this.spawnClock += dt;
    while (this.spawnQueue.length && this.spawnQueue[0]!.at <= this.spawnClock) {
      const job = this.spawnQueue.shift()!;
      this.spawnEnemy(job.kind);
    }
  }

  private spawnEnemy(kind: EnemyKind): void {
    const slot = this.enemies.find((e) => !e.alive);
    if (!slot) return;
    const def = ENEMIES[kind];
    const wp = WAYPOINTS[0]!;
    const waveIndex = Math.max(0, this.wave - 1);
    const hp = Math.round(def.hp * hpScale(waveIndex, this.stage.hpMul));
    slot.id = this.nextEnemyId++;
    slot.alive = true;
    slot.kind = kind;
    slot.x = wp.x;
    slot.y = wp.y;
    slot.vx = 0;
    slot.vy = 0;
    slot.hp = hp;
    slot.maxHp = hp;
    slot.speed = def.speed;
    slot.gold = Math.round(def.gold * goldScale(waveIndex));
    slot.armor = def.armor;
    slot.radius = def.radius;
    slot.lives = def.lives;
    slot.waypoint = 0;
    slot.pathT = 0;
    slot.slowUntil = 0;
    slot.slowFactor = 1;
    slot.flash = 0;
    slot.bob = Math.random() * Math.PI * 2;
  }

  private tickEnemies(dt: number): void {
    for (const e of this.enemies) {
      if (!e.alive) continue;
      if (e.flash > 0) e.flash = Math.max(0, e.flash - dt * 6);
      e.bob += dt * (e.kind === "runner" ? 14 : 8);
      const slow = this.time < e.slowUntil ? e.slowFactor : 1;
      const speed = e.speed * slow;
      if (e.waypoint >= WAYPOINTS.length - 1) {
        this.leak(e);
        continue;
      }
      const target = WAYPOINTS[e.waypoint + 1]!;
      const dx = target.x - e.x;
      const dy = target.y - e.y;
      const dist = Math.hypot(dx, dy) || 1;
      const step = speed * dt;
      if (dist <= step) {
        e.x = target.x;
        e.y = target.y;
        e.waypoint += 1;
      } else {
        e.vx = (dx / dist) * speed;
        e.vy = (dy / dist) * speed;
        e.x += e.vx * dt;
        e.y += e.vy * dt;
      }
      e.pathT = pathProgress(e.waypoint, e.x, e.y);
    }
  }

  private leak(e: Enemy): void {
    e.alive = false;
    this.lives = Math.max(0, this.lives - e.lives);
    this.leakFlash = 1;
    this.addTrauma(e.kind === "brute" ? 0.7 : 0.4);
    this.float(WAYPOINTS[WAYPOINTS.length - 1]!.x, WAYPOINTS[WAYPOINTS.length - 1]!.y - 18, `-${e.lives}`, "#c45c4a", 16);
    sfxPlay.leak();
    if (this.lives <= 0) {
      this.phase = "lost";
      sfxPlay.lose();
    }
    this.pushHud();
  }

  private tickTowers(dt: number): void {
    for (const t of this.towers) {
      t.cooldown = Math.max(0, t.cooldown - dt);
      const stats = towerStats(t.kind, t.damageRank, t.rateRank);
      const rangePx = stats.range * CELL;
      const target = this.acquire(t, rangePx);
      t.targetId = target ? target.id : 0;
      if (target) {
        t.angle += wrapAngle(Math.atan2(target.y - t.y, target.x - t.x) - t.angle) * Math.min(1, dt * 10);
        if (t.cooldown <= 0) {
          this.fire(t, target, stats);
          t.cooldown = 1 / stats.fireRate;
        }
      }
    }
  }

  private acquire(t: Tower, rangePx: number): Enemy | null {
    const r2 = rangePx * rangePx;
    let best: Enemy | null = null;
    let bestScore = this.policy === "last" || this.policy === "closest" ? Infinity : -Infinity;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const dx = e.x - t.x;
      const dy = e.y - t.y;
      const d2 = dx * dx + dy * dy;
      if (d2 > r2) continue;
      let score: number;
      if (this.policy === "first") score = e.pathT;
      else if (this.policy === "last") score = e.pathT;
      else if (this.policy === "strongest") score = e.hp;
      else score = d2;
      const better =
        this.policy === "last" || this.policy === "closest" ? score < bestScore : score > bestScore;
      if (!best || better) {
        best = e;
        bestScore = score;
      }
    }
    return best;
  }

  private fire(t: Tower, target: Enemy, stats: ReturnType<typeof towerStats>): void {
    const slot = this.projectiles.find((p) => !p.alive);
    if (!slot) return;
    const arc = t.kind === "mortar";
    const dist = Math.hypot(target.x - t.x, target.y - t.y);
    let tx = target.x;
    let ty = target.y;
    if (arc) {
      const flight = Math.max(0.35, dist / TOWERS[t.kind].projectileSpeed);
      tx = target.x + target.vx * flight;
      ty = target.y + target.vy * flight;
    }
    slot.id = this.nextProjId++;
    slot.alive = true;
    slot.kind = t.kind;
    slot.x = t.x;
    slot.y = t.y;
    slot.sx = t.x;
    slot.sy = t.y;
    slot.tx = tx;
    slot.ty = ty;
    slot.speed = TOWERS[t.kind].projectileSpeed;
    slot.damage = stats.damage;
    slot.splash = stats.splash * CELL;
    slot.slowFactor = stats.slowFactor;
    slot.slowDuration = stats.slowDuration;
    slot.pierce = stats.pierce;
    slot.targetId = arc ? 0 : target.id;
    slot.ttl = arc ? Math.max(0.35, dist / slot.speed) : 1.4;
    slot.age = 0;
    slot.duration = slot.ttl;
    slot.arc = arc;
    if (t.kind === "bolt") sfxPlay.shootBolt();
    else if (t.kind === "mortar") sfxPlay.shootMortar();
    else if (t.kind === "lance") sfxPlay.shootLance();
    else sfxPlay.shootFrost();
  }

  private tickProjectiles(dt: number): void {
    for (const p of this.projectiles) {
      if (!p.alive) continue;
      p.age += dt;
      if (p.arc) {
        const u = Math.min(1, p.age / p.duration);
        p.x = p.sx + (p.tx - p.sx) * u;
        p.y = p.sy + (p.ty - p.sy) * u;
        if (u >= 1) this.impact(p);
        continue;
      }
      let tx = p.tx;
      let ty = p.ty;
      if (p.targetId) {
        const target = this.enemies.find((e) => e.alive && e.id === p.targetId);
        if (target) {
          tx = target.x;
          ty = target.y;
          p.tx = tx;
          p.ty = ty;
        } else {
          p.targetId = 0;
        }
      }
      const dx = tx - p.x;
      const dy = ty - p.y;
      const dist = Math.hypot(dx, dy) || 1;
      const step = p.speed * dt;
      if (dist <= step + 6) {
        p.x = tx;
        p.y = ty;
        this.impact(p);
      } else {
        p.x += (dx / dist) * step;
        p.y += (dy / dist) * step;
      }
      if (p.age > p.ttl) p.alive = false;
    }
  }

  private impact(p: Projectile): void {
    p.alive = false;
    const color = TOWERS[p.kind].accent;
    if (p.splash > 0) {
      this.burst(p.x, p.y, color, 18, 90);
      this.addTrauma(0.22);
      for (const e of this.enemies) {
        if (!e.alive) continue;
        const d = Math.hypot(e.x - p.x, e.y - p.y);
        if (d <= p.splash + e.radius) {
          const falloff = 1 - (d / (p.splash + e.radius)) * 0.35;
          this.hurt(e, p.damage * falloff, p);
        }
      }
    } else {
      this.burst(p.x, p.y, color, 6, 50);
      let hit: Enemy | undefined;
      if (p.targetId) hit = this.enemies.find((e) => e.alive && e.id === p.targetId);
      if (!hit) {
        let best = 18;
        for (const e of this.enemies) {
          if (!e.alive) continue;
          const d = Math.hypot(e.x - p.x, e.y - p.y);
          if (d < best) {
            best = d;
            hit = e;
          }
        }
      }
      if (hit) this.hurt(hit, p.damage, p);
    }
    sfxPlay.hit();
  }

  private hurt(e: Enemy, raw: number, p: Projectile): void {
    const dealt = Math.max(1, raw * (1 - e.armor * (1 - p.pierce)));
    e.hp -= dealt;
    e.flash = 1;
    if (p.slowFactor > 0) {
      e.slowFactor = p.slowFactor;
      e.slowUntil = this.time + p.slowDuration;
    }
    this.float(e.x, e.y - e.radius - 6, `${Math.round(dealt)}`, "#e8ece6", 11);
    if (e.hp <= 0) this.kill(e);
  }

  private kill(e: Enemy): void {
    e.alive = false;
    this.gold += e.gold;
    this.waveKills += 1;
    this.burst(e.x, e.y, "#c9c3b0", e.kind === "brute" ? 28 : 14, e.kind === "brute" ? 140 : 70);
    this.float(e.x, e.y - 16, `+${e.gold}`, "#c9c3b0", 12);
    if (e.kind === "brute") {
      this.addTrauma(0.55);
      this.hitstop = 0.06;
    }
    sfxPlay.death();
    this.pushHud();
  }

  private checkEnd(): void {
    if (this.phase !== "playing") return;
    if (this.lives <= 0) {
      this.phase = "lost";
      sfxPlay.lose();
      this.pushHud();
      return;
    }
    if (this.wave >= this.totalWaves && this.spawnQueue.length === 0 && this.aliveCount() === 0) {
      this.phase = "won";
      this.lastStars = starsFromLives(this.lives, this.stage.startLives);
      const prog = recordWin(this.stageIndex, this.lastStars);
      this.unlocked = prog.unlocked;
      this.stars = prog.stars;
      sfxPlay.win();
      this.pushHud();
    }
  }

  private aliveCount(): number {
    let n = 0;
    for (const e of this.enemies) if (e.alive) n += 1;
    return n;
  }

  private tickFx(dt: number): void {
    for (const p of this.particles) {
      if (!p.alive) continue;
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.gravity * dt;
      if (p.life <= 0) p.alive = false;
    }
    for (const f of this.floaters) {
      if (!f.alive) continue;
      f.life -= dt;
      f.y += f.vy * dt;
      if (f.life <= 0) f.alive = false;
    }
  }

  burst(x: number, y: number, color: string, count: number, speed: number): void {
    for (let i = 0; i < count; i++) {
      const p = this.particles.find((q) => !q.alive);
      if (!p) return;
      const a = Math.random() * Math.PI * 2;
      const s = speed * (0.3 + Math.random() * 0.9);
      p.alive = true;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(a) * s;
      p.vy = Math.sin(a) * s;
      p.life = 0.25 + Math.random() * 0.35;
      p.maxLife = p.life;
      p.size = 1.5 + Math.random() * 2.4;
      p.color = color;
      p.gravity = 40;
    }
  }

  float(x: number, y: number, text: string, color: string, size: number): void {
    const f = this.floaters.find((q) => !q.alive);
    if (!f) return;
    f.alive = true;
    f.x = x;
    f.y = y;
    f.vy = -28;
    f.life = 0.7;
    f.maxLife = 0.7;
    f.text = text;
    f.color = color;
    f.size = size;
  }

  addTrauma(n: number): void {
    if (this.reducedMotion) return;
    this.trauma = Math.min(1, this.trauma + n);
  }

  private resetSim(): void {
    this.gold = this.stage.startGold;
    this.lives = this.stage.startLives;
    this.wave = 0;
    this.time = 0;
    this.selectedShop = null;
    this.selectedTowerId = 0;
    this.hover = null;
    this.prepLeft = this.stage.prep;
    this.spawnQueue = [];
    this.spawnClock = 0;
    this.towers = [];
    this.occupied.clear();
    this.trauma = 0;
    this.hitstop = 0;
    this.leakFlash = 0;
    this.waveKills = 0;
    this.waveActive = false;
    this.lastStars = 0;
    for (const e of this.enemies) e.alive = false;
    for (const p of this.projectiles) p.alive = false;
    for (const p of this.particles) p.alive = false;
    for (const f of this.floaters) f.alive = false;
  }

  pushHud(): void {
    const selected = this.towers.find((t) => t.id === this.selectedTowerId);
    const next = this.stage.waves[this.wave];
    useGameStore.setState({
      phase: this.phase,
      gold: this.gold,
      lives: this.lives,
      wave: this.wave,
      totalWaves: this.totalWaves,
      enemiesAlive: this.aliveCount(),
      spawning: this.spawnQueue.length > 0,
      canCallWave: this.canCallWave(),
      prepLeft: this.prepLeft,
      nextHint: this.wave >= this.totalWaves ? "" : waveHint(next),
      selectedShop: this.selectedShop,
      selectedTower: selected ? selectedFromTower(selected) : null,
      policy: this.policy,
      speed: this.speed,
      leakFlash: this.leakFlash,
      waveKills: this.waveKills,
      stageIndex: this.stageIndex,
      stageName: this.stage.name,
      stageCount: STAGES.length,
      startLives: this.stage.startLives,
      lastStars: this.lastStars,
      unlocked: this.unlocked,
      stars: this.stars,
    });
  }
}

function wrapAngle(a: number): number {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

function emptyEnemy(): Enemy {
  return {
    id: 0,
    alive: false,
    kind: "grunt",
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    hp: 0,
    maxHp: 1,
    speed: 0,
    gold: 0,
    armor: 0,
    radius: 8,
    lives: 1,
    waypoint: 0,
    pathT: 0,
    slowUntil: 0,
    slowFactor: 1,
    flash: 0,
    bob: 0,
  };
}

function emptyProj(): Projectile {
  return {
    id: 0,
    alive: false,
    kind: "bolt",
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    sx: 0,
    sy: 0,
    speed: 0,
    damage: 0,
    splash: 0,
    slowFactor: 0,
    slowDuration: 0,
    pierce: 0,
    targetId: 0,
    ttl: 0,
    age: 0,
    duration: 1,
    arc: false,
  };
}

function emptyPart(): Particle {
  return {
    alive: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    life: 0,
    maxLife: 1,
    size: 1,
    color: "#fff",
    gravity: 0,
  };
}

function emptyFloat(): Floater {
  return {
    alive: false,
    x: 0,
    y: 0,
    vy: 0,
    life: 0,
    maxLife: 1,
    text: "",
    color: "#fff",
    size: 12,
  };
}
