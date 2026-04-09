import Phaser from 'phaser';
import { store } from './Store';

export interface BgTheme {
  name: string;
  top: number;
  bot: number;
  accent1: number;
  accent2: number;
  accent3: number;
}

// Theme-specific background palettes — vivid & dramatic
const THEME_BGS: Record<string, BgTheme[]> = {
  building: [
    { name: 'DOWNTOWN',  top: 0x080814, bot: 0x141430, accent1: 0x4a6fa5, accent2: 0xffeaa7, accent3: 0x6c5ce7 },
    { name: 'MIDNIGHT',  top: 0x030310, bot: 0x0a0a20, accent1: 0x1e3a5f, accent2: 0xffeaa7, accent3: 0x00cec9 },
    { name: 'NEON CITY', top: 0x0a0520, bot: 0x180e38, accent1: 0xff00ff, accent2: 0x00ffcc, accent3: 0xff6b9d },
    { name: 'CLOUDS',    top: 0x081828, bot: 0x142848, accent1: 0x74b9ff, accent2: 0xdfe6e9, accent3: 0xa29bfe },
    { name: 'SUNSET',    top: 0x200810, bot: 0x381018, accent1: 0xff6348, accent2: 0xfeca57, accent3: 0xfd79a8 },
    { name: 'STORM',     top: 0x060610, bot: 0x0e0e1c, accent1: 0x636e72, accent2: 0x74b9ff, accent3: 0xdfe6e9 },
    { name: 'DEEP SPACE',top: 0x020206, bot: 0x06060c, accent1: 0xdfe6e9, accent2: 0x6c5ce7, accent3: 0x00cec9 },
    { name: 'GOLDEN HR', top: 0x140a02, bot: 0x200e06, accent1: 0xf0c674, accent2: 0xff6348, accent3: 0xffffff },
  ],
  sushi: [
    { name: 'IZAKAYA',   top: 0x100606, bot: 0x201010, accent1: 0xe74c3c, accent2: 0xffeaa7, accent3: 0x27ae60 },
    { name: 'SAKURA',    top: 0x140814, bot: 0x281020, accent1: 0xff69b4, accent2: 0xffffff, accent3: 0xff9ff3 },
    { name: 'PACIFIC',   top: 0x021420, bot: 0x042030, accent1: 0x0984e3, accent2: 0x00cec9, accent3: 0xdfe6e9 },
    { name: 'BAMBOO',    top: 0x041004, bot: 0x0a1e0a, accent1: 0x27ae60, accent2: 0xffeaa7, accent3: 0x6ab04c },
    { name: 'WASABI',    top: 0x061006, bot: 0x0c1e0c, accent1: 0x6ab04c, accent2: 0xff6b6b, accent3: 0xffeaa7 },
    { name: 'FIRE',      top: 0x100408, bot: 0x200810, accent1: 0xff4444, accent2: 0xff8800, accent3: 0xfeca57 },
    { name: 'ZEN',       top: 0x080808, bot: 0x141414, accent1: 0xdfe6e9, accent2: 0xa29bfe, accent3: 0xffeaa7 },
    { name: 'OMAKASE',   top: 0x100802, bot: 0x1e1006, accent1: 0xf0c674, accent2: 0xe74c3c, accent3: 0xffffff },
  ],
  burger: [
    { name: 'DINER',     top: 0x140606, bot: 0x281010, accent1: 0xe74c3c, accent2: 0xf1c40f, accent3: 0x27ae60 },
    { name: 'SMOKEHOUSE',top: 0x120402, bot: 0x220a06, accent1: 0xe67e22, accent2: 0xd35400, accent3: 0xf39c12 },
    { name: 'NEON SIGN', top: 0x060316, bot: 0x100628, accent1: 0xff6b9d, accent2: 0x39ff14, accent3: 0x00ccff },
    { name: 'RETRO',     top: 0x0e0808, bot: 0x1c1212, accent1: 0xf39c12, accent2: 0xe74c3c, accent3: 0xecf0f1 },
    { name: 'KETCHUP',   top: 0x140202, bot: 0x280606, accent1: 0xff2222, accent2: 0xf1c40f, accent3: 0xffffff },
    { name: 'MUSTARD',   top: 0x100802, bot: 0x201006, accent1: 0xf1c40f, accent2: 0x8B4513, accent3: 0x27ae60 },
    { name: 'CHARCOAL',  top: 0x060404, bot: 0x0c0808, accent1: 0xff6348, accent2: 0xffa502, accent3: 0xdfe6e9 },
    { name: 'FEAST',     top: 0x0c0606, bot: 0x180e0e, accent1: 0xf0c674, accent2: 0xe74c3c, accent3: 0x27ae60 },
  ],
  cake: [
    { name: 'BAKERY',    top: 0x120808, bot: 0x241414, accent1: 0xff69b4, accent2: 0xfff0f5, accent3: 0xf0c674 },
    { name: 'CHOCOLATE', top: 0x0e0402, bot: 0x1c0a06, accent1: 0x8B4513, accent2: 0xfff5e6, accent3: 0xd2691e },
    { name: 'STRAWBERRY',top: 0x140614, bot: 0x280e20, accent1: 0xff69b4, accent2: 0xffffff, accent3: 0xef5350 },
    { name: 'MINT',      top: 0x041008, bot: 0x0a200e, accent1: 0x66bb6a, accent2: 0xe8f5e9, accent3: 0xfff0f5 },
    { name: 'VANILLA',   top: 0x0e0e06, bot: 0x1c1c0e, accent1: 0xfff9c4, accent2: 0xffb74d, accent3: 0xfff0f5 },
    { name: 'BIRTHDAY',  top: 0x0e0614, bot: 0x1e0e28, accent1: 0xba68c8, accent2: 0xff69b4, accent3: 0x42a5f5 },
    { name: 'ROYAL',     top: 0x060414, bot: 0x100a28, accent1: 0xf0c674, accent2: 0xba68c8, accent3: 0xffffff },
    { name: 'RAINBOW',   top: 0x0c0606, bot: 0x180e0e, accent1: 0xff4444, accent2: 0xfeca57, accent3: 0x48dbfb },
  ],
  dj: [
    { name: 'CLUB',      top: 0x040408, bot: 0x0a0a14, accent1: 0xff00ff, accent2: 0x00ff88, accent3: 0x00ccff },
    { name: 'RAVE',      top: 0x060214, bot: 0x100428, accent1: 0xff2222, accent2: 0xffff00, accent3: 0x00ff00 },
    { name: 'BASS DROP', top: 0x020206, bot: 0x06060e, accent1: 0x44ff44, accent2: 0x00ccff, accent3: 0xff00ff },
    { name: 'TECHNO',    top: 0x040204, bot: 0x0a060a, accent1: 0xee44ff, accent2: 0xff8800, accent3: 0x00ffcc },
    { name: 'FESTIVAL',  top: 0x080408, bot: 0x140c14, accent1: 0xff6b9d, accent2: 0xfeca57, accent3: 0x48dbfb },
    { name: 'STUDIO',    top: 0x040404, bot: 0x0a0a0a, accent1: 0xdfe6e9, accent2: 0x6c5ce7, accent3: 0x00cec9 },
    { name: 'NEON',      top: 0x020210, bot: 0x060620, accent1: 0x39ff14, accent2: 0xff073a, accent3: 0x00bfff },
    { name: 'LASER',     top: 0x060206, bot: 0x100410, accent1: 0xff0000, accent2: 0x00ff00, accent3: 0x0044ff },
  ],
  pixel: [
    { name: 'ARCADE',    top: 0x080818, bot: 0x141434, accent1: 0x5b6ee1, accent2: 0xfbf236, accent3: 0xd95763 },
    { name: 'DUNGEON',   top: 0x040408, bot: 0x0a0a12, accent1: 0x76428a, accent2: 0xfbf236, accent3: 0x6abe30 },
    { name: 'OVERWORLD', top: 0x041408, bot: 0x0a2810, accent1: 0x6abe30, accent2: 0x37946e, accent3: 0xfbf236 },
    { name: 'CASTLE',    top: 0x060406, bot: 0x100810, accent1: 0xac3232, accent2: 0xdf7126, accent3: 0xfbf236 },
    { name: 'WATER LVL', top: 0x020810, bot: 0x061420, accent1: 0x5b6ee1, accent2: 0x5fcde4, accent3: 0xffffff },
    { name: 'VOLCANO',   top: 0x140202, bot: 0x280606, accent1: 0xdf7126, accent2: 0xac3232, accent3: 0xfbf236 },
    { name: 'ICE WORLD', top: 0x061018, bot: 0x0c1c28, accent1: 0x5fcde4, accent2: 0xffffff, accent3: 0x5b6ee1 },
    { name: 'BOSS FIGHT',top: 0x080408, bot: 0x140814, accent1: 0xd95763, accent2: 0xfbf236, accent3: 0x76428a },
  ],
  aquarium: [
    { name: 'CORAL REEF',top: 0x021018, bot: 0x042028, accent1: 0x0984e3, accent2: 0xff6b6b, accent3: 0xffeaa7 },
    { name: 'DEEP BLUE', top: 0x010610, bot: 0x030e1c, accent1: 0x00b894, accent2: 0x6c5ce7, accent3: 0x00cec9 },
    { name: 'TROPICAL',  top: 0x040e0e, bot: 0x0a1e1e, accent1: 0x00cec9, accent2: 0xfeca57, accent3: 0xff6b6b },
    { name: 'KELP BED',  top: 0x020c08, bot: 0x061a0e, accent1: 0x27ae60, accent2: 0x0984e3, accent3: 0xffeaa7 },
    { name: 'PINK CORAL',top: 0x0a0410, bot: 0x180a20, accent1: 0xe84393, accent2: 0xff9ff3, accent3: 0x00cec9 },
    { name: 'SUNBEAM',   top: 0x040c14, bot: 0x0a1c28, accent1: 0x74b9ff, accent2: 0xffeaa7, accent3: 0x55efc4 },
    { name: 'ABYSS',     top: 0x010206, bot: 0x030610, accent1: 0x6c5ce7, accent2: 0x00cec9, accent3: 0xdfe6e9 },
    { name: 'LAGOON',    top: 0x040a0e, bot: 0x0a141c, accent1: 0x0097e6, accent2: 0x55efc4, accent3: 0xf8c291 },
  ],
  space: [
    { name: 'ORBIT',     top: 0x020208, bot: 0x060610, accent1: 0x00ccff, accent2: 0xdfe6e9, accent3: 0x6c5ce7 },
    { name: 'NEBULA',    top: 0x060214, bot: 0x100628, accent1: 0xff6b9d, accent2: 0x6c5ce7, accent3: 0x00cec9 },
    { name: 'STATION',   top: 0x040404, bot: 0x0a0a0a, accent1: 0xdfe6e9, accent2: 0x00ff88, accent3: 0x00ccff },
    { name: 'RED PLANET',top: 0x100202, bot: 0x200606, accent1: 0xe74c3c, accent2: 0xf39c12, accent3: 0xdfe6e9 },
    { name: 'HYPERSPACE',top: 0x020610, bot: 0x060e20, accent1: 0x48dbfb, accent2: 0xffffff, accent3: 0xa29bfe },
    { name: 'ALIEN SKY', top: 0x020602, bot: 0x060e06, accent1: 0x00ff88, accent2: 0xcc44ff, accent3: 0xfeca57 },
    { name: 'BLACK HOLE',top: 0x010102, bot: 0x030306, accent1: 0x636e72, accent2: 0xdfe6e9, accent3: 0x6c5ce7 },
    { name: 'SUPERNOVA', top: 0x080204, bot: 0x14060c, accent1: 0xfeca57, accent2: 0xff2222, accent3: 0xffffff },
  ],
  candy: [
    { name: 'CANDY LAND',top: 0x100410, bot: 0x200a20, accent1: 0xff6fd8, accent2: 0xfeca57, accent3: 0x48dbfb },
    { name: 'GUMMY',     top: 0x0a020a, bot: 0x180618, accent1: 0xff9ff3, accent2: 0x55efc4, accent3: 0xfeca57 },
    { name: 'LOLLIPOP',  top: 0x080414, bot: 0x140a28, accent1: 0xff4444, accent2: 0xffffff, accent3: 0x48dbfb },
    { name: 'TAFFY',     top: 0x0c0606, bot: 0x1a0e0e, accent1: 0xfab1a0, accent2: 0xff9ff3, accent3: 0xa29bfe },
    { name: 'SPEARMINT', top: 0x040c08, bot: 0x0a1c0e, accent1: 0x55efc4, accent2: 0xffffff, accent3: 0x00cec9 },
    { name: 'BUBBLEGUM', top: 0x120414, bot: 0x240a24, accent1: 0xff6fd8, accent2: 0xff9ff3, accent3: 0xffffff },
    { name: 'SOUR PATCH',top: 0x060c02, bot: 0x0e1a06, accent1: 0xfeca57, accent2: 0x6ab04c, accent3: 0xff4444 },
    { name: 'COTTON',    top: 0x060610, bot: 0x0e0e22, accent1: 0xa29bfe, accent2: 0xff9ff3, accent3: 0x48dbfb },
  ],
  bamboo: [
    { name: 'GARDEN',    top: 0x040e04, bot: 0x0a1e0a, accent1: 0x6ab04c, accent2: 0x27ae60, accent3: 0xffeaa7 },
    { name: 'FOREST',    top: 0x020802, bot: 0x061206, accent1: 0x2ecc71, accent2: 0x6ab04c, accent3: 0xdfe6e9 },
    { name: 'TEMPLE',    top: 0x0c0804, bot: 0x1a120a, accent1: 0xf0c674, accent2: 0xe74c3c, accent3: 0x27ae60 },
    { name: 'MONSOON',   top: 0x040808, bot: 0x0a1212, accent1: 0x74b9ff, accent2: 0x6ab04c, accent3: 0xdfe6e9 },
    { name: 'CHERRY BL', top: 0x060804, bot: 0x0e1408, accent1: 0xff9ff3, accent2: 0x6ab04c, accent3: 0xffffff },
    { name: 'TWILIGHT',  top: 0x060410, bot: 0x100a20, accent1: 0xa29bfe, accent2: 0x6ab04c, accent3: 0xffeaa7 },
    { name: 'KOI POND',  top: 0x040a0c, bot: 0x0a1618, accent1: 0xff6348, accent2: 0x6ab04c, accent3: 0xffeaa7 },
    { name: 'MOONLIGHT', top: 0x040408, bot: 0x0a0a14, accent1: 0xdfe6e9, accent2: 0x6ab04c, accent3: 0xffeaa7 },
  ],
  icecream: [
    { name: 'PARLOR',    top: 0x10060a, bot: 0x200e16, accent1: 0xfab1a0, accent2: 0xffeaa7, accent3: 0xff9ff3 },
    { name: 'SUNDAE',    top: 0x0c0402, bot: 0x1c0c06, accent1: 0x8B4513, accent2: 0xffeaa7, accent3: 0xe74c3c },
    { name: 'GELATO',    top: 0x080606, bot: 0x140e0e, accent1: 0xff9ff3, accent2: 0x55efc4, accent3: 0xfeca57 },
    { name: 'WAFFLE',    top: 0x0e0804, bot: 0x1e120a, accent1: 0xf0c674, accent2: 0xd4a34a, accent3: 0xfab1a0 },
    { name: 'SORBET',    top: 0x060c0c, bot: 0x0e1a1a, accent1: 0x55efc4, accent2: 0xa29bfe, accent3: 0xffffff },
    { name: 'SPRINKLES', top: 0x0a0414, bot: 0x180a24, accent1: 0xff4444, accent2: 0xfeca57, accent3: 0x48dbfb },
    { name: 'FROZEN',    top: 0x040e14, bot: 0x0a1e28, accent1: 0x48dbfb, accent2: 0xdfe6e9, accent3: 0xa29bfe },
    { name: 'TROPICAL',  top: 0x0c0a02, bot: 0x1a1406, accent1: 0xf9ca24, accent2: 0xff6348, accent3: 0x27ae60 },
  ],
};

