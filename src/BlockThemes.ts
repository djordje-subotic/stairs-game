import Phaser from 'phaser';

export interface BlockThemeDef {
  id: string;
  name: string;
  price: number;
  icon: string;
  drawBlock: (g: Phaser.GameObjects.Graphics, w: number, h: number, idx: number) => void;
  drawFragment: (g: Phaser.GameObjects.Graphics, w: number, h: number, idx: number) => void;
}

// Seeded pseudo-random so blocks look consistent across redraws
function seed(idx: number, salt: number): number {
  const x = Math.sin(idx * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// ══════════════════════════════════════════════════════════════
// BUILDING — each variant is a totally different building style
// ══════════════════════════════════════════════════════════════

function drawBuilding(g: Phaser.GameObjects.Graphics, w: number, h: number, idx: number) {
  const variant = idx % 8;

  if (variant === 0) {
    // Modern glass — blue tinted with large reflective windows
    g.fillStyle(0x2a5080, 1);
    g.fillRect(0, 0, w, h);
    // Large window panels
    const panelW = Math.max(8, Math.floor((w - 6) / 3));
    const gap = 2;
    const cols = Math.floor((w - 4) / (panelW + gap));
    const sx = (w - cols * (panelW + gap) + gap) / 2;
    for (let ci = 0; ci < cols; ci++) {
      const wx = sx + ci * (panelW + gap);
      // Window glass
      g.fillStyle(0x6abcee, 0.7);
      g.fillRect(wx, 4, panelW, h - 8);
      // Reflection streak
      g.fillStyle(0xffffff, 0.4);
      g.fillRect(wx + 1, 4, 2, h - 8);
      // Mullion (vertical divider)
      g.fillStyle(0x1a3050, 0.9);
      g.fillRect(wx + Math.floor(panelW / 2), 4, 1, h - 8);
    }
    // Steel frame top/bottom
    g.fillStyle(0x6080a0, 1);
    g.fillRect(0, 0, w, 3);
    g.fillRect(0, h - 2, w, 2);
    g.fillStyle(0xffffff, 0.25);
    g.fillRect(0, 0, w, 1);

  } else if (variant === 1) {
    // Brick building — red/brown with visible brick pattern
    g.fillStyle(0x8b4513, 1);
    g.fillRect(0, 0, w, h);
    // Brick rows
    const brickW = 8, brickH = 5;
    for (let row = 0; row < Math.ceil(h / brickH); row++) {
      const offset = (row % 2) * (brickW / 2);
      for (let col = -1; col < Math.ceil(w / brickW) + 1; col++) {
        const bx = col * brickW + offset;
        const by = row * brickH;
        // Mortar lines
        g.fillStyle(0xc8b8a0, 0.6);
        g.fillRect(bx + brickW - 1, by, 1, brickH);
        g.fillRect(bx, by + brickH - 1, brickW, 1);
        // Brick color variation
        const shade = seed(idx, row * 17 + col * 7);
        g.fillStyle(shade > 0.5 ? 0xa05020 : 0x903818, 0.3);
        g.fillRect(bx, by, brickW - 1, brickH - 1);
      }
    }
    // Small window
    if (w > 25) {
      g.fillStyle(0x2a2a2a, 0.9);
      g.fillRect(w * 0.4, 8, 8, 12);
      g.fillStyle(0xffeaa7, 0.5);
      g.fillRect(w * 0.4 + 1, 9, 6, 10);
      g.fillStyle(0x5a3a1a, 0.9);
      g.fillRect(w * 0.4 + 3, 8, 1, 12);
      g.fillRect(w * 0.4, 14, 8, 1);
    }

  } else if (variant === 2) {
    // Art deco — gold trim with ornate details
    g.fillStyle(0x2a2a3a, 1);
    g.fillRect(0, 0, w, h);
    // Gold trim top
    g.fillStyle(0xd4a845, 1);
    g.fillRect(0, 0, w, 5);
    g.fillStyle(0xffd700, 0.7);
    g.fillRect(0, 0, w, 2);
    // Chevron pattern in gold
    g.fillStyle(0xd4a845, 0.6);
    for (let cx = 4; cx < w - 4; cx += 12) {
      g.beginPath();
      g.moveTo(cx, 18); g.lineTo(cx + 6, 8); g.lineTo(cx + 12, 18);
      g.lineTo(cx + 10, 18); g.lineTo(cx + 6, 10); g.lineTo(cx + 2, 18);
      g.closePath(); g.fillPath();
    }
    // Vertical gold lines
    g.fillStyle(0xd4a845, 0.5);
    g.fillRect(3, 5, 2, h - 7);
    g.fillRect(w - 5, 5, 2, h - 7);
    // Gold bottom trim
    g.fillStyle(0xd4a845, 0.8);
    g.fillRect(0, h - 3, w, 3);
    // Center ornament
    if (w > 30) {
      g.fillStyle(0xffd700, 0.6);
      g.fillCircle(w / 2, h / 2 + 2, 4);
      g.fillStyle(0x2a2a3a, 0.8);
      g.fillCircle(w / 2, h / 2 + 2, 2);
    }

  } else if (variant === 3) {
    // Office tower — gray, uniform small windows
    g.fillStyle(0x606870, 1);
    g.fillRect(0, 0, w, h);
    // Grid of small uniform windows
    const winW = 4, winH = 5, gapX = 3, gapY = 4;
    const cols = Math.floor((w - 4) / (winW + gapX));
    const rows = Math.floor((h - 6) / (winH + gapY));
    const sx = (w - cols * (winW + gapX) + gapX) / 2;
    const sy = (h - rows * (winH + gapY) + gapY) / 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const wx = sx + c * (winW + gapX);
        const wy = sy + r * (winH + gapY);
        const lit = seed(idx, r * 13 + c * 7) > 0.4;
        g.fillStyle(lit ? 0xffeaa7 : 0x303840, lit ? 0.7 : 0.8);
        g.fillRect(wx, wy, winW, winH);
      }
    }
    // Concrete ledges
    g.fillStyle(0x808890, 1);
    g.fillRect(0, 0, w, 2);
    g.fillRect(0, h - 2, w, 2);
    g.fillStyle(0xffffff, 0.15);
    g.fillRect(0, 0, w, 1);

  } else if (variant === 4) {
    // Residential — warm brown with shuttered windows
    g.fillStyle(0x8b7355, 1);
    g.fillRect(0, 0, w, h);
    // Stucco texture
    g.fillStyle(0xffffff, 0.08);
    for (let i = 0; i < 20; i++) {
      const tx = seed(idx, i * 3) * w;
      const ty = seed(idx, i * 7) * h;
      g.fillRect(tx, ty, 2, 1);
    }
    // Windows with shutters
    const winCols = Math.max(1, Math.floor((w - 10) / 20));
    const wsx = (w - winCols * 20) / 2 + 4;
    for (let c = 0; c < winCols; c++) {
      const wx = wsx + c * 20;
      // Shutters
      g.fillStyle(0x4a6040, 0.9);
      g.fillRect(wx - 3, 7, 3, 16);
      g.fillRect(wx + 10, 7, 3, 16);
      // Window
      g.fillStyle(0xfff5e6, 0.6);
      g.fillRect(wx, 8, 10, 14);
      // Cross bars
      g.fillStyle(0x6a5030, 0.8);
      g.fillRect(wx + 4, 8, 2, 14);
      g.fillRect(wx, 14, 10, 2);
      // Flower box
      g.fillStyle(0x8b4513, 0.7);
      g.fillRect(wx - 1, 23, 12, 3);
      g.fillStyle(0xff6b9d, 0.6);
      g.fillCircle(wx + 2, 22, 2);
      g.fillCircle(wx + 8, 22, 2);
    }
    g.fillStyle(0x000000, 0.1);
    g.fillRect(0, h - 1, w, 1);

  } else if (variant === 5) {
    // Neon building — dark with glowing neon signs
    g.fillStyle(0x151520, 1);
    g.fillRect(0, 0, w, h);
    // Dark windows
    g.fillStyle(0x101018, 0.8);
    for (let wx = 4; wx < w - 8; wx += 9) {
      g.fillRect(wx, 6, 6, 10);
    }
    // Neon sign glow
    g.fillStyle(0xff00ff, 0.15);
    g.fillRect(4, 2, w - 8, h - 4);
    // Neon horizontal bar
    g.fillStyle(0xff00ff, 0.8);
    g.fillRect(6, 18, w - 12, 2);
    g.fillStyle(0xff00ff, 0.3);
    g.fillRect(6, 17, w - 12, 4);
    // Neon vertical accents
    g.fillStyle(0x00ffff, 0.7);
    g.fillRect(3, 3, 1, h - 6);
    g.fillRect(w - 4, 3, 1, h - 6);
    g.fillStyle(0x00ffff, 0.25);
    g.fillRect(2, 3, 3, h - 6);
    g.fillRect(w - 5, 3, 3, h - 6);
    // Neon text dots
    if (w > 30) {
      g.fillStyle(0xff4488, 0.9);
      for (let dx = 10; dx < w - 10; dx += 5) {
        g.fillCircle(dx, 10, 1.2);
      }
    }
    g.fillStyle(0x000000, 0.3);
    g.fillRect(0, h - 1, w, 1);

  } else if (variant === 6) {
    // Classical — columns, stone look
    g.fillStyle(0xd4c8b0, 1);
    g.fillRect(0, 0, w, h);
    // Stone texture
    g.fillStyle(0x000000, 0.06);
    for (let i = 0; i < 15; i++) {
      const sx = seed(idx, i * 5) * w;
      const sy = seed(idx, i * 9) * h;
      g.fillRect(sx, sy, 3, 2);
    }
    // Entablature (top)
    g.fillStyle(0xbfb49a, 1);
    g.fillRect(0, 0, w, 6);
    g.fillStyle(0xffffff, 0.25);
    g.fillRect(0, 0, w, 2);
    g.fillStyle(0xa09070, 0.8);
    g.fillRect(0, 4, w, 2);
    // Columns
    const colCount = Math.max(2, Math.floor(w / 16));
    const colSpace = w / (colCount + 1);
    for (let ci = 0; ci < colCount; ci++) {
      const cx = colSpace * (ci + 1);
      g.fillStyle(0xc8bca4, 1);
      g.fillRect(cx - 3, 6, 6, h - 8);
      // Column fluting (vertical lines)
      g.fillStyle(0x000000, 0.12);
      g.fillRect(cx - 2, 6, 1, h - 8);
      g.fillRect(cx + 1, 6, 1, h - 8);
      // Highlight
      g.fillStyle(0xffffff, 0.2);
      g.fillRect(cx - 1, 6, 1, h - 8);
      // Capital
      g.fillStyle(0xbfb49a, 0.9);
      g.fillRect(cx - 4, 6, 8, 3);
    }
    // Base
    g.fillStyle(0xa09070, 0.8);
    g.fillRect(0, h - 3, w, 3);

  } else {
    // Penthouse — luxury with gold accents
    g.fillStyle(0x1a1a2e, 1);
    g.fillRect(0, 0, w, h);
    // Marble texture
    g.fillStyle(0xffffff, 0.05);
    for (let i = 0; i < 8; i++) {
      const mx = seed(idx, i * 3) * w;
      const my = seed(idx, i * 7) * h;
      g.beginPath();
      g.moveTo(mx, my);
      g.lineTo(mx + 15, my + 3);
      g.lineTo(mx + 15, my + 4);
      g.lineTo(mx, my + 1);
      g.closePath(); g.fillPath();
    }
    // Large panoramic window
    g.fillStyle(0x1a1a40, 0.9);
    g.fillRect(6, 6, w - 12, h - 12);
    g.fillStyle(0x202060, 0.6);
    g.fillRect(7, 7, w - 14, h - 14);
    // City lights reflection
    for (let i = 0; i < 6; i++) {
      const lx = 10 + seed(idx, i * 5) * (w - 24);
      const ly = 10 + seed(idx, i * 9) * (h - 20);
      g.fillStyle(0xffeaa7, 0.3);
      g.fillCircle(lx, ly, 1);
    }
    // Gold frame
    g.fillStyle(0xd4a845, 0.9);
    g.fillRect(0, 0, w, 3);
    g.fillRect(0, h - 2, w, 2);
    g.fillRect(0, 0, 3, h);
    g.fillRect(w - 3, 0, 3, h);
    g.fillStyle(0xffd700, 0.5);
    g.fillRect(0, 0, w, 1);
    g.fillRect(0, 0, 1, h);
  }
}

// ══════════════════════════════════════════════════════════════
// SUSHI — each variant is a distinct sushi type
// ══════════════════════════════════════════════════════════════

