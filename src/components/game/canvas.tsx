import { useEffect, useRef } from "react";
import { CELL, STEP, WORLD_H, WORLD_W } from "@/game/config";
import { engine } from "@/game/session";
import { renderFrame } from "@/game/render";
import { resumeAudio, unlockAudio } from "@/game/audio";
import { isBuildable } from "@/game/map";

export function GameCanvas() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let acc = 0;
    let hudAcc = 0;
    let last = performance.now();
    let alive = true;
    let dpr = 1;

    const fit = () => {
      const rect = wrap.getBoundingClientRect();
      const pad = 8;
      const availW = Math.max(160, rect.width - pad);
      const availH = Math.max(120, rect.height - pad);
      const scale = Math.min(availW / WORLD_W, availH / WORLD_H);
      const cssW = Math.floor(WORLD_W * scale);
      const cssH = Math.floor(WORLD_H * scale);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      canvas.width = Math.floor(WORLD_W * dpr);
      canvas.height = Math.floor(WORLD_H * dpr);
    };

    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    fit();
    renderFrame(ctx, engine, dpr);

    const loop = (now: number) => {
      if (!alive) return;
      const raw = Math.min(0.1, (now - last) / 1000);
      last = now;
      const scaled = raw * engine.speed;
      acc += scaled;
      while (acc >= STEP) {
        engine.fixedUpdate(STEP);
        acc -= STEP;
      }
      engine.frameFx(raw);
      hudAcc += raw;
      if (hudAcc >= 0.12) {
        engine.pushHud();
        hudAcc = 0;
      }
      renderFrame(ctx, engine, dpr);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onVis = () => {
      if (document.visibilityState === "visible") resumeAudio();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const toWorld = (ev: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((ev.clientX - rect.left) / rect.width) * WORLD_W,
        y: ((ev.clientY - rect.top) / rect.height) * WORLD_H,
      };
    };

    const onMove = (ev: PointerEvent) => {
      const p = toWorld(ev);
      engine.pointerMove(p.x, p.y);
      const col = Math.floor(p.x / CELL);
      const row = Math.floor(p.y / CELL);
      const placing = Boolean(engine.selectedShop);
      const overTower = engine.towers.some((t) => t.col === col && t.row === row);
      canvas.style.cursor = placing
        ? isBuildable(col, row)
          ? "copy"
          : "not-allowed"
        : overTower
          ? "pointer"
          : "crosshair";
    };
    const onDown = (ev: PointerEvent) => {
      unlockAudio();
      const p = toWorld(ev);
      engine.pointerDown(p.x, p.y);
    };
    const onLeave = () => engine.pointerLeave();

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointercancel", onLeave);
    return () => {
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointercancel", onLeave);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="touch-none max-h-full max-w-full rounded-lg border border-border bg-bg"
        width={WORLD_W}
        height={WORLD_H}
      />
    </div>
  );
}
