import Phaser from 'phaser';
import { store, SKINS } from '../Store';
import { BLOCK_THEMES } from '../BlockThemes';
import { sound } from '../SoundManager';
import { F_HEAD, F_BODY, C, drawModernBg, drawGlassCard, createGlassBtn } from '../Theme';

const TOP = 60;  // Dynamic Island offset
const BOT = 65;  // bottom safe (ad banner + margin)

export class ShopScene extends Phaser.Scene {
  constructor() { super({ key: 'ShopScene' }); }

  create() {
    sound.init();
    const { width: w, height: h } = this.scale;

    drawModernBg(this, w, h);

    // ── BACK button (top-left, always visible) ──
    const backText = this.add.text(16, TOP, '← Back', {
      fontSize: '14px', fontFamily: F_BODY, fontStyle: '600', color: C.accent,
    }).setInteractive({ useHandCursor: true }).setDepth(200);
    backText.on('pointerdown', () => { sound.tick(); this.scene.start('MenuScene'); });

    this.add.text(w / 2, TOP + 2, 'SHOP', {
      fontSize: '20px', fontFamily: F_HEAD, fontStyle: '700', color: '#ffffff', letterSpacing: 6,
    }).setOrigin(0.5).setDepth(200);

    this.add.text(w / 2, TOP + 28, `● ${store.getCoins()}`, {
      fontSize: '13px', fontFamily: F_BODY, fontStyle: '700', color: C.gold,
    }).setOrigin(0.5).setDepth(200);

    // ── Scrollable content in a container ──
    const contentY = TOP + 52;
    const content = this.add.container(0, 0);
    let y = contentY;

    // ──── THEMES ────
    const thLabel = this.add.text(20, y, 'THEMES', {
      fontSize: '10px', fontFamily: F_BODY, fontStyle: '600', color: C.accent, letterSpacing: 4,
    });
    content.add(thLabel);
    y += 20;

    const ownedThemes = store.getOwnedThemes();
    const currentTheme = store.getCurrentTheme();
    const rowH = 56;

    for (const theme of BLOCK_THEMES) {
      const isOwned = ownedThemes.includes(theme.id);
      const isCurrent = theme.id === currentTheme;

      const card = drawGlassCard(this, 14, y, w - 28, rowH - 4, 10);
      content.add(card);

      if (isCurrent) {
        const hl = this.add.graphics();
        hl.lineStyle(1.5, C.tealHex, 0.2);
        hl.strokeRoundedRect(14, y, w - 28, rowH - 4, 10);
        content.add(hl);
      }

      const icon = this.add.text(28, y + 10, theme.icon, { fontSize: '18px' });
      const name = this.add.text(54, y + 9, theme.name, {
        fontSize: '12px', fontFamily: F_HEAD, fontStyle: '700', color: '#ffffff',
      });
      content.add(icon);
      content.add(name);

      if (isCurrent) {
        const eq = this.add.text(54, y + 27, 'EQUIPPED', {
          fontSize: '8px', fontFamily: F_BODY, fontStyle: '600', color: C.teal, letterSpacing: 2,
        });
        content.add(eq);
      } else if (isOwned) {
        const { hit, text, bg } = createGlassBtn(this, w - 55, y + (rowH - 4) / 2, 'EQUIP', { w: 64, h: 26, color: C.teal, fontSize: '9px' });
        content.add(bg); content.add(text); content.add(hit);
        hit.on('pointerdown', () => { sound.snap(); store.setTheme(theme.id); this.scene.restart(); });
      } else {
        const pr = this.add.text(54, y + 27, `● ${theme.price}`, {
          fontSize: '9px', fontFamily: F_BODY, fontStyle: '600', color: C.gold,
        });
        content.add(pr);
        const canBuy = store.getCoins() >= theme.price;
        const { hit, text, bg } = createGlassBtn(this, w - 55, y + (rowH - 4) / 2, 'BUY', {
          w: 64, h: 26, color: canBuy ? C.gold : C.muted, fontSize: '9px',
          filled: canBuy, fillColor: C.goldHex,
        });
        content.add(bg); content.add(text); content.add(hit);
        if (canBuy) hit.on('pointerdown', () => {
          if (store.buyTheme(theme.id, theme.price)) { sound.perfect(); store.setTheme(theme.id); this.scene.restart(); }
        });
      }
      y += rowH;
    }

    // ──── COLORS ────
    y += 8;
    const colLabel = this.add.text(20, y, 'COLORS', {
      fontSize: '10px', fontFamily: F_BODY, fontStyle: '600', color: C.accent, letterSpacing: 4,
    });
    content.add(colLabel);
    y += 20;

    const ownedSkins = store.getOwnedSkins();
    const currentSkin = store.getCurrentSkin().id;
    const skinH = 50;

    for (const skin of SKINS) {
      const isOwned = ownedSkins.includes(skin.id);
      const isCurrent = skin.id === currentSkin;

      const card = drawGlassCard(this, 14, y, w - 28, skinH - 4, 10);
      content.add(card);

      if (isCurrent) {
        const hl = this.add.graphics();
        hl.lineStyle(1.5, C.accentHex, 0.15);
        hl.strokeRoundedRect(14, y, w - 28, skinH - 4, 10);
        content.add(hl);
      }

      skin.palette.slice(0, 5).forEach((p, j) => {
        const dot = this.add.circle(32 + j * 13, y + (skinH - 4) / 2, 4.5, p.fg);
        content.add(dot);
      });

      const name = this.add.text(102, y + 9, skin.name, {
        fontSize: '11px', fontFamily: F_HEAD, fontStyle: '700', color: '#ffffff',
      });
      content.add(name);

      if (isCurrent) {
        const eq = this.add.text(102, y + 25, 'EQUIPPED', {
          fontSize: '8px', fontFamily: F_BODY, fontStyle: '600', color: C.accent, letterSpacing: 2,
        });
        content.add(eq);
      } else if (isOwned) {
        const { hit, text, bg } = createGlassBtn(this, w - 55, y + (skinH - 4) / 2, 'EQUIP', { w: 64, h: 24, color: C.accent, fontSize: '9px' });
        content.add(bg); content.add(text); content.add(hit);
        hit.on('pointerdown', () => { sound.snap(); store.setSkin(skin.id); this.scene.restart(); });
      } else if (skin.price > 0) {
        const pr = this.add.text(102, y + 25, `● ${skin.price}`, {
          fontSize: '9px', fontFamily: F_BODY, fontStyle: '600', color: C.gold,
        });
        content.add(pr);
        const canBuy = store.getCoins() >= skin.price;
        const { hit, text, bg } = createGlassBtn(this, w - 55, y + (skinH - 4) / 2, 'BUY', {
          w: 64, h: 24, color: canBuy ? C.gold : C.muted, fontSize: '9px',
          filled: canBuy, fillColor: C.goldHex,
        });
        content.add(bg); content.add(text); content.add(hit);
        if (canBuy) hit.on('pointerdown', () => {
          if (store.buySkin(skin.id)) { sound.perfect(); store.setSkin(skin.id); this.scene.restart(); }
        });
      }
      y += skinH;
    }

    // ── Drag to scroll ──
    const contentH = y - contentY;
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

    // Mask to clip content to visible area
    const mask = this.add.graphics();
    mask.fillRect(0, contentY, w, viewH);
    content.setMask(new Phaser.Display.Masks.GeometryMask(this, mask));

    this.cameras.main.fadeIn(150, 6, 6, 12);
  }
}
