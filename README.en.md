# Holdfast · 固守

[繁體中文](README.md) | **English**

**[Live Demo / 線上展示](https://zinc-wind-tundra-stone.grok.me/)**

A browser tower-defense game. Place towers along a moss-stone keep, stop insect waves, unlock the next line, and earn stars from remaining lives.

![Campaign select](screenshots/campaign.png)

## Features

- Six stages in two chapters, each with its own path and palette
- Four towers: rapid fire, slow, splash, armor pierce
- Five enemies: grub, runner, armored, brute, swarm
- Damage and fire-rate upgrades; selling refunds 60% of spend
- Target priority: first, last, strongest, closest
- Stars and unlocks stored in `localStorage` — no account required

## Campaign

| Chapter | Stage | Difficulty | Waves | Lives |
| --- | --- | --- | --- | --- |
| Outer | Moss Path (苔徑) | Drill | 8 | 20 |
| Outer | Fold Valley (折谷) | Advanced | 10 | 16 |
| Outer | Marsh (濕沼) | Advanced | 10 | 16 |
| Deep | Thornwood (棘林) | Elite | 11 | 14 |
| Deep | Ruined Gate (殘門) | Elite | 12 | 14 |
| Deep | Dusk Keep (暮堡) | Finale | 14 | 12 |

Three stars at ≥60% lives, two at ≥30%, one otherwise. Clearing a stage unlocks the next.

![Gameplay](screenshots/gameplay-wave.png)

## Towers

| Tower | Cost | Role |
| --- | --- | --- |
| Bolt (迅矢) | 80 | Cheap rapid fire |
| Frost (霜縛) | 115 | Slow / crowd control |
| Mortar (崩砲) | 165 | Splash vs clumps |
| Lance (裂光) | 190 | Long-range armor pierce |

## Controls

| Input | Action |
| --- | --- |
| Click a card | Preview the map; click again to attack |
| Enter | Start the selected stage / next stage on win |
| 1–4 | Select Bolt, Frost, Mortar, Lance |
| Space | Call the next wave early (gold bonus) |
| Esc / P | Pause or return to campaign |
| Click empty grass | Place the selected tower |
| Click a built tower | Upgrade damage or rate, or sell |

Path and rocks are not buildable. The range ring turns red when gold is short.

## Stack

- React 19, TanStack Start, Tailwind CSS v4
- Canvas 2D loop with a fixed `1/60` sim step
- Zustand for HUD
- No auth, no database

```text
src/
  game/            engine, stages, renderer, sprites, save
  components/game/ canvas, HUD, dock, campaign overlays
  routes/          app entry
public/
  sprites/         towers, enemies, projectiles, props
  tiles/           ground and path textures
```

## Run locally

Requires [Node.js 22](https://nodejs.org/).

```bash
git clone https://github.com/richie7p/Holdfast.git
cd Holdfast
npm install
npm run dev
```

Open the local URL printed by Vite.

```bash
npm run typecheck
npm run build
```

No API keys, database, or sign-in.

## License

No license file is attached. Ask the repository owner before reuse.
