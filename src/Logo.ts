import Phaser from 'phaser';
import { F_HEAD } from './Theme';

/**
 * STACKO logo — each letter is a stacked block that animates in.
 * Returns a container you can position and scale.
 */
export function createLogo(
  scene: Phaser.Scene,
  x: number, y: number,
  animate = true,
): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);

  const letters = 'STACKO'.split('');
  const blockW = 52;
  const blockH = 48;
  const gap = 6;
  const totalW = letters.length * (blockW + gap) - gap;
  const startX = -totalW / 2;

  // Brand colors for each letter block
  const blockColors = [
    { bg: 0x6c5ce7, top: 0x8b7cf0 },  // S - purple
    { bg: 0x0984e3, top: 0x2d9af0 },  // T - blue
    { bg: 0x00b894, top: 0x1dd1a1 },  // A - green
    { bg: 0xf0c674, top: 0xf5d98a },  // C - gold
    { bg: 0xe17055, top: 0xf08a70 },  // K - orange
    { bg: 0xe84393, top: 0xf06aaa },  // O - pink
  ];

  letters.forEach((letter, i) => {
    const bx = startX + i * (blockW + gap);
    const by = 0;
    const c = blockColors[i];

    const g = scene.add.graphics();

    // Shadow
    g.fillStyle(0x000000, 0.15);
    g.fillRoundedRect(bx + 3, by + 4, blockW, blockH, 10);

    // Body
    g.fillStyle(c.bg, 1);
    g.fillRoundedRect(bx, by, blockW, blockH, 10);

    // Top bevel
    g.fillStyle(c.top, 1);
    g.fillRoundedRect(bx, by, blockW, blockH * 0.42, { tl: 10, tr: 10, bl: 0, br: 0 });

    // Shine
    g.fillStyle(0xffffff, 0.2);
    g.fillRoundedRect(bx + 6, by + 3, blockW * 0.5, 4, 2);

    // Bottom edge
    g.fillStyle(0x000000, 0.1);
    g.fillRoundedRect(bx + 2, by + blockH - 4, blockW - 4, 4, { tl: 0, tr: 0, bl: 8, br: 8 });

    container.add(g);

    // Letter text
    const txt = scene.add.text(bx + blockW / 2, by + blockH / 2 - 1, letter, {
      fontSize: '28px',
      fontFamily: F_HEAD,
      fontStyle: '700',
      color: '#ffffff',
    }).setOrigin(0.5);
    txt.setShadow(0, 2, '#000000', 4, true, true);
    container.add(txt);

    // Animate each block dropping in
    if (animate) {
      g.setAlpha(0);
      g.y = -40;
      txt.setAlpha(0);
      txt.y -= 40;

      scene.tweens.add({
        targets: [g, txt],
        y: '+=40',
        alpha: 1,
        duration: 300,
        delay: 100 + i * 80,
        ease: 'Back.easeOut',
      });

      // Subtle continuous float per letter (staggered)
      scene.tweens.add({
        targets: [g, txt],
        y: '-=3',
        duration: 1500 + i * 200,
        yoyo: true,
        repeat: -1,
        delay: 600 + i * 80,
        ease: 'Sine.easeInOut',
      });
    }
  });

  // Tagline below
  const tagline = scene.add.text(0, blockH + 14, 'STACK  ·  CHOP  ·  REPEAT', {
    fontSize: '9px',
    fontFamily: "'Inter', sans-serif",
    fontStyle: '600',
    color: '#a29bfe',
    letterSpacing: 4,
  }).setOrigin(0.5).setAlpha(0);

  container.add(tagline);

  if (animate) {
    scene.tweens.add({
      targets: tagline,
      alpha: 0.7,
      duration: 400,
      delay: 800,
    });
  } else {
    tagline.setAlpha(0.7);
  }

  return container;
}

/** Small inline STACKO text logo for headers */
export function createLogoText(
  scene: Phaser.Scene,
  x: number, y: number,
  size = '16px',
): Phaser.GameObjects.Text {
  const t = scene.add.text(x, y, 'STACKO', {
    fontSize: size,
    fontFamily: F_HEAD,
    fontStyle: '700',
    color: '#ffffff',
    letterSpacing: 4,
  }).setOrigin(0.5);
  t.setShadow(0, 1, '#6c5ce7', 6, true, true);
  return t;
}
