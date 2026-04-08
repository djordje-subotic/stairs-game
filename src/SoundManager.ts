import { store } from './Store';

// Theme sound profiles — different pitch/waveform per theme
interface ThemeSound {
  landWave: OscillatorType; landFreq: number; landEnd: number;
  chopFreq: number;
  bgNote: number; bgWave: OscillatorType; bgTempo: number;
}

const THEME_SOUNDS: Record<string, ThemeSound> = {
  building: { landWave: 'sine', landFreq: 900, landEnd: 250, chopFreq: 2000, bgNote: 110, bgWave: 'sine', bgTempo: 0.5 },
  sushi:    { landWave: 'sine', landFreq: 1100, landEnd: 400, chopFreq: 2500, bgNote: 220, bgWave: 'sine', bgTempo: 0.4 },
  burger:   { landWave: 'triangle', landFreq: 600, landEnd: 150, chopFreq: 1500, bgNote: 82, bgWave: 'triangle', bgTempo: 0.6 },
  cake:     { landWave: 'sine', landFreq: 1200, landEnd: 500, chopFreq: 3000, bgNote: 330, bgWave: 'sine', bgTempo: 0.35 },
  dj:       { landWave: 'square', landFreq: 800, landEnd: 200, chopFreq: 4000, bgNote: 55, bgWave: 'sawtooth', bgTempo: 1.0 },
  pixel:    { landWave: 'square', landFreq: 1000, landEnd: 300, chopFreq: 2000, bgNote: 165, bgWave: 'square', bgTempo: 0.7 },
  aquarium: { landWave: 'sine', landFreq: 700, landEnd: 350, chopFreq: 1800, bgNote: 146, bgWave: 'sine', bgTempo: 0.3 },
  space:    { landWave: 'sine', landFreq: 500, landEnd: 200, chopFreq: 1200, bgNote: 73, bgWave: 'sine', bgTempo: 0.25 },
  candy:    { landWave: 'sine', landFreq: 1300, landEnd: 600, chopFreq: 3500, bgNote: 262, bgWave: 'triangle', bgTempo: 0.45 },
  bamboo:   { landWave: 'sine', landFreq: 800, landEnd: 400, chopFreq: 2200, bgNote: 196, bgWave: 'sine', bgTempo: 0.3 },
  icecream: { landWave: 'sine', landFreq: 1100, landEnd: 500, chopFreq: 2800, bgNote: 247, bgWave: 'triangle', bgTempo: 0.4 },
};

export class SoundManager {
  private ctx: AudioContext | null = null;
  private gain!: GainNode;

  init() {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this.gain = this.ctx.createGain();
    this.gain.gain.value = 0.45;
    this.gain.connect(this.ctx.destination);
  }

  private ok(): AudioContext {
    if (!this.ctx) this.init();
    if (this.ctx!.state === 'suspended') this.ctx!.resume();
    return this.ctx!;
  }

  private ts(): ThemeSound {
    const id = store.getCurrentTheme();
    return THEME_SOUNDS[id] || THEME_SOUNDS['building'];
  }