function drawSushi(g: Phaser.GameObjects.Graphics, w: number, h: number, idx: number) {
  const variant = idx % 8;
  const split = Math.floor(h * 0.45);

  if (variant === 0) {
    // Salmon nigiri — orange-pink with diagonal fat marbling
    g.fillStyle(0xe8734a, 1);
    g.fillRect(0, 0, w, split + 2);
    // Diagonal marbling (white fat lines) — clamped to bounds
    g.fillStyle(0xffccaa, 0.5);
    for (let dx = 0; dx < w; dx += 6) {
      g.fillRect(dx, 0, 2, split + 2);
    }
    // Shine
    g.fillStyle(0xffffff, 0.3);
    g.fillRect(4, 1, w * 0.3, 2);
    // Rice
    g.fillStyle(0xfff5e6, 1);
    g.fillRect(0, split, w, h - split);
    // Rice grains
    g.fillStyle(0xe0d8c8, 0.35);
    for (let i = 0; i < 12; i++) {
      g.fillRect(seed(idx, i * 3) * (w - 6) + 3, split + 2 + seed(idx, i * 7) * (h - split - 4), 2, 1);
    }
    // Nori band center
    g.fillStyle(0x1a2e1a, 0.9);
    g.fillRect(w * 0.25, split - 3, w * 0.5, 7);

  } else if (variant === 1) {
    // Tuna — deep red, smooth surface with slight grain
    g.fillStyle(0xb82030, 1);
    g.fillRect(0, 0, w, split + 2);
    // Subtle horizontal grain
    g.fillStyle(0x901828, 0.4);
    for (let ly = 1; ly < split; ly += 3) {
      g.fillRect(2, ly, w - 4, 1);
    }
    g.fillStyle(0xffffff, 0.25);
    g.fillRect(3, 1, w * 0.4, 2);
    // Rice
    g.fillStyle(0xfff5e6, 1);
    g.fillRect(0, split, w, h - split);
    g.fillStyle(0xe0d8c8, 0.35);
    for (let i = 0; i < 12; i++) {
      g.fillRect(seed(idx, i * 3) * (w - 6) + 3, split + 2 + seed(idx, i * 7) * (h - split - 4), 2, 1);
    }
    // Wide nori at bottom
    g.fillStyle(0x1a2e1a, 0.9);
    g.fillRect(0, h - 6, w, 6);
    g.fillStyle(0x2a4a2a, 0.3);
    g.fillRect(0, h - 6, w, 2);

  } else if (variant === 2) {
    // Avocado — green smooth gradient
    g.fillStyle(0x4a8a30, 1);
    g.fillRect(0, 0, w, split + 2);
    // Smooth gradient effect (lighter at top)
    g.fillStyle(0x7ac050, 0.5);
    g.fillRect(0, 0, w, Math.floor(split * 0.4));
    g.fillStyle(0x3a6a20, 0.3);
    g.fillRect(0, Math.floor(split * 0.7), w, split - Math.floor(split * 0.7) + 2);
    // Subtle seed mark
    if (w > 25) {
      g.fillStyle(0x5a4020, 0.3);
      g.fillCircle(w * 0.5, split * 0.5, 3);
    }
    g.fillStyle(0xffffff, 0.2);
    g.fillRect(4, 1, w * 0.25, 2);
    // Rice
    g.fillStyle(0xfff5e6, 1);
    g.fillRect(0, split, w, h - split);
    g.fillStyle(0xe0d8c8, 0.35);
    for (let i = 0; i < 12; i++) {
      g.fillRect(seed(idx, i * 3) * (w - 6) + 3, split + 2 + seed(idx, i * 7) * (h - split - 4), 2, 1);
    }
    // Thin nori wrap on left side
    g.fillStyle(0x1a2e1a, 0.9);
    g.fillRect(0, 2, 5, h - 4);

  } else if (variant === 3) {
    // Tamago (egg) — bright yellow with horizontal fold lines
    g.fillStyle(0xf0c830, 1);
    g.fillRect(0, 0, w, split + 2);
    // Horizontal fold/layer lines
    g.fillStyle(0xd4a010, 0.5);
    for (let ly = 3; ly < split; ly += 4) {
      g.fillRect(1, ly, w - 2, 1);
    }
    // Egg sheen
    g.fillStyle(0xffffff, 0.35);
    g.fillRect(3, 1, w * 0.5, 3);
    g.fillStyle(0xfff8d0, 0.3);
    g.fillRect(0, 0, w, Math.floor(split * 0.3));
    // Rice
    g.fillStyle(0xfff5e6, 1);
    g.fillRect(0, split, w, h - split);
    g.fillStyle(0xe0d8c8, 0.35);
    for (let i = 0; i < 12; i++) {
      g.fillRect(seed(idx, i * 3) * (w - 6) + 3, split + 2 + seed(idx, i * 7) * (h - split - 4), 2, 1);
    }
    // Nori band at center-right
    g.fillStyle(0x1a2e1a, 0.9);
    g.fillRect(w * 0.55, split - 4, w * 0.35, 8);

  } else if (variant === 4) {
    // Shrimp (ebi) — pink/orange, curved tail marks
    g.fillStyle(0xe87050, 1);
    g.fillRect(0, 0, w, split + 2);
    // Shrimp segment lines (curved horizontal)
    g.fillStyle(0xf0a088, 0.6);
    for (let ly = 2; ly < split; ly += 3) {
      g.fillRect(3, ly, w - 6, 2);
      g.fillStyle(0xc85030, 0.3);
      g.fillRect(3, ly + 2, w - 6, 1);
      g.fillStyle(0xf0a088, 0.6);
    }
    // Tail end at right
    g.fillStyle(0xff8060, 0.8);
    g.fillTriangle(w - 2, 0, w + 3, split * 0.5, w - 2, split);
    g.fillStyle(0xffffff, 0.3);
    g.fillRect(4, 1, w * 0.2, 2);
    // Rice
    g.fillStyle(0xfff5e6, 1);
    g.fillRect(0, split, w, h - split);
    g.fillStyle(0xe0d8c8, 0.35);
    for (let i = 0; i < 12; i++) {
      g.fillRect(seed(idx, i * 3) * (w - 6) + 3, split + 2 + seed(idx, i * 7) * (h - split - 4), 2, 1);
    }
    // No nori for shrimp

  } else if (variant === 5) {
    // Uni (sea urchin) — golden-orange, spiky/creamy texture
    g.fillStyle(0xd09020, 1);
    g.fillRect(0, 0, w, split + 2);
    // Creamy bumpy texture
    g.fillStyle(0xe0a830, 0.6);
    for (let i = 0; i < 8; i++) {
      const bx = seed(idx, i * 5) * (w - 8) + 4;
      const by = seed(idx, i * 9) * split * 0.6 + 2;
      g.fillCircle(bx, by, 3);
    }
    g.fillStyle(0xc08018, 0.5);
    for (let i = 0; i < 6; i++) {
      const bx = seed(idx, i * 7) * (w - 6) + 3;
      const by = seed(idx, i * 11) * split * 0.7 + 1;
      g.fillCircle(bx, by, 2);
    }
    g.fillStyle(0xffffff, 0.25);
    g.fillRect(4, 1, w * 0.2, 2);
    // Gunkan wrap (nori all around sides)
    g.fillStyle(0x1a2e1a, 0.9);
    g.fillRect(0, 0, 3, h);
    g.fillRect(w - 3, 0, 3, h);
    // Rice
    g.fillStyle(0xfff5e6, 1);
    g.fillRect(3, split, w - 6, h - split);
    g.fillStyle(0xe0d8c8, 0.35);
    for (let i = 0; i < 10; i++) {
      g.fillRect(seed(idx, i * 3) * (w - 12) + 6, split + 2 + seed(idx, i * 7) * (h - split - 4), 2, 1);
    }

  } else if (variant === 6) {
    // Mackerel (saba) — silver-blue with dark stripe pattern
    g.fillStyle(0x708898, 1);
    g.fillRect(0, 0, w, split + 2);
    // Dark blue stripes (fish skin pattern)
    g.fillStyle(0x304858, 0.6);
    for (let sx = 0; sx < w; sx += 5) {
      const sOff = seed(idx, sx) * 3;
      g.fillRect(sx, sOff, 3, split - sOff);
    }
    // Silver sheen
    g.fillStyle(0xffffff, 0.3);
    g.fillRect(2, Math.floor(split * 0.3), w - 4, 3);
    // Rice
    g.fillStyle(0xfff5e6, 1);
    g.fillRect(0, split, w, h - split);
    g.fillStyle(0xe0d8c8, 0.35);
    for (let i = 0; i < 12; i++) {
      g.fillRect(seed(idx, i * 3) * (w - 6) + 3, split + 2 + seed(idx, i * 7) * (h - split - 4), 2, 1);
    }
    // Nori band at bottom
    g.fillStyle(0x1a2e1a, 0.9);
    g.fillRect(w * 0.15, h - 5, w * 0.7, 5);

  } else {
    // Otoro (fatty tuna) — marbled pink-white
    g.fillStyle(0xe88088, 1);
    g.fillRect(0, 0, w, split + 2);
    // Heavy white marbling
    // Marbling lines — vertical, clamped
    g.fillStyle(0xffffff, 0.45);
    for (let dx = 2; dx < w; dx += 4) {
      g.fillRect(dx, 0, 1.5, split + 2);
    }
    g.fillStyle(0xffd0d8, 0.3);
    g.fillRect(0, 0, w, Math.floor(split * 0.3));
    g.fillStyle(0xffffff, 0.35);
    g.fillRect(4, 1, w * 0.35, 2);
    // Rice
    g.fillStyle(0xfff5e6, 1);
    g.fillRect(0, split, w, h - split);
    g.fillStyle(0xe0d8c8, 0.35);
    for (let i = 0; i < 12; i++) {
      g.fillRect(seed(idx, i * 3) * (w - 6) + 3, split + 2 + seed(idx, i * 7) * (h - split - 4), 2, 1);
    }
    // Thin nori at center
    g.fillStyle(0x1a2e1a, 0.9);
    g.fillRect(w * 0.3, split - 2, w * 0.4, 5);
  }
}

// ══════════════════════════════════════════════════════════════
// BURGER — each block is a completely different ingredient
// ══════════════════════════════════════════════════════════════

function drawBurger(g: Phaser.GameObjects.Graphics, w: number, h: number, idx: number) {
  const variant = idx % 8;

  if (variant === 0) {
    // Bun top — golden brown dome with sesame seeds
    g.fillStyle(0xC4853F, 1);
    g.fillRect(0, 0, w, h);
    // Dome highlight (lighter on top)
    g.fillStyle(0xd8a050, 0.6);
    g.fillRect(0, 0, w, Math.floor(h * 0.4));
    g.fillStyle(0xffffff, 0.2);
    g.fillRect(3, 0, w - 6, 3);
    // Sesame seeds
    g.fillStyle(0xfff5d6, 0.85);
    for (let i = 0; i < Math.floor(w / 8); i++) {
      const sx = seed(idx, i * 5) * (w - 16) + 8;
      const sy = seed(idx, i * 9) * (h * 0.5) + 2;
      g.fillCircle(sx, sy, 1.5);
      g.fillStyle(0xfff0c0, 0.6);
      g.fillCircle(sx, sy, 1);
      g.fillStyle(0xfff5d6, 0.85);
    }
    // Bottom edge shadow
    g.fillStyle(0x905020, 0.4);
    g.fillRect(0, h - 3, w, 3);

  } else if (variant === 1) {
    // Lettuce — bright green with wavy edges sticking out
    g.fillStyle(0x3ac060, 1);
    g.fillRect(0, 0, w, h);
    // Darker veins
    g.fillStyle(0x20802a, 0.5);
    g.fillRect(w * 0.3, 2, 1, h - 4);
    g.fillRect(w * 0.55, 3, 1, h - 5);
    g.fillRect(w * 0.75, 2, 1, h - 3);
    // Lighter center
    g.fillStyle(0x80ff80, 0.35);
    g.fillRect(2, Math.floor(h * 0.3), w - 4, Math.floor(h * 0.4));
    // Wavy edges sticking out on both sides
    g.fillStyle(0x30b050, 0.9);
    for (let lx = 0; lx < w; lx += 6) {
      g.fillCircle(lx, 2, 3);
      g.fillCircle(lx + 3, h - 2, 3);
    }
    // Ruffled texture
    g.fillStyle(0x20a040, 0.4);
    for (let lx = 0; lx < w; lx += 4) {
      g.fillCircle(lx, h * 0.5, 2);
    }

  } else if (variant === 2) {
    // Cheese — bright yellow with melty drips
    g.fillStyle(0xf5d020, 1);
    g.fillRect(0, 0, w, h);
    // Orange tint variation
    g.fillStyle(0xf0a800, 0.3);
    g.fillRect(0, Math.floor(h * 0.5), w, Math.floor(h * 0.5));
    // Cheese holes
    g.fillStyle(0xe8b800, 0.5);
    g.fillCircle(w * 0.25, h * 0.4, 3);
    g.fillCircle(w * 0.7, h * 0.6, 2);
    // Melty drips hanging off edges
    g.fillStyle(0xf5d020, 0.95);
    for (const dp of [0.1, 0.3, 0.55, 0.75, 0.9]) {
      const dl = 4 + seed(idx, dp * 99) * 8;
      g.fillRect(w * dp - 2, h - 1, 4, dl);
      g.fillCircle(w * dp, h - 1 + dl, 2.5);
    }
    // Shine
    g.fillStyle(0xffffff, 0.3);
    g.fillRect(3, 1, w * 0.4, 2);

  } else if (variant === 3) {
    // Patty — dark brown with grill marks
    g.fillStyle(0x5a2a10, 1);
    g.fillRect(0, 0, w, h);
    // Grill marks
    g.fillStyle(0x2a1000, 0.6);
    for (let gx = 4; gx < w - 4; gx += 7) {
      g.fillRect(gx, 4, 5, 3);
      g.fillRect(gx + 2, h - 8, 5, 3);
    }
    // Crust texture
    g.fillStyle(0x401a08, 0.4);
    g.fillRect(0, 0, w, 3);
    g.fillRect(0, h - 3, w, 3);
    // Juicy spots
    g.fillStyle(0xcc3300, 0.5);
    g.fillCircle(w * 0.2, h - 2, 2);
    g.fillCircle(w * 0.6, h - 2, 1.5);
    g.fillCircle(w * 0.85, h - 2, 1.5);
    // Slight sheen
    g.fillStyle(0xffffff, 0.08);
    g.fillRect(0, Math.floor(h * 0.3), w, 2);

  } else if (variant === 4) {
    // Tomato — bright red with visible seed chambers
    g.fillStyle(0xe03020, 1);
    g.fillRect(0, 0, w, h);
    // Tomato seed chambers (lighter red circles)
    g.fillStyle(0xff6050, 0.4);
    const chambers = Math.max(2, Math.floor(w / 18));
    for (let ci = 0; ci < chambers; ci++) {
      const cx = (w / (chambers + 1)) * (ci + 1);
      g.fillCircle(cx, h * 0.5, 5);
      // Seeds
      g.fillStyle(0xffcc80, 0.5);
      g.fillCircle(cx - 2, h * 0.45, 1);
      g.fillCircle(cx + 1, h * 0.55, 1);
      g.fillStyle(0xff6050, 0.4);
    }
    // Wet surface highlight
    g.fillStyle(0xffffff, 0.25);
    g.fillRect(4, 1, w * 0.35, 2);
    // Skin edges
    g.fillStyle(0xb01818, 0.5);
    g.fillRect(0, 0, w, 2);
    g.fillRect(0, h - 2, w, 2);

  } else if (variant === 5) {
    // Onion — pale white with ring pattern
    g.fillStyle(0xe8dcd0, 1);
    g.fillRect(0, 0, w, h);
    // Onion rings
    g.fillStyle(0xd0c0b0, 0.5);
    const rings = Math.max(2, Math.floor(w / 14));
    for (let ri = 0; ri < rings; ri++) {
      const rx = (w / (rings + 1)) * (ri + 1);
      g.lineStyle(1.5, 0xc0a898, 0.6);
      g.strokeCircle(rx, h / 2, 6);
      g.lineStyle(1, 0xd8c8b8, 0.4);
      g.strokeCircle(rx, h / 2, 4);
      g.lineStyle(0.5, 0xc8b8a8, 0.3);
      g.strokeCircle(rx, h / 2, 8);
    }
    // Translucent sheen
    g.fillStyle(0xffffff, 0.2);
    g.fillRect(0, 0, w, Math.floor(h * 0.3));
    // Purple tint at edge
    g.fillStyle(0x8040a0, 0.12);
    g.fillRect(0, 0, w, 2);
    g.fillRect(0, h - 2, w, 2);

  } else if (variant === 6) {
    // Bacon — orange-brown with wavy fat/meat stripes
    g.fillStyle(0xb04020, 1);
    g.fillRect(0, 0, w, h);
    // Fat stripes (wavy horizontal)
    g.fillStyle(0xf0c0a0, 0.7);
    g.fillRect(0, 2, w, 4);
    g.fillRect(0, 12, w, 3);
    g.fillRect(0, h - 8, w, 4);
    // Meat between fat
    g.fillStyle(0x8a2010, 0.5);
    g.fillRect(0, 6, w, 6);
    g.fillRect(0, 15, w, h - 23);
    // Crispy edges
    g.fillStyle(0x601008, 0.4);
    for (let cx = 2; cx < w - 2; cx += 5) {
      g.fillRect(cx, 0, 3, 2);
      g.fillRect(cx + 1, h - 2, 3, 2);
    }
    // Grease shine
    g.fillStyle(0xffffff, 0.15);
    g.fillRect(3, 3, w * 0.3, 2);

  } else {
    // Bun bottom — flat, lighter brown
    g.fillStyle(0xa07030, 1);
    g.fillRect(0, 0, w, h);
    // Flat top surface
    g.fillStyle(0xb88040, 0.5);
    g.fillRect(0, 0, w, 3);
    g.fillStyle(0xffffff, 0.15);
    g.fillRect(0, 0, w, 2);
    // Flour spots
    g.fillStyle(0xfff5e0, 0.35);
    for (let i = 0; i < 6; i++) {
      const fx = seed(idx, i * 4) * (w - 10) + 5;
      const fy = seed(idx, i * 8) * (h * 0.6) + 4;
      g.fillCircle(fx, fy, 1.5);
    }
    // Bottom crust
    g.fillStyle(0x704020, 0.4);
    g.fillRect(0, h - 4, w, 4);
  }
}

