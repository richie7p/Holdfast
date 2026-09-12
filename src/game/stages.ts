import type { EnemyKind, GroundKind, WaveDef } from "./types";

export interface MapPalette {
  grassA: string;
  grassB: string;
  grassC: string;
  pathEdge: string;
  pathFill: string;
  pathHigh: string;
  rock: string;
  moss: string;
  accent: string;
  ground: GroundKind;
}

export type StageDiff = "練習" | "進階" | "精銳" | "終局";

export interface StageDef {
  id: string;
  name: string;
  blurb: string;
  chapter: string;
  difficulty: StageDiff;
  startGold: number;
  startLives: number;
  prep: number;
  hpMul: number;
  path: Array<[number, number]>;
  blocked: Array<[number, number]>;
  waves: WaveDef[];
  palette: MapPalette;
}

function line(a: [number, number], b: [number, number]): Array<[number, number]> {
  const cells: Array<[number, number]> = [];
  let [x, y] = a;
  cells.push([x, y]);
  while (x !== b[0] || y !== b[1]) {
    if (x !== b[0]) x += Math.sign(b[0] - x);
    else y += Math.sign(b[1] - y);
    cells.push([x, y]);
  }
  return cells;
}

function path(...corners: Array<[number, number]>): Array<[number, number]> {
  const cells: Array<[number, number]> = [];
  for (let i = 0; i < corners.length - 1; i++) {
    const seg = line(corners[i]!, corners[i + 1]!);
    if (i > 0) seg.shift();
    cells.push(...seg);
  }
  return cells;
}

function w(...groups: Array<[EnemyKind, number, number, number?]>): WaveDef {
  return {
    groups: groups.map(([kind, count, interval, start = 0]) => ({ kind, count, interval, start })),
  };
}

const MOSS: MapPalette = {
  grassA: "#141c16",
  grassB: "#1a241c",
  grassC: "#101610",
  pathEdge: "#2e2820",
  pathFill: "#3d342a",
  pathHigh: "#4a4034",
  rock: "#2a322c",
  moss: "#3d4f3e",
  accent: "#9aaf9c",
  ground: "moss",
};

const FOLD: MapPalette = {
  grassA: "#14181c",
  grassB: "#1a2026",
  grassC: "#101418",
  pathEdge: "#2a2c30",
  pathFill: "#3a3e44",
  pathHigh: "#4c5258",
  rock: "#2c3438",
  moss: "#3a4a52",
  accent: "#8aa0a8",
  ground: "moss",
};

const MARSH: MapPalette = {
  grassA: "#101816",
  grassB: "#15221e",
  grassC: "#0c1210",
  pathEdge: "#24302c",
  pathFill: "#2e3c38",
  pathHigh: "#3e5048",
  rock: "#243430",
  moss: "#2f4a44",
  accent: "#7aa090",
  ground: "marsh",
};

const THORN: MapPalette = {
  grassA: "#121610",
  grassB: "#1a1e16",
  grassC: "#0c100c",
  pathEdge: "#2a2820",
  pathFill: "#38342a",
  pathHigh: "#484438",
  rock: "#262820",
  moss: "#3a4230",
  accent: "#8a9878",
  ground: "moss",
};

const KEEP: MapPalette = {
  grassA: "#1a1612",
  grassB: "#221c16",
  grassC: "#12100e",
  pathEdge: "#3a3028",
  pathFill: "#4a3c32",
  pathHigh: "#5c4c40",
  rock: "#322824",
  moss: "#4a3e34",
  accent: "#c9c3b0",
  ground: "dusk",
};

const DUSK: MapPalette = {
  grassA: "#161210",
  grassB: "#1e1814",
  grassC: "#100c0a",
  pathEdge: "#3a2c24",
  pathFill: "#4a382c",
  pathHigh: "#5c4838",
  rock: "#2c201c",
  moss: "#3e3028",
  accent: "#c4b49a",
  ground: "dusk",
};

