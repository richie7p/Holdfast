import { i as __toESM } from "../_runtime.mjs";
import { L as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Star, c as Lock, d as Coins, i as Swords, l as Landmark, n as Volume2, o as Play, s as Pause, t as VolumeX, u as Heart } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Do38fV31.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ctx = null;
var master = null;
var sfx = null;
var music = null;
var muted = false;
var unlocked = false;
var noiseBuffer = null;
var padOsc = null;
var padGain = null;
function ensure() {
	if (typeof window === "undefined") return null;
	if (!ctx) {
		const AC = window.AudioContext || window.webkitAudioContext;
		if (!AC) return null;
		ctx = new AC({ latencyHint: "interactive" });
		master = ctx.createGain();
		sfx = ctx.createGain();
		music = ctx.createGain();
		sfx.gain.value = .7;
		music.gain.value = .18;
		master.gain.value = muted ? 0 : .9;
		sfx.connect(master);
		music.connect(master);
		master.connect(ctx.destination);
		noiseBuffer = makeNoise(ctx);
	}
	return ctx;
}
function makeNoise(ac) {
	const buffer = ac.createBuffer(1, ac.sampleRate * .4, ac.sampleRate);
	const data = buffer.getChannelData(0);
	for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
	return buffer;
}
function unlockAudio() {
	const ac = ensure();
	if (!ac) return;
	if (ac.state === "suspended") ac.resume();
	unlocked = true;
	startPad();
}
function resumeAudio() {
	if (ctx && ctx.state === "suspended") ctx.resume();
}
function setMuted(next) {
	muted = next;
	if (master && ctx) master.gain.setTargetAtTime(next ? 0 : .9, ctx.currentTime, .02);
}
function isMuted() {
	return muted;
}
function bus(name) {
	if (name === "sfx") return sfx;
	if (name === "music") return music;
	return master;
}
function tone(opts) {
	const ac = ctx;
	const dest = bus(opts.dest ?? "sfx");
	if (!ac || !dest || !unlocked) return;
	const t = ac.currentTime + (opts.delay ?? 0);
	const osc = ac.createOscillator();
	const g = ac.createGain();
	osc.type = opts.type ?? "triangle";
	osc.frequency.setValueAtTime(opts.freq, t);
	if (opts.freqEnd) osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.freqEnd), t + opts.dur);
	const vol = opts.vol ?? .12;
	g.gain.setValueAtTime(vol, t);
	g.gain.exponentialRampToValueAtTime(.001, t + opts.dur);
	osc.connect(g);
	g.connect(dest);
	osc.start(t);
	osc.stop(t + opts.dur + .02);
}
function noise(opts) {
	const ac = ctx;
	if (!ac || !sfx || !noiseBuffer || !unlocked) return;
	const t = ac.currentTime + (opts.delay ?? 0);
	const src = ac.createBufferSource();
	src.buffer = noiseBuffer;
	const g = ac.createGain();
	const filter = ac.createBiquadFilter();
	filter.type = "lowpass";
	filter.frequency.setValueAtTime(1800, t);
	filter.frequency.exponentialRampToValueAtTime(400, t + opts.dur);
	g.gain.setValueAtTime(opts.vol ?? .16, t);
	g.gain.exponentialRampToValueAtTime(.001, t + opts.dur);
	src.connect(filter);
	filter.connect(g);
	g.connect(sfx);
	src.start(t);
	src.stop(t + opts.dur + .02);
}
function startPad() {
	const ac = ctx;
	if (!ac || !music || padOsc) return;
	padOsc = ac.createOscillator();
	padGain = ac.createGain();
	const filter = ac.createBiquadFilter();
	padOsc.type = "sine";
	padOsc.frequency.value = 55;
	filter.type = "lowpass";
	filter.frequency.value = 240;
	padGain.gain.value = 1e-4;
	padOsc.connect(filter);
	filter.connect(padGain);
	padGain.connect(music);
	padOsc.start();
	padGain.gain.setTargetAtTime(.35, ac.currentTime, .8);
}
var sfxPlay = {
	click() {
		tone({
			freq: 520,
			dur: .05,
			type: "sine",
			vol: .06
		});
	},
	place() {
		tone({
			freq: 180,
			freqEnd: 90,
			dur: .14,
			type: "triangle",
			vol: .16
		});
		noise({
			dur: .08,
			vol: .08
		});
	},
	sell() {
		tone({
			freq: 240,
			freqEnd: 140,
			dur: .12,
			type: "sine",
			vol: .1
		});
	},
	upgrade() {
		tone({
			freq: 420,
			dur: .08,
			type: "sine",
			vol: .08
		});
		tone({
			freq: 640,
			dur: .1,
			type: "sine",
			vol: .07,
			delay: .06
		});
	},
	shootBolt() {
		tone({
			freq: 760 + Math.random() * 80,
			freqEnd: 420,
			dur: .07,
			type: "square",
			vol: .045
		});
	},
	shootMortar() {
		tone({
			freq: 110,
			freqEnd: 70,
			dur: .16,
			type: "sine",
			vol: .14
		});
		noise({
			dur: .08,
			vol: .07
		});
	},
	shootFrost() {
		tone({
			freq: 620,
			freqEnd: 980,
			dur: .1,
			type: "sine",
			vol: .07
		});
	},
	shootLance() {
		tone({
			freq: 980,
			freqEnd: 520,
			dur: .09,
			type: "sawtooth",
			vol: .05
		});
		tone({
			freq: 1480,
			freqEnd: 880,
			dur: .07,
			type: "sine",
			vol: .04
		});
	},
	hit() {
		noise({
			dur: .05,
			vol: .05 + Math.random() * .03
		});
	},
	death() {
		noise({
			dur: .12,
			vol: .12
		});
		tone({
			freq: 180,
			freqEnd: 70,
			dur: .16,
			type: "sawtooth",
			vol: .05
		});
	},
	leak() {
		tone({
			freq: 220,
			freqEnd: 90,
			dur: .35,
			type: "sawtooth",
			vol: .12
		});
		tone({
			freq: 160,
			freqEnd: 70,
			dur: .4,
			type: "triangle",
			vol: .08,
			delay: .05
		});
	},
	wave() {
		tone({
			freq: 196,
			dur: .18,
			type: "triangle",
			vol: .1
		});
		tone({
			freq: 247,
			dur: .22,
			type: "triangle",
			vol: .08,
			delay: .12
		});
	},
	win() {
		tone({
			freq: 262,
			dur: .18,
			type: "sine",
			vol: .1
		});
		tone({
			freq: 330,
			dur: .18,
			type: "sine",
			vol: .09,
			delay: .12
		});
		tone({
			freq: 392,
			dur: .28,
			type: "sine",
			vol: .1,
			delay: .24
		});
		tone({
			freq: 523,
			dur: .4,
			type: "sine",
			vol: .09,
			delay: .4
		});
	},
	lose() {
		tone({
			freq: 196,
			freqEnd: 110,
			dur: .45,
			type: "triangle",
			vol: .12
		});
		tone({
			freq: 147,
			freqEnd: 80,
			dur: .55,
			type: "sine",
			vol: .1,
			delay: .12
		});
	}
};
var SELL_RATIO = .6;
var STEP = 1 / 60;
var UPGRADE_COST = [
	55,
	85,
	130
];
var DAMAGE_PER_RANK = .4;
var RATE_PER_RANK = .28;
var TOWERS = {
	bolt: {
		kind: "bolt",
		name: "迅矢",
		blurb: "廉價連射，單點優先清線。",
		cost: 80,
		range: 2.55,
		fireRate: 1.75,
		damage: 13,
		splash: 0,
		slowFactor: 0,
		slowDuration: 0,
		projectileSpeed: 430,
		pierce: 0,
		color: "#8ea089",
		accent: "#d5ddd0"
	},
	frost: {
		kind: "frost",
		name: "霜縛",
		blurb: "降速控場，拖住突襲。",
		cost: 115,
		range: 2.25,
		fireRate: 1.1,
		damage: 8,
		splash: 0,
		slowFactor: .45,
		slowDuration: 1.8,
		projectileSpeed: 340,
		pierce: 0,
		color: "#6e8b96",
		accent: "#c5e0e8"
	},
	mortar: {
		kind: "mortar",
		name: "崩砲",
		blurb: "慢速濺射，專門打堆。",
		cost: 165,
		range: 3.35,
		fireRate: .5,
		damage: 38,
		splash: 1.2,
		slowFactor: 0,
		slowDuration: 0,
		projectileSpeed: 210,
		pierce: 0,
		color: "#7a6a58",
		accent: "#c4b49a"
	},
	lance: {
		kind: "lance",
		name: "裂光",
		blurb: "遠距穿刺，專剋重甲。",
		cost: 190,
		range: 4.2,
		fireRate: .62,
		damage: 52,
		splash: 0,
		slowFactor: 0,
		slowDuration: 0,
		projectileSpeed: 560,
		pierce: .85,
		color: "#b8b4a4",
		accent: "#ece8d8"
	}
};
var ENEMIES = {
	grunt: {
		kind: "grunt",
		name: "甲蟲",
		hp: 34,
		speed: 54,
		gold: 9,
		armor: 0,
		radius: 11,
		lives: 1
	},
	runner: {
		kind: "runner",
		name: "疾足",
		hp: 20,
		speed: 98,
		gold: 11,
		armor: 0,
		radius: 9,
		lives: 1
	},
	armored: {
		kind: "armored",
		name: "重甲",
		hp: 110,
		speed: 40,
		gold: 18,
		armor: .38,
		radius: 13,
		lives: 1
	},
	swarm: {
		kind: "swarm",
		name: "群蟲",
		hp: 11,
		speed: 124,
		gold: 6,
		armor: 0,
		radius: 7,
		lives: 1
	},
	brute: {
		kind: "brute",
		name: "巨獸",
		hp: 780,
		speed: 30,
		gold: 90,
		armor: .18,
		radius: 20,
		lives: 3
	}
};
var POLICY_LABEL = {
	first: "最先",
	last: "最後",
	strongest: "最強",
	closest: "最近"
};
var ENEMY_LABEL = {
	grunt: "甲蟲",
	runner: "疾足",
	armored: "重甲",
	swarm: "群蟲",
	brute: "巨獸"
};
function hpScale(waveIndex, mul = 1) {
	return (1 + waveIndex * .14) * mul;
}
function goldScale(waveIndex) {
	return 1 + waveIndex * .04;
}
function earlyCallBonus(waveIndex) {
	return 10 + waveIndex * 2;
}
function towerStats(kind, damageRank, rateRank) {
	const def = TOWERS[kind];
	return {
		damage: def.damage * (1 + damageRank * DAMAGE_PER_RANK),
		fireRate: def.fireRate * (1 + rateRank * RATE_PER_RANK),
		range: def.range,
		splash: def.splash,
		slowFactor: def.slowFactor,
		slowDuration: def.slowDuration,
		pierce: def.pierce
	};
}
function investedCost(kind, damageRank, rateRank) {
	let total = TOWERS[kind].cost;
	for (let i = 0; i < damageRank; i++) total += UPGRADE_COST[i] ?? 0;
	for (let i = 0; i < rateRank; i++) total += UPGRADE_COST[i] ?? 0;
	return total;
}
function sellValue(kind, damageRank, rateRank) {
	return Math.floor(investedCost(kind, damageRank, rateRank) * SELL_RATIO);
}
function waveHint(wave) {
	if (!wave) return "";
	const counts = {};
	for (const g of wave.groups) counts[g.kind] = (counts[g.kind] ?? 0) + g.count;
	return [
		"grunt",
		"runner",
		"swarm",
		"armored",
		"brute"
	].filter((k) => counts[k]).map((k) => `${ENEMY_LABEL[k]} ${counts[k]}`).join(" · ");
}
function line(a, b) {
	const cells = [];
	let [x, y] = a;
	cells.push([x, y]);
	while (x !== b[0] || y !== b[1]) {
		if (x !== b[0]) x += Math.sign(b[0] - x);
		else y += Math.sign(b[1] - y);
		cells.push([x, y]);
	}
	return cells;
}
function path(...corners) {
	const cells = [];
	for (let i = 0; i < corners.length - 1; i++) {
		const seg = line(corners[i], corners[i + 1]);
		if (i > 0) seg.shift();
		cells.push(...seg);
	}
	return cells;
}
function w(...groups) {
	return { groups: groups.map(([kind, count, interval, start = 0]) => ({
		kind,
		count,
		interval,
		start
	})) };
}
var STAGES = [
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
			[8, 9]
		],
		waves: [
			w([
				"grunt",
				8,
				.85
			]),
			w([
				"grunt",
				12,
				.7
			]),
			w([
				"grunt",
				6,
				.75
			], [
				"runner",
				8,
				.55,
				1.2
			]),
			w([
				"runner",
				14,
				.48
			]),
			w([
				"grunt",
				8,
				.6
			], [
				"armored",
				5,
				1.1,
				1.4
			]),
			w([
				"grunt",
				10,
				.55
			], [
				"brute",
				1,
				0,
				3.2
			]),
			w([
				"armored",
				8,
				.9
			], [
				"runner",
				10,
				.5,
				1
			]),
			w([
				"armored",
				8,
				.7
			], [
				"runner",
				12,
				.4,
				1
			], [
				"brute",
				1,
				0,
				5
			])
		],
		palette: {
			grassA: "#141c16",
			grassB: "#1a241c",
			grassC: "#101610",
			pathEdge: "#2e2820",
			pathFill: "#3d342a",
			pathHigh: "#4a4034",
			rock: "#2a322c",
			moss: "#3d4f3e",
			accent: "#9aaf9c",
			ground: "moss"
		}
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
			[11, 3]
		],
		waves: [
			w([
				"grunt",
				10,
				.7
			]),
			w([
				"grunt",
				8,
				.65
			], [
				"runner",
				8,
				.5,
				1
			]),
			w([
				"runner",
				16,
				.42
			]),
			w([
				"armored",
				6,
				.95
			], [
				"grunt",
				8,
				.55,
				1.2
			]),
			w([
				"runner",
				12,
				.4
			], [
				"armored",
				6,
				.8,
				2
			]),
			w([
				"grunt",
				10,
				.5
			], [
				"brute",
				1,
				0,
				3
			]),
			w([
				"armored",
				10,
				.7
			], [
				"runner",
				12,
				.38,
				1.4
			]),
			w([
				"armored",
				8,
				.65
			], [
				"runner",
				14,
				.36,
				.8
			], [
				"grunt",
				8,
				.45,
				2
			]),
			w([
				"armored",
				10,
				.55
			], [
				"brute",
				1,
				0,
				4
			], [
				"runner",
				12,
				.34,
				1
			]),
			w([
				"armored",
				12,
				.5
			], [
				"runner",
				16,
				.32,
				1
			], [
				"brute",
				2,
				4,
				3.5
			])
		],
		palette: {
			grassA: "#14181c",
			grassB: "#1a2026",
			grassC: "#101418",
			pathEdge: "#2a2c30",
			pathFill: "#3a3e44",
			pathHigh: "#4c5258",
			rock: "#2c3438",
			moss: "#3a4a52",
			accent: "#8aa0a8",
			ground: "moss"
		}
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
			[12, 7]
		],
		waves: [
			w([
				"grunt",
				10,
				.65
			], [
				"swarm",
				8,
				.35,
				1.4
			]),
			w([
				"runner",
				10,
				.48
			], [
				"swarm",
				12,
				.28,
				.8
			]),
			w([
				"grunt",
				8,
				.55
			], [
				"armored",
				5,
				1,
				1.2
			]),
			w([
				"swarm",
				20,
				.26
			], [
				"runner",
				8,
				.45,
				1.5
			]),
			w([
				"armored",
				8,
				.8
			], [
				"swarm",
				14,
				.3,
				1
			]),
			w([
				"grunt",
				10,
				.5
			], [
				"brute",
				1,
				0,
				3
			], [
				"swarm",
				10,
				.28,
				1.6
			]),
			w([
				"armored",
				8,
				.7
			], [
				"runner",
				12,
				.38,
				1
			], [
				"swarm",
				12,
				.26,
				2
			]),
			w([
				"swarm",
				24,
				.22
			], [
				"armored",
				8,
				.7,
				2
			]),
			w([
				"armored",
				10,
				.6
			], [
				"runner",
				12,
				.34,
				1
			], [
				"brute",
				1,
				0,
				5
			]),
			w([
				"swarm",
				22,
				.2
			], [
				"armored",
				10,
				.55,
				1.2
			], [
				"brute",
				1,
				0,
				6
			])
		],
		palette: {
			grassA: "#101816",
			grassB: "#15221e",
			grassC: "#0c1210",
			pathEdge: "#24302c",
			pathFill: "#2e3c38",
			pathHigh: "#3e5048",
			rock: "#243430",
			moss: "#2f4a44",
			accent: "#7aa090",
			ground: "marsh"
		}
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
			[8, 9]
		],
		waves: [
			w([
				"grunt",
				12,
				.55
			], [
				"runner",
				8,
				.42,
				1
			]),
			w([
				"swarm",
				16,
				.28
			], [
				"runner",
				10,
				.4,
				1.2
			]),
			w([
				"armored",
				8,
				.75
			], [
				"grunt",
				10,
				.5,
				1
			]),
			w([
				"runner",
				16,
				.34
			], [
				"swarm",
				14,
				.24,
				.8
			]),
			w([
				"armored",
				10,
				.65
			], [
				"swarm",
				16,
				.24,
				1.4
			]),
			w([
				"grunt",
				10,
				.45
			], [
				"brute",
				1,
				0,
				2.8
			], [
				"runner",
				10,
				.36,
				1
			]),
			w([
				"armored",
				10,
				.58
			], [
				"runner",
				14,
				.32,
				1
			], [
				"swarm",
				12,
				.22,
				2
			]),
			w([
				"swarm",
				26,
				.2
			], [
				"armored",
				8,
				.55,
				1.5
			]),
			w([
				"armored",
				12,
				.5
			], [
				"runner",
				14,
				.3,
				1
			], [
				"brute",
				1,
				0,
				4.5
			]),
			w([
				"swarm",
				20,
				.18
			], [
				"armored",
				10,
				.5,
				1
			], [
				"runner",
				12,
				.3,
				2
			]),
			w([
				"armored",
				12,
				.48
			], [
				"swarm",
				22,
				.18,
				.8
			], [
				"brute",
				2,
				5,
				3.5
			])
		],
		palette: {
			grassA: "#121610",
			grassB: "#1a1e16",
			grassC: "#0c100c",
			pathEdge: "#2a2820",
			pathFill: "#38342a",
			pathHigh: "#484438",
			rock: "#262820",
			moss: "#3a4230",
			accent: "#8a9878",
			ground: "moss"
		}
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
			[5, 9]
		],
		waves: [
			w([
				"grunt",
				10,
				.55
			], [
				"runner",
				10,
				.42,
				1
			]),
			w([
				"runner",
				18,
				.34
			], [
				"swarm",
				12,
				.24,
				1.2
			]),
			w([
				"armored",
				8,
				.7
			], [
				"grunt",
				10,
				.48,
				1.2
			]),
			w([
				"swarm",
				20,
				.22
			], [
				"armored",
				6,
				.7,
				2
			]),
			w([
				"grunt",
				12,
				.42
			], [
				"brute",
				1,
				0,
				3
			], [
				"swarm",
				10,
				.24,
				1.4
			]),
			w([
				"armored",
				10,
				.58
			], [
				"runner",
				14,
				.32,
				1
			]),
			w([
				"armored",
				8,
				.55
			], [
				"runner",
				12,
				.32,
				.8
			], [
				"swarm",
				14,
				.22,
				2
			]),
			w([
				"armored",
				12,
				.5
			], [
				"brute",
				1,
				0,
				4.5
			], [
				"runner",
				14,
				.3,
				1.2
			]),
			w([
				"runner",
				20,
				.28
			], [
				"armored",
				10,
				.5,
				2
			], [
				"swarm",
				16,
				.2,
				.6
			]),
			w([
				"armored",
				12,
				.48
			], [
				"runner",
				16,
				.28,
				1
			], [
				"grunt",
				10,
				.36,
				2.5
			]),
			w([
				"armored",
				10,
				.48
			], [
				"brute",
				2,
				4,
				3
			], [
				"runner",
				14,
				.28,
				1
			]),
			w([
				"armored",
				14,
				.42
			], [
				"runner",
				18,
				.26,
				.8
			], [
				"swarm",
				18,
				.18,
				1.6
			], [
				"brute",
				2,
				5,
				4
			])
		],
		palette: {
			grassA: "#1a1612",
			grassB: "#221c16",
			grassC: "#12100e",
			pathEdge: "#3a3028",
			pathFill: "#4a3c32",
			pathHigh: "#5c4c40",
			rock: "#322824",
			moss: "#4a3e34",
			accent: "#c9c3b0",
			ground: "dusk"
		}
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
			[13, 9]
		],
		waves: [
			w([
				"runner",
				14,
				.38
			], [
				"swarm",
				14,
				.24,
				.8
			]),
			w([
				"armored",
				8,
				.65
			], [
				"grunt",
				12,
				.42,
				1
			]),
			w([
				"swarm",
				24,
				.2
			], [
				"runner",
				12,
				.32,
				1.4
			]),
			w([
				"armored",
				10,
				.55
			], [
				"swarm",
				16,
				.2,
				1
			], [
				"brute",
				1,
				0,
				4
			]),
			w([
				"runner",
				16,
				.3
			], [
				"armored",
				8,
				.55,
				1.6
			], [
				"swarm",
				14,
				.2,
				.5
			]),
			w([
				"grunt",
				12,
				.4
			], [
				"brute",
				1,
				0,
				2.5
			], [
				"runner",
				12,
				.3,
				1.2
			]),
			w([
				"armored",
				12,
				.48
			], [
				"swarm",
				20,
				.18,
				1
			], [
				"runner",
				12,
				.28,
				2
			]),
			w([
				"brute",
				2,
				3.5,
				0
			], [
				"armored",
				10,
				.5,
				1.2
			], [
				"swarm",
				16,
				.18,
				.6
			]),
			w([
				"runner",
				20,
				.26
			], [
				"armored",
				12,
				.45,
				1.5
			], [
				"swarm",
				18,
				.16,
				.4
			]),
			w([
				"armored",
				12,
				.42
			], [
				"brute",
				2,
				4,
				2
			], [
				"runner",
				14,
				.26,
				1
			]),
			w([
				"swarm",
				28,
				.16
			], [
				"armored",
				12,
				.42,
				1.2
			], [
				"grunt",
				12,
				.32,
				2.4
			]),
			w([
				"armored",
				14,
				.4
			], [
				"runner",
				16,
				.24,
				.8
			], [
				"brute",
				2,
				5,
				3
			]),
			w([
				"swarm",
				24,
				.15
			], [
				"armored",
				12,
				.4,
				1
			], [
				"runner",
				16,
				.24,
				2
			], [
				"brute",
				1,
				0,
				6
			]),
			w([
				"armored",
				16,
				.36
			], [
				"swarm",
				26,
				.14,
				.6
			], [
				"runner",
				18,
				.22,
				1.4
			], [
				"brute",
				3,
				4.5,
				2.5
			])
		],
		palette: {
			grassA: "#161210",
			grassB: "#1e1814",
			grassC: "#100c0a",
			pathEdge: "#3a2c24",
			pathFill: "#4a382c",
			pathHigh: "#5c4838",
			rock: "#2c201c",
			moss: "#3e3028",
			accent: "#c4b49a",
			ground: "dusk"
		}
	}
];
var PATH_SET = /* @__PURE__ */ new Set();
var BLOCKED_SET = /* @__PURE__ */ new Set();
var WAYPOINTS = [];
var PATH_LENGTH = 1;
var SEGMENT_LEN = [];
function applyStage(stage) {
	PATH_SET = new Set(stage.path.map(([c, r]) => `${c},${r}`));
	BLOCKED_SET = new Set(stage.blocked.map(([c, r]) => `${c},${r}`));
	WAYPOINTS = stage.path.map(([c, r]) => ({
		x: c * 48 + 24,
		y: r * 48 + 24
	}));
	SEGMENT_LEN = [];
	let len = 0;
	for (let i = 1; i < WAYPOINTS.length; i++) {
		const a = WAYPOINTS[i - 1];
		const b = WAYPOINTS[i];
		const d = Math.hypot(b.x - a.x, b.y - a.y);
		SEGMENT_LEN.push(d);
		len += d;
	}
	PATH_LENGTH = Math.max(1, len);
}
function inBounds(col, row) {
	return col >= 0 && row >= 0 && col < 14 && row < 10;
}
function isPath(col, row) {
	return PATH_SET.has(`${col},${row}`);
}
function isBlocked(col, row) {
	return BLOCKED_SET.has(`${col},${row}`);
}
function isBuildable(col, row) {
	return inBounds(col, row) && !isPath(col, row) && !isBlocked(col, row);
}
function cellCenter(col, row) {
	return {
		x: col * 48 + 24,
		y: row * 48 + 24
	};
}
function worldToCell(x, y) {
	return {
		col: Math.floor(x / 48),
		row: Math.floor(y / 48)
	};
}
function pathProgress(waypoint, x, y) {
	if (waypoint >= WAYPOINTS.length - 1) return 1;
	let traveled = 0;
	for (let i = 0; i < waypoint; i++) traveled += SEGMENT_LEN[i] ?? 0;
	WAYPOINTS[waypoint];
	const to = WAYPOINTS[waypoint + 1];
	const seg = SEGMENT_LEN[waypoint] ?? 1;
	const distToNext = Math.hypot(to.x - x, to.y - y);
	const along = Math.max(0, seg - distToNext);
	traveled += along;
	return traveled / PATH_LENGTH;
}
function hash2(x, y) {
	let n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263);
	n = Math.imul(n ^ n >>> 13, 1274126177);
	return (n >>> 0) % 1e4 / 1e4;
}
applyStage(STAGES[0]);
var KEY = "holdfast-progress-v2";
var LEGACY = "holdfast-progress-v1";
var N = STAGES.length;
function padStars(stars) {
	return Array.from({ length: N }, (_, i) => Math.max(0, Math.min(3, stars?.[i] ?? 0)));
}
function loadProgress() {
	try {
		const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY);
		if (!raw) return {
			unlocked: 0,
			stars: padStars([])
		};
		const parsed = JSON.parse(raw);
		return {
			unlocked: Math.max(0, Math.min(N - 1, parsed.unlocked ?? 0)),
			stars: padStars(parsed.stars)
		};
	} catch {
		return {
			unlocked: 0,
			stars: padStars([])
		};
	}
}
function saveProgress(next) {
	try {
		localStorage.setItem(KEY, JSON.stringify(next));
	} catch {}
}
function starsFromLives(lives, startLives) {
	if (lives <= 0) return 0;
	const r = lives / Math.max(1, startLives);
	if (r >= .6) return 3;
	if (r >= .3) return 2;
	return 1;
}
function recordWin(stageIndex, stars) {
	const cur = loadProgress();
	const nextStars = padStars(cur.stars);
	nextStars[stageIndex] = Math.max(nextStars[stageIndex] ?? 0, stars);
	const next = {
		unlocked: Math.max(cur.unlocked, Math.min(N - 1, stageIndex + 1)),
		stars: nextStars
	};
	saveProgress(next);
	return next;
}
var first = STAGES[0];
var emptyHud = {
	phase: "select",
	gold: first.startGold,
	lives: first.startLives,
	wave: 0,
	totalWaves: first.waves.length,
	enemiesAlive: 0,
	spawning: false,
	canCallWave: false,
	prepLeft: 0,
	nextHint: waveHint(first.waves[0]),
	selectedShop: null,
	selectedTower: null,
	policy: "first",
	speed: 1,
	muted: false,
	waveKills: 0,
	leakFlash: 0,
	stageIndex: 0,
	stageName: first.name,
	stageCount: STAGES.length,
	startLives: first.startLives,
	lastStars: 0,
	unlocked: 0,
	stars: STAGES.map(() => 0)
};
var useGameStore = create(() => ({ ...emptyHud }));
function selectedFromTower(t) {
	const def = TOWERS[t.kind];
	const stats = towerStats(t.kind, t.damageRank, t.rateRank);
	return {
		id: t.id,
		kind: t.kind,
		name: def.name,
		damageRank: t.damageRank,
		rateRank: t.rateRank,
		damage: stats.damage,
		fireRate: stats.fireRate,
		range: stats.range,
		sell: sellValue(t.kind, t.damageRank, t.rateRank),
		nextDamageCost: t.damageRank < 3 ? UPGRADE_COST[t.damageRank] ?? null : null,
		nextRateCost: t.rateRank < 3 ? UPGRADE_COST[t.rateRank] ?? null : null
	};
}
var ENEMY_CAP = 160;
var PROJ_CAP = 220;
var PART_CAP = 420;
var FLOAT_CAP = 80;
var GameEngine = class {
	phase = "select";
	gold = STAGES[0].startGold;
	lives = STAGES[0].startLives;
	wave = 0;
	time = 0;
	speed = 1;
	policy = "first";
	selectedShop = null;
	selectedTowerId = 0;
	hover = null;
	prepLeft = STAGES[0].prep;
	spawnQueue = [];
	spawnClock = 0;
	reducedMotion = false;
	waveActive = false;
	stageIndex = 0;
	lastStars = 0;
	unlocked = 0;
	stars = STAGES.map(() => 0);
	towers = [];
	enemies = [];
	projectiles = [];
	particles = [];
	floaters = [];
	nextEnemyId = 1;
	nextTowerId = 1;
	nextProjId = 1;
	occupied = /* @__PURE__ */ new Set();
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
	get stage() {
		return STAGES[this.stageIndex] ?? STAGES[0];
	}
	get totalWaves() {
		return this.stage.waves.length;
	}
	previewStage(index) {
		if (this.phase !== "select") return;
		if (index < 0 || index >= STAGES.length) return;
		this.stageIndex = index;
		applyStage(this.stage);
		this.pushHud();
	}
	startStage(index) {
		if (index > this.unlocked) return;
		this.stageIndex = index;
		applyStage(this.stage);
		this.resetSim();
		this.phase = "playing";
		this.prepLeft = this.stage.prep;
		this.pushHud();
		sfxPlay.click();
	}
	startGame() {
		this.startStage(this.stageIndex);
	}
	gotoSelect() {
		this.resetSim();
		this.phase = "select";
		applyStage(this.stage);
		this.pushHud();
		sfxPlay.click();
	}
	nextStage() {
		const next = this.stageIndex + 1;
		if (next >= STAGES.length || next > this.unlocked) {
			this.gotoSelect();
			return;
		}
		this.startStage(next);
	}
	restart() {
		this.startGame();
	}
	togglePause() {
		if (this.phase === "playing") {
			this.phase = "paused";
			this.pushHud();
		} else if (this.phase === "paused") {
			this.phase = "playing";
			this.pushHud();
		}
	}
	setSpeed(speed) {
		this.speed = speed;
		this.pushHud();
	}
	setPolicy(policy) {
		this.policy = policy;
		this.pushHud();
	}
	selectShop(kind) {
		this.selectedShop = kind;
		this.selectedTowerId = 0;
		this.pushHud();
		if (kind) sfxPlay.click();
	}
	canCallWave() {
		return this.phase === "playing" && this.spawnQueue.length === 0 && this.wave < this.totalWaves;
	}
	callWave() {
		if (!this.canCallWave()) return;
		if (this.prepLeft > .2) this.gold += earlyCallBonus(this.wave);
		this.beginWave();
	}
	beginWave() {
		const index = this.wave;
		const def = this.stage.waves[index];
		if (!def) return;
		this.wave += 1;
		this.spawnClock = 0;
		this.spawnQueue = [];
		this.waveKills = 0;
		this.prepLeft = 0;
		this.waveActive = true;
		for (const g of def.groups) for (let i = 0; i < g.count; i++) this.spawnQueue.push({
			kind: g.kind,
			at: g.start + i * g.interval
		});
		this.spawnQueue.sort((a, b) => a.at - b.at);
		sfxPlay.wave();
		this.pushHud();
	}
	pointerMove(x, y) {
		if (x < 0 || y < 0 || x >= 672 || y >= 480) {
			this.hover = null;
			return;
		}
		const cell = worldToCell(x, y);
		this.hover = cell;
	}
	pointerLeave() {
		this.hover = null;
	}
	pointerDown(x, y) {
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
	place(kind, col, row) {
		const def = TOWERS[kind];
		if (this.gold < def.cost) return false;
		if (!isBuildable(col, row)) return false;
		const key = `${col},${row}`;
		if (this.occupied.has(key)) return false;
		const c = cellCenter(col, row);
		const tower = {
			id: this.nextTowerId++,
			kind,
			col,
			row,
			x: c.x,
			y: c.y,
			damageRank: 0,
			rateRank: 0,
			cooldown: .15,
			angle: -Math.PI / 2,
			targetId: 0
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
	upgrade(track) {
		const t = this.towers.find((x) => x.id === this.selectedTowerId);
		if (!t) return;
		const rank = track === "damage" ? t.damageRank : t.rateRank;
		if (rank >= 3) return;
		const cost = UPGRADE_COST[rank] ?? 9999;
		if (this.gold < cost) return;
		this.gold -= cost;
		if (track === "damage") t.damageRank += 1;
		else t.rateRank += 1;
		this.burst(t.x, t.y, TOWERS[t.kind].accent, 14, 70);
		sfxPlay.upgrade();
		this.pushHud();
	}
	sell() {
		const idx = this.towers.findIndex((x) => x.id === this.selectedTowerId);
		if (idx < 0) return;
		const t = this.towers[idx];
		this.gold += sellValue(t.kind, t.damageRank, t.rateRank);
		this.occupied.delete(`${t.col},${t.row}`);
		this.towers.splice(idx, 1);
		this.selectedTowerId = 0;
		this.burst(t.x, t.y, "#8a9188", 12, 50);
		sfxPlay.sell();
		this.pushHud();
	}
	fixedUpdate(dt) {
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
	frameFx(dt) {
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
	tickSpawns(dt) {
		if (this.spawnQueue.length === 0) return;
		this.spawnClock += dt;
		while (this.spawnQueue.length && this.spawnQueue[0].at <= this.spawnClock) {
			const job = this.spawnQueue.shift();
			this.spawnEnemy(job.kind);
		}
	}
	spawnEnemy(kind) {
		const slot = this.enemies.find((e) => !e.alive);
		if (!slot) return;
		const def = ENEMIES[kind];
		const wp = WAYPOINTS[0];
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
	tickEnemies(dt) {
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
			const target = WAYPOINTS[e.waypoint + 1];
			const dx = target.x - e.x;
			const dy = target.y - e.y;
			const dist = Math.hypot(dx, dy) || 1;
			if (dist <= speed * dt) {
				e.x = target.x;
				e.y = target.y;
				e.waypoint += 1;
			} else {
				e.vx = dx / dist * speed;
				e.vy = dy / dist * speed;
				e.x += e.vx * dt;
				e.y += e.vy * dt;
			}
			e.pathT = pathProgress(e.waypoint, e.x, e.y);
		}
	}
	leak(e) {
		e.alive = false;
		this.lives = Math.max(0, this.lives - e.lives);
		this.leakFlash = 1;
		this.addTrauma(e.kind === "brute" ? .7 : .4);
		this.float(WAYPOINTS[WAYPOINTS.length - 1].x, WAYPOINTS[WAYPOINTS.length - 1].y - 18, `-${e.lives}`, "#c45c4a", 16);
		sfxPlay.leak();
		if (this.lives <= 0) {
			this.phase = "lost";
			sfxPlay.lose();
		}
		this.pushHud();
	}
	tickTowers(dt) {
		for (const t of this.towers) {
			t.cooldown = Math.max(0, t.cooldown - dt);
			const stats = towerStats(t.kind, t.damageRank, t.rateRank);
			const rangePx = stats.range * 48;
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
	acquire(t, rangePx) {
		const r2 = rangePx * rangePx;
		let best = null;
		let bestScore = this.policy === "last" || this.policy === "closest" ? Infinity : -Infinity;
		for (const e of this.enemies) {
			if (!e.alive) continue;
			const dx = e.x - t.x;
			const dy = e.y - t.y;
			const d2 = dx * dx + dy * dy;
			if (d2 > r2) continue;
			let score;
			if (this.policy === "first") score = e.pathT;
			else if (this.policy === "last") score = e.pathT;
			else if (this.policy === "strongest") score = e.hp;
			else score = d2;
			const better = this.policy === "last" || this.policy === "closest" ? score < bestScore : score > bestScore;
			if (!best || better) {
				best = e;
				bestScore = score;
			}
		}
		return best;
	}
	fire(t, target, stats) {
		const slot = this.projectiles.find((p) => !p.alive);
		if (!slot) return;
		const arc = t.kind === "mortar";
		const dist = Math.hypot(target.x - t.x, target.y - t.y);
		let tx = target.x;
		let ty = target.y;
		if (arc) {
			const flight = Math.max(.35, dist / TOWERS[t.kind].projectileSpeed);
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
		slot.splash = stats.splash * 48;
		slot.slowFactor = stats.slowFactor;
		slot.slowDuration = stats.slowDuration;
		slot.pierce = stats.pierce;
		slot.targetId = arc ? 0 : target.id;
		slot.ttl = arc ? Math.max(.35, dist / slot.speed) : 1.4;
		slot.age = 0;
		slot.duration = slot.ttl;
		slot.arc = arc;
		if (t.kind === "bolt") sfxPlay.shootBolt();
		else if (t.kind === "mortar") sfxPlay.shootMortar();
		else if (t.kind === "lance") sfxPlay.shootLance();
		else sfxPlay.shootFrost();
	}
	tickProjectiles(dt) {
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
				} else p.targetId = 0;
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
				p.x += dx / dist * step;
				p.y += dy / dist * step;
			}
			if (p.age > p.ttl) p.alive = false;
		}
	}
	impact(p) {
		p.alive = false;
		const color = TOWERS[p.kind].accent;
		if (p.splash > 0) {
			this.burst(p.x, p.y, color, 18, 90);
			this.addTrauma(.22);
			for (const e of this.enemies) {
				if (!e.alive) continue;
				const d = Math.hypot(e.x - p.x, e.y - p.y);
				if (d <= p.splash + e.radius) {
					const falloff = 1 - d / (p.splash + e.radius) * .35;
					this.hurt(e, p.damage * falloff, p);
				}
			}
		} else {
			this.burst(p.x, p.y, color, 6, 50);
			let hit;
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
	hurt(e, raw, p) {
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
	kill(e) {
		e.alive = false;
		this.gold += e.gold;
		this.waveKills += 1;
		this.burst(e.x, e.y, "#c9c3b0", e.kind === "brute" ? 28 : 14, e.kind === "brute" ? 140 : 70);
		this.float(e.x, e.y - 16, `+${e.gold}`, "#c9c3b0", 12);
		if (e.kind === "brute") {
			this.addTrauma(.55);
			this.hitstop = .06;
		}
		sfxPlay.death();
		this.pushHud();
	}
	checkEnd() {
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
	aliveCount() {
		let n = 0;
		for (const e of this.enemies) if (e.alive) n += 1;
		return n;
	}
	tickFx(dt) {
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
	burst(x, y, color, count, speed) {
		for (let i = 0; i < count; i++) {
			const p = this.particles.find((q) => !q.alive);
			if (!p) return;
			const a = Math.random() * Math.PI * 2;
			const s = speed * (.3 + Math.random() * .9);
			p.alive = true;
			p.x = x;
			p.y = y;
			p.vx = Math.cos(a) * s;
			p.vy = Math.sin(a) * s;
			p.life = .25 + Math.random() * .35;
			p.maxLife = p.life;
			p.size = 1.5 + Math.random() * 2.4;
			p.color = color;
			p.gravity = 40;
		}
	}
	float(x, y, text, color, size) {
		const f = this.floaters.find((q) => !q.alive);
		if (!f) return;
		f.alive = true;
		f.x = x;
		f.y = y;
		f.vy = -28;
		f.life = .7;
		f.maxLife = .7;
		f.text = text;
		f.color = color;
		f.size = size;
	}
	addTrauma(n) {
		if (this.reducedMotion) return;
		this.trauma = Math.min(1, this.trauma + n);
	}
	resetSim() {
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
	pushHud() {
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
			stars: this.stars
		});
	}
};
function wrapAngle(a) {
	while (a > Math.PI) a -= Math.PI * 2;
	while (a < -Math.PI) a += Math.PI * 2;
	return a;
}
function emptyEnemy() {
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
		bob: 0
	};
}
function emptyProj() {
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
		arc: false
	};
}
function emptyPart() {
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
		gravity: 0
	};
}
function emptyFloat() {
	return {
		alive: false,
		x: 0,
		y: 0,
		vy: 0,
		life: 0,
		maxLife: 1,
		text: "",
		color: "#fff",
		size: 12
	};
}
var engine = new GameEngine();
var ASSETS = [
	...[
		"grunt",
		"runner",
		"armored",
		"brute",
		"swarm"
	].flatMap((kind) => [
		1,
		2,
		3,
		4
	].map((n) => ({
		key: `${kind}-${n}`,
		src: `/sprites/${kind}-${n}.png`
	}))),
	{
		key: "bolt",
		src: "/sprites/bolt.png"
	},
	{
		key: "frost",
		src: "/sprites/frost.png"
	},
	{
		key: "mortar",
		src: "/sprites/mortar.png"
	},
	{
		key: "lance",
		src: "/sprites/lance.png"
	},
	{
		key: "keep",
		src: "/sprites/keep.png"
	},
	{
		key: "portal",
		src: "/sprites/portal.png"
	},
	{
		key: "prop-rock",
		src: "/sprites/prop-rock.png"
	},
	{
		key: "prop-ruin",
		src: "/sprites/prop-ruin.png"
	},
	{
		key: "prop-stump",
		src: "/sprites/prop-stump.png"
	},
	{
		key: "prop-fern",
		src: "/sprites/prop-fern.png"
	},
	{
		key: "proj-bolt",
		src: "/sprites/proj-bolt.png"
	},
	{
		key: "proj-frost",
		src: "/sprites/proj-frost.png"
	},
	{
		key: "proj-mortar",
		src: "/sprites/proj-mortar.png"
	},
	{
		key: "proj-lance",
		src: "/sprites/proj-lance.png"
	},
	{
		key: "tile-moss",
		src: "/tiles/grass.png"
	},
	{
		key: "tile-marsh",
		src: "/tiles/marsh.png"
	},
	{
		key: "tile-dusk",
		src: "/tiles/dusk.png"
	},
	{
		key: "tile-path",
		src: "/tiles/path.png"
	}
];
var images = /* @__PURE__ */ new Map();
var loaded = false;
function loadSprites() {
	if (loaded) return Promise.resolve();
	if (typeof window === "undefined") return Promise.resolve();
	return Promise.all(ASSETS.map((asset) => new Promise((resolve) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => {
			images.set(asset.key, img);
			resolve();
		};
		img.onerror = () => resolve();
		img.src = asset.src;
	}))).then(() => {
		loaded = true;
	});
}
function sprite(key) {
	return images.get(key) ?? null;
}
function spritesReady() {
	return loaded;
}
var mapCache = null;
var mapCacheId = "";
var CREAM = "#c9c3b0";
var SAGE = "#9aaf9c";
var DANGER = "#c45c4a";
var TOWER_FACE = -Math.PI / 2;
var PROP_KEYS = [
	"prop-rock",
	"prop-ruin",
	"prop-stump",
	"prop-fern"
];
var ENEMY_PALETTE = {
	grunt: {
		body: "#5c6b52",
		shell: "#3e4a38",
		eye: "#c9c3b0"
	},
	runner: {
		body: "#8a6e5c",
		shell: "#5c4a40",
		eye: "#e8ece6"
	},
	armored: {
		body: "#6a7068",
		shell: "#9aa198",
		eye: "#c45c4a"
	},
	brute: {
		body: "#4a3c38",
		shell: "#6e534c",
		eye: "#c9c3b0"
	},
	swarm: {
		body: "#6a4e3a",
		shell: "#4a3428",
		eye: "#c9c3b0"
	}
};
function renderFrame(ctx, engine, dpr) {
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	ctx.clearRect(0, 0, 672, 480);
	ctx.save();
	ctx.translate(engine.shakeX, engine.shakeY);
	ctx.drawImage(getMapCache(engine), 0, 0);
	drawMotes(ctx, engine.time, engine.stage.palette);
	drawSpawn(ctx, engine.time);
	drawKeep(ctx, engine.leakFlash);
	const selected = engine.towers.find((t) => t.id === engine.selectedTowerId);
	if (selected) {
		const stats = towerStats(selected.kind, selected.damageRank, selected.rateRank);
		drawRange(ctx, selected.x, selected.y, stats.range * 48, true);
	}
	if (engine.hover && engine.selectedShop && (engine.phase === "playing" || engine.phase === "paused")) drawPlacement(ctx, engine);
	else if (engine.hover && !engine.selectedShop) {
		const hovered = engine.towers.find((t) => t.col === engine.hover.col && t.row === engine.hover.row);
		if (hovered && hovered.id !== engine.selectedTowerId) {
			const stats = towerStats(hovered.kind, hovered.damageRank, hovered.rateRank);
			drawRange(ctx, hovered.x, hovered.y, stats.range * 48, true);
		}
	}
	for (const t of engine.towers) drawTower(ctx, t, t.id === engine.selectedTowerId);
	for (const e of engine.enemies) if (e.alive) drawEnemy(ctx, e, engine.time);
	for (const p of engine.projectiles) if (p.alive) drawProjectile(ctx, p);
	for (const p of engine.particles) if (p.alive) drawParticle(ctx, p);
	for (const f of engine.floaters) if (f.alive) drawFloater(ctx, f);
	ctx.restore();
	if (engine.leakFlash > 0) {
		ctx.fillStyle = `rgba(196, 92, 74, ${engine.leakFlash * .18})`;
		ctx.fillRect(0, 0, 672, 480);
	}
}
function getMapCache(engine) {
	const id = `${engine.stage.id}:${spritesReady() ? 1 : 0}`;
	if (mapCache && mapCacheId === id) return mapCache;
	const c = document.createElement("canvas");
	c.width = 672;
	c.height = 480;
	drawMap(c.getContext("2d"), engine.stage.palette);
	mapCache = c;
	mapCacheId = id;
	return c;
}
function patternFrom(ctx, img, size) {
	const c = document.createElement("canvas");
	c.width = size;
	c.height = size;
	c.getContext("2d").drawImage(img, 0, 0, size, size);
	return ctx.createPattern(c, "repeat");
}
function drawMap(ctx, pal) {
	ctx.fillStyle = pal.grassC;
	ctx.fillRect(0, 0, 672, 480);
	const ground = sprite(`tile-${pal.ground}`);
	if (ground) {
		const pat = patternFrom(ctx, ground, 96);
		if (pat) {
			ctx.globalAlpha = .9;
			ctx.fillStyle = pat;
			ctx.fillRect(0, 0, 672, 480);
			ctx.globalAlpha = 1;
		}
		ctx.fillStyle = pal.grassA;
		ctx.globalAlpha = .4;
		ctx.fillRect(0, 0, 672, 480);
		ctx.globalAlpha = 1;
	} else for (let row = 0; row < 10; row++) for (let col = 0; col < 14; col++) {
		const n = hash2(col, row);
		ctx.fillStyle = n > .55 ? pal.grassB : n > .22 ? pal.grassA : pal.grassC;
		ctx.fillRect(col * 48, row * 48, 48, 48);
	}
	ctx.save();
	ctx.lineJoin = "round";
	ctx.lineCap = "round";
	ctx.strokeStyle = pal.pathEdge;
	ctx.lineWidth = 46;
	strokePath(ctx);
	const pathTile = sprite("tile-path");
	if (pathTile) {
		const pat = patternFrom(ctx, pathTile, 96);
		if (pat) {
			ctx.strokeStyle = pat;
			ctx.lineWidth = 34;
			strokePath(ctx);
		}
	}
	ctx.strokeStyle = pal.pathFill;
	ctx.globalAlpha = .34;
	ctx.lineWidth = 34;
	strokePath(ctx);
	ctx.strokeStyle = pal.pathHigh;
	ctx.globalAlpha = .4;
	ctx.lineWidth = 8;
	strokePath(ctx);
	ctx.restore();
	ctx.strokeStyle = "rgba(42, 47, 43, 0.22)";
	ctx.lineWidth = 1;
	for (let c = 1; c < 14; c++) {
		ctx.beginPath();
		ctx.moveTo(c * 48 + .5, 0);
		ctx.lineTo(c * 48 + .5, 480);
		ctx.stroke();
	}
	for (let r = 1; r < 10; r++) {
		ctx.beginPath();
		ctx.moveTo(0, r * 48 + .5);
		ctx.lineTo(672, r * 48 + .5);
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
	ctx.strokeRect(1.5, 1.5, 669, 477);
}
function strokePath(ctx) {
	if (WAYPOINTS.length < 2) return;
	ctx.beginPath();
	ctx.moveTo(WAYPOINTS[0].x, WAYPOINTS[0].y);
	for (let i = 1; i < WAYPOINTS.length; i++) ctx.lineTo(WAYPOINTS[i].x, WAYPOINTS[i].y);
	ctx.stroke();
}
function drawProp(ctx, col, row, pal) {
	const c = cellCenter(col, row);
	const n = hash2(col * 3, row * 7);
	const img = sprite(PROP_KEYS[Math.floor(n * PROP_KEYS.length)]);
	if (img) {
		const s = 34 + n * 12;
		ctx.save();
		ctx.translate(c.x, c.y);
		ctx.rotate((n - .5) * .6);
		ctx.drawImage(img, -s / 2, -s / 2 - 2, s, s);
		ctx.restore();
		return;
	}
	ctx.save();
	ctx.translate(c.x, c.y);
	ctx.rotate((n - .5) * .7);
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
	ctx.ellipse(-2, -5, 7, 4, -.4, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
}
function drawMotes(ctx, time, pal) {
	ctx.fillStyle = pal.accent;
	for (let i = 0; i < 14; i++) {
		const seed = hash2(i * 13, 7);
		const x = (seed * 672 + Math.sin(time * .35 + i) * 18) % 672;
		const y = ((hash2(i, 19) * 480 + Math.cos(time * .28 + i * .7) * 12) % 480 + 480) % 480;
		ctx.globalAlpha = .12 + seed * .18;
		ctx.beginPath();
		ctx.arc(x, y, 1.2 + seed, 0, Math.PI * 2);
		ctx.fill();
	}
	ctx.globalAlpha = 1;
}
function drawSpawn(ctx, time) {
	const p = WAYPOINTS[0];
	if (!p) return;
	const img = sprite("portal");
	const pulse = .65 + Math.sin(time * 2.2) * .2;
	ctx.save();
	ctx.translate(p.x, p.y);
	if (img) {
		const s = 42 + pulse * 4;
		ctx.globalAlpha = .92;
		ctx.drawImage(img, -s / 2, -s / 2, s, s);
		ctx.globalAlpha = 1;
	} else {
		ctx.strokeStyle = SAGE;
		ctx.globalAlpha = .35 * pulse;
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(0, 0, 16 + pulse * 4, 0, Math.PI * 2);
		ctx.stroke();
		ctx.globalAlpha = .85;
		ctx.fillStyle = "#0b0d0c";
		ctx.beginPath();
		ctx.arc(0, 0, 10, 0, Math.PI * 2);
		ctx.fill();
	}
	ctx.restore();
}
function drawKeep(ctx, leak) {
	const p = WAYPOINTS[WAYPOINTS.length - 1];
	if (!p) return;
	const img = sprite("keep");
	ctx.save();
	ctx.translate(p.x, p.y);
	if (leak > .2) {
		ctx.fillStyle = `rgba(196, 92, 74, ${leak * .35})`;
		ctx.beginPath();
		ctx.arc(0, 0, 26, 0, Math.PI * 2);
		ctx.fill();
	}
	if (img) ctx.drawImage(img, -24, -24, 48, 48);
	else {
		ctx.fillStyle = leak > .2 ? DANGER : "#2c322e";
		rounded(ctx, -16, -14, 32, 28, 4);
		ctx.fill();
	}
	ctx.restore();
}
function drawPlacement(ctx, engine) {
	const hover = engine.hover;
	const kind = engine.selectedShop;
	if (!hover || !kind) return;
	const key = `${hover.col},${hover.row}`;
	const c = cellCenter(hover.col, hover.row);
	const valid = isBuildable(hover.col, hover.row) && !engine.occupied.has(key) && engine.gold >= TOWERS[kind].cost;
	ctx.fillStyle = valid ? "rgba(154, 175, 156, 0.16)" : "rgba(196, 92, 74, 0.16)";
	ctx.fillRect(hover.col * 48, hover.row * 48, 48, 48);
	ctx.strokeStyle = valid ? SAGE : DANGER;
	ctx.lineWidth = 1.5;
	ctx.strokeRect(hover.col * 48 + 1, hover.row * 48 + 1, 46, 46);
	drawRange(ctx, c.x, c.y, TOWERS[kind].range * 48, valid);
	ctx.globalAlpha = .55;
	drawTowerShape(ctx, c.x, c.y, kind, -Math.PI / 2, 0, 0, false);
	ctx.globalAlpha = 1;
}
function drawRange(ctx, x, y, r, valid) {
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
function drawTower(ctx, t, selected) {
	if (selected) {
		ctx.beginPath();
		ctx.arc(t.x, t.y, 22, 0, Math.PI * 2);
		ctx.strokeStyle = CREAM;
		ctx.lineWidth = 1.5;
		ctx.stroke();
	}
	drawTowerShape(ctx, t.x, t.y, t.kind, t.angle, t.damageRank, t.rateRank, true);
}
function drawTowerShape(ctx, x, y, kind, angle, dmg, rate, pips) {
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
function drawEnemy(ctx, e, time) {
	const frame = Math.floor(e.bob * 2.2) % 4 + 1;
	const img = sprite(`${e.kind}-${frame}`) ?? sprite(`${e.kind}-1`);
	const ang = Math.atan2(e.vy, e.vx) || 0;
	const bob = Math.sin(e.bob) * (e.kind === "runner" || e.kind === "swarm" ? 1.2 : .6);
	const slowed = time < e.slowUntil;
	const size = e.radius * 2.6;
	ctx.save();
	ctx.translate(e.x, e.y + bob);
	ctx.rotate(ang);
	if (img) ctx.drawImage(img, -size / 2, -size / 2, size, size);
	else drawEnemyFallback(ctx, e);
	if (slowed) {
		ctx.strokeStyle = "rgba(197, 224, 232, 0.7)";
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.arc(0, 0, e.radius + 6, 0, Math.PI * 2);
		ctx.stroke();
	}
	if (e.flash > 0) {
		ctx.fillStyle = `rgba(232, 236, 230, ${e.flash * .4})`;
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
	ctx.fillStyle = e.hp / e.maxHp < .3 ? DANGER : SAGE;
	ctx.fillRect(bx, by, bw * Math.max(0, e.hp / e.maxHp), 3);
}
function drawEnemyFallback(ctx, e) {
	const pal = ENEMY_PALETTE[e.kind];
	ctx.fillStyle = pal.shell;
	ctx.beginPath();
	ctx.ellipse(0, 0, e.radius, e.radius * .72, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.fillStyle = pal.body;
	ctx.beginPath();
	ctx.ellipse(3, 0, e.radius * .55, e.radius * .42, 0, 0, Math.PI * 2);
	ctx.fill();
}
function drawProjectile(ctx, p) {
	const img = sprite(`proj-${p.kind}`);
	ctx.save();
	if (p.arc) {
		const u = Math.min(1, p.age / Math.max(.001, p.duration));
		const lift = Math.sin(u * Math.PI) * 36;
		ctx.fillStyle = "rgba(11, 13, 12, 0.35)";
		ctx.beginPath();
		ctx.ellipse(p.x, p.y, 5, 2.5, 0, 0, Math.PI * 2);
		ctx.fill();
		if (img) ctx.drawImage(img, p.x - 8, p.y - lift - 8, 16, 16);
		else {
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
function drawParticle(ctx, p) {
	ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
	ctx.fillStyle = p.color;
	ctx.fillRect(p.x, p.y, p.size, p.size);
	ctx.globalAlpha = 1;
}
function drawFloater(ctx, f) {
	ctx.globalAlpha = Math.max(0, f.life / f.maxLife);
	ctx.fillStyle = f.color;
	ctx.font = `600 ${f.size}px Outfit, sans-serif`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(f.text, f.x, f.y);
	ctx.globalAlpha = 1;
}
function rounded(ctx, x, y, w, h, r) {
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.arcTo(x + w, y, x + w, y + h, r);
	ctx.arcTo(x + w, y + h, x, y + h, r);
	ctx.arcTo(x, y + h, x, y, r);
	ctx.arcTo(x, y, x + w, y, r);
	ctx.closePath();
}
function GameCanvas() {
	const wrapRef = (0, import_react.useRef)(null);
	const canvasRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
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
			const scale = Math.min(availW / 672, availH / 480);
			const cssW = Math.floor(672 * scale);
			const cssH = Math.floor(480 * scale);
			dpr = Math.min(2, window.devicePixelRatio || 1);
			canvas.style.width = `${cssW}px`;
			canvas.style.height = `${cssH}px`;
			canvas.width = Math.floor(672 * dpr);
			canvas.height = Math.floor(480 * dpr);
		};
		const ro = new ResizeObserver(fit);
		ro.observe(wrap);
		fit();
		renderFrame(ctx, engine, dpr);
		const loop = (now) => {
			if (!alive) return;
			const raw = Math.min(.1, (now - last) / 1e3);
			last = now;
			const scaled = raw * engine.speed;
			acc += scaled;
			while (acc >= STEP) {
				engine.fixedUpdate(STEP);
				acc -= STEP;
			}
			engine.frameFx(raw);
			hudAcc += raw;
			if (hudAcc >= .12) {
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
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const toWorld = (ev) => {
			const rect = canvas.getBoundingClientRect();
			return {
				x: (ev.clientX - rect.left) / rect.width * 672,
				y: (ev.clientY - rect.top) / rect.height * 480
			};
		};
		const onMove = (ev) => {
			const p = toWorld(ev);
			engine.pointerMove(p.x, p.y);
			const col = Math.floor(p.x / 48);
			const row = Math.floor(p.y / 48);
			const placing = Boolean(engine.selectedShop);
			const overTower = engine.towers.some((t) => t.col === col && t.row === row);
			canvas.style.cursor = placing ? isBuildable(col, row) ? "copy" : "not-allowed" : overTower ? "pointer" : "crosshair";
		};
		const onDown = (ev) => {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: wrapRef,
		className: "relative flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
			ref: canvasRef,
			className: "touch-none max-h-full max-w-full rounded-lg border border-border bg-bg",
			width: 672,
			height: 480
		})
	});
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var KINDS = [
	"bolt",
	"frost",
	"mortar",
	"lance"
];
var POLICIES = [
	"first",
	"last",
	"strongest",
	"closest"
];
function Dock() {
	const phase = useGameStore((s) => s.phase);
	const gold = useGameStore((s) => s.gold);
	const selectedShop = useGameStore((s) => s.selectedShop);
	const selectedTower = useGameStore((s) => s.selectedTower);
	const canCallWave = useGameStore((s) => s.canCallWave);
	const prepLeft = useGameStore((s) => s.prepLeft);
	const nextHint = useGameStore((s) => s.nextHint);
	const policy = useGameStore((s) => s.policy);
	const wave = useGameStore((s) => s.wave);
	if (phase !== "playing" && phase !== "paused") return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "flex shrink-0 flex-col gap-3 border-t border-border bg-surface p-3 lg:w-80 lg:border-t-0 lg:border-l lg:p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2",
				children: KINDS.map((kind) => {
					const def = TOWERS[kind];
					const selected = selectedShop === kind;
					const poor = gold < def.cost;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => engine.selectShop(selected ? null : kind),
						className: cn("flex min-h-16 flex-col items-start gap-1 rounded-md border px-2.5 py-2 text-left transition-colors", selected ? "border-accent bg-surface-2" : "border-border bg-bg hover:bg-surface-2", poor && "opacity-50"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex w-full items-center justify-between gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: `/sprites/${kind}.png`,
									alt: "",
									className: "size-7 object-contain",
									draggable: false
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-xs tabular-nums text-cream",
									children: def.cost
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium text-fg",
								children: def.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-2xs leading-tight text-muted",
								children: [
									"射程 ",
									def.range.toFixed(1),
									" · ",
									def.fireRate.toFixed(1),
									"/s"
								]
							})
						]
					}, kind);
				})
			}),
			selectedShop && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs leading-relaxed text-muted",
				children: [TOWERS[selectedShop].blurb, " 點地圖空地放置。"]
			}),
			selectedTower ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-bg p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium text-fg",
							children: selectedTower.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: ["射程 ", selectedTower.range.toFixed(1)]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 font-mono text-xs tabular-nums text-muted",
						children: [
							"傷害 ",
							selectedTower.damage.toFixed(0),
							" · 射速 ",
							selectedTower.fireRate.toFixed(2),
							"/s"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UpgradeBtn, {
							label: "傷害",
							rank: selectedTower.damageRank,
							cost: selectedTower.nextDamageCost,
							gold,
							onClick: () => engine.upgrade("damage")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UpgradeBtn, {
							label: "射速",
							rank: selectedTower.rateRank,
							cost: selectedTower.nextRateCost,
							gold,
							onClick: () => engine.upgrade("rate")
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => engine.sell(),
						className: "mt-2 min-h-11 w-full rounded-sm border border-border bg-surface-2 text-sm text-muted transition-colors hover:text-fg",
						children: ["拆除 · 退回 ", selectedTower.sell]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden rounded-lg border border-dashed border-border px-3 py-3 text-xs text-muted lg:block",
				children: "點一座已建的塔可升級傷害或射速，拆除退回六成花費。裂光可穿刺重甲。"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-auto flex flex-col gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1",
						children: POLICIES.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => engine.setPolicy(p),
							className: cn("min-h-9 rounded-full px-3 text-xs transition-colors", policy === p ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted hover:text-fg"),
							children: POLICY_LABEL[p]
						}, p))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: !canCallWave,
						onClick: () => engine.callWave(),
						className: "btn-primary min-h-12 w-full disabled:opacity-40",
						children: wave === 0 ? "放出第一波" : canCallWave ? prepLeft > .2 ? `提前放波 · +${earlyCallBonus(wave)}` : "放出下一波" : "波次進行中"
					}),
					nextHint && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-center text-2xs text-muted",
						children: [
							wave === 0 ? "即將" : "下一波",
							" · ",
							nextHint
						]
					})
				]
			})
		]
	});
}
function UpgradeBtn({ label, rank, cost, gold, onClick }) {
	const maxed = cost === null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		disabled: maxed || cost !== null && gold < cost,
		onClick,
		className: "flex min-h-14 flex-col items-start justify-center rounded-sm border border-border bg-surface-2 px-2.5 text-left disabled:opacity-40",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-xs text-muted",
				children: [
					label,
					" ",
					rank,
					"/3"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium text-fg",
				children: maxed ? "已滿" : `升級 ${cost}`
			}),
			!maxed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-0.5 flex gap-0.5",
				children: UPGRADE_COST.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("h-1 w-3 rounded-full", i < rank ? "bg-accent" : "bg-border") }, i))
			})
		]
	});
}
function Hud() {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-surface px-3 py-2 sm:gap-3 sm:px-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mr-auto flex min-w-0 items-center gap-3 sm:gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display hidden text-lg leading-none tracking-tight text-fg sm:block",
					children: "固守"
				}),
				playing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-3.5" }),
					label: "生命",
					value: String(lives),
					danger: lives <= 5 || leakFlash > .15
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-3.5" }),
					label: "金幣",
					value: String(gold)
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-2xs uppercase tracking-wider text-muted",
							children: playing ? wave === 0 ? `${stageName} · 整備` : `${stageName} · ${wave}/${totalWaves}` : "戰役"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-mono text-sm tabular-nums text-fg",
							children: !playing ? `六條防線 · 星 ${earned}/${stageCount * 3}` : spawning || enemiesAlive > 0 ? `場上 ${enemiesAlive}` : prepLeft > 0 ? `下一波 ${Math.ceil(prepLeft)}s` : nextHint || "準備"
						}),
						playing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 flex gap-px",
							children: Array.from({ length: totalWaves }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("h-1 flex-1 rounded-full", i < wave ? "bg-accent" : i === wave && (spawning || enemiesAlive > 0) ? "bg-cream" : "bg-border") }, i))
						})
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
					label: phase === "paused" ? "繼續" : "暫停",
					disabled: !playing,
					onClick: () => engine.togglePause(),
					children: phase === "paused" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
					label: speed === 1 ? "兩倍速" : "一倍速",
					disabled: !playing,
					onClick: () => engine.setSpeed(speed === 1 ? 2 : 1),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono text-xs tabular-nums",
						children: [speed, "x"]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
					label: muted ? "開啟聲音" : "靜音",
					onClick: () => {
						unlockAudio();
						const next = !isMuted();
						setMuted(next);
						try {
							localStorage.setItem("holdfast-muted", next ? "1" : "0");
						} catch {}
						useGameStore.setState({ muted: next });
					},
					children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
				})
			]
		})]
	});
}
function Chip({ icon, label, value, danger }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex min-h-11 items-center gap-2 rounded-md border border-border bg-surface-2 px-2.5", danger && "border-danger/40 text-danger"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("text-muted", danger && "text-danger"),
			children: icon
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex flex-col leading-none",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-2xs uppercase tracking-wider text-muted",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-base tabular-nums",
				children: value
			})]
		})]
	});
}
function IconBtn({ children, label, onClick, disabled }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		title: label,
		disabled,
		onClick,
		className: "inline-flex size-11 items-center justify-center rounded-md border border-border bg-surface-2 text-fg transition-colors hover:bg-surface disabled:opacity-40",
		children
	});
}
function Overlays() {
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
	if (phase === "paused") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scrim, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-2xs uppercase tracking-widest text-muted",
			children: stageName
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display mt-1 text-2xl tracking-tight",
			children: "暫停"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: "防線仍在。準備好再繼續。"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 flex flex-col gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "btn-primary w-full",
					onClick: () => engine.togglePause(),
					children: "繼續駐守"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "btn-ghost w-full",
					onClick: () => engine.restart(),
					children: "重開本關"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "btn-ghost w-full",
					onClick: () => engine.gotoSelect(),
					children: "返回關卡"
				})
			]
		})
	] }) });
	if (phase === "won" || phase === "lost") {
		const won = phase === "won";
		const hasNext = won && stageIndex + 1 < STAGES.length && stageIndex + 1 <= unlocked;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scrim, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-2xs font-medium uppercase tracking-widest text-muted",
				children: [
					won ? "防線守住" : "防線失守",
					" · ",
					stageName
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display mt-2 text-3xl tracking-tight",
				children: won ? "苔石仍在。" : "蟲潮漫過門廊。"
			}),
			won && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex justify-center gap-1",
				children: [
					1,
					2,
					3
				].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-6", n <= lastStars ? "fill-cream text-cream" : "text-border") }, n))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-6 grid grid-cols-3 gap-2 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "剩餘生命",
						value: `${lives}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "金幣",
						value: `${gold}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "波次",
						value: `${wave}/${totalWaves}`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-col gap-2",
				children: [
					hasNext && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "btn-primary w-full",
						onClick: () => {
							unlockAudio();
							engine.nextStage();
						},
						children: ["下一關 · ", STAGES[stageIndex + 1]?.name]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: cn("w-full", hasNext ? "btn-ghost" : "btn-primary"),
						onClick: () => {
							unlockAudio();
							engine.restart();
						},
						children: "再守一次"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn-ghost w-full",
						onClick: () => engine.gotoSelect(),
						children: "關卡選擇"
					})
				]
			})
		] }) });
	}
	const earned = stars.reduce((a, b) => a + b, 0);
	const outer = STAGES.slice(0, 3);
	const deep = STAGES.slice(3);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scrim, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "overlay-enter mx-auto flex w-full max-w-4xl flex-col px-3 py-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-2xs font-medium uppercase tracking-widest text-muted",
					children: "Holdfast"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display mt-1 text-4xl leading-none tracking-tight text-fg sm:text-5xl",
					children: "固守"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono text-sm tabular-nums text-cream",
					children: [
						"星 ",
						earned,
						"/",
						STAGES.length * 3
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-lg text-sm leading-relaxed text-muted",
				children: "六條防線。點卡片預覽地圖，再點一次進攻。生命剩六成得三星。"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chapter, {
				title: "外圍",
				stages: outer,
				unlocked,
				stageIndex,
				stars,
				offset: 0
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chapter, {
				title: "深處",
				stages: deep,
				unlocked,
				stageIndex,
				stars,
				offset: 3
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
				className: "mt-4 hidden gap-2 text-left text-sm sm:grid sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "size-4" }),
						title: "放置",
						body: "選塔點空地。路與岩石不能放。"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swords, { className: "size-4" }),
						title: "升級",
						body: "點已建的塔，走傷害或射速。"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-4" }),
						title: "守門",
						body: "漏過扣生命。通關解鎖下一線。"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-center text-2xs text-subtle",
				children: "Enter 進攻 · 1–4 選塔 · 空白放波 · Esc 暫停"
			})
		]
	}) });
}
function Chapter({ title, stages, unlocked, stageIndex, stars, offset }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-2xs uppercase tracking-widest text-muted",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 grid grid-cols-2 gap-2 lg:grid-cols-3",
			children: stages.map((stage, i) => {
				const index = offset + i;
				const locked = index > unlocked;
				const preview = index === stageIndex;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					disabled: locked,
					onClick: () => {
						unlockAudio();
						if (locked) return;
						if (preview) engine.startStage(index);
						else engine.previewStage(index);
					},
					className: cn("flex flex-col rounded-lg border p-2.5 text-left transition-colors", preview ? "border-accent bg-surface" : "border-border bg-surface/80 hover:bg-surface", locked && "opacity-50"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative overflow-hidden rounded-sm bg-bg",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniMap, {
								path: stage.path,
								blocked: stage.blocked,
								accent: preview
							}), locked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "absolute inset-0 flex items-center justify-center bg-bg/60",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-4 text-muted" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex items-baseline justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display text-base tracking-tight text-fg sm:text-lg",
								children: stage.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("text-2xs", diffClass(stage.difficulty)),
								children: stage.difficulty
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 line-clamp-2 text-2xs leading-relaxed text-muted sm:text-xs",
							children: stage.blurb
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1.5 flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex items-center gap-0.5",
								children: [
									1,
									2,
									3
								].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-3", n <= (stars[index] ?? 0) ? "fill-cream text-cream" : "text-border") }, n))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono text-2xs tabular-nums text-subtle",
								children: [
									stage.waves.length,
									" 波 · ",
									stage.startLives,
									" 命"
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("mt-2 inline-flex min-h-10 items-center justify-center rounded-sm px-3 text-xs font-medium", preview ? "bg-accent text-accent-fg" : "bg-surface-2 text-fg"),
							children: locked ? "未解鎖" : preview ? "進攻此關" : "預覽地圖"
						})
					]
				}, stage.id);
			})
		})]
	});
}
function MiniMap({ path, blocked, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: `0 0 14 10`,
		className: "h-16 w-full sm:h-20",
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				width: 14,
				height: 10,
				className: "fill-bg"
			}),
			blocked.map(([c, r], i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: c,
				y: r,
				width: 1,
				height: 1,
				className: "fill-surface-2"
			}, `b-${c}-${r}-${i}`)),
			path.map(([c, r], i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: c,
				y: r,
				width: 1,
				height: 1,
				className: accent ? "fill-accent" : "fill-path"
			}, `p-${c}-${r}-${i}`))
		]
	});
}
function diffClass(d) {
	if (d === "練習") return "text-ok";
	if (d === "終局") return "text-danger";
	if (d === "精銳") return "text-cream";
	return "text-muted";
}
function Scrim({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-20 overflow-y-auto bg-bg/70 px-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex min-h-full items-center justify-center py-4 sm:py-6",
			children
		})
	});
}
function Panel({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overlay-enter my-auto w-full max-w-sm rounded-xl border border-border bg-surface p-6",
		children
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "rounded-md bg-surface-2 px-2 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-2xs text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 font-mono text-lg tabular-nums text-fg",
			children: value
		})]
	});
}
function Step({ icon, title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex gap-3 rounded-lg border border-border bg-surface/80 px-3 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-sm bg-surface-2 text-accent",
			children: icon
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block font-medium text-fg",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mt-0.5 block text-muted",
			children: body
		})] })]
	});
}
var GAME_KEYS = /* @__PURE__ */ new Set([
	"Space",
	"KeyP",
	"Escape",
	"Digit1",
	"Digit2",
	"Digit3",
	"Digit4",
	"KeyQ",
	"KeyF",
	"Enter"
]);
function GameShell() {
	(0, import_react.useEffect)(() => {
		loadSprites();
		try {
			if (localStorage.getItem("holdfast-muted") === "1") {
				setMuted(true);
				useGameStore.setState({ muted: true });
			}
		} catch {}
		engine.pushHud();
		const onKey = (e) => {
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
				} else if (engine.phase === "paused") engine.togglePause();
				return;
			}
			if (e.code === "KeyP" || e.code === "Escape" && engine.phase === "playing") {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh select-none flex-col overflow-hidden bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hud, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex min-h-0 flex-1 flex-col lg:flex-row",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameCanvas, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dock, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlays, {})
			]
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameShell, {});
}
//#endregion
export { Home as component };