// ══════════════════════════════════════════════════════════════
// CAKE — each layer is visually unique
// ══════════════════════════════════════════════════════════════

function drawCake(g: Phaser.GameObjects.Graphics, w: number, h: number, idx: number) {
  const variant = idx % 8;

  if (variant === 0) {
    // Pink strawberry layer with dripping frosting and sprinkles
    g.fillStyle(0xf0b8c0, 1);
    g.fillRect(0, 0, w, h);
    // Frosting top (white with drips)
    g.fillStyle(0xfff0f5, 1);
    g.fillRect(0, 0, w, 8);
    // Drips
    for (let x = 4; x < w - 4; x += 7) {
      const dh = 4 + seed(idx, x) * 6;
      g.fillRect(x - 2, 6, 4, dh);
      g.fillCircle(x, 6 + dh, 2.5);
    }
    // Rainbow sprinkles
    const sprCols = [0xff4444, 0xff8800, 0xffd000, 0x44cc44, 0x4488ff, 0xcc44ff];
    for (let i = 0; i < 10; i++) {
      const sx = seed(idx, i * 7) * (w - 10) + 5;
      const sy = seed(idx, i * 13) * 5 + 1;
      g.fillStyle(sprCols[i % sprCols.length], 0.8);
      g.fillRect(sx, sy, 3, 1.5);
    }
    // Cherry on top — inside bounds
    if (w > 22) {
      g.fillStyle(0xc02020, 0.85);
      g.fillCircle(w * 0.5, 4, 3.5);
      g.fillStyle(0xffffff, 0.4);
      g.fillCircle(w * 0.5 - 1, 3, 1);
    }
    g.fillStyle(0x000000, 0.08);
    g.fillRect(0, h - 1, w, 1);

  } else if (variant === 1) {
    // Dark chocolate layer — rich brown, smooth ganache
    g.fillStyle(0x4a2010, 1);
    g.fillRect(0, 0, w, h);
    // Ganache top (glossy dark)
    g.fillStyle(0x3a1808, 1);
    g.fillRect(0, 0, w, 7);
    g.fillStyle(0xffffff, 0.15);
    g.fillRect(3, 1, w * 0.4, 2);
    // Chocolate shavings
    g.fillStyle(0x6a3820, 0.6);
    for (let i = 0; i < 6; i++) {
      const cx = seed(idx, i * 5) * (w - 12) + 6;
      const cy = seed(idx, i * 9) * 4 + 2;
      g.fillRect(cx, cy, 4, 1);
    }
    // Rich filling line
    g.fillStyle(0x5a2818, 0.6);
    g.fillRect(2, Math.floor(h * 0.5), w - 4, 3);
    // Bottom edge
    g.fillStyle(0x000000, 0.15);
    g.fillRect(0, h - 1, w, 1);

  } else if (variant === 2) {
    // Vanilla with fruit — cream colored, strawberry slices
    g.fillStyle(0xfff5d8, 1);
    g.fillRect(0, 0, w, h);
    // Cream frosting swirls on top
    g.fillStyle(0xfff8e8, 1);
    g.fillRect(0, 0, w, 7);
    for (let x = 3; x < w - 3; x += 6) {
      g.fillCircle(x, 6, 3);
    }
    // Strawberry slices
    g.fillStyle(0xe03030, 0.7);
    for (let i = 0; i < 3; i++) {
      const fx = seed(idx, i * 7) * (w - 16) + 8;
      g.fillCircle(fx, 3, 3);
      g.fillStyle(0xff6060, 0.4);
      g.fillCircle(fx, 3, 1.5);
      g.fillStyle(0xe03030, 0.7);
    }
    // Sponge texture dots
    g.fillStyle(0xe8dcc0, 0.4);
    for (let i = 0; i < 8; i++) {
      g.fillCircle(seed(idx, i * 5) * (w - 6) + 3, 10 + seed(idx, i * 11) * (h - 14), 1);
    }
    g.fillStyle(0x000000, 0.06);
    g.fillRect(0, h - 1, w, 1);

  } else if (variant === 3) {
    // Red velvet — deep red sponge, cream cheese frosting
    g.fillStyle(0xa02020, 1);
    g.fillRect(0, 0, w, h);
    // Cream cheese frosting (thick white)
    g.fillStyle(0xfff8f0, 1);
    g.fillRect(0, 0, w, 9);
    g.fillStyle(0xffffff, 0.3);
    g.fillRect(2, 1, w * 0.3, 2);
    // Smooth drips
    for (let x = 5; x < w - 5; x += 10) {
      const dh = 3 + seed(idx, x) * 4;
      g.fillStyle(0xfff8f0, 0.9);
      g.fillRect(x - 1, 7, 3, dh);
      g.fillCircle(x + 0.5, 7 + dh, 2);
    }
    // Velvet texture
    g.fillStyle(0x801818, 0.3);
    for (let i = 0; i < 10; i++) {
      g.fillCircle(seed(idx, i * 5) * (w - 6) + 3, 12 + seed(idx, i * 11) * (h - 16), 1.2);
    }
    g.fillStyle(0x000000, 0.1);
    g.fillRect(0, h - 1, w, 1);

  } else if (variant === 4) {
    // Matcha — green tea layer
    g.fillStyle(0x708838, 1);
    g.fillRect(0, 0, w, h);
    // White chocolate drizzle
    g.fillStyle(0xfff8e0, 0.8);
    g.fillRect(0, 0, w, 6);
    // Zigzag drizzle pattern
    for (let x = 3; x < w - 3; x += 5) {
      g.fillStyle(0xfff8e0, 0.7);
      g.fillRect(x, 5, 2, 3 + seed(idx, x) * 4);
    }
    // Powder dusting
    g.fillStyle(0x90a848, 0.4);
    for (let i = 0; i < 15; i++) {
      g.fillRect(seed(idx, i * 3) * w, seed(idx, i * 7) * 5 + 1, 2, 1);
    }
    g.fillStyle(0x000000, 0.08);
    g.fillRect(0, h - 1, w, 1);

  } else if (variant === 5) {
    // Caramel layer — golden with caramel sauce
    g.fillStyle(0xd4a040, 1);
    g.fillRect(0, 0, w, h);
    // Caramel sauce on top
    g.fillStyle(0x905010, 0.8);
    g.fillRect(0, 0, w, 7);
    g.fillStyle(0xffffff, 0.2);
    g.fillRect(3, 1, w * 0.3, 2);
    // Thick caramel drips
    for (let x = 2; x < w - 2; x += 6) {
      const dh = 5 + seed(idx, x) * 8;
      g.fillStyle(0x905010, 0.7);
      g.fillRect(x - 1, 5, 3, dh);
      g.fillCircle(x + 0.5, 5 + dh, 2);
    }
    // Nuts on top
    g.fillStyle(0x8b6030, 0.7);
    for (let i = 0; i < 4; i++) {
      const nx = seed(idx, i * 7) * (w - 12) + 6;
      g.fillCircle(nx, 3, 2);
    }
    g.fillStyle(0x000000, 0.08);
    g.fillRect(0, h - 1, w, 1);

  } else if (variant === 6) {
    // Blueberry layer — lavender with berry pieces
    g.fillStyle(0xc8b8e8, 1);
    g.fillRect(0, 0, w, h);
    // Whipped cream top
    g.fillStyle(0xfff8ff, 1);
    g.fillRect(0, 0, w, 6);
    for (let x = 2; x < w - 2; x += 5) {
      g.fillCircle(x, 5, 2.5);
    }
    // Blueberries
    g.fillStyle(0x4030a0, 0.8);
    for (let i = 0; i < 5; i++) {
      const bx = seed(idx, i * 7) * (w - 10) + 5;
      const by = seed(idx, i * 11) * 4 + 1;
      g.fillCircle(bx, by, 2.5);
      g.fillStyle(0xffffff, 0.3);
      g.fillCircle(bx - 0.5, by - 0.5, 0.8);
      g.fillStyle(0x4030a0, 0.8);
    }
    // Filling stripe
    g.fillStyle(0x5040b0, 0.3);
    g.fillRect(2, Math.floor(h * 0.55), w - 4, 3);
    g.fillStyle(0x000000, 0.06);
    g.fillRect(0, h - 1, w, 1);

  } else {
    // Confetti funfetti layer — white with colorful dots
    g.fillStyle(0xfff0e8, 1);
    g.fillRect(0, 0, w, h);
    // Buttercream top
    g.fillStyle(0xfff8f0, 1);
    g.fillRect(0, 0, w, 7);
    // Confetti dots throughout cake
    const confCols = [0xff4466, 0x44aaff, 0xffcc00, 0x44dd44, 0xff66cc, 0xff8833];
    for (let i = 0; i < 16; i++) {
      g.fillStyle(confCols[i % confCols.length], 0.7);
      const cx = seed(idx, i * 5) * (w - 6) + 3;
      const cy = seed(idx, i * 9) * (h - 4) + 2;
      g.fillCircle(cx, cy, 1.3);
    }
    // Swirl piping on top
    g.fillStyle(0xffb8c8, 0.7);
    for (let x = 6; x < w - 6; x += 8) {
      g.fillCircle(x, 3, 2.5);
    }
    g.fillStyle(0x000000, 0.06);
    g.fillRect(0, h - 1, w, 1);
  }
}

// ══════════════════════════════════════════════════════════════
// DJ — each variant is different equipment
// ══════════════════════════════════════════════════════════════

