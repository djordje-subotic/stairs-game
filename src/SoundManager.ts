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

  // Landing thud — pitch scales with combo
  snap(comboLevel = 0) {
    const c = this.ok(), t = c.currentTime;
    const pitch = Math.min(900 + comboLevel * 50, 1400);
    const o1 = c.createOscillator(), g1 = c.createGain();
    o1.type = 'sine';
    o1.frequency.setValueAtTime(pitch, t);
    o1.frequency.exponentialRampToValueAtTime(250, t + 0.06);
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
    [660, 880, 1100, 1320].forEach((f, i) => {
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
    const f = 500 + level * 100;
    const o1 = c.createOscillator(), g1 = c.createGain();
    o1.type = 'triangle';
    o1.frequency.setValueAtTime(f, t);
    o1.frequency.linearRampToValueAtTime(f * 1.4, t + 0.1);
    g1.gain.setValueAtTime(0.2, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    o1.connect(g1).connect(this.gain);
    o1.start(t); o1.stop(t + 0.24);
    if (level > 3) {
      const o2 = c.createOscillator(), g2 = c.createGain();
      o2.type = 'sine'; o2.frequency.setValueAtTime(f * 1.5, t);
      o2.frequency.linearRampToValueAtTime(f * 2, t + 0.1);
      g2.gain.setValueAtTime(0.1, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      o2.connect(g2).connect(this.gain);
      o2.start(t); o2.stop(t + 0.2);
    }
  }

  // Chop sound — satisfying slice when overshoot is trimmed
  chop() {
    const c = this.ok(), t = c.currentTime;
    const len = c.sampleRate * 0.08;
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    const src = c.createBufferSource(); src.buffer = buf;
    const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2000;
    const g = c.createGain();
    g.gain.setValueAtTime(0.3, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    src.connect(hp).connect(g).connect(this.gain);
    src.start(t); src.stop(t + 0.1);
  }

  // Stair width grew back
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

  // Crumble on miss
  fall() {
    const c = this.ok(), t = c.currentTime;
    const len = c.sampleRate * 0.35;
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    const src = c.createBufferSource(); src.buffer = buf;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 400;
    const gn = c.createGain();
    gn.gain.setValueAtTime(0.3, t); gn.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    src.connect(lp).connect(gn).connect(this.gain);
    src.start(t); src.stop(t + 0.35);

    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(300, t); o.frequency.exponentialRampToValueAtTime(50, t + 0.4);
    g.gain.setValueAtTime(0.15, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    const lp2 = c.createBiquadFilter(); lp2.type = 'lowpass'; lp2.frequency.value = 600;
    o.connect(lp2).connect(g).connect(this.gain);
    o.start(t); o.stop(t + 0.5);
  }

  // Danger rumble for narrow stairs
  danger() {
    const c = this.ok(), t = c.currentTime;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.value = 50;
    g.gain.setValueAtTime(0.08, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    o.connect(g).connect(this.gain);
    o.start(t); o.stop(t + 0.22);
  }

  // Close call tense snap
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

  // Direction switch whoosh
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
