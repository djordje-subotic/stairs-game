import Phaser from 'phaser';
import { store } from '../Store';
import { BLOCK_THEMES } from '../BlockThemes';
import { sound } from '../SoundManager';
import { F_HEAD, F_BODY, C, drawModernBg, drawGlassCard, createGlassBtn } from '../Theme';

const TOP = 72;
const BOT = 65;
const DEV = false; // flip to true for testing

export class ShopScene extends Phaser.Scene {
  constructor() { super({ key: 'ShopScene' }); }

  create(data?: { from?: string }) {
    sound.init();
    const returnTo = data?.from || 'MenuScene';
    const { width: w, height: h } = this.scale;

    drawModernBg(this, w, h);

    // ── Header bar ──
    const headerBg = this.add.graphics().setDepth(199);
    headerBg.fillStyle(0x06060c, 0.95);
    headerBg.fillRect(0, 0, w, TOP + 48);
    // Gradient fade at bottom of header
    headerBg.fillGradientStyle(0x06060c, 0x06060c, 0x06060c, 0x06060c, 0.95, 0.95, 0, 0);
    headerBg.fillRect(0, TOP + 48, w, 12);

    const backText = this.add.text(16, TOP + 4, '← Back', {
      fontSize: '14px', fontFamily: F_BODY, fontStyle: '600', color: C.accent,
    }).setInteractive({ useHandCursor: true }).setDepth(200);
    backText.on('pointerdown', () => { sound.tick(); this.scene.start(returnTo); });

    this.add.text(w / 2, TOP + 4, 'SHOP', {
      fontSize: '20px', fontFamily: F_HEAD, fontStyle: '700', color: '#ffffff', letterSpacing: 6,
    }).setOrigin(0.5).setDepth(200);

    this.add.text(w / 2, TOP + 28, `● ${store.getCoins()}`, {
      fontSize: '13px', fontFamily: F_BODY, fontStyle: '700', color: C.gold,
    }).setOrigin(0.5).setDepth(200);

    // ── Scrollable content ──
    const contentY = TOP + 58;
    const content = this.add.container(0, 0);
    let y = contentY;

    // Section label
    const thLabel = this.add.text(20, y, 'THEMES', {
      fontSize: '10px', fontFamily: F_BODY, fontStyle: '600', color: C.accent, letterSpacing: 4,
    });
    content.add(thLabel);
    y += 22;

    const ownedThemes = store.getOwnedThemes();
    const currentTheme = store.getCurrentTheme();
    const rowH = 66; // taller cards

    for (const theme of BLOCK_THEMES) {
      const isOwned = DEV || ownedThemes.includes(theme.id);
      const isCurrent = theme.id === currentTheme;

      // Card background
      const card = drawGlassCard(this, 14, y, w - 28, rowH - 6, 10);
      content.add(card);

      // Highlight border for equipped
      if (isCurrent) {
        const hl = this.add.graphics();
        hl.lineStyle(1.5, C.tealHex, 0.3);
        hl.strokeRoundedRect(14, y, w - 28, rowH - 6, 10);
        content.add(hl);
      }

      // Block preview — draw actual theme block with Graphics (no emoji!)
      const previewW = 32, previewH = 20;
      const previewX = 26, previewY = y + (rowH - 6) / 2 - previewH / 2;
      // Mini block preview — stacked blocks
      const p2 = this.add.graphics();
      theme.drawBlock(p2, previewW - 4, previewH - 2, 2);
      p2.setPosition(previewX + 2, previewY - 8);
      p2.setAlpha(0.4);
      content.add(p2);

      const p1 = this.add.graphics();
      theme.drawBlock(p1, previewW, previewH, 0);
      p1.setPosition(previewX, previewY);
      content.add(p1);

      // Theme name
      const name = this.add.text(68, y + 10, theme.name, {
        fontSize: '13px', fontFamily: F_HEAD, fontStyle: '700', color: '#ffffff',
      });
      content.add(name);

      // Status / action
      if (isCurrent) {
        const eq = this.add.text(68, y + 30, 'EQUIPPED', {
          fontSize: '9px', fontFamily: F_BODY, fontStyle: '600', color: C.teal, letterSpacing: 2,
        });
        content.add(eq);
      } else if (isOwned) {
        const sub = this.add.text(68, y + 30, 'OWNED', {
          fontSize: '8px', fontFamily: F_BODY, fontStyle: '600', color: C.muted, letterSpacing: 1,
        });
        content.add(sub);
        const { hit, text, bg } = createGlassBtn(this, w - 55, y + (rowH - 6) / 2, 'EQUIP', {
          w: 68, h: 28, color: C.teal, fontSize: '10px',
        });
        content.add(bg); content.add(text); content.add(hit);
        hit.on('pointerdown', () => { sound.snap(); store.setTheme(theme.id); this.scene.restart(); });
      } else {
        const pr = this.add.text(68, y + 30, `● ${theme.price}`, {
          fontSize: '10px', fontFamily: F_BODY, fontStyle: '700', color: C.gold,
        });
        content.add(pr);
        const canBuy = store.getCoins() >= theme.price;
        const { hit, text, bg } = createGlassBtn(this, w - 55, y + (rowH - 6) / 2, 'BUY', {
          w: 68, h: 28, color: canBuy ? C.gold : C.muted, fontSize: '10px',
          filled: canBuy, fillColor: C.goldHex,
        });
        content.add(bg); content.add(text); content.add(hit);
        if (canBuy) hit.on('pointerdown', () => {
          if (store.buyTheme(theme.id, theme.price)) { sound.perfect(); store.setTheme(theme.id); this.scene.restart(); }
        });
      }
      y += rowH;
    }

    // ── Scroll ──
    const contentH = y - contentY + 20;
    const viewH = h - contentY - BOT;
    const maxScroll = Math.max(0, contentH - viewH);
    let scrollY = 0;

    if (maxScroll > 0) {
      this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        if (!pointer.isDown) return;
        scrollY -= pointer.velocity.y * 0.02;
        scrollY = Phaser.Math.Clamp(scrollY, 0, maxScroll);
        content.y = -scrollY;
      });
    }

    // Mask
    const mask = this.add.graphics();
    mask.fillRect(0, contentY, w, viewH);
    content.setMask(new Phaser.Display.Masks.GeometryMask(this, mask));

    this.cameras.main.fadeIn(150, 6, 6, 12);
  }
}