function drawDJ(g: Phaser.GameObjects.Graphics, w: number, h: number, idx: number) {
  const variant = idx % 8;

  if (variant === 0) {
    // Woofer speaker — large cone with ring
    g.fillStyle(0x1a1a1a, 1);
    g.fillRect(0, 0, w, h);
    // Recessed panel
    g.fillStyle(0x0a0a0a, 0.8);
    g.fillRect(2, 2, w - 4, h - 4);
    // Grille lines
    g.fillStyle(0x303030, 0.5);
    for (let y = 3; y < h - 3; y += 2) g.fillRect(3, y, w - 6, 1);
    // Big woofer cone
    const cx = w * 0.45, cy = h / 2, r = Math.min(h * 0.42, 13);
    g.fillStyle(0x0a0a0a, 1);
    g.fillCircle(cx, cy, r);
    g.lineStyle(1.5, 0x444444, 0.8);
    g.strokeCircle(cx, cy, r);
    g.lineStyle(1, 0x333333, 0.6);
    g.strokeCircle(cx, cy, r * 0.7);
    g.fillStyle(0x00ff88, 0.5);
    g.fillCircle(cx, cy, r * 0.25);
    // Chrome trim
    g.fillStyle(0x888888, 0.6);
    g.fillRect(0, 0, w, 1);
    g.fillRect(0, h - 1, w, 1);

  } else if (variant === 1) {
    // Tweeter speaker — small central cone
    g.fillStyle(0x202020, 1);
    g.fillRect(0, 0, w, h);
    g.fillStyle(0x101010, 0.9);
    g.fillRect(2, 2, w - 4, h - 4);
    // Fine grille
    g.fillStyle(0x383838, 0.4);
    for (let y = 3; y < h - 3; y += 2) g.fillRect(3, y, w - 6, 1);
    // Central tweeter
    const cx = w * 0.5, cy = h / 2;
    g.fillStyle(0xc0c0c0, 0.6);
    g.fillCircle(cx, cy, 6);
    g.fillStyle(0xff00ff, 0.7);
    g.fillCircle(cx, cy, 3);
    g.fillStyle(0xffffff, 0.4);
    g.fillCircle(cx - 1, cy - 1, 1);
    // Purple glow
    g.fillStyle(0xff00ff, 0.15);
    g.fillCircle(cx, cy, 10);
    // Chrome trim
    g.fillStyle(0x666666, 0.5);
    g.fillRect(0, 0, w, 1);
    g.fillRect(0, h - 1, w, 1);

  } else if (variant === 2) {
    // Mixing board — sliders and knobs
    g.fillStyle(0x2a2a30, 1);
    g.fillRect(0, 0, w, h);
    // Panel surface
    g.fillStyle(0x353540, 0.8);
    g.fillRect(2, 2, w - 4, h - 4);
    // Fader channels
    const channels = Math.max(3, Math.floor(w / 12));
    for (let ci = 0; ci < channels; ci++) {
      const fx = 4 + ci * ((w - 8) / channels);
      const faderW = Math.max(3, ((w - 8) / channels) - 2);
      // Fader track
      g.fillStyle(0x000000, 0.6);
      g.fillRect(fx + faderW * 0.35, 4, faderW * 0.3, h - 8);
      // Fader knob position
      const knobY = 5 + seed(idx, ci * 7) * (h - 14);
      g.fillStyle(0x00ccff, 0.8);
      g.fillRect(fx + faderW * 0.15, knobY, faderW * 0.7, 4);
      g.fillStyle(0xffffff, 0.4);
      g.fillRect(fx + faderW * 0.25, knobY + 1, faderW * 0.5, 1);
      // Channel color dot
      const chColors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44, 0xff44ff, 0x44ffff];
      g.fillStyle(chColors[ci % chColors.length], 0.7);
      g.fillCircle(fx + faderW * 0.5, h - 3, 1.5);
    }

  } else if (variant === 3) {
    // Turntable — vinyl record with tonearm
    g.fillStyle(0x252525, 1);
    g.fillRect(0, 0, w, h);
    // Platter area
    g.fillStyle(0x1a1a1a, 0.9);
    const cx = w * 0.4, cy = h / 2, r = Math.min(h * 0.44, 14);
    g.fillCircle(cx, cy, r);
    // Vinyl grooves
    g.lineStyle(0.5, 0x333333, 0.5);
    for (let ri = 3; ri < r; ri += 2) g.strokeCircle(cx, cy, ri);
    // Label
    g.fillStyle(0xff4444, 0.7);
    g.fillCircle(cx, cy, r * 0.25);
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(cx, cy, 1);
    // Tonearm
    g.fillStyle(0xaaaaaa, 0.8);
    g.fillRect(w - 10, 3, 2, h - 6);
    g.fillRect(w - 14, h * 0.3, 6, 2);
    // Dot at needle
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(w - 14, h * 0.3 + 1, 1);

  } else if (variant === 4) {
    // Amplifier — VU meters and controls
    g.fillStyle(0x1a1a20, 1);
    g.fillRect(0, 0, w, h);
    // Brushed metal panel
    g.fillStyle(0x404048, 0.6);
    g.fillRect(2, 2, w - 4, h - 4);
    g.fillStyle(0xffffff, 0.05);
    for (let y = 3; y < h - 3; y += 1) g.fillRect(3, y, w - 6, 1);
    // VU meter background
    if (w > 25) {
      g.fillStyle(0xfff8e0, 0.7);
      g.fillRect(5, 4, Math.min(w * 0.4, 20), h - 10);
      // Meter needle area
      g.fillStyle(0xff0000, 0.5);
      g.fillRect(5 + Math.min(w * 0.4, 20) * 0.6, 5, Math.min(w * 0.4, 20) * 0.35, h - 12);
      g.fillStyle(0x00aa00, 0.5);
      g.fillRect(6, 5, Math.min(w * 0.4, 20) * 0.55, h - 12);
      // Needle
      g.fillStyle(0x000000, 0.8);
      const needleX = 6 + seed(idx, 1) * Math.min(w * 0.35, 18);
      g.fillRect(needleX, 5, 1, h - 12);
    }
    // Knobs on right
    g.fillStyle(0x222222, 0.9);
    g.fillCircle(w - 10, h * 0.3, 4);
    g.fillCircle(w - 10, h * 0.7, 4);
    g.fillStyle(0xffffff, 0.3);
    g.fillCircle(w - 10, h * 0.3 - 2, 0.8);
    g.fillCircle(w - 10, h * 0.7 - 2, 0.8);
    // Chrome strips
    g.fillStyle(0xaaaaaa, 0.4);
    g.fillRect(0, 0, w, 1);
    g.fillRect(0, h - 1, w, 1);

  } else if (variant === 5) {
    // Headphones — curved band with ear cups
    g.fillStyle(0x252530, 1);
    g.fillRect(0, 0, w, h);
    // Band across top
    g.fillStyle(0x404050, 0.9);
    g.fillRect(4, 2, w - 8, 5);
    g.fillStyle(0xffffff, 0.15);
    g.fillRect(4, 2, w - 8, 2);
    // Left ear cup
    g.fillStyle(0x303038, 0.95);
    g.fillRect(2, 7, 14, h - 10);
    g.fillStyle(0x444450, 0.7);
    g.fillRect(4, 9, 10, h - 14);
    // Cushion
    g.fillStyle(0x505058, 0.6);
    g.fillRect(3, 8, 2, h - 12);
    // Right ear cup
    g.fillStyle(0x303038, 0.95);
    g.fillRect(w - 16, 7, 14, h - 10);
    g.fillStyle(0x444450, 0.7);
    g.fillRect(w - 14, 9, 10, h - 14);
    // Green accent
    g.fillStyle(0x00ff88, 0.6);
    g.fillRect(8, h * 0.5, 4, 2);
    g.fillRect(w - 12, h * 0.5, 4, 2);

  } else if (variant === 6) {
    // Subwoofer — massive bass speaker
    g.fillStyle(0x181818, 1);
    g.fillRect(0, 0, w, h);
    // Port hole
    g.fillStyle(0x080808, 0.9);
    g.fillRect(3, h * 0.6, w * 0.3, h * 0.25);
    // Huge speaker cone
    const cx = w * 0.55, cy = h / 2, r = Math.min(h * 0.46, 15);
    g.fillStyle(0x0a0a0a, 1);
    g.fillCircle(cx, cy, r);
    g.lineStyle(2, 0x333333, 0.7);
    g.strokeCircle(cx, cy, r);
    g.lineStyle(1, 0x2a2a2a, 0.5);
    g.strokeCircle(cx, cy, r * 0.75);
    g.lineStyle(1, 0x222222, 0.4);
    g.strokeCircle(cx, cy, r * 0.5);
    g.fillStyle(0xff4444, 0.6);
    g.fillCircle(cx, cy, r * 0.2);
    // Bass vibration glow
    g.fillStyle(0xff4444, 0.12);
    g.fillCircle(cx, cy, r + 3);
    // Heavy chassis
    g.fillStyle(0x333333, 0.5);
    g.fillRect(0, 0, w, 2);
    g.fillRect(0, h - 2, w, 2);

  } else {
    // LED panel — grid of colored lights
    g.fillStyle(0x0a0a0a, 1);
    g.fillRect(0, 0, w, h);
    // LED matrix
    const ledSize = 3;
    const gap = 1;
    const cols = Math.floor((w - 4) / (ledSize + gap));
    const rows = Math.floor((h - 4) / (ledSize + gap));
    const sx = (w - cols * (ledSize + gap) + gap) / 2;
    const sy = (h - rows * (ledSize + gap) + gap) / 2;
    const ledColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xff8800, 0xff0088];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const lx = sx + c * (ledSize + gap);
        const ly = sy + r * (ledSize + gap);
        const on = seed(idx, r * 17 + c * 7) > 0.3;
        if (on) {
          const color = ledColors[Math.floor(seed(idx, r * 11 + c * 13) * ledColors.length)];
          g.fillStyle(color, 0.2);
          g.fillRect(lx - 1, ly - 1, ledSize + 2, ledSize + 2);
          g.fillStyle(color, 0.8);
          g.fillRect(lx, ly, ledSize, ledSize);
        } else {
          g.fillStyle(0x1a1a1a, 0.5);
          g.fillRect(lx, ly, ledSize, ledSize);
        }
      }
    }
    // Frame
    g.fillStyle(0x333333, 0.6);
    g.fillRect(0, 0, w, 1);
    g.fillRect(0, h - 1, w, 1);
  }
}

// ══════════════════════════════════════════════════════════════
// PIXEL — each variant is a different classic game block
// ══════════════════════════════════════════════════════════════

