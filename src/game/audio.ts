type Bus = "master" | "sfx" | "music";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfx: GainNode | null = null;
let music: GainNode | null = null;
let muted = false;
let unlocked = false;
let noiseBuffer: AudioBuffer | null = null;
let padOsc: OscillatorNode | null = null;
let padGain: GainNode | null = null;

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC({ latencyHint: "interactive" });
    master = ctx.createGain();
    sfx = ctx.createGain();
    music = ctx.createGain();
    sfx.gain.value = 0.7;
    music.gain.value = 0.18;
    master.gain.value = muted ? 0 : 0.9;
    sfx.connect(master);
    music.connect(master);
    master.connect(ctx.destination);
    noiseBuffer = makeNoise(ctx);
  }
  return ctx;
}

function makeNoise(ac: AudioContext): AudioBuffer {
  const buffer = ac.createBuffer(1, ac.sampleRate * 0.4, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

export function unlockAudio(): void {
  const ac = ensure();
  if (!ac) return;
  if (ac.state === "suspended") void ac.resume();
  unlocked = true;
  startPad();
}

export function resumeAudio(): void {
  if (ctx && ctx.state === "suspended") void ctx.resume();
}

export function setMuted(next: boolean): void {
  muted = next;
  if (master && ctx) {
    master.gain.setTargetAtTime(next ? 0 : 0.9, ctx.currentTime, 0.02);
  }
}

export function isMuted(): boolean {
  return muted;
}

function bus(name: Bus): GainNode | null {
  if (name === "sfx") return sfx;
  if (name === "music") return music;
  return master;
}

function tone(opts: {
  freq: number;
  freqEnd?: number;
  dur: number;
  type?: OscillatorType;
  vol?: number;
  delay?: number;
  dest?: Bus;
}): void {
  const ac = ctx;
  const dest = bus(opts.dest ?? "sfx");
  if (!ac || !dest || !unlocked) return;
  const t = ac.currentTime + (opts.delay ?? 0);
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = opts.type ?? "triangle";
  osc.frequency.setValueAtTime(opts.freq, t);
  if (opts.freqEnd) osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.freqEnd), t + opts.dur);
  const vol = opts.vol ?? 0.12;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + opts.dur);
  osc.connect(g);
  g.connect(dest);
  osc.start(t);
  osc.stop(t + opts.dur + 0.02);
}

function noise(opts: { dur: number; vol?: number; delay?: number }): void {
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
  g.gain.setValueAtTime(opts.vol ?? 0.16, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + opts.dur);
  src.connect(filter);
  filter.connect(g);
  g.connect(sfx);
  src.start(t);
  src.stop(t + opts.dur + 0.02);
}

function startPad(): void {
  const ac = ctx;
  if (!ac || !music || padOsc) return;
  padOsc = ac.createOscillator();
  padGain = ac.createGain();
  const filter = ac.createBiquadFilter();
  padOsc.type = "sine";
  padOsc.frequency.value = 55;
  filter.type = "lowpass";
  filter.frequency.value = 240;
  padGain.gain.value = 0.0001;
  padOsc.connect(filter);
  filter.connect(padGain);
  padGain.connect(music);
  padOsc.start();
  padGain.gain.setTargetAtTime(0.35, ac.currentTime, 0.8);
}

export const sfxPlay = {
  click() {
    tone({ freq: 520, dur: 0.05, type: "sine", vol: 0.06 });
  },
  place() {
    tone({ freq: 180, freqEnd: 90, dur: 0.14, type: "triangle", vol: 0.16 });
    noise({ dur: 0.08, vol: 0.08 });
  },
  sell() {
    tone({ freq: 240, freqEnd: 140, dur: 0.12, type: "sine", vol: 0.1 });
  },
  upgrade() {
    tone({ freq: 420, dur: 0.08, type: "sine", vol: 0.08 });
    tone({ freq: 640, dur: 0.1, type: "sine", vol: 0.07, delay: 0.06 });
  },
  shootBolt() {
    tone({ freq: 760 + Math.random() * 80, freqEnd: 420, dur: 0.07, type: "square", vol: 0.045 });
  },
  shootMortar() {
    tone({ freq: 110, freqEnd: 70, dur: 0.16, type: "sine", vol: 0.14 });
    noise({ dur: 0.08, vol: 0.07 });
  },
  shootFrost() {
    tone({ freq: 620, freqEnd: 980, dur: 0.1, type: "sine", vol: 0.07 });
  },
  shootLance() {
    tone({ freq: 980, freqEnd: 520, dur: 0.09, type: "sawtooth", vol: 0.05 });
    tone({ freq: 1480, freqEnd: 880, dur: 0.07, type: "sine", vol: 0.04 });
  },
  hit() {
    noise({ dur: 0.05, vol: 0.05 + Math.random() * 0.03 });
  },
  death() {
    noise({ dur: 0.12, vol: 0.12 });
    tone({ freq: 180, freqEnd: 70, dur: 0.16, type: "sawtooth", vol: 0.05 });
  },
  leak() {
    tone({ freq: 220, freqEnd: 90, dur: 0.35, type: "sawtooth", vol: 0.12 });
    tone({ freq: 160, freqEnd: 70, dur: 0.4, type: "triangle", vol: 0.08, delay: 0.05 });
  },
  wave() {
    tone({ freq: 196, dur: 0.18, type: "triangle", vol: 0.1 });
    tone({ freq: 247, dur: 0.22, type: "triangle", vol: 0.08, delay: 0.12 });
  },
  win() {
    tone({ freq: 262, dur: 0.18, type: "sine", vol: 0.1 });
    tone({ freq: 330, dur: 0.18, type: "sine", vol: 0.09, delay: 0.12 });
    tone({ freq: 392, dur: 0.28, type: "sine", vol: 0.1, delay: 0.24 });
    tone({ freq: 523, dur: 0.4, type: "sine", vol: 0.09, delay: 0.4 });
  },
  lose() {
    tone({ freq: 196, freqEnd: 110, dur: 0.45, type: "triangle", vol: 0.12 });
    tone({ freq: 147, freqEnd: 80, dur: 0.55, type: "sine", vol: 0.1, delay: 0.12 });
  },
};