const STAIRS_PER_THEME = 8;

// ── Theme-specific decoration configs ──
interface DecoConfig {
  fallerCount: number;    // falling decorations (leaves, bubbles, stars, etc.)
  fallerSpeed: [number, number];
  fallerSize: [number, number];
  fallerAlpha: [number, number];
  fallerDrift: number;    // horizontal drift strength
  pulseCount: number;     // pulsing ambient objects
  pulseSize: [number, number];
  pulseAlpha: [number, number];
  pulseSpeed: [number, number];
}

const DECO_CONFIGS: Record<string, DecoConfig> = {
  building: { fallerCount: 0, fallerSpeed: [0, 0], fallerSize: [0, 0], fallerAlpha: [0, 0], fallerDrift: 0, pulseCount: 8, pulseSize: [1, 3], pulseAlpha: [0.03, 0.1], pulseSpeed: [0.4, 1.2] },
  sushi:    { fallerCount: 12, fallerSpeed: [0.3, 0.8], fallerSize: [2, 5], fallerAlpha: [0.04, 0.12], fallerDrift: 1.5, pulseCount: 5, pulseSize: [2, 4], pulseAlpha: [0.02, 0.06], pulseSpeed: [0.2, 0.6] },
  burger:   { fallerCount: 8, fallerSpeed: [0.2, 0.5], fallerSize: [2, 4], fallerAlpha: [0.03, 0.08], fallerDrift: 0.3, pulseCount: 6, pulseSize: [3, 8], pulseAlpha: [0.02, 0.05], pulseSpeed: [0.1, 0.4] },
  cake:     { fallerCount: 15, fallerSpeed: [0.2, 0.7], fallerSize: [1, 3], fallerAlpha: [0.05, 0.15], fallerDrift: 1.2, pulseCount: 4, pulseSize: [4, 10], pulseAlpha: [0.02, 0.05], pulseSpeed: [0.3, 0.8] },
  dj:       { fallerCount: 0, fallerSpeed: [0, 0], fallerSize: [0, 0], fallerAlpha: [0, 0], fallerDrift: 0, pulseCount: 12, pulseSize: [3, 15], pulseAlpha: [0.02, 0.08], pulseSpeed: [0.5, 2.0] },
  pixel:    { fallerCount: 10, fallerSpeed: [0.5, 1.2], fallerSize: [2, 4], fallerAlpha: [0.04, 0.1], fallerDrift: 0.2, pulseCount: 6, pulseSize: [2, 5], pulseAlpha: [0.03, 0.08], pulseSpeed: [0.3, 0.8] },
  aquarium: { fallerCount: 18, fallerSpeed: [0.15, 0.5], fallerSize: [1, 4], fallerAlpha: [0.05, 0.15], fallerDrift: 0.8, pulseCount: 5, pulseSize: [2, 6], pulseAlpha: [0.03, 0.08], pulseSpeed: [0.2, 0.5] },
  space:    { fallerCount: 20, fallerSpeed: [0.3, 1.5], fallerSize: [0.5, 2], fallerAlpha: [0.08, 0.3], fallerDrift: 0.1, pulseCount: 4, pulseSize: [2, 5], pulseAlpha: [0.02, 0.06], pulseSpeed: [0.1, 0.3] },
  candy:    { fallerCount: 14, fallerSpeed: [0.2, 0.6], fallerSize: [1, 3], fallerAlpha: [0.06, 0.15], fallerDrift: 1.0, pulseCount: 6, pulseSize: [3, 8], pulseAlpha: [0.03, 0.08], pulseSpeed: [0.3, 0.7] },
  bamboo:   { fallerCount: 10, fallerSpeed: [0.15, 0.45], fallerSize: [2, 5], fallerAlpha: [0.04, 0.1], fallerDrift: 2.0, pulseCount: 8, pulseSize: [1, 3], pulseAlpha: [0.04, 0.12], pulseSpeed: [0.5, 1.5] },
  icecream: { fallerCount: 12, fallerSpeed: [0.2, 0.6], fallerSize: [1, 3], fallerAlpha: [0.05, 0.12], fallerDrift: 0.8, pulseCount: 5, pulseSize: [3, 7], pulseAlpha: [0.03, 0.08], pulseSpeed: [0.2, 0.6] },
};