function drawPixel(g: Phaser.GameObjects.Graphics, w: number, h: number, idx: number) {
  const variant = idx % 8;
  const u = 3; // pixel unit

  if (variant === 0) {
    // Grass block — green top, brown bottom (Minecraft-style)
    g.fillStyle(0x000000, 1);
    g.fillRect(0, 0, w, h);
    // Brown dirt bottom
    g.fillStyle(0x8b5a2b, 1);
    g.fillRect(u, u, w - u * 2, h - u * 2);
    // Dirt texture
    g.fillStyle(0x7a4a20, 0.5);
    for (let x = u * 2; x < w - u * 2; x += u * 2) {
      for (let y = Math.floor(h * 0.4); y < h - u * 2; y += u * 2) {
        if (seed(idx, x * 7 + y) > 0.5) g.fillRect(x, y, u, u);
      }
    }
    // Green grass top
    g.fillStyle(0x4caf30, 1);
    g.fillRect(u, u, w - u * 2, Math.floor(h * 0.35));
    g.fillStyle(0x6acd50, 0.6);
    g.fillRect(u, u, w - u * 2, u);
    // Grass tufts
    g.fillStyle(0x3a9020, 0.7);
    for (let x = u; x < w - u * 2; x += u * 2) {
      if (seed(idx, x) > 0.4) g.fillRect(x, Math.floor(h * 0.35), u, u);
    }

  } else if (variant === 1) {
    // Brick block — red brick pattern
    g.fillStyle(0x000000, 1);
    g.fillRect(0, 0, w, h);
    g.fillStyle(0xb83020, 1);
    g.fillRect(u, u, w - u * 2, h - u * 2);
    // Brick mortar grid
    const brickW = u * 3, brickH = Math.floor((h - u * 2) / 2);
    for (let row = 0; row < 2; row++) {
      const offset = row % 2 === 0 ? 0 : Math.floor(brickW / 2);
      const by = u + row * brickH;
      g.fillStyle(0x888070, 0.7);
      g.fillRect(u, by + brickH - 1, w - u * 2, 1);
      for (let col = 0; col < Math.ceil(w / brickW) + 1; col++) {
        const bx = u + col * brickW + offset;
        g.fillRect(bx, by, 1, brickH);
      }
    }
    // Highlight on bricks
    g.fillStyle(0xd84838, 0.4);
    g.fillRect(u + 1, u + 1, w - u * 2 - 2, u - 1);

  } else if (variant === 2) {
    // Question block — yellow with ? symbol
    g.fillStyle(0x000000, 1);
    g.fillRect(0, 0, w, h);
    g.fillStyle(0xe8a820, 1);
    g.fillRect(u, u, w - u * 2, h - u * 2);
    // Bevel
    g.fillStyle(0xf8c840, 0.7);
    g.fillRect(u, u, w - u * 2, u);
    g.fillRect(u, u, u, h - u * 2);
    g.fillStyle(0x000000, 0.3);
    g.fillRect(u, h - u * 2, w - u * 2, u);
    g.fillRect(w - u * 2, u, u, h - u * 2);
    // Question mark drawn in pixels
    if (w > 20) {
      const cx = Math.floor(w / 2), cy = Math.floor(h / 2);
      g.fillStyle(0x000000, 0.7);
      // Top of ?
      g.fillRect(cx - 3, cy - 8, 6, u);
      g.fillRect(cx + 3, cy - 6, u, u * 2);
      g.fillRect(cx, cy - 2, u * 2, u);
      g.fillRect(cx - 1, cy + 1, u, u);
      // Dot
      g.fillRect(cx - 1, cy + 4, u, u);
    }
    // Sparkle
    g.fillStyle(0xffffff, 0.35);
    g.fillRect(u + 2, u + 2, u, u);

  } else if (variant === 3) {
    // Pipe block — green Mario pipe
    g.fillStyle(0x000000, 1);
    g.fillRect(0, 0, w, h);
    g.fillStyle(0x30a030, 1);
    g.fillRect(u, u, w - u * 2, h - u * 2);
    // Pipe lip (wider at top)
    g.fillStyle(0x38b838, 1);
    g.fillRect(u - 1, u, w - u * 2 + 2, Math.floor(h * 0.3));
    // Pipe body shading
    g.fillStyle(0x48c848, 0.6);
    g.fillRect(u + 2, u, u * 2, h - u * 2);
    g.fillStyle(0x208020, 0.5);
    g.fillRect(w - u * 2 - u * 2, u, u * 2, h - u * 2);
    // Highlight line
    g.fillStyle(0x60e060, 0.5);
    g.fillRect(u + 3, u + 1, u, h - u * 2 - 2);
    // Lip bottom border
    g.fillStyle(0x207020, 0.6);
    g.fillRect(u - 1, u + Math.floor(h * 0.3) - 1, w - u * 2 + 2, 2);

  } else if (variant === 4) {
    // Cloud block — white and light blue
    g.fillStyle(0x6090e0, 1);
    g.fillRect(0, 0, w, h);
    // Cloud puffs
    g.fillStyle(0xffffff, 0.9);
    const cy = h * 0.5;
    for (let x = u + 2; x < w - u - 2; x += u * 2) {
      const puffR = u + seed(idx, x) * u;
      g.fillCircle(x, cy, puffR);
      g.fillCircle(x, cy - u, puffR * 0.7);
    }
    // Cloud highlight
    g.fillStyle(0xffffff, 0.5);
    for (let x = u + 4; x < w - u - 4; x += u * 3) {
      g.fillCircle(x, cy - u + 1, u * 0.6);
    }
    // Eyes if wide enough
    if (w > 30) {
      g.fillStyle(0x000000, 0.6);
      g.fillRect(w * 0.35, cy - 2, 2, 3);
      g.fillRect(w * 0.55, cy - 2, 2, 3);
    }

  } else if (variant === 5) {
    // Coin block — shiny gold
    g.fillStyle(0x000000, 1);
    g.fillRect(0, 0, w, h);
    g.fillStyle(0xd4a020, 1);
    g.fillRect(u, u, w - u * 2, h - u * 2);
    // Gold bevel
    g.fillStyle(0xf0c840, 0.7);
    g.fillRect(u, u, w - u * 2, u);
    g.fillRect(u, u, u, h - u * 2);
    g.fillStyle(0x906010, 0.5);
    g.fillRect(u, h - u * 2, w - u * 2, u);
    g.fillRect(w - u * 2, u, u, h - u * 2);
    // Coin symbol (circle with line)
    if (w > 20) {
      const cx = Math.floor(w / 2), cy = Math.floor(h / 2);
      g.fillStyle(0xffd700, 0.6);
      g.fillCircle(cx, cy, 5);
      g.fillStyle(0xd4a020, 0.8);
      g.fillCircle(cx, cy, 3);
      g.fillStyle(0xffd700, 0.7);
      g.fillRect(cx - 1, cy - 4, 2, 8);
    }
    // Sparkle dots
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(u + 3, u + 3, 1);
    g.fillCircle(w - u - 4, u + 3, 1);

  } else if (variant === 6) {
    // Stone block — gray cobblestone
    g.fillStyle(0x000000, 1);
    g.fillRect(0, 0, w, h);
    g.fillStyle(0x707070, 1);
    g.fillRect(u, u, w - u * 2, h - u * 2);
    // Stone cracks/texture
    g.fillStyle(0x585858, 0.5);
    for (let x = u; x < w - u; x += u * 2) {
      for (let y = u; y < h - u; y += u * 2) {
        if (seed(idx, x * 11 + y * 3) > 0.5) g.fillRect(x, y, u, u);
      }
    }
    // Crack lines
    g.fillStyle(0x484848, 0.6);
    g.fillRect(w * 0.3, u + 2, 1, h * 0.4);
    g.fillRect(w * 0.3, u + 2 + h * 0.4, w * 0.2, 1);
    g.fillRect(w * 0.6, h * 0.5, 1, h * 0.3);
    // Bevel
    g.fillStyle(0x888888, 0.4);
    g.fillRect(u, u, w - u * 2, u);
    g.fillStyle(0x505050, 0.3);
    g.fillRect(u, h - u * 2, w - u * 2, u);

  } else {
    // Lava block — orange with animated glow
    g.fillStyle(0x000000, 1);
    g.fillRect(0, 0, w, h);
    g.fillStyle(0xd04010, 1);
    g.fillRect(u, u, w - u * 2, h - u * 2);
    // Lava bright spots
    g.fillStyle(0xff6020, 0.7);
    for (let x = u; x < w - u; x += u * 2) {
      for (let y = u; y < h - u; y += u * 2) {
        if (seed(idx, x * 5 + y * 11) > 0.4) g.fillRect(x, y, u, u);
      }
    }
    // Hot bright core
    g.fillStyle(0xffaa30, 0.5);
    g.fillRect(u * 2, u * 2, w - u * 4, h - u * 4);
    g.fillStyle(0xffcc60, 0.3);
    g.fillRect(u * 3, u * 3, w - u * 6, h - u * 6);
    // Dark surface crust
    g.fillStyle(0x801000, 0.4);
    for (let x = u + 1; x < w - u - 1; x += u * 3) {
      g.fillRect(x, u + 1, u * 2, u);
    }
    // Glow on edges
    g.fillStyle(0xff8030, 0.3);
    g.fillRect(0, 0, w, u);
    g.fillRect(0, h - u, w, u);
  }

  // CRT scanlines (subtle, on all pixel blocks)
  g.fillStyle(0x000000, 0.04);
  for (let y = 0; y < h; y += 2) g.fillRect(0, y, w, 1);
}

// ══════════════════════════════════════════════════════════════
// AQUARIUM — each layer is a different ocean depth/scene
// ══════════════════════════════════════════════════════════════

function drawAquarium(g: Phaser.GameObjects.Graphics, w: number, h: number, idx: number) {
  const variant = idx % 8;

  if (variant === 0) {
    // Surface — light water with ripples and sun
    g.fillStyle(0x40a0e0, 0.9);
    g.fillRect(0, 0, w, h);
    // Light rays from top
    g.fillStyle(0xffffff, 0.15);
    for (let i = 0; i < 4; i++) {
      const rx = seed(idx, i * 7) * w;
      const rw = 4 + seed(idx, i * 11) * 5;
      g.beginPath();
      g.moveTo(rx, 0); g.lineTo(rx + rw * 2, h);
      g.lineTo(rx + rw * 2 + rw, h); g.lineTo(rx + rw, 0);
      g.closePath(); g.fillPath();
    }
    // Ripple lines at top
    g.fillStyle(0xffffff, 0.3);
    for (let rx = 0; rx < w; rx += 6) {
      g.fillRect(rx, 0, 4, 2);
      g.fillRect(rx + 3, 2, 3, 1);
    }
    // Sparkle on water
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(w * 0.3, 2, 1.5);
    g.fillCircle(w * 0.7, 1, 1);
    // Glass frame
    g.lineStyle(1, 0xc0c8d0, 0.2);
    g.strokeRect(0, 0, w, h);

  } else if (variant === 1) {
    // Shallow reef — coral and small fish
    g.fillStyle(0x2080c0, 0.9);
    g.fillRect(0, 0, w, h);
    // Coral at bottom
    g.fillStyle(0xff5050, 0.7);
    for (let x = 3; x < w - 3; x += 8) {
      const ch = 5 + seed(idx, x) * 8;
      g.fillRect(x, h - ch, 3, ch);
      g.fillCircle(x + 1, h - ch, 2.5);
    }
    // Orange coral
    g.fillStyle(0xff8830, 0.6);
    for (let x = 7; x < w - 5; x += 12) {
      g.fillRect(x, h - 6, 2, 6);
      g.fillCircle(x + 1, h - 7, 2);
    }
    // Small fish
    if (w > 25) {
      g.fillStyle(0xffd700, 0.8);
      const fx = 8 + seed(idx, 1) * (w - 20);
      const fy = 6 + seed(idx, 2) * (h - 18);
      g.fillCircle(fx, fy, 3);
      g.fillTriangle(fx - 4, fy, fx - 7, fy - 3, fx - 7, fy + 3);
      g.fillStyle(0x000000, 0.7);
      g.fillCircle(fx + 2, fy - 1, 0.8);
    }
    // Bubbles
    g.fillStyle(0xffffff, 0.25);
    g.fillCircle(w * 0.4, h * 0.3, 1.5);
    g.fillCircle(w * 0.6, h * 0.5, 1);

  } else if (variant === 2) {
    // Mid-depth — jellyfish layer
    g.fillStyle(0x1868a8, 0.9);
    g.fillRect(0, 0, w, h);
    // Darker water
    g.fillStyle(0x000000, 0.1);
    g.fillRect(0, h * 0.6, w, h * 0.4);
    // Jellyfish
    if (w > 20) {
      const jx = w * 0.4 + seed(idx, 1) * w * 0.2;
      const jy = h * 0.25;
      // Bell (dome)
      g.fillStyle(0xff88cc, 0.6);
      g.fillCircle(jx, jy, 6);
      g.fillCircle(jx - 3, jy + 2, 4);
      g.fillCircle(jx + 3, jy + 2, 4);
      // Tentacles
      g.fillStyle(0xff88cc, 0.4);
      g.fillRect(jx - 4, jy + 4, 1, h - jy - 6);
      g.fillRect(jx - 1, jy + 5, 1, h - jy - 8);
      g.fillRect(jx + 2, jy + 4, 1, h - jy - 7);
      g.fillRect(jx + 5, jy + 5, 1, h - jy - 9);
      // Glow
      g.fillStyle(0xff88cc, 0.15);
      g.fillCircle(jx, jy, 10);
    }
    // Particles
    g.fillStyle(0xffffff, 0.15);
    for (let i = 0; i < 4; i++) {
      g.fillCircle(seed(idx, i * 7) * (w - 6) + 3, seed(idx, i * 11) * h, 0.8);
    }

  } else if (variant === 3) {
    // Deep ocean — dark, bioluminescent
    g.fillStyle(0x0a1830, 1);
    g.fillRect(0, 0, w, h);
    // Bioluminescent particles
    const bioColors = [0x00ffaa, 0x00aaff, 0xaa00ff, 0x00ffff];
    for (let i = 0; i < 8; i++) {
      const bx = seed(idx, i * 5) * (w - 4) + 2;
      const by = seed(idx, i * 9) * (h - 4) + 2;
      const color = bioColors[i % bioColors.length];
      g.fillStyle(color, 0.15);
      g.fillCircle(bx, by, 4);
      g.fillStyle(color, 0.6);
      g.fillCircle(bx, by, 1.2);
    }
    // Anglerfish lure
    if (w > 30) {
      const ax = w * 0.6, ay = h * 0.4;
      g.fillStyle(0x00ffaa, 0.3);
      g.fillCircle(ax, ay, 5);
      g.fillStyle(0x00ffaa, 0.8);
      g.fillCircle(ax, ay, 2);
      // Stalk
      g.fillStyle(0x304050, 0.5);
      g.fillRect(ax, ay + 2, 1, 6);
    }
    // Subtle depth gradient
    g.fillStyle(0x000000, 0.15);
    g.fillRect(0, h * 0.7, w, h * 0.3);

  } else if (variant === 4) {
    // Sandy bottom — sand with shells and starfish
    g.fillStyle(0x2878a0, 0.7);
    g.fillRect(0, 0, w, h * 0.3);
    g.fillStyle(0xd4b870, 1);
    g.fillRect(0, Math.floor(h * 0.3), w, h - Math.floor(h * 0.3));
    // Sand texture
    g.fillStyle(0xc0a058, 0.4);
    for (let i = 0; i < 20; i++) {
      g.fillRect(seed(idx, i * 3) * w, Math.floor(h * 0.3) + seed(idx, i * 7) * (h * 0.7), 2, 1);
    }
    // Shell
    g.fillStyle(0xfff0d0, 0.8);
    g.fillCircle(w * 0.3, h * 0.65, 3);
    g.fillStyle(0xe8d0a0, 0.6);
    g.fillCircle(w * 0.3, h * 0.65, 1.5);
    // Starfish
    if (w > 25) {
      const sx = w * 0.7, sy = h * 0.7;
      g.fillStyle(0xff6644, 0.7);
      g.fillCircle(sx, sy, 2);
      g.fillRect(sx - 1, sy - 5, 2, 4);
      g.fillRect(sx - 1, sy + 1, 2, 4);
      g.fillRect(sx - 5, sy - 1, 4, 2);
      g.fillRect(sx + 1, sy - 1, 4, 2);
      g.fillRect(sx + 2, sy + 2, 3, 2);
    }
    // Bubbles rising from sand
    g.fillStyle(0xffffff, 0.2);
    g.fillCircle(w * 0.5, h * 0.15, 1.5);
    g.fillCircle(w * 0.55, h * 0.08, 1);

  } else if (variant === 5) {
    // Kelp forest — green with tall kelp strands
    g.fillStyle(0x186840, 0.85);
    g.fillRect(0, 0, w, h);
    // Kelp strands
    g.fillStyle(0x20803a, 0.8);
    for (let kx = 3; kx < w - 3; kx += 7) {
      g.fillRect(kx, 0, 2, h);
      // Kelp leaves
      const leafSide = seed(idx, kx) > 0.5 ? 1 : -1;
      g.fillStyle(0x30a050, 0.7);
      for (let ly = 4; ly < h - 4; ly += 8) {
        g.fillRect(kx + leafSide * 2, ly, 4 * leafSide, 3);
      }
      g.fillStyle(0x20803a, 0.8);
    }
    // Filtered light
    g.fillStyle(0xffffff, 0.08);
    g.fillRect(0, 0, w, 4);
    // Small fish between kelp
    if (w > 25) {
      g.fillStyle(0xff8844, 0.7);
      const fx = w * 0.5, fy = h * 0.4;
      g.fillCircle(fx, fy, 2.5);
      g.fillTriangle(fx - 3, fy, fx - 5, fy - 2, fx - 5, fy + 2);
    }

  } else if (variant === 6) {
    // Cave — dark rocky with stalactites
    g.fillStyle(0x2a2a38, 1);
    g.fillRect(0, 0, w, h);
    // Rocky texture
    g.fillStyle(0x383848, 0.5);
    for (let i = 0; i < 12; i++) {
      g.fillRect(seed(idx, i * 3) * (w - 4) + 2, seed(idx, i * 7) * (h - 4) + 2, 4, 3);
    }
    // Stalactites from top
    g.fillStyle(0x484860, 0.8);
    for (let sx = 4; sx < w - 4; sx += 8) {
      const sLen = 4 + seed(idx, sx) * 10;
      g.beginPath();
      g.moveTo(sx - 3, 0); g.lineTo(sx, sLen); g.lineTo(sx + 3, 0);
      g.closePath(); g.fillPath();
    }
    // Glowing eyes
    if (w > 20) {
      g.fillStyle(0xffff00, 0.7);
      g.fillCircle(w * 0.35, h * 0.6, 1.5);
      g.fillCircle(w * 0.45, h * 0.6, 1.5);
    }
    // Cave moss
    g.fillStyle(0x306030, 0.3);
    g.fillRect(0, h - 3, w, 3);

  } else {
    // Treasure — chest and gold coins on ocean floor
    g.fillStyle(0x1858a0, 0.8);
    g.fillRect(0, 0, w, h * 0.4);
    g.fillStyle(0xc8a860, 1);
    g.fillRect(0, Math.floor(h * 0.4), w, h - Math.floor(h * 0.4));
    // Treasure chest
    if (w > 20) {
      const cx = w * 0.4;
      g.fillStyle(0x6a3a10, 0.9);
      g.fillRect(cx - 6, h * 0.3, 12, 12);
      g.fillStyle(0x8a5020, 0.7);
      g.fillRect(cx - 6, h * 0.3, 12, 4);
      // Gold trim on chest
      g.fillStyle(0xffd700, 0.8);
      g.fillRect(cx - 6, h * 0.3 + 4, 12, 2);
      g.fillRect(cx - 1, h * 0.3, 2, 12);
    }
    // Gold coins scattered
    g.fillStyle(0xffd700, 0.7);
    for (let i = 0; i < 5; i++) {
      g.fillCircle(seed(idx, i * 5) * (w - 8) + 4, Math.floor(h * 0.5) + seed(idx, i * 9) * (h * 0.4), 2);
    }
    // Sparkles
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(w * 0.6, h * 0.45, 1);
    g.fillCircle(w * 0.25, h * 0.6, 0.8);
  }
}

