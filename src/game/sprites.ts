const ASSETS: Array<{ key: string; src: string }> = [
  ...(["grunt", "runner", "armored", "brute", "swarm"] as const).flatMap((kind) =>
    [1, 2, 3, 4].map((n) => ({ key: `${kind}-${n}`, src: `/sprites/${kind}-${n}.png` })),
  ),
  { key: "bolt", src: "/sprites/bolt.png" },
  { key: "frost", src: "/sprites/frost.png" },
  { key: "mortar", src: "/sprites/mortar.png" },
  { key: "lance", src: "/sprites/lance.png" },
  { key: "keep", src: "/sprites/keep.png" },
  { key: "portal", src: "/sprites/portal.png" },
  { key: "prop-rock", src: "/sprites/prop-rock.png" },
  { key: "prop-ruin", src: "/sprites/prop-ruin.png" },
  { key: "prop-stump", src: "/sprites/prop-stump.png" },
  { key: "prop-fern", src: "/sprites/prop-fern.png" },
  { key: "proj-bolt", src: "/sprites/proj-bolt.png" },
  { key: "proj-frost", src: "/sprites/proj-frost.png" },
  { key: "proj-mortar", src: "/sprites/proj-mortar.png" },
  { key: "proj-lance", src: "/sprites/proj-lance.png" },
  { key: "tile-moss", src: "/tiles/grass.png" },
  { key: "tile-marsh", src: "/tiles/marsh.png" },
  { key: "tile-dusk", src: "/tiles/dusk.png" },
  { key: "tile-path", src: "/tiles/path.png" },
];

const images = new Map<string, HTMLImageElement>();
let loaded = false;

export function loadSprites(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (typeof window === "undefined") return Promise.resolve();
  return Promise.all(
    ASSETS.map(
      (asset) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            images.set(asset.key, img);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = asset.src;
        }),
    ),
  ).then(() => {
    loaded = true;
  });
}

export function sprite(key: string): HTMLImageElement | null {
  return images.get(key) ?? null;
}

export function spritesReady(): boolean {
  return loaded;
}
