import Phaser from 'phaser';
import { getNextTier } from '../Difficulty';
import { sound } from '../SoundManager';
import { store } from '../Store';
import { F_HEAD, F_BODY, C, drawModernBg, drawGlassCard, createGlassBtn } from '../Theme';

let sessionAttempts = 0;

export class GameOverScene extends Phaser.Scene {
  constructor() { super({ key: 'GameOverScene' }); }

  create(data: { score: number; bestCombo: number; coins: number }) {
    sound.init();
    sessionAttempts++;
    const { width: w, height: h } = this.scale;
    const score = data.score ?? 0;
    const bestCombo = data.bestCombo ?? 0;
    const coinsEarned = data.coins ?? 0;

    const prevBest = store.getBest();
    const isNew = score > prevBest && score > 0;
    if (isNew) store.setBest(score);
    const best = Math.max(score, prevBest);
    if (bestCombo > store.getBestCombo()) store.setBestCombo(bestCombo);

    drawModernBg(this, w, h);

    // Floating ambient particles
    for (let i = 0; i < 12; i++) {
      const dot = this.add.circle(
        Phaser.Math.Between(0, w), Phaser.Math.Between(0, h),
        Phaser.Math.FloatBetween(1, 2.5), C.accentHex, Phaser.Math.FloatBetween(0.05, 0.15),
      );
      this.tweens.add({
        targets: dot, y: dot.y - Phaser.Math.Between(30, 80), alpha: 0,
        duration: Phaser.Math.Between(3000, 6000), repeat: -1, yoyo: true,
      });
    }

    // Glass card
    const cw = w * 0.84, ch = 190;
    const cx = (w - cw) / 2, cy = Math.max(h * 0.08, 65);
    drawGlassCard(this, cx, cy, cw, ch);

    this.add.text(w / 2, cy + 20, 'SCORE', {
      fontSize: '11px', fontFamily: F_BODY, fontStyle: '600', color: C.accent, letterSpacing: 6,
    }).setOrigin(0.5);

    const num = this.add.text(w / 2, cy + 62, `${score}`, {
      fontSize: '52px', fontFamily: F_HEAD, fontStyle: '700', color: '#ffffff',
    }).setOrigin(0.5).setScale(0.3).setAlpha(0);
    num.setShadow(0, 2, '#000000', 6, true, true);
    this.tweens.add({ targets: num, alpha: 1, scaleX: 1, scaleY: 1, duration: 300, delay: 60, ease: 'Back.easeOut' });

    const badgeY = cy + 108;
    if (isNew) {
      const badge = this.add.text(w / 2, badgeY, '★  NEW BEST  ★', {
        fontSize: '14px', fontFamily: F_HEAD, fontStyle: '700', color: C.gold,
      }).setOrigin(0.5).setAlpha(0).setScale(0.5);
      this.tweens.add({ targets: badge, alpha: 1, scaleX: 1, scaleY: 1, duration: 300, delay: 350, ease: 'Back.easeOut' });
      this.tweens.add({ targets: badge, scaleX: { from: 1, to: 1.03 }, scaleY: { from: 1, to: 1.03 }, duration: 500, yoyo: true, repeat: -1, delay: 700 });
    } else {
      this.add.text(w / 2, badgeY, `BEST  ${best}`, {
        fontSize: '13px', fontFamily: F_BODY, fontStyle: '600', color: C.accent,
      }).setOrigin(0.5);
    }

    const sy = cy + 138;
    if (bestCombo > 1) {
      this.add.text(w * 0.35, sy, `Combo ×${bestCombo}`, {
        fontSize: '11px', fontFamily: F_BODY, color: C.teal,
      }).setOrigin(0.5);
    }
    this.add.text(w * 0.65, sy, `+${coinsEarned} ●`, {
      fontSize: '12px', fontFamily: F_BODY, fontStyle: '700', color: C.gold,
    }).setOrigin(0.5);

    this.add.text(w / 2, sy + 20, `Total: ● ${store.getCoins()}`, {
      fontSize: '10px', fontFamily: F_BODY, color: C.muted,
    }).setOrigin(0.5);

    // Tier + hook
    const infoY = cy + ch + 14;
    let tier = '';
    if (score >= 32) tier = 'INSANE';
    else if (score >= 20) tier = 'HARD';
    else if (score >= 11) tier = 'FAST';
    else if (score >= 4) tier = 'NICE';
    if (tier) {
      this.add.text(w / 2, infoY, tier, {
        fontSize: '11px', fontFamily: F_HEAD, fontStyle: '700', color: C.red, letterSpacing: 4,
      }).setOrigin(0.5);
    }

    const nextTier = getNextTier(score);
    if (nextTier) {
      const hookY = infoY + (tier ? 20 : 0);
      const hook = this.add.text(w / 2, hookY, `${nextTier.remaining} more for ${nextTier.name}`, {
        fontSize: '13px', fontFamily: F_BODY, fontStyle: '600', color: C.gold,
      }).setOrigin(0.5);
      this.tweens.add({ targets: hook, alpha: { from: 1, to: 0.4 }, duration: 600, yoyo: true, repeat: -1 });
    }

    if (!isNew && score > 0 && best - score <= 3 && best - score > 0) {
      this.add.text(w / 2, infoY + 38, `SO CLOSE! ${best - score} away`, {
        fontSize: '12px', fontFamily: F_BODY, fontStyle: '600', color: C.red,
      }).setOrigin(0.5);
    }

    if (sessionAttempts >= 3) {
      this.add.text(w / 2, h * 0.47, `ATTEMPT #${sessionAttempts}`, {
        fontSize: '10px', fontFamily: F_BODY, color: C.muted, letterSpacing: 3,
      }).setOrigin(0.5);
    }

    // TAP TO RETRY
    const retry = this.add.text(w / 2, h * 0.54, 'TAP TO RETRY', {
      fontSize: '18px', fontFamily: F_HEAD, fontStyle: '700', color: '#ffffff', letterSpacing: 4,
    }).setOrigin(0.5).setAlpha(0);

    this.time.delayedCall(350, () => {
      retry.setAlpha(1);
      this.tweens.add({
        targets: retry, scaleX: { from: 1, to: 1.03 }, scaleY: { from: 1, to: 1.03 },
        alpha: { from: 1, to: 0.5 }, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
      this.input.on('pointerdown', () => this.doRetry());
    });
    this.input.keyboard?.on('keydown-SPACE', () => this.doRetry());

    // Bottom buttons
    const btnY = h * 0.67;
    const { hit: shareHit } = createGlassBtn(this, w * 0.3, btnY, 'SHARE', { w: 110, color: '#e84393', fontSize: '12px' });
    shareHit.on('pointerdown', (p: any, lx: number, ly: number, e: Phaser.Types.Input.EventData) => {
      e.stopPropagation(); sound.tick();
      const msg = `I scored ${score} on STACKO! Can you beat me? 🏗️`;
      if (navigator.share) navigator.share({ title: 'STAIRS', text: msg }).catch(() => {});
      else navigator.clipboard.writeText(msg).then(() => {
        const t = this.add.text(w / 2, h * 0.75, 'Copied!', { fontSize: '11px', fontFamily: F_BODY, color: C.teal }).setOrigin(0.5);
        this.tweens.add({ targets: t, alpha: 0, delay: 600, duration: 300, onComplete: () => t.destroy() });
      });
    });

    const { hit: shopHit } = createGlassBtn(this, w * 0.7, btnY, 'SHOP', { w: 110, color: C.gold, fontSize: '12px' });
    shopHit.on('pointerdown', (p: any, lx: number, ly: number, e: Phaser.Types.Input.EventData) => {
      e.stopPropagation(); this.scene.start('ShopScene');
    });

    this.add.text(w / 2, h * 0.77, 'MENU', {
      fontSize: '11px', fontFamily: F_BODY, fontStyle: '600', color: C.muted, letterSpacing: 3,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', (p: any, lx: number, ly: number, e: Phaser.Types.Input.EventData) => { e.stopPropagation(); this.scene.start('MenuScene'); });

    this.cameras.main.fadeIn(150, 6, 6, 12);
  }

  private doRetry() { sound.snap(); this.scene.start('GameScene'); }
}