// ══════════════════════════════════════════════════════════════
// SPACE — each variant is a different station module
// ══════════════════════════════════════════════════════════════

function drawSpace(g: Phaser.GameObjects.Graphics, w: number, h: number, idx: number) {
  const variant = idx % 8;

  if (variant === 0) {
    // Command bridge — windows with screens
    g.fillStyle(0x48536a, 1);
    g.fillRect(0, 0, w, h);
    // Large panoramic window
    g.fillStyle(0x0a0a20, 0.9);
    g.fillRect(4, 4, w - 8, h - 10);
    // Stars through window
    g.fillStyle(0xffffff, 0.6);
    for (let i = 0; i < 6; i++) {
      g.fillCircle(6 + seed(idx, i * 5) * (w - 14), 6 + seed(idx, i * 9) * (h - 16), 0.7);
    }
    // Console screens at bottom
    g.fillStyle(0x00ccff, 0.6);
    g.fillRect(6, h - 8, 8, 4);
    g.fillRect(16, h - 8, 8, 4);
    if (w > 35) g.fillRect(26, h - 8, 8, 4);
    // Blinking status lights
    g.fillStyle(0x00ff44, 0.7);
    g.fillCircle(w - 6, 6, 1.5);
    g.fillStyle(0xff4444, 0.7);
    g.fillCircle(w - 6, 11, 1.5);
    // Hull glow
    g.fillStyle(0x00ccff, 0.25);
    g.fillRect(0, 0, w, 2);
    g.fillRect(0, h - 2, w, 2);

  } else if (variant === 1) {
    // Solar panel — blue/black grid pattern
    g.fillStyle(0x2a3a50, 1);
    g.fillRect(0, 0, w, h);
    // Solar cell grid
    const cellW = Math.max(5, Math.floor((w - 4) / Math.max(1, Math.floor(w / 10))));
    const cellH = Math.max(5, Math.floor((h - 4) / 2));
    for (let cx = 2; cx < w - 2; cx += cellW) {
      for (let cy = 2; cy < h - 2; cy += cellH) {
        const cw = Math.min(cellW - 1, w - cx - 3);
        const ch = Math.min(cellH - 1, h - cy - 3);
        g.fillStyle(0x1a2a60, 0.9);
        g.fillRect(cx, cy, cw, ch);
        // Cell reflection
        g.fillStyle(0x4080ff, 0.25);
        g.fillRect(cx, cy, cw, Math.floor(ch * 0.3));
        // Grid lines
        g.fillStyle(0x607090, 0.6);
        g.fillRect(cx + Math.floor(cw / 2), cy, 1, ch);
      }
    }
    // Frame
    g.fillStyle(0x808890, 0.6);
    g.fillRect(0, 0, w, 2);
    g.fillRect(0, h - 2, w, 2);

  } else if (variant === 2) {
    // Habitat module — round windows, lived-in look
    g.fillStyle(0x505868, 1);
    g.fillRect(0, 0, w, h);
    // Interior stripe
    g.fillStyle(0x606878, 0.5);
    g.fillRect(2, Math.floor(h * 0.3), w - 4, Math.floor(h * 0.4));
    // Round portholes
    const portCount = Math.max(1, Math.floor(w / 18));
    const pSpace = w / (portCount + 1);
    for (let i = 0; i < portCount; i++) {
      const px = pSpace * (i + 1);
      g.fillStyle(0x060610, 0.9);
      g.fillCircle(px, h / 2, 5);
      g.lineStyle(1, 0x808890, 0.7);
      g.strokeCircle(px, h / 2, 5);
      // Interior light (warm)
      g.fillStyle(0xffeaa7, 0.35);
      g.fillCircle(px, h / 2, 3);
      // Reflection
      g.fillStyle(0xffffff, 0.25);
      g.fillCircle(px - 1.5, h / 2 - 1.5, 1);
    }
    // Rivets
    g.fillStyle(0xffffff, 0.15);
    for (let rx = 5; rx < w - 4; rx += 10) {
      g.fillCircle(rx, 3, 1);
      g.fillCircle(rx, h - 3, 1);
    }
    // Hull edge glow
    g.fillStyle(0x00ff88, 0.2);
    g.fillRect(0, 0, w, 1);
    g.fillRect(0, h - 1, w, 1);

  } else if (variant === 3) {
    // Engine module — glowing exhaust
    g.fillStyle(0x3a3a45, 1);
    g.fillRect(0, 0, w, h);
    // Engine nozzles at bottom
    const nozzles = Math.max(2, Math.floor(w / 14));
    const nSpace = w / (nozzles + 1);
    for (let ni = 0; ni < nozzles; ni++) {
      const nx = nSpace * (ni + 1);
      // Nozzle bell
      g.fillStyle(0x505060, 0.9);
      g.fillRect(nx - 4, h - 10, 8, 10);
      g.fillStyle(0x404050, 0.7);
      g.fillRect(nx - 3, h - 8, 6, 8);
      // Exhaust glow
      g.fillStyle(0x4488ff, 0.3);
      g.fillRect(nx - 3, h - 3, 6, 5);
      g.fillStyle(0x88bbff, 0.6);
      g.fillRect(nx - 2, h - 2, 4, 4);
      g.fillStyle(0xffffff, 0.4);
      g.fillRect(nx - 1, h - 1, 2, 3);
    }
    // Fuel lines
    g.fillStyle(0x606070, 0.6);
    g.fillRect(3, 3, w - 6, 3);
    g.fillStyle(0xfeca57, 0.4);
    g.fillRect(3, 4, w - 6, 1);
    // Warning stripe
    g.fillStyle(0xffd700, 0.5);
    for (let sx = 0; sx < w; sx += 8) {
      g.fillRect(sx, 0, 4, 2);
    }

  } else if (variant === 4) {
    // Docking bay — large bay doors
    g.fillStyle(0x454555, 1);
    g.fillRect(0, 0, w, h);
    // Bay door (large center opening)
    g.fillStyle(0x0a0a18, 0.9);
    g.fillRect(6, 3, w - 12, h - 6);
    // Door panels
    g.fillStyle(0x505060, 0.7);
    g.fillRect(6, 3, (w - 12) / 2 - 1, h - 6);
    g.fillRect(6 + (w - 12) / 2 + 1, 3, (w - 12) / 2 - 1, h - 6);
    // Gap between doors
    g.fillStyle(0x000000, 0.9);
    g.fillRect(w / 2 - 1, 3, 2, h - 6);
    // Hazard stripe
    g.fillStyle(0xffaa00, 0.6);
    for (let sx = 0; sx < w; sx += 6) {
      g.fillRect(sx, 0, 3, 2);
      g.fillRect(sx + 3, h - 2, 3, 2);
    }
    // Guide lights
    g.fillStyle(0x00ff44, 0.6);
    g.fillCircle(3, h / 2, 1.5);
    g.fillCircle(w - 3, h / 2, 1.5);

  } else if (variant === 5) {
    // Laboratory — instruments and screens
    g.fillStyle(0x404858, 1);
    g.fillRect(0, 0, w, h);
    // Clean white interior
    g.fillStyle(0x607080, 0.4);
    g.fillRect(2, 2, w - 4, h - 4);
    // Lab equipment — screens
    g.fillStyle(0x00cc66, 0.7);
    g.fillRect(5, 5, 10, 8);
    g.fillStyle(0x00aa44, 0.5);
    // Waveform on screen
    for (let sx = 6; sx < 14; sx += 2) {
      const sh = 2 + seed(idx, sx) * 4;
      g.fillRect(sx, 9 - sh / 2, 1, sh);
    }
    // Beakers/tubes
    if (w > 30) {
      g.fillStyle(0x80c0ff, 0.5);
      g.fillRect(w - 14, 6, 4, 10);
      g.fillStyle(0x40ff80, 0.4);
      g.fillRect(w - 14, 10, 4, 6);
      // Flask shape
      g.fillStyle(0xc0c8d0, 0.6);
      g.fillRect(w - 15, 5, 6, 2);
    }
    // Rivets
    g.fillStyle(0xffffff, 0.12);
    for (let rx = 6; rx < w - 4; rx += 10) {
      g.fillCircle(rx, h - 3, 0.8);
    }
    // Status bar
    g.fillStyle(0x00ccff, 0.3);
    g.fillRect(0, 0, w, 1);
    g.fillRect(0, h - 1, w, 1);

  } else if (variant === 6) {
    // Cargo module — crates and containers
    g.fillStyle(0x505050, 1);
    g.fillRect(0, 0, w, h);
    // Cargo containers
    const crateW = Math.max(10, Math.floor(w / 3));
    const colors = [0x3a6030, 0x604830, 0x304060];
    for (let ci = 0; ci < 3; ci++) {
      const cx = 2 + ci * (crateW + 1);
      if (cx + crateW > w - 2) break;
      g.fillStyle(colors[ci % colors.length], 0.9);
      g.fillRect(cx, 3, crateW - 1, h - 6);
      // Crate markings
      g.fillStyle(0xffffff, 0.2);
      g.fillRect(cx + 1, 4, crateW - 3, 2);
      g.fillRect(cx + 1, h - 6, crateW - 3, 2);
      // X marking
      g.fillStyle(0xffffff, 0.15);
      g.beginPath();
      g.moveTo(cx + 2, 6); g.lineTo(cx + crateW - 3, h - 8);
      g.lineTo(cx + crateW - 2, h - 8); g.lineTo(cx + 3, 6);
      g.closePath(); g.fillPath();
    }
    // Metal floor
    g.fillStyle(0x606060, 0.5);
    g.fillRect(0, 0, w, 2);
    g.fillRect(0, h - 2, w, 2);

  } else {
    // Antenna array — dishes and signal patterns
    g.fillStyle(0x3a4050, 1);
    g.fillRect(0, 0, w, h);
    // Antenna mast
    g.fillStyle(0x808890, 0.7);
    g.fillRect(w * 0.5 - 1, 2, 2, h - 4);
    // Dish at top
    g.fillStyle(0xc0c8d0, 0.7);
    g.beginPath();
    g.moveTo(w * 0.3, 4); g.lineTo(w * 0.5, 12); g.lineTo(w * 0.7, 4);
    g.closePath(); g.fillPath();
    // Signal waves
    g.lineStyle(1, 0x00ffaa, 0.4);
    g.strokeCircle(w * 0.5, 4, 6);
    g.lineStyle(1, 0x00ffaa, 0.25);
    g.strokeCircle(w * 0.5, 4, 10);
    g.lineStyle(1, 0x00ffaa, 0.15);
    g.strokeCircle(w * 0.5, 4, 14);
    // Side antennas
    g.fillStyle(0x808890, 0.6);
    g.fillRect(4, h * 0.4, 8, 1);
    g.fillRect(w - 12, h * 0.5, 8, 1);
    g.fillCircle(4, h * 0.4, 1.5);
    g.fillCircle(w - 4, h * 0.5, 1.5);
    // Status LEDs
    g.fillStyle(0x00ff44, 0.6);
    g.fillCircle(w * 0.5, h - 5, 1.5);
    g.fillStyle(0xff4444, 0.5);
    g.fillCircle(w * 0.5 - 5, h - 5, 1);
    // Hull edge
    g.fillStyle(0x00ccff, 0.2);
    g.fillRect(0, 0, w, 1);
    g.fillRect(0, h - 1, w, 1);
  }
}

