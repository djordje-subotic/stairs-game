import Phaser from 'phaser';
import { store } from './Store';
import { BLOCK_THEMES, type BlockThemeDef } from './BlockThemes';

export const DEFAULT_SW = 100;
export const SH = 34;
export const DY = SH;

function getBlockTheme(): BlockThemeDef {
  const id = store.getCurrentTheme();
  return BLOCK_THEMES.find(t => t.id === id) || BLOCK_THEMES[0];
}

export function createStair(
  scene: Phaser.Scene,
  x: number, y: number,
  w: number,
  colorIdx: number,
  edgeHighlight: 'left' | 'right' | 'none' = 'none',
): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  const theme = getBlockTheme();

  // Multi-layer shadow
  g.fillStyle(0x000000, 0.04);
  g.fillRoundedRect(4, 5, w, SH, 6);
  g.fillStyle(0x000000, 0.1);
  g.fillRoundedRect(2, 3, w, SH, 6);

  // Theme-specific drawing
  g.fillStyle(0x000000, 0.01);
  g.fillRect(0, 0, w, SH);
  theme.drawBlock(g, w, SH, colorIdx);
  c.add(g);

  // Edge highlight for alignment
  if (edgeHighlight !== 'none') {
    const eg = scene.add.graphics();
    const ex = edgeHighlight === 'right' ? w - 3 : 0;
    eg.fillStyle(0xffffff, 0.06);
    eg.fillRoundedRect(ex - 2, 1, 7, SH - 2, 3);
    eg.fillStyle(0xffffff, 0.3);
    eg.fillRoundedRect(ex, 3, 3, SH - 6, 1.5);
    c.add(eg);
    scene.tweens.add({ targets: eg, alpha: { from: 1, to: 0.2 }, duration: 350, yoyo: true, repeat: -1 });
  }

  return c;
}

export function createFragment(
  scene: Phaser.Scene,
  x: number, y: number,
  w: number,
  colorIdx: number,
  direction: 'left' | 'right',
): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y).setDepth(30);
  const g = scene.add.graphics();
  const theme = getBlockTheme();

  theme.drawFragment(g, w, SH, colorIdx);

  // Cracked edge
  g.fillStyle(0xffffff, 0.12);
  const crackX = direction === 'right' ? 0 : w - 2;
  g.fillRect(crackX, 1, 2, SH - 2);
  c.add(g);

  const dir = direction === 'right' ? 1 : -1;
  scene.tweens.add({
    targets: c,
    y: y + Phaser.Math.Between(120, 280),
    x: x + dir * Phaser.Math.Between(15, 50),
    rotation: dir * Phaser.Math.FloatBetween(0.3, 1.0),
    alpha: 0,
    duration: Phaser.Math.Between(450, 700),
    ease: 'Quad.easeIn',
    onComplete: () => c.destroy(),
  });

  // Spark particles at chop point
  const chopX = direction === 'right' ? x : x + w;
  for (let i = 0; i < 5; i++) {
    const spark = scene.add.circle(
      chopX + Phaser.Math.FloatBetween(-3, 3),
      y + Phaser.Math.FloatBetween(0, SH),
      Phaser.Math.FloatBetween(1, 2.5), 0xffffff, 0.7,
    ).setDepth(31);
    scene.tweens.add({
      targets: spark,
      x: spark.x + Phaser.Math.FloatBetween(-20, 20),
      y: spark.y + Phaser.Math.FloatBetween(-15, 15),
      alpha: 0, scaleX: 0, scaleY: 0,
      duration: Phaser.Math.Between(200, 400),
      onComplete: () => spark.destroy(),
    });
  }

  return c;
}

export function isDanger(w: number): boolean {
  return w < 35;
}
