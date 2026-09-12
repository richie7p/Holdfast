import { Heart, Landmark, Lock, Star, Swords } from "lucide-react";
import type { ReactNode } from "react";
import { unlockAudio } from "@/game/audio";
import { COLS, ROWS } from "@/game/config";
import { engine } from "@/game/session";
import { STAGES, type StageDef } from "@/game/stages";
import { useGameStore } from "@/game/store";
import { cn } from "@/lib/utils";

export function Overlays() {
  const phase = useGameStore((s) => s.phase);
  const lives = useGameStore((s) => s.lives);
  const gold = useGameStore((s) => s.gold);
  const wave = useGameStore((s) => s.wave);
  const totalWaves = useGameStore((s) => s.totalWaves);
  const stageName = useGameStore((s) => s.stageName);
  const stageIndex = useGameStore((s) => s.stageIndex);
  const lastStars = useGameStore((s) => s.lastStars);
  const unlocked = useGameStore((s) => s.unlocked);
  const stars = useGameStore((s) => s.stars);

  if (phase === "playing") return null;

  if (phase === "paused") {
    return (
      <Scrim>
        <Panel>
          <p className="text-2xs uppercase tracking-widest text-muted">{stageName}</p>
          <p className="font-display mt-1 text-2xl tracking-tight">暫停</p>
          <p className="mt-2 text-sm text-muted">防線仍在。準備好再繼續。</p>
          <div className="mt-6 flex flex-col gap-2">
            <button type="button" className="btn-primary w-full" onClick={() => engine.togglePause()}>
              繼續駐守
            </button>
            <button type="button" className="btn-ghost w-full" onClick={() => engine.restart()}>
              重開本關
            </button>
            <button type="button" className="btn-ghost w-full" onClick={() => engine.gotoSelect()}>
              返回關卡
            </button>
          </div>
        </Panel>
      </Scrim>
    );
  }

  if (phase === "won" || phase === "lost") {
    const won = phase === "won";
    const hasNext = won && stageIndex + 1 < STAGES.length && stageIndex + 1 <= unlocked;
    return (
      <Scrim>
        <Panel>
          <p className="text-2xs font-medium uppercase tracking-widest text-muted">
            {won ? "防線守住" : "防線失守"} · {stageName}
          </p>
          <p className="font-display mt-2 text-3xl tracking-tight">{won ? "苔石仍在。" : "蟲潮漫過門廊。"}</p>
          {won && (
            <div className="mt-4 flex justify-center gap-1">
              {[1, 2, 3].map((n) => (
                <Star
                  key={n}
                  className={cn("size-6", n <= lastStars ? "fill-cream text-cream" : "text-border")}
                />
              ))}
            </div>
          )}
          <ul className="mt-6 grid grid-cols-3 gap-2 text-center">
            <Stat label="剩餘生命" value={`${lives}`} />
            <Stat label="金幣" value={`${gold}`} />
            <Stat label="波次" value={`${wave}/${totalWaves}`} />
          </ul>
          <div className="mt-6 flex flex-col gap-2">
            {hasNext && (
              <button
                type="button"
                className="btn-primary w-full"
                onClick={() => {
                  unlockAudio();
                  engine.nextStage();
                }}
              >
                下一關 · {STAGES[stageIndex + 1]?.name}
              </button>
            )}
            <button
              type="button"
              className={cn("w-full", hasNext ? "btn-ghost" : "btn-primary")}
              onClick={() => {
                unlockAudio();
                engine.restart();
              }}
            >
              再守一次
            </button>
            <button type="button" className="btn-ghost w-full" onClick={() => engine.gotoSelect()}>
              關卡選擇
            </button>
          </div>
        </Panel>
      </Scrim>
    );
  }

  const earned = stars.reduce((a, b) => a + b, 0);
  const outer = STAGES.slice(0, 3);
  const deep = STAGES.slice(3);

  return (
    <Scrim>
      <div className="overlay-enter mx-auto flex w-full max-w-4xl flex-col px-3 py-2">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-2xs font-medium uppercase tracking-widest text-muted">Holdfast</p>
            <h1 className="font-display mt-1 text-4xl leading-none tracking-tight text-fg sm:text-5xl">固守</h1>
          </div>
          <p className="font-mono text-sm tabular-nums text-cream">
            星 {earned}/{STAGES.length * 3}
          </p>
        </div>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
          六條防線。點卡片預覽地圖，再點一次進攻。生命剩六成得三星。
        </p>

        <Chapter title="外圍" stages={outer} unlocked={unlocked} stageIndex={stageIndex} stars={stars} offset={0} />
        <Chapter title="深處" stages={deep} unlocked={unlocked} stageIndex={stageIndex} stars={stars} offset={3} />

        <ol className="mt-4 hidden gap-2 text-left text-sm sm:grid sm:grid-cols-3">
          <Step icon={<Landmark className="size-4" />} title="放置" body="選塔點空地。路與岩石不能放。" />
          <Step icon={<Swords className="size-4" />} title="升級" body="點已建的塔，走傷害或射速。" />
          <Step icon={<Heart className="size-4" />} title="守門" body="漏過扣生命。通關解鎖下一線。" />
        </ol>
        <p className="mt-3 text-center text-2xs text-subtle">
          Enter 進攻 · 1–4 選塔 · 空白放波 · Esc 暫停
        </p>
      </div>
    </Scrim>
  );
}

