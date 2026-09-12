import { Coins, Heart, Pause, Play, Volume2, VolumeX } from "lucide-react";
import type { ReactNode } from "react";
import { isMuted, setMuted, unlockAudio } from "@/game/audio";
import { engine } from "@/game/session";
import { useGameStore } from "@/game/store";
import { cn } from "@/lib/utils";

export function Hud() {
  const gold = useGameStore((s) => s.gold);
  const lives = useGameStore((s) => s.lives);
  const wave = useGameStore((s) => s.wave);
  const totalWaves = useGameStore((s) => s.totalWaves);
  const phase = useGameStore((s) => s.phase);
  const speed = useGameStore((s) => s.speed);
  const muted = useGameStore((s) => s.muted);
  const leakFlash = useGameStore((s) => s.leakFlash);
  const prepLeft = useGameStore((s) => s.prepLeft);
  const nextHint = useGameStore((s) => s.nextHint);
  const spawning = useGameStore((s) => s.spawning);
  const enemiesAlive = useGameStore((s) => s.enemiesAlive);
  const stageName = useGameStore((s) => s.stageName);
  const stars = useGameStore((s) => s.stars);
  const stageCount = useGameStore((s) => s.stageCount);
  const playing = phase === "playing" || phase === "paused";
  const earned = stars.reduce((a, b) => a + b, 0);

  return (
    <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-surface px-3 py-2 sm:gap-3 sm:px-4">
      <div className="mr-auto flex min-w-0 items-center gap-3 sm:gap-4">
        <p className="font-display hidden text-lg leading-none tracking-tight text-fg sm:block">固守</p>
        {playing && (
          <>
            <Chip
              icon={<Heart className="size-3.5" />}
              label="生命"
              value={String(lives)}
              danger={lives <= 5 || leakFlash > 0.15}
            />
            <Chip icon={<Coins className="size-3.5" />} label="金幣" value={String(gold)} />
          </>
        )}
        <div className="min-w-0">
          <p className="text-2xs uppercase tracking-wider text-muted">
            {playing ? (wave === 0 ? `${stageName} · 整備` : `${stageName} · ${wave}/${totalWaves}`) : "戰役"}
          </p>
          <p className="truncate font-mono text-sm tabular-nums text-fg">
            {!playing
              ? `六條防線 · 星 ${earned}/${stageCount * 3}`
              : spawning || enemiesAlive > 0
                ? `場上 ${enemiesAlive}`
                : prepLeft > 0
                  ? `下一波 ${Math.ceil(prepLeft)}s`
                  : nextHint || "準備"}
          </p>
          {playing && (
            <div className="mt-1 flex gap-px">
              {Array.from({ length: totalWaves }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full",
                    i < wave ? "bg-accent" : i === wave && (spawning || enemiesAlive > 0) ? "bg-cream" : "bg-border",
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <IconBtn
          label={phase === "paused" ? "繼續" : "暫停"}
          disabled={!playing}
          onClick={() => engine.togglePause()}
        >
          {phase === "paused" ? <Play className="size-4" /> : <Pause className="size-4" />}
        </IconBtn>
        <IconBtn
          label={speed === 1 ? "兩倍速" : "一倍速"}
          disabled={!playing}
          onClick={() => engine.setSpeed(speed === 1 ? 2 : 1)}
        >
          <span className="font-mono text-xs tabular-nums">{speed}x</span>
        </IconBtn>
        <IconBtn
          label={muted ? "開啟聲音" : "靜音"}
          onClick={() => {
            unlockAudio();
            const next = !isMuted();
            setMuted(next);
            try {
              localStorage.setItem("holdfast-muted", next ? "1" : "0");
            } catch {
              /* ignore */
            }
            useGameStore.setState({ muted: next });
          }}
        >
          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </IconBtn>
      </div>
    </header>
  );
}

function Chip({
  icon,
  label,
  value,
  danger,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-h-11 items-center gap-2 rounded-md border border-border bg-surface-2 px-2.5",
        danger && "border-danger/40 text-danger",
      )}
    >
      <span className={cn("text-muted", danger && "text-danger")}>{icon}</span>
      <span className="flex flex-col leading-none">
        <span className="text-2xs uppercase tracking-wider text-muted">{label}</span>
        <span className="font-mono text-base tabular-nums">{value}</span>
      </span>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex size-11 items-center justify-center rounded-md border border-border bg-surface-2 text-fg transition-colors hover:bg-surface disabled:opacity-40"
    >
      {children}
    </button>
  );
}