// ══════════════════════════════════════════════════════════════
// CANDY — each variant is a different candy type
// ══════════════════════════════════════════════════════════════

function drawCandy(g: Phaser.GameObjects.Graphics, w: number, h: number, idx: number) {
  const variant = idx % 8;

  if (variant === 0) {
    // Lollipop — spiral pattern
    g.fillStyle(0xff6fd8, 1);
    g.fillRect(0, 0, w, h);
    // Spiral pattern — vertical stripes, clamped
    g.fillStyle(0xffffff, 0.4);
    for (let sx = 3; sx < w; sx += 6) {
      g.fillRect(sx, 0, 2, h);
    }
    // Stick at bottom
    g.fillStyle(0xffffff, 0.7);
    g.fillRect(w * 0.48, h - 5, 3, 6);
    // Shine
    g.fillStyle(0xffffff, 0.35);
    g.fillCircle(w * 0.3, h * 0.3, 4);
    g.fillStyle(0xffffff, 0.2);
    g.fillCircle(w * 0.35, h * 0.35, 2);

  } else if (variant === 1) {
    // Gummy bear — shaped with translucent look
    g.fillStyle(0xff4444, 0.85);
    g.fillRect(0, 0, w, h);
    // Bear body shape (lighter center)
    g.fillStyle(0xff6666, 0.4);
    g.fillRect(w * 0.15, 4, w * 0.7, h - 8);
    // Head bump
    g.fillStyle(0xff5555, 0.6);
    g.fillCircle(w * 0.5, 4, 5);
    // Ears
    g.fillCircle(w * 0.35, 2, 2.5);
    g.fillCircle(w * 0.65, 2, 2.5);
    // Belly highlight
    g.fillStyle(0xffffff, 0.25);
    g.fillCircle(w * 0.5, h * 0.55, 5);
    // Eyes
    g.fillStyle(0x000000, 0.5);
    g.fillCircle(w * 0.4, 5, 1);
    g.fillCircle(w * 0.6, 5, 1);
    // Sugar coating
    g.fillStyle(0xffffff, 0.1);
    for (let i = 0; i < 10; i++) {
      g.fillRect(seed(idx, i * 3) * w, seed(idx, i * 7) * h, 1, 1);
    }

  } else if (variant === 2) {
    // Jawbreaker — concentric circles
    g.fillStyle(0x4488ff, 1);
    g.fillRect(0, 0, w, h);
    // Concentric color rings
    const cx = w * 0.5, cy = h * 0.5;
    const rMax = Math.min(w, h) * 0.48;
    const ringColors = [0xff4488, 0xffaa00, 0xffffff, 0x44ff88, 0x4488ff];
    for (let ri = 0; ri < ringColors.length; ri++) {
      const r = rMax * (1 - ri / ringColors.length);
      g.fillStyle(ringColors[ri], 0.7);
      g.fillCircle(cx, cy, r);
    }
    // Shine
    g.fillStyle(0xffffff, 0.4);
    g.fillCircle(cx - rMax * 0.3, cy - rMax * 0.3, rMax * 0.2);

  } else if (variant === 3) {
    // Candy cane — red and white stripes
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, w, h);
    // Red stripes — vertical, clamped
    g.fillStyle(0xdd2020, 0.85);
    for (let sx = 2; sx < w; sx += 10) {
      g.fillRect(sx, 0, 4, h);
    }
    // Glossy sheen
    g.fillStyle(0xffffff, 0.3);
    g.fillRect(0, 0, w, Math.floor(h * 0.25));
    // Cellophane shine
    g.fillStyle(0xffffff, 0.35);
    g.fillCircle(w * 0.25, h * 0.25, 3);

  } else if (variant === 4) {
    // Wrapped candy — twisted ends
    g.fillStyle(0x48dbfb, 1);
    g.fillRect(6, 0, w - 12, h);
    // Wrapper twists at sides
    g.fillStyle(0x48dbfb, 0.7);
    // Left twist
    g.beginPath();
    g.moveTo(6, 0); g.lineTo(0, h * 0.15); g.lineTo(0, h * 0.85); g.lineTo(6, h);
    g.closePath(); g.fillPath();
    // Right twist
    g.beginPath();
    g.moveTo(w - 6, 0); g.lineTo(w, h * 0.15); g.lineTo(w, h * 0.85); g.lineTo(w - 6, h);
    g.closePath(); g.fillPath();
    // Twist lines
    g.fillStyle(0x2094c8, 0.5);
    g.fillRect(2, h * 0.3, 4, 1);
    g.fillRect(2, h * 0.6, 4, 1);
    g.fillRect(w - 6, h * 0.35, 4, 1);
    g.fillRect(w - 6, h * 0.65, 4, 1);
    // Body stripes
    g.fillStyle(0xffffff, 0.3);
    for (let sx = 8; sx < w - 8; sx += 7) {
      g.fillRect(sx, 0, 3, h);
    }
    // Shine
    g.fillStyle(0xffffff, 0.25);
    g.fillRect(8, 2, w * 0.3, 3);

  } else if (variant === 5) {
    // Chocolate bar — brown with grid segments
    g.fillStyle(0x5a2a10, 1);
    g.fillRect(0, 0, w, h);
    // Grid pattern (chocolate segments)
    g.fillStyle(0x4a1a08, 0.5);
    const segW = Math.max(8, Math.floor(w / 4));
    const segH = Math.max(8, Math.floor(h / 2));
    for (let sx = 0; sx < w; sx += segW) {
      g.fillRect(sx, 0, 1, h);
    }
    for (let sy = 0; sy < h; sy += segH) {
      g.fillRect(0, sy, w, 1);
    }
    // Segment highlights
    g.fillStyle(0x7a3a18, 0.4);
    for (let sx = 1; sx < w; sx += segW) {
      for (let sy = 1; sy < h; sy += segH) {
        g.fillRect(sx, sy, Math.min(segW - 2, w - sx - 1), 2);
      }
    }
    // Glossy top
    g.fillStyle(0xffffff, 0.12);
    g.fillRect(0, 0, w, Math.floor(h * 0.3));
    // Wrapper edge peek
    g.fillStyle(0xd4a845, 0.5);
    g.fillRect(0, h - 2, w, 2);

  } else if (variant === 6) {
    // Cotton candy — fluffy pastel
    g.fillStyle(0xff9ff3, 0.8);
    g.fillRect(0, 0, w, h);
    // Fluffy cloud shapes
    g.fillStyle(0xffb8f8, 0.5);
    for (let i = 0; i < 8; i++) {
      const bx = seed(idx, i * 5) * w;
      const by = seed(idx, i * 9) * h;
      g.fillCircle(bx, by, 5 + seed(idx, i * 3) * 4);
    }
    // Lighter puffs
    g.fillStyle(0xffd8ff, 0.4);
    for (let i = 0; i < 6; i++) {
      g.fillCircle(seed(idx, i * 7) * w, seed(idx, i * 11) * h, 3 + seed(idx, i * 2) * 3);
    }
    // Stick
    g.fillStyle(0xffffff, 0.6);
    g.fillRect(w * 0.48, h - 4, 2, 5);
    // Sugar sparkles
    g.fillStyle(0xffffff, 0.5);
    for (let i = 0; i < 5; i++) {
      g.fillCircle(seed(idx, i * 13) * (w - 6) + 3, seed(idx, i * 17) * (h - 4) + 2, 0.7);
    }

  } else {
    // Rock candy — crystal formations
    g.fillStyle(0xa29bfe, 1);
    g.fillRect(0, 0, w, h);
    // Crystal formations
    g.fillStyle(0xc8c0ff, 0.6);
    for (let i = 0; i < 5; i++) {
      const cx = seed(idx, i * 5) * (w - 10) + 5;
      const cy = seed(idx, i * 9) * (h - 8) + 4;
      // Crystal shape (elongated diamond)
      g.beginPath();
      g.moveTo(cx, cy - 5); g.lineTo(cx + 3, cy); g.lineTo(cx, cy + 5); g.lineTo(cx - 3, cy);
      g.closePath(); g.fillPath();
    }
    // Facet highlights
    g.fillStyle(0xffffff, 0.4);
    for (let i = 0; i < 5; i++) {
      const cx = seed(idx, i * 5) * (w - 10) + 5;
      const cy = seed(idx, i * 9) * (h - 8) + 4;
      g.fillCircle(cx - 1, cy - 2, 1);
    }
    // Sugar base
    g.fillStyle(0xffffff, 0.2);
    g.fillRect(0, h - 3, w, 3);
    // Stick
    g.fillStyle(0xd0c8b0, 0.6);
    g.fillRect(w * 0.47, h - 4, 3, 5);
  }
}

// ══════════════════════════════════════════════════════════════
// BAMBOO — each variant has different nature elements
// ══════════════════════════════════════════════════════════════

function drawBamboo(g: Phaser.GameObjects.Graphics, w: number, h: number, idx: number) {
  const variant = idx % 8;

  // Common bamboo stalk base
  const stalkColor = [0x6ab04c, 0x7bc950, 0x58a040, 0x6ab04c, 0x5a9838, 0x7bc950, 0x6ab04c, 0x58a040][variant];
  const nodeColor = [0x4a8030, 0x5aa035, 0x3d7a2a, 0x4a8030, 0x3a7025, 0x5aa035, 0x4a8030, 0x3d7a2a][variant];

  // Stalk body
  g.fillStyle(stalkColor, 1);
  g.fillRect(0, 0, w, h);

  // Center lighter strip (cylinder illusion)
  g.fillStyle(0xffffff, 0.1);
  g.fillRect(w * 0.3, 4, w * 0.4, h - 8);

  // Fiber lines
  g.fillStyle(0x000000, 0.06);
  for (let lx = 3; lx < w - 3; lx += 4) g.fillRect(lx, 4, 1, h - 8);

  // Left highlight
  g.fillStyle(0xffffff, 0.15);
  g.fillRect(3, 4, 2, h - 8);

  // Right shadow
  g.fillStyle(0x000000, 0.1);
  g.fillRect(w - 4, 4, 2, h - 8);

  // Node rings
  g.fillStyle(nodeColor, 1);
  g.fillRect(0, 0, w, 4);
  g.fillStyle(0xffffff, 0.15);
  g.fillRect(0, 0, w, 2);
  g.fillStyle(0x000000, 0.1);
  g.fillRect(0, 4, w, 1);
  g.fillStyle(nodeColor, 0.8);
  g.fillRect(0, h - 3, w, 3);

  // Variant-specific decoration
  if (variant === 0) {
    // Cherry blossom flowers
    g.fillStyle(0xff88aa, 0.7);
    g.fillCircle(w * 0.7, h * 0.35, 4);
    g.fillCircle(w * 0.75, h * 0.3, 3);
    g.fillCircle(w * 0.65, h * 0.3, 3);
    g.fillCircle(w * 0.68, h * 0.4, 3);
    // Center
    g.fillStyle(0xffcc00, 0.6);
    g.fillCircle(w * 0.7, h * 0.35, 1.5);
    // Petals falling
    g.fillStyle(0xff88aa, 0.4);
    g.fillCircle(w * 0.4, h * 0.7, 1.5);

  } else if (variant === 1) {
    // Butterfly
    if (w > 22) {
      const bx = w * 0.65, by = h * 0.4;
      // Wings
      g.fillStyle(0xff8800, 0.7);
      g.fillTriangle(bx - 5, by - 4, bx, by, bx - 5, by + 4);
      g.fillTriangle(bx + 5, by - 4, bx, by, bx + 5, by + 4);
      // Wing dots
      g.fillStyle(0x000000, 0.5);
      g.fillCircle(bx - 3, by, 1);
      g.fillCircle(bx + 3, by, 1);
      // Body
      g.fillStyle(0x333333, 0.7);
      g.fillRect(bx - 0.5, by - 3, 1, 6);
    }

  } else if (variant === 2) {
    // Moss patches
    g.fillStyle(0x2a6a20, 0.5);
    for (let i = 0; i < 6; i++) {
      const mx = seed(idx, i * 5) * w;
      const my = 6 + seed(idx, i * 9) * (h - 12);
      g.fillCircle(mx, my, 3 + seed(idx, i * 3) * 3);
    }
    g.fillStyle(0x3a8a30, 0.3);
    for (let i = 0; i < 4; i++) {
      g.fillCircle(seed(idx, i * 7) * w, 6 + seed(idx, i * 11) * (h - 12), 2);
    }

  } else if (variant === 3) {
    // Fireflies
    for (let i = 0; i < 4; i++) {
      const fx = seed(idx, i * 5) * (w - 8) + 4;
      const fy = 6 + seed(idx, i * 9) * (h - 12);
      // Glow
      g.fillStyle(0xffff00, 0.2);
      g.fillCircle(fx, fy, 4);
      // Core
      g.fillStyle(0xffff44, 0.7);
      g.fillCircle(fx, fy, 1.5);
    }

  } else if (variant === 4) {
    // Small bird perched
    if (w > 22) {
      const bx = w * 0.65, by = h * 0.4;
      // Body
      g.fillStyle(0xcc4444, 0.8);
      g.fillCircle(bx, by, 4);
      // Head
      g.fillCircle(bx + 3, by - 3, 2.5);
      // Beak
      g.fillStyle(0xffaa00, 0.8);
      g.fillTriangle(bx + 5, by - 3, bx + 8, by - 2.5, bx + 5, by - 2);
      // Eye
      g.fillStyle(0x000000, 0.7);
      g.fillCircle(bx + 4, by - 3.5, 0.7);
      // Tail
      g.fillStyle(0xaa3333, 0.7);
      g.fillTriangle(bx - 4, by, bx - 7, by - 2, bx - 7, by + 2);
    }

  } else if (variant === 5) {
    // Paper lantern hanging
    if (w > 18) {
      const lx = w * 0.65, ly = h * 0.25;
      // String
      g.fillStyle(0x333333, 0.5);
      g.fillRect(lx, 0, 1, ly - 3);
      // Lantern body
      g.fillStyle(0xff3030, 0.7);
      g.fillCircle(lx, ly + 3, 5);
      g.fillRect(lx - 5, ly, 10, 8);
      // Ribs
      g.fillStyle(0xcc2020, 0.4);
      g.fillRect(lx - 4, ly + 1, 1, 6);
      g.fillRect(lx + 3, ly + 1, 1, 6);
      // Glow
      g.fillStyle(0xffaa00, 0.3);
      g.fillCircle(lx, ly + 3, 3);
      // Tassel
      g.fillStyle(0xff3030, 0.5);
      g.fillRect(lx - 0.5, ly + 8, 1, 4);
    }

  } else if (variant === 6) {
    // Clean bamboo with prominent leaf
    const lx = w * 0.6;
    const ly = h * 0.3;
    g.fillStyle(0x2ecc71, 0.6);
    g.fillTriangle(lx, ly, lx + 12, ly - 5, lx + 14, ly);
    g.fillStyle(0x2ecc71, 0.4);
    g.fillTriangle(lx, ly, lx + 12, ly + 4, lx + 14, ly);
    // Second leaf
    g.fillStyle(0x2ecc71, 0.5);
    g.fillTriangle(lx, ly + 8, lx + 10, ly + 4, lx + 11, ly + 8);

  } else {
    // Rain drops
    g.fillStyle(0x80c0ff, 0.4);
    for (let i = 0; i < 7; i++) {
      const rx = seed(idx, i * 5) * (w - 6) + 3;
      const ry = seed(idx, i * 9) * (h - 8) + 4;
      // Raindrop shape (circle + triangle top)
      g.fillCircle(rx, ry + 1, 1.5);
      g.fillTriangle(rx - 1, ry + 1, rx + 1, ry + 1, rx, ry - 2);
    }
    // Splash at bottom
    g.fillStyle(0x80c0ff, 0.3);
    g.fillCircle(w * 0.3, h - 4, 2);
    g.fillCircle(w * 0.7, h - 5, 1.5);
  }
}

