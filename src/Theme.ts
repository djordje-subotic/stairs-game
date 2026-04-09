import Phaser from 'phaser';

export const F_HEAD = "'Space Grotesk', 'Inter', sans-serif";
export const F_BODY = "'Inter', sans-serif";

/** Scale factor for tablet — makes UI bigger on wider screens */
export function uiScale(): number {
  const w = window.innerWidth;
  if (w > 600) return 1.5;   // iPad
  if (w > 430) return 1.2;   // large phone
  return 1;
}

export const C = {
  bg1: 0x06060c,
  bg2: 0x0c0c18,
  accent: '#a29bfe',
  accentHex: 0xa29bfe,
  gold: '#f0c674',
  goldHex: 0xf0c674,
  red: '#ff6b6b',
  redHex: 0xff6b6b,
  teal: '#4ecdc4',
  tealHex: 0x4ecdc4,
  muted: '#6b7280',
  mutedHex: 0x6b7280,
  white: '#e5e7eb',
  whiteHex: 0xe5e7eb,
  dimWhite: '#9ca3af',
};

export function drawModernBg(scene: Phaser.Scene, w: number, h: number) {
  const g = scene.add.graphics().setDepth(-10);
  g.fillGradientStyle(C.bg1, C.bg1, C.bg2, C.bg2, 1);
  g.fillRect(0, 0, w, h);
  for (let i = 0; i < 7; i++) {
    g.fillStyle(C.accentHex, Phaser.Math.FloatBetween(0.012, 0.03));
    g.fillCircle(Phaser.Math.Between(0, w), Phaser.Math.Between(0, h), Phaser.Math.Between(30, 100));
  }
  for (let i = 0; i < 4; i++) {
    g.fillStyle(C.goldHex, Phaser.Math.FloatBetween(0.008, 0.02));
    g.fillCircle(Phaser.Math.Between(0, w), Phaser.Math.Between(0, h), Phaser.Math.Between(15, 50));
  }
  return g;
}

export function drawGlassCard(scene: Phaser.Scene, x: number, y: number, w: number, h: number, r = 16) {
  const g = scene.add.graphics();
  g.fillStyle(0xffffff, 0.04);
  g.fillRoundedRect(x, y, w, h, r);
  g.fillGradientStyle(0xffffff, 0xffffff, 0xffffff, 0xffffff, 0.05, 0.05, 0, 0);
  g.fillRoundedRect(x, y, w, h * 0.35, { tl: r, tr: r, bl: 0, br: 0 });
  g.lineStyle(1, 0xffffff, 0.05);
  g.strokeRoundedRect(x, y, w, h, r);
  return g;
}

/**
 * Modern button — looks like plain text, pill bg appears on hover.
 * The pill "pops out" from behind the text with a scale animation.
 */
export function createGlassBtn(
  scene: Phaser.Scene, x: number, y: number, label: string,
  opts: { w?: number; h?: number; color?: string; fontSize?: string; filled?: boolean; fillColor?: number } = {},
) {
  const s = uiScale();
  const w = (opts.w ?? 160) * s, h = (opts.h ?? 44) * s;
  const bx = x - w / 2, by = y - h / 2;

  // Pill background — starts invisible and small
  const bg = scene.add.graphics();
  bg.setAlpha(0);
  bg.setScale(0.6);

  const drawPill = (alpha: number) => {
    bg.clear();
    if (opts.filled && opts.fillColor) {
      bg.fillStyle(opts.fillColor, 0.12);
    } else {
      bg.fillStyle(0xffffff, 0.06);
    }
    bg.fillRoundedRect(bx, by, w, h, h / 2);
    bg.lineStyle(1, 0xffffff, 0.06);
    bg.strokeRoundedRect(bx, by, w, h, h / 2);
  };
  drawPill(0.06);

  // Text label — scaled for tablets
  const baseFontSize = parseInt(opts.fontSize ?? '14px');
  const text = scene.add.text(x, y, label, {
    fontSize: `${Math.round(baseFontSize * s)}px`,
    fontFamily: F_BODY,
    fontStyle: '600',
    color: opts.color ?? C.white,
    letterSpacing: 2,
  }).setOrigin(0.5);

  // Hit area
  const hit = scene.add.rectangle(x, y, w + 20, h + 10, 0, 0).setInteractive({ useHandCursor: true });

  // Hover — pill pops out from behind text
  hit.on('pointerover', () => {
    scene.tweens.add({
      targets: bg,
      alpha: 1,
      scaleX: 1, scaleY: 1,
      duration: 150,
      ease: 'Back.easeOut',
    });
    scene.tweens.add({
      targets: text,
      scaleX: 1.06, scaleY: 1.06,
      duration: 120,
    });
  });

  hit.on('pointerout', () => {
    scene.tweens.add({
      targets: bg,
      alpha: 0,
      scaleX: 0.6, scaleY: 0.6,
      duration: 120,
      ease: 'Quad.easeIn',
    });
    scene.tweens.add({
      targets: text,
      scaleX: 1, scaleY: 1,
      duration: 100,
    });
  });

  hit.on('pointerdown', () => {
    scene.tweens.add({
      targets: [bg, text],
      scaleX: 0.92, scaleY: 0.92,
      duration: 50,
      yoyo: true,
    });
  });

  return { hit, text, bg };
}