  // ── Theme-specific landing sound ──
  snap(comboLevel = 0) {
    const c = this.ok(), t = c.currentTime;
    const ts = this.ts();
    const pitch = Math.min(ts.landFreq + comboLevel * 50, 1600);

    const o1 = c.createOscillator(), g1 = c.createGain();
    o1.type = ts.landWave;
    o1.frequency.setValueAtTime(pitch, t);
    o1.frequency.exponentialRampToValueAtTime(ts.landEnd, t + 0.06);
    g1.gain.setValueAtTime(0.5, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    o1.connect(g1).connect(this.gain);
    o1.start(t); o1.stop(t + 0.09);

    const o2 = c.createOscillator(), g2 = c.createGain();
    o2.type = 'sine';
    o2.frequency.setValueAtTime(120, t);
    o2.frequency.exponentialRampToValueAtTime(40, t + 0.08);
    g2.gain.setValueAtTime(0.3, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    o2.connect(g2).connect(this.gain);
    o2.start(t); o2.stop(t + 0.11);
  }

  perfect() {
    const c = this.ok(), t = c.currentTime;
    const ts = this.ts();
    const base = ts.landFreq * 0.75;
    [base, base * 1.33, base * 1.67, base * 2].forEach((f, i) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = f;
      const s = t + i * 0.04;
      g.gain.setValueAtTime(0, s);
      g.gain.linearRampToValueAtTime(0.25, s + 0.012);
      g.gain.exponentialRampToValueAtTime(0.001, s + 0.2);
      o.connect(g).connect(this.gain);
      o.start(s); o.stop(s + 0.22);
    });
  }

  combo(level: number) {
    const c = this.ok(), t = c.currentTime;
    const ts = this.ts();
    const f = Math.min(ts.landFreq * 0.6 + level * 80, 1800);
    const o1 = c.createOscillator(), g1 = c.createGain();
    o1.type = ts.landWave === 'square' ? 'triangle' : ts.landWave;
    o1.frequency.setValueAtTime(f, t);
    o1.frequency.linearRampToValueAtTime(f * 1.5, t + 0.1);
    g1.gain.setValueAtTime(0.22, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    o1.connect(g1).connect(this.gain);
    o1.start(t); o1.stop(t + 0.27);
    if (level > 2) {
      const o2 = c.createOscillator(), g2 = c.createGain();
      o2.type = 'sine'; o2.frequency.setValueAtTime(f * 1.5, t);
      o2.frequency.linearRampToValueAtTime(f * 2, t + 0.1);
      g2.gain.setValueAtTime(0.12, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o2.connect(g2).connect(this.gain);
      o2.start(t); o2.stop(t + 0.22);
    }
    if (level > 7) {
      const o3 = c.createOscillator(), g3 = c.createGain();
      o3.type = 'sine'; o3.frequency.setValueAtTime(f * 2, t + 0.02);
      o3.frequency.linearRampToValueAtTime(f * 3, t + 0.12);
      g3.gain.setValueAtTime(0.06, t + 0.02);
      g3.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      o3.connect(g3).connect(this.gain);
      o3.start(t + 0.02); o3.stop(t + 0.2);
    }
  }

  milestone() {
    const c = this.ok(), t = c.currentTime;
    [523, 659, 784, 1047].forEach((f, i) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = f;
      const s = t + i * 0.06;
      g.gain.setValueAtTime(0, s);
      g.gain.linearRampToValueAtTime(0.2, s + 0.015);
      g.gain.exponentialRampToValueAtTime(0.001, s + 0.35);
      o.connect(g).connect(this.gain);
      o.start(s); o.stop(s + 0.37);
    });
  }

  // Theme-specific chop sound
  chop() {
    const c = this.ok(), t = c.currentTime;
    const ts = this.ts();
    const len = c.sampleRate * 0.08;
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    const src = c.createBufferSource(); src.buffer = buf;
    const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = ts.chopFreq;
    const g = c.createGain();
    g.gain.setValueAtTime(0.3, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    src.connect(hp).connect(g).connect(this.gain);
    src.start(t); src.stop(t + 0.1);
  }

  grow() {
    const c = this.ok(), t = c.currentTime;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(600, t);
    o.frequency.linearRampToValueAtTime(1000, t + 0.12);
    g.gain.setValueAtTime(0.15, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    o.connect(g).connect(this.gain);
    o.start(t); o.stop(t + 0.22);
  }

  // Theme-specific fall sound
  fall() {
    const c = this.ok(), t = c.currentTime;
    const ts = this.ts();
    const len = c.sampleRate * 0.35;
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    const src = c.createBufferSource(); src.buffer = buf;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = ts.chopFreq * 0.2;
    const gn = c.createGain();
    gn.gain.setValueAtTime(0.3, t); gn.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    src.connect(lp).connect(gn).connect(this.gain);
    src.start(t); src.stop(t + 0.35);

    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(ts.landFreq * 0.3, t);
    o.frequency.exponentialRampToValueAtTime(30, t + 0.4);
    g.gain.setValueAtTime(0.15, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    const lp2 = c.createBiquadFilter(); lp2.type = 'lowpass'; lp2.frequency.value = 600;
    o.connect(lp2).connect(g).connect(this.gain);
    o.start(t); o.stop(t + 0.5);
  }

  danger() {
    const c = this.ok(), t = c.currentTime;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.value = 50;
    g.gain.setValueAtTime(0.08, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    o.connect(g).connect(this.gain);
    o.start(t); o.stop(t + 0.22);
  }

  closecall() {
    const c = this.ok(), t = c.currentTime;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(500, t);
    o.frequency.exponentialRampToValueAtTime(150, t + 0.05);
    g.gain.setValueAtTime(0.2, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1200;
    o.connect(lp).connect(g).connect(this.gain);
    o.start(t); o.stop(t + 0.07);
  }

  dirSwitch() {
    const c = this.ok(), t = c.currentTime;
    const len = c.sampleRate * 0.12;
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource(); src.buffer = buf;
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.setValueAtTime(300, t);
    bp.frequency.exponentialRampToValueAtTime(1500, t + 0.1); bp.Q.value = 1.5;
    const g = c.createGain();
    g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    src.connect(bp).connect(g).connect(this.gain);
    src.start(t); src.stop(t + 0.12);
  }

  tick() {
    const c = this.ok(), t = c.currentTime;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.value = 700;
    g.gain.setValueAtTime(0.1, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    o.connect(g).connect(this.gain);
    o.start(t); o.stop(t + 0.04);
  }

  whoosh() {
    const c = this.ok(), t = c.currentTime;
    const len = c.sampleRate * 0.12;
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource(); src.buffer = buf;
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.setValueAtTime(1200, t);
    bp.frequency.exponentialRampToValueAtTime(300, t + 0.1); bp.Q.value = 1.5;
    const g = c.createGain();
    g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    src.connect(bp).connect(g).connect(this.gain);
    src.start(t); src.stop(t + 0.12);
  }
}

export const sound = new SoundManager();