// ══════════════════════════════════════════════════════════════
// ICE CREAM — each variant is a different frozen treat
// ══════════════════════════════════════════════════════════════

function drawIceCream(g: Phaser.GameObjects.Graphics, w: number, h: number, idx: number) {
  const variant = idx % 8;

  if (variant === 0) {
    // Strawberry scoop — pink with fruit bits
    g.fillStyle(0xfab1a0, 1);
    g.fillRect(0, 0, w, h);
    // Fruit bits
    g.fillStyle(0xe74c3c, 0.5);
    for (let i = 0; i < 6; i++) {
      const fx = seed(idx, i * 5) * (w - 6) + 3;
      const fy = seed(idx, i * 9) * (h - 6) + 3;
      g.fillRect(fx, fy, 3, 2);
    }
    // Creamy swirls
    g.fillStyle(0xffffff, 0.15);
    for (let i = 0; i < 4; i++) {
      g.fillCircle(seed(idx, i * 7) * (w - 8) + 4, seed(idx, i * 11) * (h - 6) + 3, 4);
    }
    // Drizzle
    g.fillStyle(0xe74c3c, 0.5);
    for (let dx = 3; dx < w - 3; dx += 6) {
      g.fillRect(dx, 1, seed(idx, dx) * 4 + 2, 2);
    }
    // Glossy
    g.fillStyle(0xffffff, 0.2);
    g.fillRect(3, 1, w * 0.25, 3);
    g.fillStyle(0x000000, 0.05);
    g.fillRect(0, h - 1, w, 1);

  } else if (variant === 1) {
    // Waffle cone piece — waffle pattern
    g.fillStyle(0xd4a34a, 1);
    g.fillRect(0, 0, w, h);
    // Cross-hatch waffle pattern — grid, clamped
    g.fillStyle(0xb88830, 0.5);
    for (let gx = 3; gx < w; gx += 6) g.fillRect(gx, 0, 1, h);
    for (let gy = 3; gy < h; gy += 6) g.fillRect(0, gy, w, 1);
    // Golden sheen
    g.fillStyle(0xffffff, 0.15);
    g.fillRect(0, 0, w, Math.floor(h * 0.3));
    // Crispy edges
    g.fillStyle(0xc09030, 0.4);
    g.fillRect(0, 0, w, 2);
    g.fillRect(0, h - 2, w, 2);

  } else if (variant === 2) {
    // Sundae layer — white with chocolate sauce and cherry
    g.fillStyle(0xfff8f0, 1);
    g.fillRect(0, 0, w, h);
    // Chocolate sauce drizzle from top
    g.fillStyle(0x4a2008, 0.7);
    g.fillRect(0, 0, w, 5);
    for (let x = 3; x < w - 3; x += 7) {
      const dh = 3 + seed(idx, x) * 6;
      g.fillRect(x - 1, 3, 3, dh);
      g.fillCircle(x + 0.5, 3 + dh, 2);
    }
    // Whipped cream swirls
    g.fillStyle(0xffffff, 0.5);
    for (let x = 4; x < w - 4; x += 6) {
      g.fillCircle(x, h * 0.5, 3);
    }
    // Cherry
    if (w > 20) {
      g.fillStyle(0xcc2020, 0.85);
      g.fillCircle(w * 0.5, 2, 3.5);
      g.fillStyle(0xffffff, 0.35);
      g.fillCircle(w * 0.5 - 1, 1, 1);
    }
    g.fillStyle(0x000000, 0.05);
    g.fillRect(0, h - 1, w, 1);

  } else if (variant === 3) {
    // Popsicle — solid color with stick showing
    g.fillStyle(0x6c5ce7, 1);
    g.fillRect(0, 0, w, h);
    // Popsicle shape
    g.fillStyle(0x8070f0, 0.4);
    g.fillRect(0, 0, w, Math.floor(h * 0.5));
    // Bite mark
    if (w > 20) {
      g.fillStyle(0x5040c0, 0.6);
      g.fillCircle(w * 0.7, 3, 5);
    }
    // Frost crystals
    g.fillStyle(0xffffff, 0.3);
    for (let i = 0; i < 6; i++) {
      g.fillCircle(seed(idx, i * 5) * (w - 6) + 3, seed(idx, i * 9) * (h - 6) + 3, 1);
    }
    // Stick at bottom
    g.fillStyle(0xd4b87a, 0.8);
    g.fillRect(w * 0.4, h - 6, w * 0.2, 8);
    // Melty drip — inside bounds
    g.fillStyle(0x6c5ce7, 0.6);
    g.fillRect(w * 0.2, h - 5, 3, 4);

  } else if (variant === 4) {
    // Ice cream sandwich — chocolate cookie + vanilla
    g.fillStyle(0x3a1808, 1);
    g.fillRect(0, 0, w, h);
    // Top cookie
    g.fillRect(0, 0, w, Math.floor(h * 0.3));
    // Vanilla ice cream center
    g.fillStyle(0xfff8e0, 1);
    g.fillRect(0, Math.floor(h * 0.3), w, Math.floor(h * 0.4));
    // Ice cream texture
    g.fillStyle(0xffffff, 0.2);
    for (let i = 0; i < 5; i++) {
      g.fillCircle(seed(idx, i * 7) * (w - 4) + 2, Math.floor(h * 0.3) + seed(idx, i * 11) * (h * 0.4), 2);
    }
    // Bottom cookie
    g.fillStyle(0x3a1808, 1);
    g.fillRect(0, Math.floor(h * 0.7), w, h - Math.floor(h * 0.7));
    // Cookie texture
    g.fillStyle(0x4a2818, 0.4);
    for (let i = 0; i < 8; i++) {
      g.fillCircle(seed(idx, i * 3) * w, seed(idx, i * 9) * (h * 0.25) + 2, 1);
      g.fillCircle(seed(idx, i * 5) * w, Math.floor(h * 0.75) + seed(idx, i * 7) * (h * 0.2), 1);
    }
    // Squeeze-out at edges
    g.fillStyle(0xfff8e0, 0.6);
    g.fillRect(-2, Math.floor(h * 0.35), 4, Math.floor(h * 0.3));
    g.fillRect(w - 2, Math.floor(h * 0.35), 4, Math.floor(h * 0.3));

  } else if (variant === 5) {
    // Gelato — rich, dense, smooth
    g.fillStyle(0x70e8b8, 1);
    g.fillRect(0, 0, w, h);
    // Dense creamy texture
    g.fillStyle(0x60d0a0, 0.3);
    g.fillRect(0, Math.floor(h * 0.5), w, Math.floor(h * 0.5));
    // Smooth swirl marks
    g.fillStyle(0x80f0c8, 0.25);
    for (let sx = 2; sx < w - 2; sx += 5) {
      const curveY = h * 0.3 + Math.sin(sx * 0.3) * 4;
      g.fillCircle(sx, curveY, 3);
    }
    // Pistachio bits
    g.fillStyle(0x4a8030, 0.5);
    for (let i = 0; i < 5; i++) {
      g.fillRect(seed(idx, i * 5) * (w - 6) + 3, seed(idx, i * 9) * (h - 6) + 3, 2, 2);
    }
    // Serving mark (flat top where scooped)
    g.fillStyle(0xffffff, 0.15);
    g.fillRect(0, 0, w, 3);

  } else if (variant === 6) {
    // Sorbet with fruit bits — orange with visible fruit
    g.fillStyle(0xf9ca24, 1);
    g.fillRect(0, 0, w, h);
    // Fruit chunks
    g.fillStyle(0xe67e22, 0.6);
    for (let i = 0; i < 7; i++) {
      const fx = seed(idx, i * 5) * (w - 6) + 3;
      const fy = seed(idx, i * 9) * (h - 6) + 3;
      g.fillCircle(fx, fy, 2);
    }
    // Icy crystals
    g.fillStyle(0xffffff, 0.3);
    for (let i = 0; i < 8; i++) {
      g.fillCircle(seed(idx, i * 7) * (w - 4) + 2, seed(idx, i * 11) * (h - 4) + 2, 1);
    }
    // Glossy
    g.fillStyle(0xffffff, 0.2);
    g.fillRect(3, 1, w * 0.3, 2);
    // Citrus zest
    g.fillStyle(0xff8800, 0.4);
    for (let i = 0; i < 4; i++) {
      g.fillRect(seed(idx, i * 13) * (w - 8) + 4, seed(idx, i * 17) * (h - 4) + 2, 3, 1);
    }
    g.fillStyle(0x000000, 0.05);
    g.fillRect(0, h - 1, w, 1);

  } else {
    // Whipped cream — white fluffy mound
    g.fillStyle(0xfff8f0, 1);
    g.fillRect(0, 0, w, h);
    // Fluffy cloud shapes
    g.fillStyle(0xffffff, 0.5);
    for (let x = 2; x < w - 2; x += 5) {
      g.fillCircle(x, h * 0.4, 4);
      g.fillCircle(x + 2, h * 0.3, 3);
    }
    // Swirl peak
    g.fillStyle(0xffffff, 0.4);
    g.fillCircle(w * 0.5, 3, 5);
    g.fillCircle(w * 0.45, 5, 4);
    // Shadow/depth
    g.fillStyle(0xe0d8d0, 0.3);
    g.fillRect(0, Math.floor(h * 0.6), w, Math.floor(h * 0.4));
    // Highlight
    g.fillStyle(0xffffff, 0.3);
    g.fillRect(w * 0.2, 2, w * 0.2, 2);
    g.fillStyle(0x000000, 0.04);
    g.fillRect(0, h - 1, w, 1);
  }
}

// ══════════════════════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════════════════════

export const BLOCK_THEMES: BlockThemeDef[] = [
  { id: 'building', name: 'Skyscraper', price: 0, icon: '🏙️', drawBlock: drawBuilding, drawFragment: drawBuilding },
  { id: 'sushi', name: 'Sushi Tower', price: 200, icon: '🍣', drawBlock: drawSushi, drawFragment: drawSushi },
  { id: 'burger', name: 'Mega Burger', price: 250, icon: '🍔', drawBlock: drawBurger, drawFragment: drawBurger },
  { id: 'cake', name: 'Layer Cake', price: 300, icon: '🎂', drawBlock: drawCake, drawFragment: drawCake },
  { id: 'dj', name: 'DJ Stack', price: 350, icon: '🎵', drawBlock: drawDJ, drawFragment: drawDJ },
  { id: 'pixel', name: 'Pixel Retro', price: 300, icon: '🕹️', drawBlock: drawPixel, drawFragment: drawPixel },
  { id: 'aquarium', name: 'Aquarium', price: 350, icon: '🐠', drawBlock: drawAquarium, drawFragment: drawAquarium },
  { id: 'space', name: 'Space Station', price: 400, icon: '🚀', drawBlock: drawSpace, drawFragment: drawSpace },
  { id: 'candy', name: 'Sweet Candy', price: 250, icon: '🍬', drawBlock: drawCandy, drawFragment: drawCandy },
  { id: 'bamboo', name: 'Zen Bamboo', price: 300, icon: '🎋', drawBlock: drawBamboo, drawFragment: drawBamboo },
  { id: 'icecream', name: 'Ice Cream', price: 350, icon: '🍦', drawBlock: drawIceCream, drawFragment: drawIceCream },
];
