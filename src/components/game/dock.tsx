import { POLICY_LABEL, TOWERS, UPGRADE_COST, earlyCallBonus } from "@/game/config";
import { engine } from "@/game/session";
import { useGameStore } from "@/game/store";
import type { TargetPolicy, TowerKind } from "@/game/types";
import { cn } from "@/lib/utils";

const KINDS: TowerKind[] = ["bolt", "frost", "mortar", "lance"];
const POLICIES: TargetPolicy[] = ["first", "last", "strongest", "closest"];

export function Dock() {
  const phase = useGameStore((s) => s.phase);
  const gold = useGameStore((s) => s.gold);
  const selectedShop = useGameStore((s) => s.selectedShop);
  const selectedTower = useGameStore((s) => s.selectedTower);
  const canCallWave = useGameStore((s) => s.canCallWave);
  const prepLeft = useGameStore((s) => s.prepLeft);
  const nextHint = useGameStore((s) => s.nextHint);
  const policy = useGameStore((s) => s.policy);
  const wave = useGameStore((s) => s.wave);
  const locked = phase !== "playing" && phase !== "paused";

  if (locked) return null;

  return (
    <aside className="flex shrink-0 flex-col gap-3 border-t border-border bg-surface p-3 lg:w-80 lg:border-t-0 lg:border-l lg:p-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
        {KINDS.map((kind) => {
          const def = TOWERS[kind];
          const selected = selectedShop === kind;
          const poor = gold < def.cost;
          return (
            <button
              key={kind}
              type="button"
              onClick={() => engine.selectShop(selected ? null : kind)}
              className={cn(
                "flex min-h-16 flex-col items-start gap-1 rounded-md border px-2.5 py-2 text-left transition-colors",
                selected ? "border-accent bg-surface-2" : "border-border bg-bg hover:bg-surface-2",
                poor && "opacity-50",
              )}
            >
              <span className="flex w-full items-center justify-between gap-1">
                <img src={`/sprites/${kind}.png`} alt="" className="size-7 object-contain" draggable={false} />
                <span className="font-mono text-xs tabular-nums text-cream">{def.cost}</span>
              </span>
              <span className="text-sm font-medium text-fg">{def.name}</span>
              <span className="text-2xs leading-tight text-muted">
                射程 {def.range.toFixed(1)} · {def.fireRate.toFixed(1)}/s
              </span>
            </button>
          );
        })}
      </div>

      {selectedShop && (
        <p className="text-xs leading-relaxed text-muted">{TOWERS[selectedShop].blurb} 點地圖空地放置。</p>
      )}

      {selectedTower ? (
        <div className="rounded-lg border border-border bg-bg p-3">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-medium text-fg">{selectedTower.name}</p>
            <p className="text-xs text-muted">射程 {selectedTower.range.toFixed(1)}</p>
          </div>
          <p className="mt-1 font-mono text-xs tabular-nums text-muted">
            傷害 {selectedTower.damage.toFixed(0)} · 射速 {selectedTower.fireRate.toFixed(2)}/s
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <UpgradeBtn
              label="傷害"
              rank={selectedTower.damageRank}
              cost={selectedTower.nextDamageCost}
              gold={gold}
              onClick={() => engine.upgrade("damage")}
            />
            <UpgradeBtn
              label="射速"
              rank={selectedTower.rateRank}
              cost={selectedTower.nextRateCost}
              gold={gold}
              onClick={() => engine.upgrade("rate")}
            />
          </div>
          <button
            type="button"
            onClick={() => engine.sell()}
            className="mt-2 min-h-11 w-full rounded-sm border border-border bg-surface-2 text-sm text-muted transition-colors hover:text-fg"
          >
            拆除 · 退回 {selectedTower.sell}
          </button>
        </div>
      ) : (
        <div className="hidden rounded-lg border border-dashed border-border px-3 py-3 text-xs text-muted lg:block">
          點一座已建的塔可升級傷害或射速，拆除退回六成花費。裂光可穿刺重甲。
        </div>
      )}

      <div className="mt-auto flex flex-col gap-2">
        <div className="flex flex-wrap gap-1">
          {POLICIES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => engine.setPolicy(p)}
              className={cn(
                "min-h-9 rounded-full px-3 text-xs transition-colors",
                policy === p ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted hover:text-fg",
              )}
            >
              {POLICY_LABEL[p]}
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled={!canCallWave}
          onClick={() => engine.callWave()}
          className="btn-primary min-h-12 w-full disabled:opacity-40"
        >
          {wave === 0
            ? "放出第一波"
            : canCallWave
              ? prepLeft > 0.2
                ? `提前放波 · +${earlyCallBonus(wave)}`
                : "放出下一波"
              : "波次進行中"}
        </button>
        {nextHint && (
          <p className="text-center text-2xs text-muted">
            {wave === 0 ? "即將" : "下一波"} · {nextHint}
          </p>
        )}
      </div>
    </aside>
  );
}

function UpgradeBtn({
  label,
  rank,
  cost,
  gold,
  onClick,
}: {
  label: string;
  rank: number;
  cost: number | null;
  gold: number;
  onClick: () => void;
}) {
  const maxed = cost === null;
  const poor = cost !== null && gold < cost;
  return (
    <button
      type="button"
      disabled={maxed || poor}
      onClick={onClick}
      className="flex min-h-14 flex-col items-start justify-center rounded-sm border border-border bg-surface-2 px-2.5 text-left disabled:opacity-40"
    >
      <span className="text-xs text-muted">
        {label} {rank}/3
      </span>
      <span className="text-sm font-medium text-fg">{maxed ? "已滿" : `升級 ${cost}`}</span>
      {!maxed && (
        <span className="mt-0.5 flex gap-0.5">
          {UPGRADE_COST.map((_, i) => (
            <span key={i} className={cn("h-1 w-3 rounded-full", i < rank ? "bg-accent" : "bg-border")} />
          ))}
        </span>
      )}
    </button>
  );
}
