import { CELL, COLS, ROWS, TOWERS, WORLD_H, WORLD_W, towerStats } from "./config";
import { BLOCKED_SET, PATH_SET, WAYPOINTS, cellCenter, hash2, isBuildable } from "./map";
import { sprite, spritesReady } from "./sprites";
import type { GameEngine } from "./engine";
import type { Enemy, Projectile, Tower, TowerKind } from "./types";
import type { MapPalette } from "./stages";

let mapCache: HTMLCanvasElement | null = null;
let mapCacheId = "";

const CREAM = "#c9c3b0";
const SAGE = "#9aaf9c";
const DANGER = "#c45c4a";
const FG = "#e8ece6";
const MUTED = "#8a9188";
const TOWER_FACE = -Math.PI / 2;
const PROP_KEYS = ["prop-rock", "prop-ruin", "prop-stump", "prop-fern"] as const;

const ENEMY_PALETTE = {
  grunt: { body: "#5c6b52", shell: "#3e4a38", eye: "#c9c3b0" },
  runner: { body: "#8a6e5c", shell: "#5c4a40", eye: "#e8ece6" },
  armored: { body: "#6a7068", shell: "#9aa198", eye: "#c45c4a" },
  brute: { body: "#4a3c38", shell: "#6e534c", eye: "#c9c3b0" },
  swarm: { body: "#6a4e3a", shell: "#4a3428", eye: "#c9c3b0" },
} as const;

export function renderFrame(ctx: CanvasRenderingContext2D, engine: GameEngine, dpr: number): void {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, WORLD_W, WORLD_H);
  ctx.save();
  ctx.translate(engine.shakeX, engine.shakeY);

  ctx.drawImage(getMapCache(engine), 0, 0);
  drawMotes(ctx, engine.time, engine.stage.palette);

  drawSpawn(ctx, engine.time);
  drawKeep(ctx, engine.leakFlash);

  const selected = engine.towers.find((t) => t.id === engine.selectedTowerId);
  if (selected) {
    const stats = towerStats(selected.kind, selected.damageRank, selected.rateRank);
    drawRange(ctx, selected.x, selected.y, stats.range * CELL, true);
  }

  if (engine.hover && engine.selectedShop && (engine.phase === "playing" || engine.phase === "paused")) {
    drawPlacement(ctx, engine);
  } else if (engine.hover && !engine.selectedShop) {
    const hovered = engine.towers.find((t) => t.col === engine.hover!.col && t.row === engine.hover!.row);
    if (hovered && hovered.id !== engine.selectedTowerId) {
      const stats = towerStats(hovered.kind, hovered.damageRank, hovered.rateRank);
      drawRange(ctx, hovered.x, hovered.y, stats.range * CELL, true);
    }
  }

  for (const t of engine.towers) drawTower(ctx, t, t.id === engine.selectedTowerId);
  for (const e of engine.enemies) if (e.alive) drawEnemy(ctx, e, engine.time);
  for (const p of engine.projectiles) if (p.alive) drawProjectile(ctx, p);
  for (const p of engine.particles) if (p.alive) drawParticle(ctx, p);
  for (const f of engine.floaters) if (f.alive) drawFloater(ctx, f);

  ctx.restore();

  if (engine.leakFlash > 0) {
    ctx.fillStyle = `rgba(196, 92, 74, ${engine.leakFlash * 0.18})`;
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);
  }
}

function getMapCache(engine: GameEngine): HTMLCanvasElement {
  const id = `${engine.stage.id}:${spritesReady() ? 1 : 0}`;
  if (mapCache && mapCacheId === id) return mapCache;
  const c = document.createElement("canvas");
  c.width = WORLD_W;
  c.height = WORLD_H;
  const g = c.getContext("2d")!;
  drawMap(g, engine.stage.palette);
  mapCache = c;
  mapCacheId = id;
  return c;
}

function patternFrom(ctx: CanvasRenderingContext2D, img: HTMLImageElement, size: number): CanvasPattern | null {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  c.getContext("2d")!.drawImage(img, 0, 0, size, size);
  return ctx.createPattern(c, "repeat");
}

