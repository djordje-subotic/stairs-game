import Phaser from 'phaser';

/**
 * Each theme defines how to draw a "block" (stair/floor/layer).
 * All themes use the same dimensions and mechanics — only visuals change.
 */

export interface BlockThemeDef {
  id: string;
  name: string;
  price: number;      // 0 = free
  icon: string;       // emoji for shop
  drawBlock: (g: Phaser.GameObjects.Graphics, w: number, h: number, idx: number) => void;
  drawFragment: (g: Phaser.GameObjects.Graphics, w: number, h: number, idx: number) => void;
}

// ── Color helpers ──
function hsl(h: number, s: number, l: number): number {
  // Simple HSL to hex — approximate
  const c = Phaser.Display.Color.HSLToColor(h, s, l);
  return c.color;
}

// ══════════════════════════════════════════════════════════════
// BUILDING / SKYSCRAPER (default)
// ══════════════════════════════════════════════════════════════
const BUILDING_COLORS = [
  { wall: 0x4a5568, top: 0x5a6578 },
  { wall: 0x3d5a80, top: 0x4d6a90 },
  { wall: 0x5c4d7d, top: 0x6c5d8d },
  { wall: 0x2d6a4f, top: 0x3d7a5f },
  { wall: 0x6b4226, top: 0x7b5236 },
  { wall: 0x7b2d3b, top: 0x8b3d4b },
  { wall: 0x2b4570, top: 0x3b5580 },
  { wall: 0x5e503f, top: 0x6e604f },
];

function drawBuilding(g: Phaser.GameObjects.Graphics, w: number, h: number, idx: number) {
  const c = BUILDING_COLORS[idx % BUILDING_COLORS.length];
  const R = 3;

  // Main wall
  g.fillStyle(c.wall, 1);
  g.fillRoundedRect(0, 0, w, h, { tl: R, tr: R, bl: 0, br: 0 });

  // Top ledge (lighter)
  g.fillStyle(c.top, 1);
  g.fillRect(0, 0, w, 6);
  g.fillStyle(0xffffff, 0.12);
  g.fillRect(0, 0, w, 3);

  // Windows — evenly spaced
  const winW = 6, winH = 8, gap = 4;
  const winY = 10;
  const cols = Math.floor((w - 8) / (winW + gap));
  const startX = (w - cols * (winW + gap) + gap) / 2;

  for (let c = 0; c < cols; c++) {
    const wx = startX + c * (winW + gap);
    // Randomly lit windows
    const lit = Math.random() > 0.3;
    if (lit) {
      // Warm light glow
      g.fillStyle(0xffeaa7, 0.15);
      g.fillRect(wx - 1, winY - 1, winW + 2, winH + 2);
      g.fillStyle(0xffeaa7, 0.6);
      g.fillRect(wx, winY, winW, winH);
      // Cross frame
      g.fillStyle(c.wall > 0x500000 ? c.wall : 0x333333, 0.5);
      g.fillRect(wx + winW / 2 - 0.5, winY, 1, winH);
      g.fillRect(wx, winY + winH / 2 - 0.5, winW, 1);
    } else {
      g.fillStyle(0x1a1a2e, 0.7);
      g.fillRect(wx, winY, winW, winH);
      g.fillStyle(0x2d3748, 0.3);
      g.fillRect(wx + winW / 2 - 0.5, winY, 1, winH);
      g.fillRect(wx, winY + winH / 2 - 0.5, winW, 1);
    }
  }

  // Bottom shadow line
  g.fillStyle(0x000000, 0.15);
  g.fillRect(0, h - 2, w, 2);
}

// ══════════════════════════════════════════════════════════════
// SUSHI
// ══════════════════════════════════════════════════════════════
const SUSHI_TYPES = [
  { rice: 0xfff5e6, topping: 0xe74c3c, name: 'salmon' },
  { rice: 0xfff5e6, topping: 0xd63031, name: 'tuna' },
  { rice: 0xfff5e6, topping: 0x27ae60, name: 'avocado' },
  { rice: 0xfff5e6, topping: 0xf39c12, name: 'tamago' },
  { rice: 0xfff5e6, topping: 0xe84393, name: 'shrimp' },
  { rice: 0xfff5e6, topping: 0x6c5ce7, name: 'urchin' },
  { rice: 0xfff5e6, topping: 0x00cec9, name: 'mackerel' },
  { rice: 0xfff5e6, topping: 0xfd79a8, name: 'otoro' },
];