function Chapter({
  title,
  stages,
  unlocked,
  stageIndex,
  stars,
  offset,
}: {
  title: string;
  stages: StageDef[];
  unlocked: number;
  stageIndex: number;
  stars: number[];
  offset: number;
}) {
  return (
    <section className="mt-3">
      <p className="text-2xs uppercase tracking-widest text-muted">{title}</p>
      <div className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-3">
        {stages.map((stage, i) => {
          const index = offset + i;
          const locked = index > unlocked;
          const preview = index === stageIndex;
          return (
            <button
              key={stage.id}
              type="button"
              disabled={locked}
              onClick={() => {
                unlockAudio();
                if (locked) return;
                if (preview) engine.startStage(index);
                else engine.previewStage(index);
              }}
              className={cn(
                "flex flex-col rounded-lg border p-2.5 text-left transition-colors",
                preview ? "border-accent bg-surface" : "border-border bg-surface/80 hover:bg-surface",
                locked && "opacity-50",
              )}
            >
              <div className="relative overflow-hidden rounded-sm bg-bg">
                <MiniMap path={stage.path} blocked={stage.blocked} accent={preview} />
                {locked && (
                  <span className="absolute inset-0 flex items-center justify-center bg-bg/60">
                    <Lock className="size-4 text-muted" />
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-2">
                <span className="font-display text-base tracking-tight text-fg sm:text-lg">{stage.name}</span>
                <span className={cn("text-2xs", diffClass(stage.difficulty))}>{stage.difficulty}</span>
              </div>
              <p className="mt-0.5 line-clamp-2 text-2xs leading-relaxed text-muted sm:text-xs">{stage.blurb}</p>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <span className="flex items-center gap-0.5">
                  {[1, 2, 3].map((n) => (
                    <Star
                      key={n}
                      className={cn("size-3", n <= (stars[index] ?? 0) ? "fill-cream text-cream" : "text-border")}
                    />
                  ))}
                </span>
                <span className="font-mono text-2xs tabular-nums text-subtle">
                  {stage.waves.length} 波 · {stage.startLives} 命
                </span>
              </div>
              <span
                className={cn(
                  "mt-2 inline-flex min-h-10 items-center justify-center rounded-sm px-3 text-xs font-medium",
                  preview ? "bg-accent text-accent-fg" : "bg-surface-2 text-fg",
                )}
              >
                {locked ? "未解鎖" : preview ? "進攻此關" : "預覽地圖"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function MiniMap({
  path,
  blocked,
  accent,
}: {
  path: Array<[number, number]>;
  blocked: Array<[number, number]>;
  accent: boolean;
}) {
  return (
    <svg viewBox={`0 0 ${COLS} ${ROWS}`} className="h-16 w-full sm:h-20" aria-hidden>
      <rect width={COLS} height={ROWS} className="fill-bg" />
      {blocked.map(([c, r], i) => (
        <rect key={`b-${c}-${r}-${i}`} x={c} y={r} width={1} height={1} className="fill-surface-2" />
      ))}
      {path.map(([c, r], i) => (
        <rect
          key={`p-${c}-${r}-${i}`}
          x={c}
          y={r}
          width={1}
          height={1}
          className={accent ? "fill-accent" : "fill-path"}
        />
      ))}
    </svg>
  );
}

function diffClass(d: StageDef["difficulty"]): string {
  if (d === "練習") return "text-ok";
  if (d === "終局") return "text-danger";
  if (d === "精銳") return "text-cream";
  return "text-muted";
}

function Scrim({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 z-20 overflow-y-auto bg-bg/70 px-3">
      <div className="flex min-h-full items-center justify-center py-4 sm:py-6">{children}</div>
    </div>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="overlay-enter my-auto w-full max-w-sm rounded-xl border border-border bg-surface p-6">{children}</div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <li className="rounded-md bg-surface-2 px-2 py-3">
      <p className="text-2xs text-muted">{label}</p>
      <p className="mt-1 font-mono text-lg tabular-nums text-fg">{value}</p>
    </li>
  );
}

function Step({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <li className="flex gap-3 rounded-lg border border-border bg-surface/80 px-3 py-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-sm bg-surface-2 text-accent">
        {icon}
      </span>
      <span>
        <span className="block font-medium text-fg">{title}</span>
        <span className="mt-0.5 block text-muted">{body}</span>
      </span>
    </li>
  );
}
