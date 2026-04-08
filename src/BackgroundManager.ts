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

// Theme-specific background palettes
const THEME_BGS: Record<string, BgTheme[]> = {
  building: [
    { name: 'DOWNTOWN', top: 0x0a0a14, bot: 0x141428, accent1: 0x4a6fa5, accent2: 0xffeaa7, accent3: 0x6c5ce7 },
    { name: 'MIDNIGHT', top: 0x050510, bot: 0x0c0c1e, accent1: 0x2d3436, accent2: 0xffeaa7, accent3: 0x00cec9 },
    { name: 'SKYLINE',  top: 0x0c0818, bot: 0x1a1030, accent1: 0xe84393, accent2: 0x6c5ce7, accent3: 0x00cec9 },
    { name: 'CLOUDS',   top: 0x0a1220, bot: 0x162040, accent1: 0x74b9ff, accent2: 0xdfe6e9, accent3: 0xa29bfe },
    { name: 'SUNSET',   top: 0x1a0810, bot: 0x2a1018, accent1: 0xe17055, accent2: 0xfdcb6e, accent3: 0xfd79a8 },
    { name: 'STORM',    top: 0x080810, bot: 0x101018, accent1: 0x636e72, accent2: 0x74b9ff, accent3: 0xdfe6e9 },
    { name: 'SPACE',    top: 0x040408, bot: 0x08080e, accent1: 0xdfe6e9, accent2: 0x6c5ce7, accent3: 0x00cec9 },
    { name: 'GOLD',     top: 0x0c0a04, bot: 0x120e08, accent1: 0xf0c674, accent2: 0xe17055, accent3: 0xffffff },
  ],
  sushi: [
    { name: 'IZAKAYA',   top: 0x0c0808, bot: 0x1a1210, accent1: 0xe74c3c, accent2: 0xffeaa7, accent3: 0x27ae60 },
    { name: 'SAKURA',    top: 0x100810, bot: 0x1e1018, accent1: 0xfd79a8, accent2: 0xffffff, accent3: 0xff9ff3 },
    { name: 'OCEAN',     top: 0x04101a, bot: 0x081825, accent1: 0x0984e3, accent2: 0x00cec9, accent3: 0xdfe6e9 },
    { name: 'BAMBOO',    top: 0x060c06, bot: 0x0c1a0c, accent1: 0x27ae60, accent2: 0xffeaa7, accent3: 0x6ab04c },
    { name: 'WASABI',    top: 0x080c08, bot: 0x101810, accent1: 0x6ab04c, accent2: 0xff6b6b, accent3: 0xffeaa7 },
    { name: 'NIGHT',     top: 0x080608, bot: 0x100e10, accent1: 0xff6348, accent2: 0xffa502, accent3: 0xff4757 },
    { name: 'ZEN',       top: 0x0a0a0a, bot: 0x141414, accent1: 0xdfe6e9, accent2: 0xa29bfe, accent3: 0xffeaa7 },
    { name: 'GOLDEN',    top: 0x0c0a04, bot: 0x140e08, accent1: 0xf0c674, accent2: 0xe74c3c, accent3: 0xffffff },
  ],
  burger: [
    { name: 'DINER',     top: 0x100808, bot: 0x1e1010, accent1: 0xe74c3c, accent2: 0xf1c40f, accent3: 0x27ae60 },
    { name: 'BBQ',       top: 0x0e0604, bot: 0x1a0e08, accent1: 0xe67e22, accent2: 0xd35400, accent3: 0xf39c12 },
    { name: 'NEON',      top: 0x080410, bot: 0x10081a, accent1: 0xff6b9d, accent2: 0x39ff14, accent3: 0x00cec9 },
    { name: 'RETRO',     top: 0x0c0a0a, bot: 0x181414, accent1: 0xf39c12, accent2: 0xe74c3c, accent3: 0xecf0f1 },
    { name: 'KETCHUP',   top: 0x100404, bot: 0x1c0808, accent1: 0xe74c3c, accent2: 0xf1c40f, accent3: 0xffffff },
    { name: 'MUSTARD',   top: 0x0c0a04, bot: 0x180e08, accent1: 0xf1c40f, accent2: 0x8B4513, accent3: 0x27ae60 },
    { name: 'GRILL',     top: 0x080606, bot: 0x100c0c, accent1: 0xff6348, accent2: 0xffa502, accent3: 0xdfe6e9 },
    { name: 'FEAST',     top: 0x0a0808, bot: 0x141010, accent1: 0xf0c674, accent2: 0xe74c3c, accent3: 0x27ae60 },
  ],
  cake: [
    { name: 'BAKERY',    top: 0x0e0a0a, bot: 0x1a1414, accent1: 0xff69b4, accent2: 0xfff0f5, accent3: 0xf0c674 },
    { name: 'CHOCOLATE', top: 0x0a0604, bot: 0x140e08, accent1: 0x8B4513, accent2: 0xfff5e6, accent3: 0xd2691e },
    { name: 'STRAWBERRY',top: 0x100610, bot: 0x1a0e18, accent1: 0xff69b4, accent2: 0xffffff, accent3: 0xef5350 },
    { name: 'MINT',      top: 0x060c0a, bot: 0x0e1810, accent1: 0x66bb6a, accent2: 0xe8f5e9, accent3: 0xfff0f5 },
    { name: 'VANILLA',   top: 0x0c0c08, bot: 0x18180e, accent1: 0xfff9c4, accent2: 0xffb74d, accent3: 0xfff0f5 },
    { name: 'BIRTHDAY',  top: 0x0c0810, bot: 0x180e1a, accent1: 0xba68c8, accent2: 0xff69b4, accent3: 0x42a5f5 },
    { name: 'ROYAL',     top: 0x080610, bot: 0x100c1a, accent1: 0xf0c674, accent2: 0xba68c8, accent3: 0xffffff },
    { name: 'RAINBOW',   top: 0x0a0808, bot: 0x141010, accent1: 0xff6b6b, accent2: 0xfeca57, accent3: 0x48dbfb },
  ],
  dj: [
    { name: 'CLUB',      top: 0x060608, bot: 0x0c0c12, accent1: 0xff00ff, accent2: 0x00ff88, accent3: 0x00ccff },
    { name: 'RAVE',      top: 0x080410, bot: 0x10081a, accent1: 0xff4444, accent2: 0xffff00, accent3: 0x00ff00 },
    { name: 'BASS',      top: 0x040408, bot: 0x08080e, accent1: 0x44ff44, accent2: 0x00ccff, accent3: 0xff00ff },
    { name: 'TECHNO',    top: 0x060406, bot: 0x0c080c, accent1: 0xcc44ff, accent2: 0xff8800, accent3: 0x00ffcc },
    { name: 'FESTIVAL',  top: 0x0a0608, bot: 0x140c10, accent1: 0xff6b9d, accent2: 0xfeca57, accent3: 0x48dbfb },
    { name: 'STUDIO',    top: 0x060606, bot: 0x0e0e0e, accent1: 0xdfe6e9, accent2: 0x6c5ce7, accent3: 0x00cec9 },
    { name: 'NEON',      top: 0x040410, bot: 0x08081a, accent1: 0x39ff14, accent2: 0xff073a, accent3: 0x00bfff },
    { name: 'LASER',     top: 0x080408, bot: 0x100810, accent1: 0xff0000, accent2: 0x00ff00, accent3: 0x0000ff },
  ],
};