function drawSushi(g: Phaser.GameObjects.Graphics, w: number, h: number, idx: number) {
  const s = SUSHI_TYPES[idx % SUSHI_TYPES.length];
  const R = 6;
  const tH = Math.floor(h * 0.4);
  const rH = h - tH;

  // Rice body (bottom)
  g.fillStyle(s.rice, 1);
  g.fillRoundedRect(0, tH, w, rH, { tl: 0, tr: 0, bl: R, br: R });

  // Rice texture dots
  g.fillStyle(0x000000, 0.04);
  for (let i = 0; i < 12; i++) {
    const rx = Phaser.Math.Between(3, w - 3);
    const ry = Phaser.Math.Between(tH + 3, h - 3);
    g.fillCircle(rx, ry, 1);
  }

  // Topping (top)
  g.fillStyle(s.topping, 1);
  g.fillRoundedRect(0, 0, w, tH + 4, { tl: R, tr: R, bl: 0, br: 0 });

  // Topping shine
  g.fillStyle(0xffffff, 0.2);
  g.fillRoundedRect(4, 2, w * 0.4, 4, 2);

  // Nori wrap (dark band in middle)
  const noriH = 6;
  const noriY = tH - 1;
  g.fillStyle(0x1a2d1a, 0.85);
  g.fillRect(w * 0.3, noriY, w * 0.4, noriH);
  g.fillStyle(0x2d4a2d, 0.3);
  g.fillRect(w * 0.3, noriY, w * 0.4, 2);
}

// ══════════════════════════════════════════════════════════════
// BURGER
// ══════════════════════════════════════════════════════════════
const BURGER_LAYERS = [
  { color: 0x8B4513, name: 'patty', shine: 0x6B3410 },
  { color: 0x27ae60, name: 'lettuce', shine: 0x2ecc71 },
  { color: 0xf1c40f, name: 'cheese', shine: 0xf9e070 },
  { color: 0xe74c3c, name: 'tomato', shine: 0xf06060 },
  { color: 0x8B4513, name: 'patty2', shine: 0x6B3410 },
  { color: 0xecf0f1, name: 'onion', shine: 0xffffff },
  { color: 0xe67e22, name: 'bacon', shine: 0xd35400 },
  { color: 0xf39c12, name: 'egg', shine: 0xf9d56e },
];

function drawBurger(g: Phaser.GameObjects.Graphics, w: number, h: number, idx: number) {
  const b = BURGER_LAYERS[idx % BURGER_LAYERS.length];
  const R = 5;

  g.fillStyle(b.color, 1);
  g.fillRoundedRect(0, 0, w, h, R);

  // Top highlight
  g.fillStyle(b.shine, 0.4);
  g.fillRoundedRect(0, 0, w, h * 0.4, { tl: R, tr: R, bl: 0, br: 0 });

  // Shine
  g.fillStyle(0xffffff, 0.15);
  g.fillRoundedRect(5, 2, w * 0.35, 3, 1.5);

  // Drip effect on sides (ketchup/sauce)
  if (b.name === 'patty' || b.name === 'patty2') {
    g.fillStyle(0xcc3300, 0.4);
    g.fillCircle(w * 0.2, h, 3);
    g.fillCircle(w * 0.7, h, 2);
  }
  if (b.name === 'cheese') {
    // Cheese drip
    g.fillStyle(0xf1c40f, 0.6);
    g.fillRect(w * 0.15, h - 2, 8, 5);
    g.fillRect(w * 0.65, h - 2, 6, 4);
  }

  // Bottom shadow
  g.fillStyle(0x000000, 0.1);
  g.fillRect(2, h - 2, w - 4, 2);
}

// ══════════════════════════════════════════════════════════════
// CAKE
// ══════════════════════════════════════════════════════════════
const CAKE_LAYERS = [
  { sponge: 0xf5d6c3, cream: 0xfff0f5, accent: 0xff69b4 },
  { sponge: 0x8B4513, cream: 0xfff5e6, accent: 0xd2691e },
  { sponge: 0xf5d6c3, cream: 0xe8f5e9, accent: 0x66bb6a },
  { sponge: 0xfff0e6, cream: 0xfff9c4, accent: 0xffb74d },
  { sponge: 0xe8d5e0, cream: 0xf3e5f5, accent: 0xba68c8 },
  { sponge: 0xf5d6c3, cream: 0xfce4ec, accent: 0xef5350 },
  { sponge: 0xd7ccc8, cream: 0xfff8e1, accent: 0x8d6e63 },
  { sponge: 0xc8e6c9, cream: 0xf1f8e9, accent: 0x43a047 },
];

