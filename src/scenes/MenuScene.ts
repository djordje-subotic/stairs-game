import Phaser from 'phaser';
import { createStair, DEFAULT_SW, DY } from '../StairGfx';
import { sound } from '../SoundManager';
import { store } from '../Store';
import { F_HEAD, F_BODY, C, drawModernBg, createGlassBtn } from '../Theme';
import { createLogo } from '../Logo';
import { purchases } from '../PurchaseManager';

// Safe top offset for Dynamic Island / notch (~55px on iPhone 14+)
const TOP_SAFE = 60;

export class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }

  create() {
    sound.init();
    const { width: w, height: h } = this.scale;

    drawModernBg(this, w, h);

    // Ambient particles
    for (let i = 0; i < 12; i++) {
      const dot = this.add.circle(
        Phaser.Math.Between(0, w), Phaser.Math.Between(0, h),
        Phaser.Math.FloatBetween(1, 2.5),
        Math.random() > 0.5 ? C.accentHex : C.goldHex,
        Phaser.Math.FloatBetween(0.03, 0.1),
      );
      this.tweens.add({
        targets: dot, y: dot.y - Phaser.Math.Between(30, 80), x: dot.x + Phaser.Math.Between(-15, 15),
        alpha: 0, duration: Phaser.Math.Between(3000, 6000), repeat: -1, yoyo: true, ease: 'Sine.easeInOut',
      });
    }

    // Demo stairs
    const ox = (w - DEFAULT_SW) / 2, oy = h * 0.85;
    let di = 0;
    createStair(this, ox, oy, DEFAULT_SW, 0).setAlpha(0.1);
    this.time.addEvent({
      delay: 350, repeat: 4,
      callback: () => {
        di++;
        const s = createStair(this, ox, oy - di * DY, DEFAULT_SW, di).setAlpha(0);
        this.tweens.add({ targets: s, alpha: 0.1, duration: 200 });
      },
    });

    // ── LOGO (pushed down for Dynamic Island) ──
    createLogo(this, w / 2, TOP_SAFE + h * 0.06, true);

    // Stats
    const best = store.getBest();
    const coins = store.getCoins();
    let ny = TOP_SAFE + h * 0.2;
    if (best > 0) {
      this.add.text(w / 2, ny, `BEST  ${best}`, {
        fontSize: '16px', fontFamily: F_HEAD, fontStyle: '700', color: C.gold,
      }).setOrigin(0.5);
      ny += 24;
    }
    this.add.text(w / 2, ny, `● ${coins}`, {
      fontSize: '13px', fontFamily: F_BODY, fontStyle: '700', color: C.gold,
    }).setOrigin(0.5);

    // TAP TO START
    const tap = this.add.text(w / 2, h * 0.42, 'TAP TO START', {
      fontSize: '17px', fontFamily: F_HEAD, fontStyle: '700', color: '#ffffff', letterSpacing: 4,
    }).setOrigin(0.5);
    this.tweens.add({
      targets: tap, scaleX: { from: 1, to: 1.04 }, scaleY: { from: 1, to: 1.04 },
      alpha: { from: 1, to: 0.4 }, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // SHOP
    const { hit: shopHit } = createGlassBtn(this, w / 2, h * 0.50, 'SHOP', { color: C.gold, fontSize: '13px' });
    shopHit.on('pointerdown', (p: any, lx: number, ly: number, e: Phaser.Types.Input.EventData) => {
      e.stopPropagation(); sound.tick(); this.scene.start('ShopScene');
    });

    // REMOVE ADS (if not already ad-free)
    if (!store.isAdFree()) {
      const removeBtn = this.add.text(w / 2, h * 0.57, 'REMOVE ADS — $0.99', {
        fontSize: '11px', fontFamily: F_BODY, fontStyle: '600', color: C.muted, letterSpacing: 2,
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      let busy = false;
      removeBtn.on('pointerup', async (_p: any, _lx: number, _ly: number, e: Phaser.Types.Input.EventData) => {
        e.stopPropagation();
        if (busy) return;
        busy = true;
        sound.tick();
        removeBtn.setText('PROCESSING…');
        const ok = await purchases.buyRemoveAds();
        busy = false;
        if (ok && store.isAdFree()) {
          (window as any).__hideAds?.();
          this.scene.restart();
        } else {
          removeBtn.setText('REMOVE ADS — $0.99');
        }
      });

      const restoreBtn = this.add.text(w / 2, h * 0.605, 'Restore Purchases', {
        fontSize: '10px', fontFamily: F_BODY, fontStyle: '500', color: C.muted, letterSpacing: 1,
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      restoreBtn.setAlpha(0.7);
      let restoring = false;
      restoreBtn.on('pointerup', async (_p: any, _lx: number, _ly: number, e: Phaser.Types.Input.EventData) => {
        e.stopPropagation();
        if (restoring) return;
        restoring = true;
        sound.tick();
        restoreBtn.setText('Restoring…');
        const ok = await purchases.restore();
        restoring = false;
        if (ok && store.isAdFree()) {
          (window as any).__hideAds?.();
          this.scene.restart();
        } else {
          restoreBtn.setText('Restore Purchases');
        }
      });
    }

    // Current theme/skin
    const themeId = store.getCurrentTheme();
    const skin = store.getCurrentSkin();
    const themeNames: Record<string, string> = {
      building: 'Skyscraper', sushi: 'Sushi Tower', burger: 'Mega Burger', cake: 'Layer Cake',
      dj: 'DJ Stack', pixel: 'Pixel Retro', aquarium: 'Aquarium', space: 'Space Station',
      candy: 'Sweet Candy', bamboo: 'Zen Bamboo', icecream: 'Ice Cream',
    };
    const parts: string[] = [];
    if (themeId !== 'building') parts.push(themeNames[themeId] || themeId);
    if (skin.id !== 'classic') parts.push(skin.name);
    if (parts.length > 0) {
      this.add.text(w / 2, h * 0.63, parts.join('  ·  '), {
        fontSize: '10px', fontFamily: F_BODY, color: C.muted,
      }).setOrigin(0.5);
    }

    // How to play
    this.add.text(w / 2, h * 0.68, 'Tap to stack — overshoot gets chopped!\nStairs come from both sides', {
      fontSize: '10px', fontFamily: F_BODY, color: C.dimWhite, alpha: 0.2, align: 'center', lineSpacing: 4,
    }).setOrigin(0.5);

    // Tiers
    const tiers = [
      { s: '0', l: 'WARM UP', c: C.accent },
      { s: '4', l: 'NICE', c: C.gold },
      { s: '11', l: 'FAST', c: '#fab1a0' },
      { s: '20', l: 'HARD', c: C.red },
      { s: '32', l: 'INSANE', c: '#ff4757' },
    ];
    const ty = h * 0.75;
    tiers.forEach((t, i) => {
      this.add.text(w * 0.28, ty + i * 17, t.s, { fontSize: '10px', fontFamily: F_BODY, color: C.muted }).setOrigin(1, 0.5);
      this.add.text(w * 0.32, ty + i * 17, t.l, { fontSize: '10px', fontFamily: F_HEAD, fontStyle: '700', color: t.c, letterSpacing: 2 }).setOrigin(0, 0.5);
    });

    // TAP TO START — only if not tapping on a button
    this.input.on('pointerdown', (_p: any, gameObjects: any[]) => {
      // If tap hit an interactive object (button), don't start game
      if (gameObjects && gameObjects.length > 0) return;
      sound.snap();
      this.scene.start('GameScene');
    });
    this.input.keyboard?.on('keydown-SPACE', () => { sound.snap(); this.scene.start('GameScene'); });
    this.cameras.main.fadeIn(250, 6, 6, 12);
  }
}