function drawMap(ctx: CanvasRenderingContext2D, pal: MapPalette): void {
  ctx.fillStyle = pal.grassC;
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);

  const ground = sprite(`tile-${pal.ground}`);
  if (ground) {
    const pat = patternFrom(ctx, ground, CELL * 2);
    if (pat) {
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, WORLD_W, WORLD_H);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = pal.grassA;
    ctx.globalAlpha = 0.4;
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);
    ctx.globalAlpha = 1;
  } else {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const n = hash2(col, row);
        ctx.fillStyle = n > 0.55 ? pal.grassB : n > 0.22 ? pal.grassA : pal.grassC;
        ctx.fillRect(col * CELL, row * CELL, CELL, CELL);
      }
    }
  }

  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = pal.pathEdge;
  ctx.lineWidth = 46;
  strokePath(ctx);
  const pathTile = sprite("tile-path");
  if (pathTile) {
    const pat = patternFrom(ctx, pathTile, CELL * 2);
    if (pat) {
      ctx.strokeStyle = pat;
      ctx.lineWidth = 34;
      strokePath(ctx);
    }
  }
  ctx.strokeStyle = pal.pathFill;
  ctx.globalAlpha = 0.34;
  ctx.lineWidth = 34;
  strokePath(ctx);
  ctx.strokeStyle = pal.pathHigh;
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 8;
  strokePath(ctx);
  ctx.restore();

  ctx.strokeStyle = "rgba(42, 47, 43, 0.22)";
  ctx.lineWidth = 1;
  for (let c = 1; c < COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * CELL + 0.5, 0);
    ctx.lineTo(c * CELL + 0.5, WORLD_H);
    ctx.stroke();
  }
  for (let r = 1; r < ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * CELL + 0.5);
    ctx.lineTo(WORLD_W, r * CELL + 0.5);
    ctx.stroke();
  }

  for (const key of BLOCKED_SET) {
    const [cs, rs] = key.split(",");
    const col = Number(cs);
    const row = Number(rs);
    if (PATH_SET.has(key)) continue;
    drawProp(ctx, col, row, pal);
  }

  ctx.strokeStyle = "rgba(201, 195, 176, 0.16)";
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, WORLD_W - 3, WORLD_H - 3);
}