interface Floater {
  obj: Phaser.GameObjects.Arc;
  baseX: number;
  baseY: number;
  sx: number; sy: number;
  amp: number;
  phase: number;
  parallax: number;
}

interface Riser {
  obj: Phaser.GameObjects.Arc;
  speed: number;
  drift: number;
}

interface Faller {
  obj: Phaser.GameObjects.Arc;
  speed: number;
  drift: number;
  driftPhase: number;
  driftAmp: number;
}

interface Pulser {
  obj: Phaser.GameObjects.Arc;
  baseAlpha: number;
  speed: number;
  phase: number;
  baseX: number;
  baseY: number;
  parallax: number;
}

export class BackgroundManager {
  private scene: Phaser.Scene;
  private bgGfx: Phaser.GameObjects.Graphics;
  private floaters: Floater[] = [];
  private risers: Riser[] = [];
  private fallers: Faller[] = [];
  private pulsers: Pulser[] = [];
  private decoGfx!: Phaser.GameObjects.Graphics;
  private themeIdx = 0;
  private elapsed = 0;
  private W: number;
  private H: number;
  private blockThemeId: string;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    // MUST use window dimensions — Phaser scale may not be ready yet, especially on iPad
    this.W = window.innerWidth || 430;
    this.H = window.innerHeight || 932;
    this.blockThemeId = store.getCurrentTheme();
    this.bgGfx = scene.add.graphics().setDepth(-10);
    this.decoGfx = scene.add.graphics().setDepth(-5).setScrollFactor(0);
    const themes = this.getThemes();
    this.drawGrad(themes[0]);
    this.createFloaters(themes[0]);
    this.createRisers(themes[0]);
    this.createFallers(themes[0]);
    this.createPulsers(themes[0]);
  }

  private getThemes(): BgTheme[] {
    return THEME_BGS[this.blockThemeId] || THEME_BGS['building'];
  }

  getTheme(): BgTheme {
    const themes = this.getThemes();
    return themes[this.themeIdx % themes.length];
  }

  update(dt: number, camY: number) {
    this.elapsed += dt * 0.001;
    // Keep W/H updated for resize
    const liveW = this.scene.scale.width;
    const liveH = this.scene.scale.height;

    // Floaters — sinusoidal bob
    for (const f of this.floaters) {
      f.obj.x = f.baseX + Math.sin(this.elapsed * f.sx + f.phase) * f.amp;
      f.obj.y = f.baseY + Math.cos(this.elapsed * f.sy + f.phase) * (f.amp * 0.5) + camY * f.parallax;
    }

    // Risers — float upward
    for (const r of this.risers) {
      r.obj.y -= r.speed;
      r.obj.x += Math.sin(this.elapsed * r.drift) * 0.3;
      if (r.obj.y < camY - liveH) {
        r.obj.y = camY + liveH + 50;
        r.obj.x = Phaser.Math.Between(0, liveW);
      }
    }

    // Fallers — themed falling particles
    for (const fl of this.fallers) {
      fl.obj.y += fl.speed;
      fl.obj.x += Math.sin(this.elapsed * fl.drift + fl.driftPhase) * fl.driftAmp;
      if (fl.obj.y > camY + liveH + 30) {
        fl.obj.y = camY - 30;
        fl.obj.x = Phaser.Math.Between(0, liveW);
      }
    }

    // Pulsers — breathing ambient glows
    for (const p of this.pulsers) {
      const pulse = Math.sin(this.elapsed * p.speed + p.phase) * 0.5 + 0.5;
      p.obj.setAlpha(p.baseAlpha * (0.3 + pulse * 0.7));
      p.obj.y = p.baseY + camY * p.parallax;
    }

    // Animated deco layer (theme-specific per-frame drawing)
    this.drawDecorations(camY);
  }

  onScoreChange(score: number): string | null {
    const themes = this.getThemes();
    const newIdx = Math.floor(score / STAIRS_PER_THEME) % themes.length;
    if (newIdx === this.themeIdx) return null;
    this.themeIdx = newIdx;
    const theme = themes[newIdx];

    const oldBg = this.bgGfx;
    this.bgGfx = this.scene.add.graphics().setDepth(-10).setAlpha(0);
    this.drawGrad(theme);
    this.scene.tweens.add({ targets: this.bgGfx, alpha: 1, duration: 1000 });
    this.scene.tweens.add({ targets: oldBg, alpha: 0, duration: 1000, onComplete: () => oldBg.destroy() });

    const colors = [theme.accent1, theme.accent2, theme.accent3];
    this.floaters.forEach((f, i) => {
      f.obj.setFillStyle(colors[i % 3], f.obj.fillAlpha);
    });
    this.risers.forEach((r, i) => {
      r.obj.setFillStyle(colors[i % 3], r.obj.fillAlpha);
    });
    this.fallers.forEach((fl, i) => {
      fl.obj.setFillStyle(colors[i % 3], fl.obj.fillAlpha);
    });
    this.pulsers.forEach((p, i) => {
      p.obj.setFillStyle(colors[i % 3], p.baseAlpha);
    });

    return theme.name;
  }

  updateOverlayPosition() {}

  private drawGrad(theme: BgTheme) {
    this.bgGfx.fillGradientStyle(theme.top, theme.top, theme.bot, theme.bot, 1);
    this.bgGfx.fillRect(-1000, -20000, 3000, 30000);
  }

  // Theme-specific per-frame decorations — Geometry Dash style, dramatic & immersive
  private drawDecorations(_camY: number) {
    this.decoGfx.clear();
    const t = this.elapsed;
    const theme = this.getTheme();
    const g = this.decoGfx;
    // Use live viewport size so it works on iPad too
    const W = this.scene.scale.width;
    const H = this.scene.scale.height;
    const tid = this.blockThemeId;

    // ── Universal full-screen ambient: scattered glowing dots across ENTIRE viewport ──
    const ambColors = [theme.accent1, theme.accent2, theme.accent3];
    for (let i = 0; i < 20; i++) {
      const ax = (i * 79 + 23) % W;
      const ay = (i * 167 + 41) % H;
      const pulse = Math.sin(t * (0.8 + i * 0.2) + i * 2.3) * 0.5 + 0.5;
      g.fillStyle(ambColors[i % 3], pulse * 0.06);
      g.fillCircle(ax, ay, 3 + pulse * 4);
    }
    // Drifting light streaks across full screen
    for (let i = 0; i < 4; i++) {
      const sx = ((t * (5 + i * 3) + i * 200) % (W + 100)) - 50;
      const sy = H * (0.15 + i * 0.2);
      g.fillStyle(ambColors[i % 3], 0.03);
      g.fillRect(sx, sy, 60 + i * 20, 1);
    }

    // ═══════════════════════════════════════════════════════════════
    // BUILDING — Cityscape silhouette, twinkling windows, clouds, airplane
    // ═══════════════════════════════════════════════════════════════
    if (tid === 'building') {
      // --- Layer 1 (far): Tall distant skyscrapers covering full screen ---
      const farScroll = t * 3;
      g.fillStyle(theme.accent1, 0.08);
      for (let i = 0; i < 14; i++) {
        const bx = ((i * 38 + farScroll) % (W + 60)) - 30;
        const bh = H * 0.4 + ((i * 53) % (H * 0.5));
        const bw = 12 + (i * 7) % 14;
        g.fillRect(bx, H - bh, bw, bh);
        if (i % 3 === 0) g.fillRect(bx + bw / 2 - 1, H - bh - 15, 2, 15);
      }

      // --- Layer 2 (mid): Taller closer buildings ---
      const midScroll = t * 8;
      g.fillStyle(theme.accent1, 0.15);
      for (let i = 0; i < 10; i++) {
        const bx = ((i * 50 + midScroll + 17) % (W + 80)) - 40;
        const bh = H * 0.5 + ((i * 67) % (H * 0.45));
        const bw = 18 + (i * 11) % 20;
        g.fillRect(bx, H - bh, bw, bh);
        g.fillRect(bx + 3, H - bh - 20 - (i * 13) % 40, bw - 6, 20 + (i * 13) % 40);
      }

      // --- Twinkling lit windows spread across buildings ---
      for (let i = 0; i < 60; i++) {
        const bIdx = i % 10;
        const bx = ((bIdx * 50 + midScroll + 17) % (W + 80)) - 40;
        const bh = H * 0.5 + ((bIdx * 67) % (H * 0.45));
        const bw = 18 + (bIdx * 11) % 20;
        const wx = bx + 3 + ((i * 7) % Math.max(1, bw - 6));
        const wy = H - bh + 5 + ((i * 13) % Math.max(1, bh - 10));
        const flicker = Math.sin(t * (2 + i * 0.5) + i * 3.7) * 0.5 + 0.5;
        g.fillStyle(0xffeaa7, 0.08 + flicker * 0.18);
        g.fillRect(wx, wy, 3, 3);
      }

      // --- Moving clouds at top ---
      for (let i = 0; i < 5; i++) {
        const cx = ((t * (6 + i * 2) + i * 120) % (W + 200)) - 100;
        const cy = H * (0.05 + i * 0.08);
        g.fillStyle(theme.accent3, 0.10 + (i % 2) * 0.05);
        g.fillCircle(cx, cy, 25 + i * 5);
        g.fillCircle(cx + 20, cy + 5, 20 + i * 3);
        g.fillCircle(cx - 15, cy + 3, 18 + i * 4);
        g.fillCircle(cx + 35, cy + 8, 14);
      }

      // --- Airplane light crossing ---
      const planeX = ((t * 25) % (W + 200)) - 100;
      const planeY = H * 0.12 + Math.sin(t * 0.3) * 10;
      // Fuselage glow
      g.fillStyle(0xffffff, 0.15);
      g.fillCircle(planeX, planeY, 3);
      // Blinking red light
      const blink = Math.sin(t * 6) > 0.3 ? 0.25 : 0.05;
      g.fillStyle(0xff0000, blink);
      g.fillCircle(planeX - 8, planeY + 2, 2);
      // Wing lights
      g.fillStyle(0x00ff00, 0.12);
      g.fillCircle(planeX + 8, planeY + 1, 1.5);
    }

    // ═══════════════════════════════════════════════════════════════
    // SUSHI — Cherry blossom trees, sakura petals, steam, red lanterns
    // ═══════════════════════════════════════════════════════════════
    if (tid === 'sushi') {
      // --- Cherry blossom tree silhouettes on sides ---
      for (let side = 0; side < 2; side++) {
        const tx = side === 0 ? -10 : W + 10;
        const dir = side === 0 ? 1 : -1;
        const ty = H * 0.05;
        // Trunk — full height
        g.fillStyle(0x4a2020, 0.20);
        g.fillRect(tx + dir * 5, ty, dir * 12, H * 0.95);
        // Branches
        for (let b = 0; b < 4; b++) {
          const by = ty + b * (H * 0.12);
          const bLen = 40 + b * 15;
          g.fillStyle(0x4a2020, 0.18);
          g.beginPath();
          g.moveTo(tx + dir * 12, by);
          g.lineTo(tx + dir * (12 + bLen), by - 15 + b * 5);
          g.lineTo(tx + dir * (12 + bLen), by - 10 + b * 5);
          g.lineTo(tx + dir * 12, by + 4);
          g.closePath(); g.fillPath();
          // Blossom clusters
          g.fillStyle(0xff9ff3, 0.18);
          const bex = tx + dir * (12 + bLen);
          const bey = by - 12 + b * 5;
          g.fillCircle(bex, bey, 14);
          g.fillCircle(bex + dir * 10, bey + 5, 11);
          g.fillCircle(bex - dir * 5, bey - 8, 9);
          g.fillStyle(0xffb6c1, 0.12);
          g.fillCircle(bex + dir * 15, bey - 3, 8);
        }
      }

      // --- Falling sakura petals ---
      for (let i = 0; i < 20; i++) {
        const px = ((t * (8 + i * 2) + i * 50) % (W + 60)) - 30;
        const py = ((t * (15 + i * 3) + i * 100) % (H + 80)) - 40;
        const rot = t * (0.8 + i * 0.15) + i * 2.5;
        const stretch = Math.abs(Math.sin(rot));
        const drift = Math.sin(t * 0.5 + i * 1.2) * 8;
        g.fillStyle(0xff69b4, 0.15 + stretch * 0.10);
        g.fillCircle(px + drift, py, 3 + stretch * 2);
        g.fillCircle(px + drift + 3, py - 2, 2 + stretch);
      }

      // --- Rising steam wisps ---
      for (let i = 0; i < 6; i++) {
        const riseT = (t * 0.4 + i * 0.7) % 5;
        const sx = W * (0.15 + i * 0.14);
        const sy = H - riseT * H * 0.25;
        const a = Math.max(0, 0.15 - riseT * 0.03);
        g.fillStyle(0xffffff, a);
        const wobble = Math.sin(t * 0.6 + i * 1.5) * 15;
        g.fillCircle(sx + wobble, sy, 10 + riseT * 8);
        g.fillCircle(sx + wobble + 8, sy - 6, 8 + riseT * 5);
      }

      // --- Red lanterns glowing ---
      for (let i = 0; i < 4; i++) {
        const lx = W * (0.15 + i * 0.23);
        const ly = H * 0.08 + Math.sin(t * 0.4 + i * 1.5) * 5;
        // String
        g.fillStyle(0x333333, 0.15);
        g.fillRect(lx, 0 - 5, 1, ly - 5);
        // Lantern glow
        const glow = Math.sin(t * 1.5 + i * 2) * 0.05 + 0.20;
        g.fillStyle(0xff2222, glow);
        g.fillCircle(lx, ly, 10);
        g.fillStyle(0xff4444, glow * 1.3);
        g.fillCircle(lx, ly, 6);
        // Bottom tassel
        g.fillStyle(0xffcc00, 0.18);
        g.fillRect(lx - 0.5, ly + 10, 1, 6);
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // BURGER — Grill flames, BBQ smoke, floating ingredients, neon sign
    // ═══════════════════════════════════════════════════════════════
    if (tid === 'burger') {
      // --- Grill flames at bottom (large, dramatic) ---
      for (let i = 0; i < 14; i++) {
        const fx = W * (0.02 + i * 0.07);
        const fy = H;
        const flameH = 30 + Math.sin(t * 4 + i * 1.7) * 18 + Math.sin(t * 7 + i * 3.1) * 8;
        // Outer flame
        g.fillStyle(0xff4500, 0.20);
        g.fillTriangle(fx - 10, fy, fx + 10, fy, fx + Math.sin(t * 3 + i) * 6, fy - flameH);
        // Mid flame
        g.fillStyle(0xff8c00, 0.18);
        g.fillTriangle(fx - 6, fy, fx + 6, fy, fx + Math.sin(t * 5 + i * 2) * 4, fy - flameH * 0.7);
        // Core
        g.fillStyle(0xfeca57, 0.15);
        g.fillTriangle(fx - 3, fy, fx + 3, fy, fx, fy - flameH * 0.4);
      }

      // --- Large BBQ smoke clouds rising ---
      for (let i = 0; i < 10; i++) {
        const riseT = (t * 0.3 + i * 0.5) % 6;
        const sx = W * (0.05 + i * 0.10);
        const sy = H - riseT * H * 0.2;
        const size = 12 + riseT * 14;
        const a = Math.max(0, 0.18 - riseT * 0.03);
        g.fillStyle(0xb2bec3, a);
        g.fillCircle(sx + Math.sin(t * 0.3 + i * 1.2) * 20, sy, size);
        g.fillCircle(sx + Math.sin(t * 0.3 + i * 1.2) * 20 + size * 0.6, sy - size * 0.3, size * 0.7);
      }

      // --- Floating ingredient silhouettes ---
      // Buns
      for (let i = 0; i < 3; i++) {
        const bx = ((t * (5 + i * 3) + i * 140) % (W + 80)) - 40;
        const by = H * (0.2 + i * 0.2) + Math.sin(t * 0.5 + i * 2) * 20;
        g.fillStyle(0xd4a34a, 0.18);
        g.fillCircle(bx, by, 14);
        g.fillCircle(bx - 8, by + 2, 10);
        g.fillCircle(bx + 8, by + 2, 10);
      }
      // Cheese slices
      for (let i = 0; i < 2; i++) {
        const cx = ((t * (7 + i * 4) + i * 200 + 60) % (W + 60)) - 30;
        const cy = H * (0.35 + i * 0.25) + Math.sin(t * 0.4 + i * 3) * 15;
        g.fillStyle(0xf1c40f, 0.18);
        g.fillRect(cx - 12, cy - 2, 24, 4);
        // Melting drip
        g.fillTriangle(cx - 6, cy + 2, cx - 3, cy + 2, cx - 4, cy + 10);
        g.fillTriangle(cx + 4, cy + 2, cx + 7, cy + 2, cx + 6, cy + 8);
      }

      // --- Neon "OPEN" sign — subtle text outline, not filled rect ---
      const neonPulse = Math.sin(t * 2) * 0.04 + 0.08;
      g.lineStyle(1.5, 0xff4444, neonPulse);
      g.strokeRoundedRect(W * 0.38, H * 0.06, W * 0.24, H * 0.035, 4);
      // Glow around it
      g.fillStyle(0xff0000, neonPulse * 0.3);
      g.fillCircle(W * 0.5, H * 0.075, 20);
    }

    // ═══════════════════════════════════════════════════════════════
    // CAKE — Confetti rain, balloons, candle flames, cream swirls
    // ═══════════════════════════════════════════════════════════════
    if (tid === 'cake') {
      // --- Bold confetti rain ---
      const confettiCols = [0xff69b4, 0xfeca57, 0x48dbfb, 0x55efc4, 0xff6b6b, 0xa29bfe, 0xff9ff3, 0xffffff];
      for (let i = 0; i < 30; i++) {
        const cx = ((t * (6 + i * 1.5) + i * 40) % (W + 30)) - 15;
        const cy = ((t * (20 + i * 2) + i * 80) % (H + 50)) - 25;
        const rot = t * (1.5 + i * 0.3) + i * 1.1;
        const stretch = Math.abs(Math.sin(rot));
        g.fillStyle(confettiCols[i % confettiCols.length], 0.22);
        if (i % 4 === 0) {
          g.fillCircle(cx, cy, 3);
        } else if (i % 4 === 1) {
          g.fillRect(cx - 4 * stretch, cy, 8 * stretch, 3);
        } else if (i % 4 === 2) {
          g.fillTriangle(cx - 3, cy + 3, cx + 3, cy + 3, cx, cy - 4);
        } else {
          g.fillRect(cx, cy, 3, 6 * stretch);
        }
      }

      // --- Floating birthday balloons ---
      const balloonCols = [0xff4444, 0x4488ff, 0xffcc00, 0x44cc44, 0xff69b4, 0xcc44ff];
      for (let i = 0; i < 6; i++) {
        const bx = W * (0.08 + i * 0.16) + Math.sin(t * 0.4 + i * 2) * 12;
        const by = H * (0.15 + i * 0.1) + Math.sin(t * 0.6 + i * 1.5) * 18;
        // String
        g.lineStyle(1, 0xffffff, 0.12);
        g.lineBetween(bx, by + 14, bx + Math.sin(t * 0.3 + i) * 8, by + 50);
        // Balloon body
        g.fillStyle(balloonCols[i], 0.22);
        g.fillCircle(bx, by, 12);
        g.fillCircle(bx, by + 3, 10);
        // Shine
        g.fillStyle(0xffffff, 0.12);
        g.fillCircle(bx - 3, by - 3, 3);
        // Knot
        g.fillStyle(balloonCols[i], 0.18);
        g.fillTriangle(bx - 2, by + 12, bx + 2, by + 12, bx, by + 16);
      }

      // --- Candle flames (large) ---
      for (let i = 0; i < 5; i++) {
        const cx = W * (0.12 + i * 0.19);
        const cy = H * 0.75;
        const flicker = Math.sin(t * 5 + i * 2.5) * 3;
        // Candle body
        g.fillStyle(0xfff5e6, 0.18);
        g.fillRect(cx - 3, cy, 6, 30);
        // Stripe
        g.fillStyle(confettiCols[i % confettiCols.length], 0.12);
        g.fillRect(cx - 3, cy, 6, 30);
        // Outer flame glow
        g.fillStyle(0xffa500, 0.15);
        g.fillCircle(cx + flicker * 0.5, cy - 8, 10);
        // Flame
        g.fillStyle(0xfeca57, 0.25);
        g.fillTriangle(cx - 5, cy, cx + 5, cy, cx + flicker, cy - 16);
        // Core
        g.fillStyle(0xffffff, 0.20);
        g.fillCircle(cx + flicker * 0.3, cy - 5, 3);
      }

      // --- Cream swirl pattern ---
      for (let i = 0; i < 3; i++) {
        const sx = W * (0.2 + i * 0.3);
        const sy = H * 0.45 + Math.sin(t * 0.3 + i * 2) * 20;
        for (let j = 0; j < 12; j++) {
          const angle = t * 0.5 + j * (Math.PI / 6) + i * 2;
          const r = 8 + j * 2;
          g.fillStyle(0xfff0f5, 0.10 - j * 0.006);
          g.fillCircle(sx + Math.cos(angle) * r, sy + Math.sin(angle) * r, 4 - j * 0.2);
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // DJ — Beat rings, laser beams, equalizer bars, strobe, vinyl
    // ═══════════════════════════════════════════════════════════════
    if (tid === 'dj') {
      // --- Large expanding beat rings from center ---
      const beatPhase = t * 3.5;
      for (let i = 0; i < 6; i++) {
        const ring = ((beatPhase + i * 1.2) % 6) / 6;
        const r = ring * Math.max(W, H) * 0.7;
        const a = (1 - ring) * 0.22;
        if (a > 0.01) {
          const cols = [theme.accent1, theme.accent2, theme.accent3];
          g.lineStyle(3 - ring * 2, cols[i % 3], a);
          g.strokeCircle(W / 2, H * 0.5, r);
        }
      }

      // --- Sweeping laser beams ---
      for (let i = 0; i < 5; i++) {
        const angle = Math.sin(t * (0.6 + i * 0.3) + i * 1.5) * 1.2;
        const lx = W * 0.5;
        const ly = H * 0.1;
        const cols = [theme.accent1, theme.accent2, theme.accent3, theme.accent1, theme.accent2];
        g.lineStyle(2, cols[i], 0.18);
        g.lineBetween(lx, ly,
          lx + Math.cos(angle + i * 0.8) * H * 1.2,
          ly + Math.sin(angle + i * 0.8) * H * 1.2);
        // Glow at source
        g.fillStyle(cols[i], 0.10);
        g.fillCircle(lx, ly, 5);
      }

      // --- Equalizer bars on sides ---
      const barCount = 12;
      for (let i = 0; i < barCount; i++) {
        const freq = Math.sin(t * (3 + i * 0.8) + i * 2.1) * 0.5 + 0.5;
        const barH = freq * H * 0.35;
        const barW = 6;
        // Left side
        g.fillStyle(theme.accent1, 0.15 + freq * 0.10);
        g.fillRect(3, H - barH - i * 0, barW, barH);
        // Right side
        g.fillStyle(theme.accent2, 0.15 + freq * 0.10);
        g.fillRect(W - barW - 3, H - barH, barW, barH);
        // Color shift by height
        if (freq > 0.7) {
          g.fillStyle(theme.accent3, 0.12);
          g.fillRect(3, H - barH, barW, 4);
          g.fillRect(W - barW - 3, H - barH, barW, 4);
        }
      }

      // --- Strobe flash effect ---
      const strobe = Math.sin(t * 8);
      if (strobe > 0.92) {
        g.fillStyle(0xffffff, 0.08);
        g.fillRect(0, 0, W, H);
      }

      // --- Spinning vinyl record ---
      const vx = W * 0.82, vy = H * 0.5;
      const vRot = t * 2;
      // Record body
      g.fillStyle(0x111111, 0.25);
      g.fillCircle(vx, vy, 35);
      // Grooves
      for (let r = 10; r < 34; r += 4) {
        g.lineStyle(1, theme.accent1, 0.08);
        g.strokeCircle(vx, vy, r);
      }
      // Label
      g.fillStyle(theme.accent2, 0.20);
      g.fillCircle(vx, vy, 10);
      // Spindle
      g.fillStyle(0xffffff, 0.20);
      g.fillCircle(vx, vy, 3);
      // Spinning highlight
      g.fillStyle(0xffffff, 0.06);
      g.fillCircle(vx + Math.cos(vRot) * 20, vy + Math.sin(vRot) * 20, 5);
    }

    // ═══════════════════════════════════════════════════════════════
    // PIXEL — Pixel clouds, coins/stars, ground+grass, mountains, scanlines
    // ═══════════════════════════════════════════════════════════════
    if (tid === 'pixel') {
      // --- Pixel art mountains scrolling (far layer) — tall, full screen ---
      const mtnScroll = t * 4;
      g.fillStyle(theme.accent1, 0.14);
      for (let i = 0; i < 8; i++) {
        const mx = ((i * 60 + mtnScroll) % (W + 120)) - 60;
        const mh = H * 0.3 + (i * 37) % (H * 0.5);
        const mw = 40 + (i * 23) % 30;
        // Blocky mountain (pixel style = stacked rectangles)
        for (let step = 0; step < 5; step++) {
          const sw = mw - step * (mw / 5);
          g.fillRect(mx + (mw - sw) / 2, H - mh + step * (mh / 5) - 20, sw, mh / 5 + 1);
        }
      }

      // --- Pixel art mountains (near layer) ---
      const mtnScroll2 = t * 10;
      g.fillStyle(theme.accent1, 0.22);
      for (let i = 0; i < 6; i++) {
        const mx = ((i * 80 + mtnScroll2 + 35) % (W + 140)) - 70;
        const mh = 35 + (i * 29) % 40;
        const mw = 30 + (i * 17) % 25;
        for (let step = 0; step < 4; step++) {
          const sw = mw - step * (mw / 4);
          g.fillRect(mx + (mw - sw) / 2, H - mh + step * (mh / 4) - 5, sw, mh / 4 + 1);
        }
      }

      // --- Ground line with grass ---
      g.fillStyle(theme.accent1, 0.18);
      g.fillRect(0, H - 6, W, 6);
      // Grass tufts
      for (let i = 0; i < 30; i++) {
        const gx = (i * W / 30);
        g.fillRect(gx, H - 10, 4, 4);
        if (i % 3 === 0) g.fillRect(gx + 2, H - 14, 4, 4);
      }

      // --- Falling coins/stars ---
      for (let i = 0; i < 10; i++) {
        const cx = (i * 47 + 15) % W;
        const cy = ((t * 50 + i * 120) % (H + 50)) - 25;
        const stretch = Math.abs(Math.sin(t * 2.5 + i));
        // Coin (pixel style)
        g.fillStyle(0xfbf236, 0.22);
        g.fillRect(cx - 4 * stretch, cy - 4, 8 * stretch, 8);
        // Inner detail
        g.fillStyle(0xd4a017, 0.18);
        g.fillRect(cx - 2 * stretch, cy - 2, 4 * stretch, 4);
      }

      // --- Pixel clouds ---
      for (let i = 0; i < 4; i++) {
        const cx = ((t * (8 + i * 3) + i * 130) % (W + 120)) - 60;
        const cy = H * (0.1 + i * 0.18);
        g.fillStyle(0xffffff, 0.15);
        // Blocky cloud shape
        g.fillRect(cx, cy, 28, 8);
        g.fillRect(cx + 4, cy - 8, 20, 8);
        g.fillRect(cx + 8, cy - 16, 12, 8);
        g.fillRect(cx - 4, cy + 8, 16, 8);
        g.fillRect(cx + 20, cy + 8, 12, 8);
      }

      // --- Scanline effect ---
      for (let i = 0; i < Math.floor(H / 4); i++) {
        g.fillStyle(0x000000, 0.04);
        g.fillRect(0, i * 4, W, 1);
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // AQUARIUM — Caustic rays, big fish, coral reef, bubbles, seaweed
    // ═══════════════════════════════════════════════════════════════
    if (tid === 'aquarium') {
      // --- Bright caustic light rays ---
      for (let i = 0; i < 8; i++) {
        const rx = ((t * (8 + i * 3) + i * 55) % (W + 150)) - 75;
        const rw = 12 + Math.sin(t * 0.5 + i * 1.3) * 6;
        const brightness = 0.10 + Math.sin(t * 0.8 + i * 2) * 0.04;
        g.fillStyle(0xffffff, brightness);
        g.beginPath();
        g.moveTo(rx, 0 - 20);
        g.lineTo(rx + rw * 4, H + 20);
        g.lineTo(rx + rw * 4 + rw * 1.5, H + 20);
        g.lineTo(rx + rw, 0 - 20);
        g.closePath(); g.fillPath();
      }

      // --- Large fish swimming across slowly ---
      for (let i = 0; i < 4; i++) {
        const speed = 12 + i * 6;
        const fx = ((t * speed + i * 180) % (W + 160)) - 80;
        const fy = H * (0.2 + i * 0.17) + Math.sin(t * 0.4 + i * 2.5) * 25;
        const dir = i % 2 === 0 ? 1 : -1;
        const fishSize = 12 + i * 4;
        // Body
        g.fillStyle(theme.accent2, 0.18);
        g.fillCircle(fx, fy, fishSize);
        g.fillCircle(fx + dir * fishSize * 0.6, fy, fishSize * 0.8);
        // Tail
        g.fillTriangle(
          fx - dir * fishSize * 0.8, fy,
          fx - dir * (fishSize * 1.6), fy - fishSize * 0.6,
          fx - dir * (fishSize * 1.6), fy + fishSize * 0.6
        );
        // Eye
        g.fillStyle(0xffffff, 0.20);
        g.fillCircle(fx + dir * fishSize * 0.5, fy - fishSize * 0.2, 3);
        g.fillStyle(0x000000, 0.20);
        g.fillCircle(fx + dir * fishSize * 0.55, fy - fishSize * 0.2, 1.5);
        // Fin
        g.fillStyle(theme.accent2, 0.12);
        const finWave = Math.sin(t * 3 + i * 2) * 5;
        g.fillTriangle(fx, fy + fishSize * 0.3, fx - dir * 5, fy + fishSize + finWave, fx + dir * 5, fy + fishSize * 0.5);
      }

      // --- Coral reef silhouettes on sides ---
      for (let side = 0; side < 2; side++) {
        const baseX = side === 0 ? 0 : W - 50;
        g.fillStyle(theme.accent1, 0.18);
        for (let i = 0; i < 6; i++) {
          const cx = baseX + (i * 9) * (side === 0 ? 1 : -1);
          const ch = 25 + (i * 17) % 40;
          const cy = H - ch;
          // Coral branch
          g.fillCircle(cx + 5, cy, 8 + (i * 3) % 6);
          g.fillCircle(cx + 10, cy + 10, 6 + (i * 5) % 5);
          g.fillCircle(cx, cy + 15, 7);
          g.fillRect(cx + 3, cy, 5, ch);
        }
      }

      // --- Bubble columns rising ---
      for (let col = 0; col < 4; col++) {
        const baseX = W * (0.15 + col * 0.22);
        for (let i = 0; i < 6; i++) {
          const riseT = (t * (0.5 + col * 0.15) + i * 1.2) % 5;
          const bx = baseX + Math.sin(t * 0.8 + i * 2 + col) * 8;
          const by = H - riseT * H * 0.22;
          const bSize = 3 + (i * 2) % 4;
          const a = Math.max(0, 0.18 - riseT * 0.035);
          g.lineStyle(1.5, 0xffffff, a);
          g.strokeCircle(bx, by, bSize);
          // Shine
          g.fillStyle(0xffffff, a * 0.5);
          g.fillCircle(bx - bSize * 0.3, by - bSize * 0.3, bSize * 0.3);
        }
      }

      // --- Seaweed swaying ---
      for (let i = 0; i < 8; i++) {
        const sx = W * (0.08 + i * 0.12);
        const sBase = H;
        const sHeight = 40 + (i * 19) % 30;
        g.fillStyle(0x27ae60, 0.18);
        for (let seg = 0; seg < 8; seg++) {
          const segY = sBase - seg * (sHeight / 8);
          const sway = Math.sin(t * 0.8 + i * 1.5 + seg * 0.5) * (3 + seg * 1.5);
          g.fillCircle(sx + sway, segY, 4 - seg * 0.3);
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // SPACE — Dense starfield, shooting stars, planet+rings, nebula, satellite
    // ═══════════════════════════════════════════════════════════════
    if (tid === 'space') {
      // --- Dense starfield (3 layers for depth) ---
      // Far stars (slow parallax)
      for (let i = 0; i < 40; i++) {
        const sx = (i * 53 + 11) % W;
        const sy = 0 * 0.02 + (i * 137 + 29) % H + 0;
        const twinkle = Math.sin(t * (1.2 + i * 0.2) + i * 3.1) * 0.5 + 0.5;
        g.fillStyle(0xffffff, 0.08 + twinkle * 0.12);
        g.fillCircle(sx, sy, 0.5 + twinkle * 0.5);
      }
      // Mid stars
      for (let i = 0; i < 25; i++) {
        const sx = (i * 71 + 37) % W;
        const sy = 0 * 0.05 + (i * 101 + 61) % H + 0;
        const twinkle = Math.sin(t * (1.8 + i * 0.35) + i * 2.3) * 0.5 + 0.5;
        g.fillStyle(i % 3 === 0 ? theme.accent1 : 0xffffff, 0.12 + twinkle * 0.15);
        g.fillCircle(sx, sy, 1 + twinkle * 0.8);
      }
      // Near bright stars
      for (let i = 0; i < 10; i++) {
        const sx = (i * 89 + 47) % W;
        const sy = 0 * 0.1 + (i * 191 + 83) % H + 0;
        const twinkle = Math.sin(t * (2.5 + i * 0.5) + i * 1.7) * 0.5 + 0.5;
        g.fillStyle(0xffffff, 0.20 + twinkle * 0.10);
        g.fillCircle(sx, sy, 1.5 + twinkle);
        // Cross sparkle on brightest
        if (twinkle > 0.7) {
          g.fillStyle(0xffffff, 0.12);
          g.fillRect(sx - 4, sy - 0.5, 8, 1);
          g.fillRect(sx - 0.5, sy - 4, 1, 8);
        }
      }

      // --- Shooting stars (multiple, staggered) ---
      for (let s = 0; s < 3; s++) {
        const starP = (t * (0.5 + s * 0.3) + s * 2.1) % 7;
        if (starP < 0.6) {
          const p = starP / 0.6;
          const startX = W * (0.7 + s * 0.1);
          const startY = H * (0.1 + s * 0.05);
          const sx = startX - p * W * 0.6;
          const sy = startY + p * H * 0.4;
          // Trail
          g.lineStyle(2, 0xffffff, 0.25 * (1 - p));
          g.lineBetween(sx, sy, sx + 35, sy - 18);
          // Fading trail segments
          for (let tr = 1; tr < 4; tr++) {
            g.lineStyle(1, 0xffffff, 0.12 * (1 - p) / tr);
            g.lineBetween(sx + 35 * tr * 0.3, sy - 18 * tr * 0.3,
              sx + 35 * (tr + 1) * 0.3, sy - 18 * (tr + 1) * 0.3);
          }
          // Head
          g.fillStyle(0xffffff, 0.30 * (1 - p));
          g.fillCircle(sx, sy, 2.5);
        }
      }

      // --- Large planet with rings ---
      const px = W * 0.18, py = H * 0.3;
      const planetR = 35;
      // Planet shadow (creates crescent)
      g.fillStyle(theme.accent1, 0.18);
      g.fillCircle(px, py, planetR);
      // Surface detail
      g.fillStyle(theme.accent2, 0.08);
      g.fillCircle(px - 8, py - 5, 10);
      g.fillCircle(px + 12, py + 8, 7);
      // Shadow overlay
      g.fillStyle(0x000000, 0.12);
      g.fillCircle(px + 10, py - 5, planetR - 3);
      // Ring system
      g.lineStyle(3, theme.accent3, 0.16);
      g.strokeCircle(px, py, planetR + 12);
      g.lineStyle(2, theme.accent1, 0.12);
      g.strokeCircle(px, py, planetR + 18);
      g.lineStyle(1, theme.accent3, 0.08);
      g.strokeCircle(px, py, planetR + 24);

      // --- Nebula clouds ---
      for (let i = 0; i < 3; i++) {
        const nx = W * (0.5 + i * 0.2) + Math.sin(t * 0.1 + i) * 20;
        const ny = H * (0.1 + i * 0.3);
        const cols = [theme.accent1, theme.accent2, theme.accent3];
        g.fillStyle(cols[i], 0.08);
        g.fillCircle(nx, ny, 50 + Math.sin(t * 0.2 + i * 2) * 10);
        g.fillStyle(cols[(i + 1) % 3], 0.05);
        g.fillCircle(nx + 30, ny + 15, 35);
        g.fillCircle(nx - 25, ny - 10, 30);
      }

      // --- Satellite orbiting ---
      const satAngle = t * 0.4;
      const satX = W * 0.6 + Math.cos(satAngle) * 60;
      const satY = H * 0.5 + Math.sin(satAngle) * 30;
      g.fillStyle(0xdfe6e9, 0.20);
      g.fillRect(satX - 2, satY - 1, 4, 2);
      // Solar panels
      g.fillStyle(0x4488ff, 0.18);
      g.fillRect(satX - 10, satY - 3, 7, 6);
      g.fillRect(satX + 3, satY - 3, 7, 6);
      // Blink
      const satBlink = Math.sin(t * 3) > 0.5 ? 0.25 : 0.08;
      g.fillStyle(0xff0000, satBlink);
      g.fillCircle(satX, satY, 1.5);
    }

    // ═══════════════════════════════════════════════════════════════
    // CANDY — Rainbow stripes, lollipop spirals, sparkle bursts, candy cane pillars
    // ═══════════════════════════════════════════════════════════════
    if (tid === 'candy') {
      // --- Rainbow stripes in background (diagonal, scrolling) ---
      const rainbowCols = [0xff4444, 0xff8800, 0xffdd00, 0x44cc44, 0x4488ff, 0x8844cc, 0xff44aa];
      for (let i = 0; i < 14; i++) {
        const stripeX = ((t * 15 + i * 35) % (W + 200)) - 100;
        g.fillStyle(rainbowCols[i % rainbowCols.length], 0.08);
        g.beginPath();
        g.moveTo(stripeX, 0 - 20);
        g.lineTo(stripeX + 15, 0 - 20);
        g.lineTo(stripeX + 15 + H * 0.3, H + 20);
        g.lineTo(stripeX + H * 0.3, H + 20);
        g.closePath(); g.fillPath();
      }

      // --- Lollipop spirals ---
      for (let i = 0; i < 5; i++) {
        const lx = W * (0.1 + i * 0.2);
        const ly = H * (0.25 + i * 0.12) + Math.sin(t * 0.4 + i * 1.8) * 12;
        // Stick
        g.fillStyle(0xffffff, 0.15);
        g.fillRect(lx - 1.5, ly + 14, 3, 25);
        // Candy swirl (layered circles)
        const cols = [theme.accent1, theme.accent2, theme.accent3];
        for (let r = 14; r > 2; r -= 3) {
          const swirlAngle = t * 0.8 + i * 2 + r * 0.5;
          g.fillStyle(cols[Math.floor(r / 3) % 3], 0.20);
          g.fillCircle(lx + Math.cos(swirlAngle) * (14 - r) * 0.3, ly + Math.sin(swirlAngle) * (14 - r) * 0.3, r);
        }
        // Center
        g.fillStyle(0xffffff, 0.22);
        g.fillCircle(lx, ly, 3);
      }

      // --- Sparkle bursts ---
      for (let i = 0; i < 15; i++) {
        const sx = (i * 51 + 23) % W;
        const sy = (i * 97 + 41) % H;
        const sparkle = Math.sin(t * (2.5 + i * 0.4) + i * 3.3) * 0.5 + 0.5;
        if (sparkle > 0.5) {
          const a = (sparkle - 0.5) * 0.50;
          const size = 4 + sparkle * 3;
          g.fillStyle(0xffffff, a);
          g.fillRect(sx - size, sy - 0.5, size * 2, 1);
          g.fillRect(sx - 0.5, sy - size, 1, size * 2);
          // Diagonal arms
          g.fillStyle(0xffffff, a * 0.6);
          const d = size * 0.7;
          g.fillRect(sx - d, sy - d, d * 0.5, 1);
          g.fillRect(sx + d * 0.5, sy + d * 0.5, d * 0.5, 1);
        }
      }

      // --- Candy cane pillars on sides ---
      for (let side = 0; side < 2; side++) {
        const px = side === 0 ? 8 : W - 16;
        const stripeH = 18;
        for (let s = 0; s < Math.ceil(H / stripeH) + 2; s++) {
          const sy = s * stripeH - (t * 20 % stripeH);
          g.fillStyle(s % 2 === 0 ? 0xff2222 : 0xffffff, 0.18);
          g.fillRect(px, sy, 8, stripeH);
        }
        // Curved top
        g.fillStyle(0xff2222, 0.18);
        g.fillCircle(px + 4 + (side === 0 ? 8 : -8), 10, 12);
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // BAMBOO — Forest silhouettes, fireflies, falling leaves, moon, zen ripples
    // ═══════════════════════════════════════════════════════════════
    if (tid === 'bamboo') {
      // --- Bamboo forest silhouettes on sides (tall stalks, parallax) ---
      // Far layer
      for (let i = 0; i < 8; i++) {
        const bx = i < 4
          ? -5 + i * 10 + Math.sin(t * 0.15 + i) * 2
          : W - 35 + (i - 4) * 10 + Math.sin(t * 0.15 + i) * 2;
        g.fillStyle(0x1a6030, 0.14);
        g.fillRect(bx, 0 - 50, 6, H + 100);
        // Nodes
        for (let n = 0; n < 8; n++) {
          g.fillRect(bx - 2, n * (H / 7) + 10, 10, 4);
        }
        // Leaves
        const leafSway = Math.sin(t * 0.5 + i * 1.5) * 8;
        g.fillStyle(0x2ecc71, 0.12);
        g.fillTriangle(bx + 6, 40 + i * 30, bx + 25 + leafSway, 30 + i * 30, bx + 6, 25 + i * 30);
        g.fillTriangle(bx, 100 + i * 25, bx - 20 + leafSway, 90 + i * 25, bx, 85 + i * 25);
      }
      // Near layer (bigger, more opaque)
      for (let i = 0; i < 4; i++) {
        const bx = i < 2 ? -3 + i * 18 : W - 20 + (i - 2) * 18;
        g.fillStyle(0x27ae60, 0.22);
        g.fillRect(bx, 0 - 80, 8, H + 160);
        for (let n = 0; n < 10; n++) {
          g.fillRect(bx - 2, n * (H / 8), 12, 5);
        }
      }

      // --- Bright fireflies (many, glowing) ---
      for (let i = 0; i < 16; i++) {
        const fx = W * 0.5 + Math.sin(t * (0.2 + i * 0.05) + i * 1.7) * W * 0.42;
        const fy = H * 0.2 + Math.cos(t * (0.15 + i * 0.04) + i * 2.3) * H * 0.35;
        const glow = Math.sin(t * (1.5 + i * 0.4) + i * 2.9) * 0.5 + 0.5;
        // Outer glow
        g.fillStyle(0xfeca57, glow * 0.15);
        g.fillCircle(fx, fy, 10);
        // Inner bright
        g.fillStyle(0xfff9c4, glow * 0.30);
        g.fillCircle(fx, fy, 3);
        // Core
        g.fillStyle(0xffffff, glow * 0.25);
        g.fillCircle(fx, fy, 1.5);
      }

      // --- Falling leaves ---
      for (let i = 0; i < 12; i++) {
        const lx = ((t * (5 + i * 2) + i * 60) % (W + 40)) - 20;
        const ly = ((t * (12 + i * 3) + i * 90) % (H + 60)) - 30;
        const rot = t * (0.6 + i * 0.2) + i * 2;
        const wobble = Math.sin(t * 0.7 + i * 1.3) * 10;
        g.fillStyle(i % 3 === 0 ? 0x27ae60 : i % 3 === 1 ? 0x6ab04c : 0xf0c674, 0.18);
        const sz = 3 + Math.abs(Math.sin(rot)) * 3;
        g.fillCircle(lx + wobble, ly, sz);
        g.fillCircle(lx + wobble + sz * 0.8, ly - sz * 0.3, sz * 0.6);
      }

      // --- Moon glow ---
      const moonX = W * 0.8, moonY = H * 0.1;
      // Outer halo
      g.fillStyle(0xffeaa7, 0.06);
      g.fillCircle(moonX, moonY, 45);
      g.fillStyle(0xffeaa7, 0.08);
      g.fillCircle(moonX, moonY, 30);
      // Moon face
      g.fillStyle(0xfff9c4, 0.22);
      g.fillCircle(moonX, moonY, 18);
      // Crescent shadow
      g.fillStyle(0x000000, 0.10);
      g.fillCircle(moonX + 6, moonY - 3, 15);

      // --- Zen ripples on water ---
      const waterY = H * 0.7;
      // Water surface
      g.fillStyle(theme.accent1, 0.08);
      g.fillRect(0, waterY, W, H * 0.15);
      // Ripple rings
      for (let r = 0; r < 4; r++) {
        const rippleT = (t * 0.6 + r * 1.5) % 5;
        const rSize = rippleT * 15;
        const rAlpha = Math.max(0, 0.15 - rippleT * 0.03);
        g.lineStyle(1.5, 0xffffff, rAlpha);
        g.strokeCircle(W * 0.5 + r * 30 - 45, waterY + 10, rSize);
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // ICE CREAM — Waffle cone pattern, dripping chocolate, sprinkle rain, whipped cream clouds
    // ═══════════════════════════════════════════════════════════════
    if (tid === 'icecream') {
      // --- Waffle cone cross-hatch pattern at bottom ---
      const waffleTop = H * 0.6;
      // Background waffle color
      g.fillStyle(0xd4a34a, 0.15);
      g.fillRect(0, waffleTop, W, H * 0.28);
      // Cross-hatch lines
      const spacing = 14;
      for (let i = -20; i < W + H; i += spacing) {
        g.lineStyle(1.5, 0xc4943a, 0.18);
        g.lineBetween(i, waffleTop, i - H * 0.28, waffleTop + H * 0.28);
        g.lineBetween(i, waffleTop, i + H * 0.28, waffleTop + H * 0.28);
      }

      // --- Dripping chocolate sauce from top ---
      for (let i = 0; i < 10; i++) {
        const dx = W * (0.05 + i * 0.10);
        const dripLen = 30 + Math.sin(t * 0.5 + i * 1.8) * 15 + (i * 17) % 25;
        // Drip body
        g.fillStyle(0x5C3317, 0.22);
        g.fillRect(dx - 4, 0, 8, dripLen);
        // Rounded drip end
        g.fillCircle(dx, dripLen, 5);
        // Highlight
        g.fillStyle(0x8B4513, 0.12);
        g.fillRect(dx - 1, 0, 2, dripLen * 0.7);
      }
      // Chocolate sauce band at top
      g.fillStyle(0x5C3317, 0.20);
      g.fillRect(0, 0, W, 10);
      g.fillStyle(0x3d1f0d, 0.12);
      g.fillRect(0, 10, W, 4);

      // --- Bold colorful sprinkle rain ---
      const sprCols = [0xff4444, 0xff8800, 0xfeca57, 0x44ff44, 0x4488ff, 0xcc44ff, 0xff44aa, 0x00cccc];
      for (let i = 0; i < 25; i++) {
        const sx = ((t * (8 + i * 1.5) + i * 35) % (W + 20)) - 10;
        const sy = ((t * (25 + i * 2) + i * 80) % (H + 30)) - 15;
        const rot = t * (1.2 + i * 0.2) + i * 1.7;
        g.fillStyle(sprCols[i % sprCols.length], 0.25);
        if (i % 3 === 0) {
          // Round sprinkle
          g.fillCircle(sx, sy, 3);
        } else {
          // Rod sprinkle (rotated)
          const len = 7;
          const dx = Math.cos(rot) * len * 0.5;
          const dy = Math.sin(rot) * len * 0.5;
          g.lineStyle(3, sprCols[i % sprCols.length], 0.25);
          g.lineBetween(sx - dx, sy - dy, sx + dx, sy + dy);
        }
      }

      // --- Whipped cream clouds ---
      for (let i = 0; i < 4; i++) {
        const cx = W * (0.1 + i * 0.25) + Math.sin(t * 0.2 + i) * 10;
        const cy = H * 0.25 + Math.sin(t * 0.35 + i * 1.5) * 15;
        g.fillStyle(0xffffff, 0.18);
        g.fillCircle(cx, cy, 18);
        g.fillCircle(cx + 14, cy + 3, 14);
        g.fillCircle(cx - 10, cy + 4, 12);
        g.fillCircle(cx + 6, cy - 10, 12);
        g.fillCircle(cx - 5, cy - 8, 10);
        // Peak swirl
        g.fillStyle(0xfff5e6, 0.14);
        g.fillCircle(cx + 2, cy - 14, 7);
        g.fillCircle(cx + 1, cy - 20, 4);
      }

      // --- Cherry on top accent ---
      for (let i = 0; i < 2; i++) {
        const cherryX = W * (0.3 + i * 0.4);
        const cherryY = H * 0.18 + Math.sin(t * 0.4 + i * 2) * 8;
        g.fillStyle(0xe74c3c, 0.22);
        g.fillCircle(cherryX, cherryY, 8);
        g.fillStyle(0xff6b6b, 0.15);
        g.fillCircle(cherryX - 2, cherryY - 2, 3);
        // Stem
        g.lineStyle(1.5, 0x27ae60, 0.20);
        g.lineBetween(cherryX, cherryY - 8, cherryX + 5, cherryY - 18);
        // Leaf
        g.fillStyle(0x27ae60, 0.18);
        g.fillCircle(cherryX + 6, cherryY - 17, 4);
      }
    }
  }

  private createFloaters(theme: BgTheme) {
    const colors = [theme.accent1, theme.accent2, theme.accent3];
    const layers = [
      { count: 6, rMin: 50, rMax: 130, aMin: 0.01, aMax: 0.022, sMin: 0.05, sMax: 0.15, ampMin: 45, ampMax: 100, parallax: 0.04 },
      { count: 10, rMin: 18, rMax: 50, aMin: 0.018, aMax: 0.038, sMin: 0.1, sMax: 0.3, ampMin: 28, ampMax: 65, parallax: 0.1 },
      { count: 8, rMin: 4, rMax: 16, aMin: 0.035, aMax: 0.07, sMin: 0.2, sMax: 0.55, ampMin: 15, ampMax: 42, parallax: 0.18 },
    ];
    layers.forEach(l => {
      for (let i = 0; i < l.count; i++) {
        const r = Phaser.Math.Between(l.rMin, l.rMax);
        const obj = this.scene.add.circle(
          Phaser.Math.Between(-200, this.W + 200),
          Phaser.Math.Between(-12000, 4000),
          r, colors[i % 3], Phaser.Math.FloatBetween(l.aMin, l.aMax),
        ).setDepth(-9);
        this.floaters.push({
          obj, baseX: obj.x, baseY: obj.y,
          sx: Phaser.Math.FloatBetween(l.sMin, l.sMax),
          sy: Phaser.Math.FloatBetween(l.sMin * 0.7, l.sMax * 0.7),
          amp: Phaser.Math.Between(l.ampMin, l.ampMax),
          phase: Phaser.Math.FloatBetween(0, Math.PI * 2),
          parallax: l.parallax,
        });
      }
    });
  }

  private createRisers(theme: BgTheme) {
    const colors = [theme.accent1, theme.accent2, theme.accent3];
    for (let i = 0; i < 22; i++) {
      const obj = this.scene.add.circle(
        Phaser.Math.Between(0, this.W),
        Phaser.Math.Between(-5000, this.H),
        Phaser.Math.FloatBetween(0.8, 3),
        colors[i % 3], Phaser.Math.FloatBetween(0.05, 0.2),
      ).setDepth(-6);
      this.risers.push({
        obj,
        speed: Phaser.Math.FloatBetween(0.15, 0.8),
        drift: Phaser.Math.FloatBetween(0.5, 2),
      });
    }
  }

  private createFallers(theme: BgTheme) {
    const cfg = DECO_CONFIGS[this.blockThemeId] || DECO_CONFIGS['building'];
    if (cfg.fallerCount === 0) return;
    const colors = [theme.accent1, theme.accent2, theme.accent3];
    for (let i = 0; i < cfg.fallerCount; i++) {
      const obj = this.scene.add.circle(
        Phaser.Math.Between(0, this.W),
        Phaser.Math.Between(-5000, this.H),
        Phaser.Math.FloatBetween(cfg.fallerSize[0], cfg.fallerSize[1]),
        colors[i % 3], Phaser.Math.FloatBetween(cfg.fallerAlpha[0], cfg.fallerAlpha[1]),
      ).setDepth(-7);
      this.fallers.push({
        obj,
        speed: Phaser.Math.FloatBetween(cfg.fallerSpeed[0], cfg.fallerSpeed[1]),
        drift: Phaser.Math.FloatBetween(0.3, 1.5),
        driftPhase: Phaser.Math.FloatBetween(0, Math.PI * 2),
        driftAmp: cfg.fallerDrift,
      });
    }
  }

  private createPulsers(theme: BgTheme) {
    const cfg = DECO_CONFIGS[this.blockThemeId] || DECO_CONFIGS['building'];
    if (cfg.pulseCount === 0) return;
    const colors = [theme.accent1, theme.accent2, theme.accent3];
    for (let i = 0; i < cfg.pulseCount; i++) {
      const baseAlpha = Phaser.Math.FloatBetween(cfg.pulseAlpha[0], cfg.pulseAlpha[1]);
      const obj = this.scene.add.circle(
        Phaser.Math.Between(0, this.W),
        Phaser.Math.Between(-8000, 3000),
        Phaser.Math.FloatBetween(cfg.pulseSize[0], cfg.pulseSize[1]),
        colors[i % 3], baseAlpha,
      ).setDepth(-8);
      this.pulsers.push({
        obj, baseAlpha,
        speed: Phaser.Math.FloatBetween(cfg.pulseSpeed[0], cfg.pulseSpeed[1]),
        phase: Phaser.Math.FloatBetween(0, Math.PI * 2),
        baseX: obj.x, baseY: obj.y,
        parallax: Phaser.Math.FloatBetween(0.05, 0.15),
      });
    }
  }
}