const STAIRS_PER_THEME = 8;

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

export class BackgroundManager {
  private scene: Phaser.Scene;
  private bgGfx: Phaser.GameObjects.Graphics;
  private floaters: Floater[] = [];
  private risers: Riser[] = [];
  private themeIdx = 0;
  private elapsed = 0;
  private W: number;
  private H: number;
  private blockThemeId: string;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.W = scene.scale.width;
    this.H = scene.scale.height;
    this.blockThemeId = store.getCurrentTheme();
    this.bgGfx = scene.add.graphics().setDepth(-10);
    const themes = this.getThemes();
    this.drawGrad(themes[0]);
    this.createFloaters(themes[0]);
    this.createRisers(themes[0]);
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
    for (const f of this.floaters) {
      f.obj.x = f.baseX + Math.sin(this.elapsed * f.sx + f.phase) * f.amp;
      f.obj.y = f.baseY + Math.cos(this.elapsed * f.sy + f.phase) * (f.amp * 0.5) + camY * f.parallax;
    }
    for (const r of this.risers) {
      r.obj.y -= r.speed;
      r.obj.x += Math.sin(this.elapsed * r.drift) * 0.3;
      if (r.obj.y < camY - this.H) {
        r.obj.y = camY + this.H + 50;
        r.obj.x = Phaser.Math.Between(0, this.W);
      }
    }
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

    return theme.name;
  }

  updateOverlayPosition() {}

  private drawGrad(theme: BgTheme) {
    this.bgGfx.fillGradientStyle(theme.top, theme.top, theme.bot, theme.bot, 1);
    this.bgGfx.fillRect(-1000, -20000, 3000, 30000);
  }

  private createFloaters(theme: BgTheme) {
    const colors = [theme.accent1, theme.accent2, theme.accent3];
    const layers = [
      { count: 5, rMin: 45, rMax: 110, aMin: 0.012, aMax: 0.025, sMin: 0.06, sMax: 0.18, ampMin: 40, ampMax: 90, parallax: 0.04 },
      { count: 8, rMin: 15, rMax: 45, aMin: 0.02, aMax: 0.04, sMin: 0.12, sMax: 0.35, ampMin: 25, ampMax: 60, parallax: 0.1 },
      { count: 6, rMin: 4, rMax: 14, aMin: 0.04, aMax: 0.08, sMin: 0.25, sMax: 0.6, ampMin: 15, ampMax: 40, parallax: 0.18 },
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
    for (let i = 0; i < 18; i++) {
      const obj = this.scene.add.circle(
        Phaser.Math.Between(0, this.W),
        Phaser.Math.Between(-5000, this.H),
        Phaser.Math.FloatBetween(0.8, 2.5),
        colors[i % 3], Phaser.Math.FloatBetween(0.06, 0.18),
      ).setDepth(-6);
      this.risers.push({
        obj,
        speed: Phaser.Math.FloatBetween(0.15, 0.7),
        drift: Phaser.Math.FloatBetween(0.5, 2),
      });
    }
  }
}