function strokePath(ctx: CanvasRenderingContext2D): void {
  if (WAYPOINTS.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(WAYPOINTS[0]!.x, WAYPOINTS[0]!.y);
  for (let i = 1; i < WAYPOINTS.length; i++) ctx.lineTo(WAYPOINTS[i]!.x, WAYPOINTS[i]!.y);
  ctx.stroke();
}

function drawProp(ctx: CanvasRenderingContext2D, col: number, row: number, pal: MapPalette): void {
  const c = cellCenter(col, row);
  const n = hash2(col * 3, row * 7);
  const img = sprite(PROP_KEYS[Math.floor(n * PROP_KEYS.length)]!);
  if (img) {
    const s = 34 + n * 12;
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate((n - 0.5) * 0.6);
    ctx.drawImage(img, -s / 2, -s / 2 - 2, s, s);
    ctx.restore();
    return;
  }
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate((n - 0.5) * 0.7);
  ctx.fillStyle = pal.rock;
  ctx.beginPath();
  ctx.moveTo(-12, 7);
  ctx.lineTo(-7, -12);
  ctx.lineTo(9, -9);
  ctx.lineTo(13, 6);
  ctx.lineTo(1, 13);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = pal.moss;
  ctx.beginPath();
  ctx.ellipse(-2, -5, 7, 4, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawMotes(ctx: CanvasRenderingContext2D, time: number, pal: MapPalette): void {
  ctx.fillStyle = pal.accent;
  for (let i = 0; i < 14; i++) {
    const seed = hash2(i * 13, 7);
    const x = (seed * WORLD_W + Math.sin(time * 0.35 + i) * 18) % WORLD_W;
    const y = ((hash2(i, 19) * WORLD_H + Math.cos(time * 0.28 + i * 0.7) * 12) % WORLD_H + WORLD_H) % WORLD_H;
    ctx.globalAlpha = 0.12 + seed * 0.18;
    ctx.beginPath();
    ctx.arc(x, y, 1.2 + seed, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawSpawn(ctx: CanvasRenderingContext2D, time: number): void {
  const p = WAYPOINTS[0];
  if (!p) return;
  const img = sprite("portal");
  const pulse = 0.65 + Math.sin(time * 2.2) * 0.2;
  ctx.save();
  ctx.translate(p.x, p.y);
  if (img) {
    const s = 42 + pulse * 4;
    ctx.globalAlpha = 0.92;
    ctx.drawImage(img, -s / 2, -s / 2, s, s);
    ctx.globalAlpha = 1;
  } else {
    ctx.strokeStyle = SAGE;
    ctx.globalAlpha = 0.35 * pulse;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 16 + pulse * 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = "#0b0d0c";
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawKeep(ctx: CanvasRenderingContext2D, leak: number): void {
  const p = WAYPOINTS[WAYPOINTS.length - 1];
  if (!p) return;
  const img = sprite("keep");
  ctx.save();
  ctx.translate(p.x, p.y);
  if (leak > 0.2) {
    ctx.fillStyle = `rgba(196, 92, 74, ${leak * 0.35})`;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fill();
  }
  if (img) {
    ctx.drawImage(img, -24, -24, 48, 48);
  } else {
    ctx.fillStyle = leak > 0.2 ? DANGER : "#2c322e";
    rounded(ctx, -16, -14, 32, 28, 4);
    ctx.fill();
  }
  ctx.restore();
}

function drawPlacement(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
  const hover = engine.hover;
  const kind = engine.selectedShop;
  if (!hover || !kind) return;
  const key = `${hover.col},${hover.row}`;
  const c = cellCenter(hover.col, hover.row);
  const valid = isBuildable(hover.col, hover.row) && !engine.occupied.has(key) && engine.gold >= TOWERS[kind].cost;
  ctx.fillStyle = valid ? "rgba(154, 175, 156, 0.16)" : "rgba(196, 92, 74, 0.16)";
  ctx.fillRect(hover.col * CELL, hover.row * CELL, CELL, CELL);
  ctx.strokeStyle = valid ? SAGE : DANGER;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(hover.col * CELL + 1, hover.row * CELL + 1, CELL - 2, CELL - 2);
  drawRange(ctx, c.x, c.y, TOWERS[kind].range * CELL, valid);
  ctx.globalAlpha = 0.55;
  drawTowerShape(ctx, c.x, c.y, kind, -Math.PI / 2, 0, 0, false);
  ctx.globalAlpha = 1;
}

function drawRange(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, valid: boolean): void {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = valid ? "rgba(154, 175, 156, 0.08)" : "rgba(196, 92, 74, 0.08)";
  ctx.fill();
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = valid ? "rgba(154, 175, 156, 0.55)" : "rgba(196, 92, 74, 0.55)";
  ctx.lineWidth = 1.25;
  ctx.stroke();
  ctx.restore();
}

function drawTower(ctx: CanvasRenderingContext2D, t: Tower, selected: boolean): void {
  if (selected) {
    ctx.beginPath();
    ctx.arc(t.x, t.y, 22, 0, Math.PI * 2);
    ctx.strokeStyle = CREAM;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  drawTowerShape(ctx, t.x, t.y, t.kind, t.angle, t.damageRank, t.rateRank, true);
}

function drawTowerShape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  kind: TowerKind,
  angle: number,
  dmg: number,
  rate: number,
  pips: boolean,
): void {
  const img = sprite(kind);
  ctx.save();
  ctx.translate(x, y);
  if (img) {
    ctx.save();
    ctx.rotate(angle + TOWER_FACE);
    ctx.drawImage(img, -22, -22, 44, 44);
    ctx.restore();
  } else {
    const def = TOWERS[kind];
    ctx.fillStyle = "#242a26";
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = def.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.save();
    ctx.rotate(angle);
    ctx.fillStyle = def.accent;
    ctx.fillRect(2, -3.5, 16, 7);
    ctx.restore();
  }
  if (pips) {
    const total = dmg + rate;
    for (let i = 0; i < total; i++) {
      ctx.fillStyle = i < dmg ? CREAM : SAGE;
      ctx.beginPath();
      ctx.arc(-10 + i * 5, 20, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy, time: number): void {
  const frame = (Math.floor(e.bob * 2.2) % 4) + 1;
  const img = sprite(`${e.kind}-${frame}`) ?? sprite(`${e.kind}-1`);
  const ang = Math.atan2(e.vy, e.vx) || 0;
  const bob = Math.sin(e.bob) * (e.kind === "runner" || e.kind === "swarm" ? 1.2 : 0.6);
  const slowed = time < e.slowUntil;
  const size = e.radius * 2.6;
  ctx.save();
  ctx.translate(e.x, e.y + bob);
  ctx.rotate(ang);
  if (img) {
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
  } else {
    drawEnemyFallback(ctx, e);
  }
  if (slowed) {
    ctx.strokeStyle = "rgba(197, 224, 232, 0.7)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, e.radius + 6, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (e.flash > 0) {
    ctx.fillStyle = `rgba(232, 236, 230, ${e.flash * 0.4})`;
    ctx.beginPath();
    ctx.arc(0, 0, e.radius + 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  const bw = Math.max(18, e.radius * 2);
  const bx = e.x - bw / 2;
  const by = e.y - e.radius - 10;
  ctx.fillStyle = "rgba(11, 13, 12, 0.7)";
  ctx.fillRect(bx, by, bw, 3);
  ctx.fillStyle = e.hp / e.maxHp < 0.3 ? DANGER : SAGE;
  ctx.fillRect(bx, by, bw * Math.max(0, e.hp / e.maxHp), 3);
}

function drawEnemyFallback(ctx: CanvasRenderingContext2D, e: Enemy): void {
  const pal = ENEMY_PALETTE[e.kind];
  ctx.fillStyle = pal.shell;
  ctx.beginPath();
  ctx.ellipse(0, 0, e.radius, e.radius * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = pal.body;
  ctx.beginPath();
  ctx.ellipse(3, 0, e.radius * 0.55, e.radius * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawProjectile(ctx: CanvasRenderingContext2D, p: Projectile): void {
  const img = sprite(`proj-${p.kind}`);
  ctx.save();
  if (p.arc) {
    const u = Math.min(1, p.age / Math.max(0.001, p.duration));
    const lift = Math.sin(u * Math.PI) * 36;
    ctx.fillStyle = "rgba(11, 13, 12, 0.35)";
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    if (img) {
      ctx.drawImage(img, p.x - 8, p.y - lift - 8, 16, 16);
    } else {
      ctx.fillStyle = TOWERS.mortar.accent;
      ctx.beginPath();
      ctx.arc(p.x, p.y - lift, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (img) {
    const ang = Math.atan2(p.ty - p.sy, p.tx - p.sx);
    ctx.translate(p.x, p.y);
    ctx.rotate(ang);
    const s = p.kind === "frost" ? 14 : 16;
    ctx.drawImage(img, -s / 2, -s / 2, s, s);
  } else if (p.kind === "frost") {
    ctx.fillStyle = TOWERS.frost.accent;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const ang = Math.atan2(p.ty - p.sy, p.tx - p.sx);
    ctx.translate(p.x, p.y);
    ctx.rotate(ang);
    ctx.fillStyle = TOWERS[p.kind].accent;
    ctx.fillRect(-6, -1.6, 12, 3.2);
  }
  ctx.restore();
}

function drawParticle(
  ctx: CanvasRenderingContext2D,
  p: { x: number; y: number; size: number; color: string; life: number; maxLife: number },
): void {
  ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
  ctx.fillStyle = p.color;
  ctx.fillRect(p.x, p.y, p.size, p.size);
  ctx.globalAlpha = 1;
}

function drawFloater(
  ctx: CanvasRenderingContext2D,
  f: { x: number; y: number; text: string; color: string; size: number; life: number; maxLife: number },
): void {
  ctx.globalAlpha = Math.max(0, f.life / f.maxLife);
  ctx.fillStyle = f.color;
  ctx.font = `600 ${f.size}px Outfit, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(f.text, f.x, f.y);
  ctx.globalAlpha = 1;
}

function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export { MUTED, FG };
