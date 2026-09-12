import { useEffect } from "react";
import { setMuted, unlockAudio } from "@/game/audio";
import { engine } from "@/game/session";
import { loadSprites } from "@/game/sprites";
import { useGameStore } from "@/game/store";
import { GameCanvas } from "./canvas";
import { Dock } from "./dock";
import { Hud } from "./hud";
import { Overlays } from "./overlays";

const GAME_KEYS = new Set(["Space", "KeyP", "Escape", "Digit1", "Digit2", "Digit3", "Digit4", "KeyQ", "KeyF", "Enter"]);

export function GameShell() {
  useEffect(() => {
    void loadSprites();
    try {
      if (localStorage.getItem("holdfast-muted") === "1") {
        setMuted(true);
        useGameStore.setState({ muted: true });
      }
    } catch {
      /* ignore */
    }
    engine.pushHud();

    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (GAME_KEYS.has(e.code)) e.preventDefault();

      if (e.code === "Enter") {
        if (engine.phase === "select") {
          unlockAudio();
          engine.startStage(engine.stageIndex);
        } else if (engine.phase === "won") {
          unlockAudio();
          engine.nextStage();
        } else if (engine.phase === "lost") {
          unlockAudio();
          engine.restart();
        } else if (engine.phase === "paused") {
          engine.togglePause();
        }
        return;
      }
      if (e.code === "KeyP" || (e.code === "Escape" && engine.phase === "playing")) {
        engine.togglePause();
        return;
      }
      if (e.code === "Escape") {
        if (engine.phase === "paused" || engine.phase === "won" || engine.phase === "lost") {
          engine.gotoSelect();
          return;
        }
        engine.selectShop(null);
        engine.selectedTowerId = 0;
        engine.pushHud();
        return;
      }
      if (e.code === "Space") {
        if (engine.phase === "playing") engine.callWave();
        return;
      }
      if (e.code === "Digit1") engine.selectShop("bolt");
      if (e.code === "Digit2") engine.selectShop("frost");
      if (e.code === "Digit3") engine.selectShop("mortar");
      if (e.code === "Digit4") engine.selectShop("lance");
      if (e.code === "KeyQ") engine.selectShop(null);
      if (e.code === "KeyF") engine.setSpeed(engine.speed === 1 ? 2 : 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex h-dvh select-none flex-col overflow-hidden bg-bg text-fg">
      <Hud />
      <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
        <GameCanvas />
        <Dock />
        <Overlays />
      </div>
    </div>
  );
}