export const STAGES: StageDef[] = [
  {
    id: "moss",
    name: "苔徑",
    blurb: "開闊土路，適合練習佈陣。",
    chapter: "外圍",
    difficulty: "練習",
    startGold: 180,
    startLives: 20,
    prep: 12,
    hpMul: 1,
    path: path([0, 2], [10, 2], [10, 5], [3, 5], [3, 7], [13, 7]),
    blocked: [
      [1, 0],
      [6, 0],
      [12, 0],
      [13, 3],
      [0, 5],
      [7, 4],
      [5, 8],
      [11, 9],
      [13, 9],
      [8, 9],
    ],
    waves: [
      w(["grunt", 8, 0.85]),
      w(["grunt", 12, 0.7]),
      w(["grunt", 6, 0.75], ["runner", 8, 0.55, 1.2]),
      w(["runner", 14, 0.48]),
      w(["grunt", 8, 0.6], ["armored", 5, 1.1, 1.4]),
      w(["grunt", 10, 0.55], ["brute", 1, 0, 3.2]),
      w(["armored", 8, 0.9], ["runner", 10, 0.5, 1]),
      w(["armored", 8, 0.7], ["runner", 12, 0.4, 1], ["brute", 1, 0, 5]),
    ],
    palette: MOSS,
  },
  {
    id: "fold",
    name: "折谷",
    blurb: "狹窄折路，死角多、空地少。",
    chapter: "外圍",
    difficulty: "進階",
    startGold: 200,
    startLives: 16,
    prep: 10,
    hpMul: 1.12,
    path: path([0, 1], [8, 1], [8, 4], [2, 4], [2, 8], [10, 8], [10, 5], [13, 5]),
    blocked: [
      [1, 0],
      [4, 0],
      [6, 2],
      [4, 2],
      [5, 6],
      [7, 6],
      [12, 2],
      [12, 8],
      [0, 7],
      [13, 8],
      [4, 6],
      [11, 3],
    ],
    waves: [
      w(["grunt", 10, 0.7]),
      w(["grunt", 8, 0.65], ["runner", 8, 0.5, 1]),
      w(["runner", 16, 0.42]),
      w(["armored", 6, 0.95], ["grunt", 8, 0.55, 1.2]),
      w(["runner", 12, 0.4], ["armored", 6, 0.8, 2]),
      w(["grunt", 10, 0.5], ["brute", 1, 0, 3]),
      w(["armored", 10, 0.7], ["runner", 12, 0.38, 1.4]),
      w(["armored", 8, 0.65], ["runner", 14, 0.36, 0.8], ["grunt", 8, 0.45, 2]),
      w(["armored", 10, 0.55], ["brute", 1, 0, 4], ["runner", 12, 0.34, 1]),
      w(["armored", 12, 0.5], ["runner", 16, 0.32, 1], ["brute", 2, 4, 3.5]),
    ],
    palette: FOLD,
  },
  {
    id: "marsh",
    name: "濕沼",
    blurb: "彎曲泥路。群蟲開始成簇湧出。",
    chapter: "外圍",
    difficulty: "進階",
    startGold: 210,
    startLives: 16,
    prep: 10,
    hpMul: 1.18,
    path: path([0, 4], [5, 4], [5, 1], [11, 1], [11, 6], [3, 6], [3, 9], [13, 9]),
    blocked: [
      [1, 0],
      [7, 0],
      [13, 0],
      [0, 2],
      [2, 2],
      [8, 3],
      [13, 3],
      [1, 7],
      [7, 8],
      [9, 4],
      [6, 8],
      [12, 7],
    ],
    waves: [
      w(["grunt", 10, 0.65], ["swarm", 8, 0.35, 1.4]),
      w(["runner", 10, 0.48], ["swarm", 12, 0.28, 0.8]),
      w(["grunt", 8, 0.55], ["armored", 5, 1, 1.2]),
      w(["swarm", 20, 0.26], ["runner", 8, 0.45, 1.5]),
      w(["armored", 8, 0.8], ["swarm", 14, 0.3, 1]),
      w(["grunt", 10, 0.5], ["brute", 1, 0, 3], ["swarm", 10, 0.28, 1.6]),
      w(["armored", 8, 0.7], ["runner", 12, 0.38, 1], ["swarm", 12, 0.26, 2]),
      w(["swarm", 24, 0.22], ["armored", 8, 0.7, 2]),
      w(["armored", 10, 0.6], ["runner", 12, 0.34, 1], ["brute", 1, 0, 5]),
      w(["swarm", 22, 0.2], ["armored", 10, 0.55, 1.2], ["brute", 1, 0, 6]),
    ],
    palette: MARSH,
  },
  {
    id: "thorn",
    name: "棘林",
    blurb: "密林夾道，可放塔的格子很少。",
    chapter: "深處",
    difficulty: "精銳",
    startGold: 230,
    startLives: 14,
    prep: 9,
    hpMul: 1.28,
    path: path([0, 0], [11, 0], [11, 3], [2, 3], [2, 6], [12, 6], [12, 9], [13, 9]),
    blocked: [
      [4, 1],
      [6, 1],
      [8, 1],
      [13, 1],
      [0, 2],
      [5, 2],
      [8, 2],
      [13, 2],
      [4, 4],
      [6, 4],
      [8, 4],
      [10, 4],
      [0, 5],
      [5, 5],
      [9, 5],
      [4, 7],
      [7, 7],
      [10, 7],
      [1, 8],
      [6, 8],
      [9, 8],
      [3, 9],
      [8, 9],
    ],
    waves: [
      w(["grunt", 12, 0.55], ["runner", 8, 0.42, 1]),
      w(["swarm", 16, 0.28], ["runner", 10, 0.4, 1.2]),
      w(["armored", 8, 0.75], ["grunt", 10, 0.5, 1]),
      w(["runner", 16, 0.34], ["swarm", 14, 0.24, 0.8]),
      w(["armored", 10, 0.65], ["swarm", 16, 0.24, 1.4]),
      w(["grunt", 10, 0.45], ["brute", 1, 0, 2.8], ["runner", 10, 0.36, 1]),
      w(["armored", 10, 0.58], ["runner", 14, 0.32, 1], ["swarm", 12, 0.22, 2]),
      w(["swarm", 26, 0.2], ["armored", 8, 0.55, 1.5]),
      w(["armored", 12, 0.5], ["runner", 14, 0.3, 1], ["brute", 1, 0, 4.5]),
      w(["swarm", 20, 0.18], ["armored", 10, 0.5, 1], ["runner", 12, 0.3, 2]),
      w(["armored", 12, 0.48], ["swarm", 22, 0.18, 0.8], ["brute", 2, 5, 3.5]),
    ],
    palette: THORN,
  },
  {
    id: "keep",
    name: "殘門",
    blurb: "環城長路，蟲潮幾乎不斷。",
    chapter: "深處",
    difficulty: "精銳",
    startGold: 240,
    startLives: 14,
    prep: 9,
    hpMul: 1.35,
    path: path([0, 5], [6, 5], [6, 1], [12, 1], [12, 8], [2, 8], [2, 6], [9, 6], [9, 3], [13, 3]),
    blocked: [
      [0, 0],
      [3, 0],
      [8, 0],
      [1, 2],
      [4, 3],
      [8, 4],
      [4, 7],
      [7, 7],
      [10, 4],
      [13, 6],
      [13, 9],
      [0, 9],
      [5, 9],
    ],
    waves: [
      w(["grunt", 10, 0.55], ["runner", 10, 0.42, 1]),
      w(["runner", 18, 0.34], ["swarm", 12, 0.24, 1.2]),
      w(["armored", 8, 0.7], ["grunt", 10, 0.48, 1.2]),
      w(["swarm", 20, 0.22], ["armored", 6, 0.7, 2]),
      w(["grunt", 12, 0.42], ["brute", 1, 0, 3], ["swarm", 10, 0.24, 1.4]),
      w(["armored", 10, 0.58], ["runner", 14, 0.32, 1]),
      w(["armored", 8, 0.55], ["runner", 12, 0.32, 0.8], ["swarm", 14, 0.22, 2]),
      w(["armored", 12, 0.5], ["brute", 1, 0, 4.5], ["runner", 14, 0.3, 1.2]),
      w(["runner", 20, 0.28], ["armored", 10, 0.5, 2], ["swarm", 16, 0.2, 0.6]),
      w(["armored", 12, 0.48], ["runner", 16, 0.28, 1], ["grunt", 10, 0.36, 2.5]),
      w(["armored", 10, 0.48], ["brute", 2, 4, 3], ["runner", 14, 0.28, 1]),
      w(["armored", 14, 0.42], ["runner", 18, 0.26, 0.8], ["swarm", 18, 0.18, 1.6], ["brute", 2, 5, 4]),
    ],
    palette: KEEP,
  },
  {
    id: "dusk",
    name: "暮堡",
    blurb: "終局。巨獸成對，群蟲不斷。",
    chapter: "深處",
    difficulty: "終局",
    startGold: 260,
    startLives: 12,
    prep: 8,
    hpMul: 1.48,
    path: path([0, 8], [2, 8], [2, 1], [8, 1], [8, 8], [5, 8], [5, 4], [12, 4], [12, 2], [13, 2]),
    blocked: [
      [0, 0],
      [4, 0],
      [10, 0],
      [13, 0],
      [0, 3],
      [4, 2],
      [10, 1],
      [13, 5],
      [0, 6],
      [3, 5],
      [7, 5],
      [10, 6],
      [1, 9],
      [6, 9],
      [10, 9],
      [13, 8],
      [13, 9],
    ],
    waves: [
      w(["runner", 14, 0.38], ["swarm", 14, 0.24, 0.8]),
      w(["armored", 8, 0.65], ["grunt", 12, 0.42, 1]),
      w(["swarm", 24, 0.2], ["runner", 12, 0.32, 1.4]),
      w(["armored", 10, 0.55], ["swarm", 16, 0.2, 1], ["brute", 1, 0, 4]),
      w(["runner", 16, 0.3], ["armored", 8, 0.55, 1.6], ["swarm", 14, 0.2, 0.5]),
      w(["grunt", 12, 0.4], ["brute", 1, 0, 2.5], ["runner", 12, 0.3, 1.2]),
      w(["armored", 12, 0.48], ["swarm", 20, 0.18, 1], ["runner", 12, 0.28, 2]),
      w(["brute", 2, 3.5, 0], ["armored", 10, 0.5, 1.2], ["swarm", 16, 0.18, 0.6]),
      w(["runner", 20, 0.26], ["armored", 12, 0.45, 1.5], ["swarm", 18, 0.16, 0.4]),
      w(["armored", 12, 0.42], ["brute", 2, 4, 2], ["runner", 14, 0.26, 1]),
      w(["swarm", 28, 0.16], ["armored", 12, 0.42, 1.2], ["grunt", 12, 0.32, 2.4]),
      w(["armored", 14, 0.4], ["runner", 16, 0.24, 0.8], ["brute", 2, 5, 3]),
      w(["swarm", 24, 0.15], ["armored", 12, 0.4, 1], ["runner", 16, 0.24, 2], ["brute", 1, 0, 6]),
      w(["armored", 16, 0.36], ["swarm", 26, 0.14, 0.6], ["runner", 18, 0.22, 1.4], ["brute", 3, 4.5, 2.5]),
    ],
    palette: DUSK,
  },
];

export function stageById(id: string): StageDef {
  return STAGES.find((s) => s.id === id) ?? STAGES[0]!;
}