function drawCake(g: Phaser.GameObjects.Graphics, w: number, h: number, idx: number) {
  const c = CAKE_LAYERS[idx % CAKE_LAYERS.length];
  const R = 4;
  const creamH = 7;

  // Sponge body
  g.fillStyle(c.sponge, 1);
  g.fillRoundedRect(0, creamH, w, h - creamH, { tl: 0, tr: 0, bl: R, br: R });

  // Cream top
  g.fillStyle(c.cream, 1);
  g.fillRoundedRect(0, 0, w, creamH + 2, { tl: R, tr: R, bl: 0, br: 0 });

  // Cream drip (wavy)
  g.fillStyle(c.cream, 0.9);
  for (let x = 5; x < w - 5; x += 12) {
    const dripH = Phaser.Math.Between(2, 6);
    g.fillCircle(x, creamH + 1, 4);
    g.fillRect(x - 2, creamH, 4, dripH);
  }

  // Decorations (sprinkles or fruit)
  for (let i = 0; i < 5; i++) {
    const sx = Phaser.Math.Between(6, w - 6);
    g.fillStyle(c.accent, 0.7);
    g.fillCircle(sx, 3, 2);
  }

  // Shine
  g.fillStyle(0xffffff, 0.12);
  g.fillRoundedRect(4, 1, w * 0.3, 3, 1);
}

// ══════════════════════════════════════════════════════════════
// DJ / SPEAKERS
// ══════════════════════════════════════════════════════════════
const DJ_COLORS = [
  { body: 0x2d2d2d, accent: 0x00ff88 },
  { body: 0x1a1a2e, accent: 0xff00ff },
  { body: 0x2d2d2d, accent: 0x00ccff },
  { body: 0x1a1a2e, accent: 0xffff00 },
  { body: 0x2d2d2d, accent: 0xff4444 },
  { body: 0x1a1a2e, accent: 0xff8800 },
  { body: 0x2d2d2d, accent: 0x44ff44 },
  { body: 0x1a1a2e, accent: 0xcc44ff },
];

function drawDJ(g: Phaser.GameObjects.Graphics, w: number, h: number, idx: number) {
  const d = DJ_COLORS[idx % DJ_COLORS.length];
  const R = 4;

  // Speaker body
  g.fillStyle(d.body, 1);
  g.fillRoundedRect(0, 0, w, h, R);

  // Metal grille texture
  g.fillStyle(0xffffff, 0.04);
  for (let y = 4; y < h - 4; y += 3) {
    g.fillRect(3, y, w - 6, 1);
  }

  // Speaker cone (circle)
  const cx = w * 0.35, cy = h / 2, r = Math.min(h * 0.35, 10);
  g.fillStyle(0x111111, 0.8);
  g.fillCircle(cx, cy, r);
  g.fillStyle(d.accent, 0.3);
  g.fillCircle(cx, cy, r * 0.6);
  g.fillStyle(d.accent, 0.6);
  g.fillCircle(cx, cy, r * 0.25);

  // LED strip
  g.fillStyle(d.accent, 0.5);
  g.fillRect(w - 8, 4, 4, h - 8);
  // LED dots
  const leds = Math.floor((h - 12) / 5);
  for (let i = 0; i < leds; i++) {
    const bright = Math.random() > 0.3;
    g.fillStyle(d.accent, bright ? 0.9 : 0.2);
    g.fillCircle(w - 6, 7 + i * 5, 1.5);
  }

  // Top chrome strip
  g.fillStyle(0xffffff, 0.1);
  g.fillRect(0, 0, w, 2);

  // Bottom shadow
  g.fillStyle(0x000000, 0.2);
  g.fillRect(2, h - 2, w - 4, 2);
}

// ══════════════════════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════════════════════

export const BLOCK_THEMES: BlockThemeDef[] = [
  {
    id: 'building', name: 'Skyscraper', price: 0, icon: '🏙️',
    drawBlock: drawBuilding, drawFragment: drawBuilding,
  },
  {
    id: 'sushi', name: 'Sushi Tower', price: 200, icon: '🍣',
    drawBlock: drawSushi, drawFragment: drawSushi,
  },
  {
    id: 'burger', name: 'Mega Burger', price: 250, icon: '🍔',
    drawBlock: drawBurger, drawFragment: drawBurger,
  },
  {
    id: 'cake', name: 'Layer Cake', price: 300, icon: '🎂',
    drawBlock: drawCake, drawFragment: drawCake,
  },
  {
    id: 'dj', name: 'DJ Stack', price: 350, icon: '🎵',
    drawBlock: drawDJ, drawFragment: drawDJ,
  },
];
