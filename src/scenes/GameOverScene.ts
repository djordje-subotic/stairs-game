import Phaser from 'phaser';
import { getNextTier } from '../Difficulty';
import { sound } from '../SoundManager';
import { store } from '../Store';
import { F_HEAD, F_BODY, C, drawModernBg, drawGlassCard, createGlassBtn } from '../Theme';
import { ads } from '../AdManager';

let sessionAttempts = 0;

interface GameOverData {
  score: number; bestCombo: number; coins: number;
  stairW: number;
}

export class GameOverScene extends Phaser.Scene {
  private canTap = false;

  constructor() { super({ key: 'GameOverScene' }); }

  create(data: GameOverData) {
    sound.init();
    this.canTap = false;
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
      this.add.text(w / 2, h * 0.46, `ATTEMPT #${sessionAttempts}`, {
        fontSize: '10px', fontFamily: F_BODY, color: C.muted, letterSpacing: 3,
      }).setOrigin(0.5);
    }

    // ──── CONTINUE SYSTEM ────
    const canContinue = score >= 3; // always offer continue if score >= 3

    if (canContinue) {
      this.buildContinueUI(w, h, data);
    } else {
      this.buildRetryUI(w, h, data);
    }

    this.cameras.main.fadeIn(150, 6, 6, 12);
  }

  private buildContinueUI(w: number, h: number, data: GameOverData) {
    const hasFreeDaily = store.hasDailyContinue();
    const hasCoins = store.canCoinContinue();
    const hasAds = !store.isAdFree();
    const allElements: Phaser.GameObjects.GameObject[] = [];

    // ── Glass card for continue section ──
    const cardW = w * 0.82;
    const cardH = 125;
    const cardX = (w - cardW) / 2;
    const cardY = h * 0.48;
    const card = drawGlassCard(this, cardX, cardY, cardW, cardH, 14);
    card.setAlpha(0);
    this.tweens.add({ targets: card, alpha: 1, duration: 300, delay: 150 });
    allElements.push(card);

    // Header
    const header = this.add.text(w / 2, cardY + 18, 'CONTINUE?', {
      fontSize: '13px', fontFamily: F_HEAD, fontStyle: '700', color: '#ffffff', letterSpacing: 5,
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: header, alpha: 1, duration: 250, delay: 200 });
    allElements.push(header);

    // Countdown bar — wider, inside card
    const barW = cardW - 30;
    const barY = cardY + 33;
    const barBg = this.add.graphics().setDepth(100);
    barBg.fillStyle(0xffffff, 0.06);
    barBg.fillRoundedRect(w / 2 - barW / 2, barY, barW, 5, 2.5);
    const barFill = this.add.graphics().setDepth(101);
    allElements.push(barBg, barFill);

    let timeLeft = 6000;
    const updateBar = () => {
      barFill.clear();
      const pct = Math.max(0, timeLeft / 6000);
      const col = pct > 0.4 ? 0x00cec9 : pct > 0.15 ? 0xfeca57 : 0xff6b6b;
      barFill.fillStyle(col, 0.8);
      barFill.fillRoundedRect(w / 2 - barW / 2, barY, barW * pct, 5, 2.5);
    };
    updateBar();

    const timerEvent = this.time.addEvent({
      delay: 50, loop: true,
      callback: () => {
        timeLeft -= 50;
        updateBar();
        if (timeLeft <= 0) {
          timerEvent.destroy();
          this.transitionToRetry(w, h, data, allElements);
        }
      },
    });

    // ── Buttons row ──
    const btnY = cardY + 68;
    const btnGap = 10;

    const coinCost = store.continueCoinCost();
    const freeLeft = store.dailyContinuesLeft();

    // Free users:    🎁 FREE (daily) + 📺 WATCH AD
    // Ad-free users: 📺 WATCH AD    + 💰 30 COINS
    const adFree = store.isAdFree();
    const showFree = hasFreeDaily && !adFree;
    const showAd = true; // always
    const showCoins = hasCoins && adFree;

    // Helper to draw a custom continue button — all in a Container so pulse stays aligned
    const makeBtn = (
      cx: number, cy: number, bw: number, bh: number,
      icon: string, label: string, sublabel: string,
      fillCol: number, textCol: string,
      onTap: () => void,
    ) => {
      const bg = this.add.graphics();
      bg.fillStyle(fillCol, 0.15);
      bg.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 8);
      bg.lineStyle(1, fillCol, 0.25);
      bg.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, 8);

      // Icon drawn purely with Graphics — no emoji, no clipping
      const iconGfx = this.add.graphics();
      const ix = -bw / 2 + 18, iy = 0;
      iconGfx.fillStyle(fillCol, 0.3);
      iconGfx.fillCircle(ix, iy, 11);
      // Draw a simple play triangle inside the circle
      iconGfx.fillStyle(0xffffff, 0.7);
      iconGfx.fillTriangle(ix - 3, iy - 5, ix - 3, iy + 5, ix + 5, iy);

      const labelTxt = this.add.text(8, -5, label, {
        fontSize: '11px', fontFamily: F_HEAD, fontStyle: '700', color: textCol, letterSpacing: 1,
      }).setOrigin(0.5);
      const subTxt = this.add.text(8, 9, sublabel, {
        fontSize: '7px', fontFamily: F_BODY, fontStyle: '600', color: C.dimWhite,
      }).setOrigin(0.5);

      // Container holds everything — pulse the container, not individual items
      const container = this.add.container(cx, cy, [bg, iconGfx, labelTxt, subTxt]).setAlpha(0);

      // Hit area on top
      const hit = this.add.rectangle(cx, cy, bw + 8, bh + 8, 0, 0).setInteractive({ useHandCursor: true });

      // Animate in
      this.tweens.add({ targets: [container, hit], alpha: { from: 0, to: 1 }, duration: 300, delay: 300 });
      // Pulse the whole container — text stays inside button
      this.tweens.add({
        targets: container, scaleX: { from: 1, to: 1.03 }, scaleY: { from: 1, to: 1.03 },
        duration: 700, yoyo: true, repeat: -1, delay: 600, ease: 'Sine.easeInOut',
      });

      // Press effect on container
      hit.on('pointerdown', (p: any, lx: number, ly: number, e: Phaser.Types.Input.EventData) => {
        e.stopPropagation();
        this.tweens.add({ targets: container, scaleX: 0.92, scaleY: 0.92, duration: 60, yoyo: true });
        timerEvent.destroy();
        onTap();
      });

      allElements.push(container, hit);
    };

    // Build button list — up to 2 options shown side by side
    const opts: { icon: string; label: string; sub: string; col: number; tCol: string; tap: () => void }[] = [];

    if (showFree) {
      opts.push({
        icon: '🎁', label: 'FREE', sub: `${freeLeft}x today`,
        col: 0x00b894, tCol: '#55efc4',
        tap: () => { store.useDailyContinue(); sound.perfect(); this.doContinue(data); },
      });
    }

    if (showAd) {
      opts.push({
        icon: '📺', label: 'WATCH AD', sub: 'free continue',
        col: 0x6c5ce7, tCol: '#a29bfe',
        tap: async () => {
          const watched = await ads.showRewarded();
          if (watched) {
            this.showResumePrompt(w, h, data, allElements);
          } else {
            this.transitionToRetry(w, h, data, allElements);
          }
        },
      });
    }

    if (showCoins && opts.length < 2) {
      opts.push({
        icon: '💰', label: `${coinCost} COINS`, sub: `you have ${store.getCoins()}`,
        col: C.goldHex, tCol: C.gold,
        tap: () => { if (store.spendCoinContinue()) { sound.perfect(); this.doContinue(data); } },
      });
    }

    if (opts.length === 0) {
      this.transitionToRetry(w, h, data, []);
      return;
    }

    if (opts.length === 2) {
      const half = (cardW - btnGap * 3) / 2;
      makeBtn(cardX + btnGap + half / 2 + 2, btnY, half, 44,
        opts[0].icon, opts[0].label, opts[0].sub, opts[0].col, opts[0].tCol, opts[0].tap);
      makeBtn(cardX + cardW - btnGap - half / 2 - 2, btnY, half, 44,
        opts[1].icon, opts[1].label, opts[1].sub, opts[1].col, opts[1].tCol, opts[1].tap);
    } else {
      makeBtn(w / 2, btnY, cardW - 30, 44,
        opts[0].icon, opts[0].label, opts[0].sub, opts[0].col, opts[0].tCol, opts[0].tap);
    }

    // Skip button — visible and tappable
    const skipY = cardY + cardH + 12;
    const skipTxt = this.add.text(w / 2, skipY, 'SKIP ›', {
      fontSize: '12px', fontFamily: F_BODY, fontStyle: '600', color: C.muted, letterSpacing: 2,
    }).setOrigin(0.5).setAlpha(0);
    const skipHit = this.add.rectangle(w / 2, skipY, 120, 36, 0, 0).setInteractive({ useHandCursor: true });
    this.tweens.add({ targets: skipTxt, alpha: 0.5, duration: 300, delay: 500 });
    skipHit.on('pointerdown', (p: any, lx: number, ly: number, e: Phaser.Types.Input.EventData) => {
      e.stopPropagation(); timerEvent.destroy();
      this.transitionToRetry(w, h, data, allElements);
    });
    allElements.push(skipTxt, skipHit);
  }

  private transitionToRetry(w: number, h: number, data: GameOverData, toHide: Phaser.GameObjects.GameObject[]) {
    for (const obj of toHide) {
      this.tweens.add({ targets: obj, alpha: 0, duration: 200, onComplete: () => {
        if ('destroy' in obj && typeof (obj as any).destroy === 'function') (obj as any).destroy();
      }});
    }
    this.time.delayedCall(250, () => this.buildRetryUI(w, h, data));
  }

  private showResumePrompt(w: number, h: number, data: GameOverData, toHide: Phaser.GameObjects.GameObject[]) {
    // Fade out the continue card
    for (const obj of toHide) {
      this.tweens.add({ targets: obj, alpha: 0, duration: 200, onComplete: () => {
        if ('destroy' in obj && typeof (obj as any).destroy === 'function') (obj as any).destroy();
      }});
    }

    this.time.delayedCall(250, () => {
      const cardW = w * 0.82;
      const cardH = 110;
      const cardX = (w - cardW) / 2;
      const cardY = h * 0.5;
      const card = drawGlassCard(this, cardX, cardY, cardW, cardH, 14);
      card.setAlpha(0);
      this.tweens.add({ targets: card, alpha: 1, duration: 250 });

      const hint = this.add.text(w / 2, cardY + 22, 'READY?', {
        fontSize: '11px', fontFamily: F_BODY, fontStyle: '600', color: C.accent, letterSpacing: 6,
      }).setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: hint, alpha: 1, duration: 250, delay: 100 });

      // Big RESUME button
      const btnW = cardW - 30;
      const btnH = 50;
      const btnX = w / 2;
      const btnY = cardY + 68;

      const bg = this.add.graphics();
      bg.fillStyle(0x6c5ce7, 0.2);
      bg.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 10);
      bg.lineStyle(1.5, 0x6c5ce7, 0.5);
      bg.strokeRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 10);

      const label = this.add.text(btnX, btnY, 'RESUME', {
        fontSize: '16px', fontFamily: F_HEAD, fontStyle: '700', color: '#a29bfe', letterSpacing: 4,
      }).setOrigin(0.5);

      const hit = this.add.rectangle(btnX, btnY, btnW, btnH, 0, 0).setInteractive({ useHandCursor: true });

      bg.setAlpha(0); label.setAlpha(0);
      this.tweens.add({ targets: [bg, label], alpha: 1, duration: 300, delay: 150 });
      this.tweens.add({
        targets: label, scaleX: { from: 1, to: 1.04 }, scaleY: { from: 1, to: 1.04 },
        duration: 800, yoyo: true, repeat: -1, delay: 500, ease: 'Sine.easeInOut',
      });

      hit.on('pointerdown', (_p: any, _lx: number, _ly: number, e: Phaser.Types.Input.EventData) => {
        e.stopPropagation();
        sound.perfect();
        this.doContinue(data);
      });
    });
  }

  private buildRetryUI(w: number, h: number, _data: GameOverData) {
    // TAP TO RETRY
    const retry = this.add.text(w / 2, h * 0.54, 'TAP TO RETRY', {
      fontSize: '18px', fontFamily: F_HEAD, fontStyle: '700', color: '#ffffff', letterSpacing: 4,
    }).setOrigin(0.5).setAlpha(0);

    this.time.delayedCall(100, () => {
      retry.setAlpha(1);
      this.tweens.add({
        targets: retry, scaleX: { from: 1, to: 1.03 }, scaleY: { from: 1, to: 1.03 },
        alpha: { from: 1, to: 0.5 }, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
      this.canTap = true;
      this.input.on('pointerdown', () => this.doRetry());
    });
    this.input.keyboard?.on('keydown-SPACE', () => this.doRetry());

    // Bottom buttons
    const btnY = h * 0.67;
    const { hit: shareHit } = createGlassBtn(this, w * 0.3, btnY, 'SHARE', { w: 110, color: '#e84393', fontSize: '12px' });
    shareHit.on('pointerdown', (p: any, lx: number, ly: number, e: Phaser.Types.Input.EventData) => {
      e.stopPropagation(); sound.tick();
      const score = _data.score ?? 0;
      const bestCombo = _data.bestCombo ?? 0;

      let flex = '';
      if (score >= 100) flex = "I'm a CENTURION 👑";
      else if (score >= 50) flex = "I just hit FIFTY 🔥";
      else if (score >= 25) flex = "Quarter century 💪";
      else if (score >= 10) flex = "Double digits 😤";
      else flex = `${score} and climbing`;

      const taunts = [
        "Bet you can't beat this 😏",
        "Try to top this 👀",
        "Your turn... if you dare 🫣",
        "Think you're better? Prove it 💀",
        "Good luck beating this 🎯",
      ];
      const taunt = taunts[Phaser.Math.Between(0, taunts.length - 1)];
      const msg = `🏗️ STACKO — ${flex}\n\n🎯 Score: ${score}${bestCombo > 2 ? ` | 🔥 Combo: ×${bestCombo}` : ''}\n\n${taunt}`;

      if (navigator.share) navigator.share({ title: 'STACKO', text: msg }).catch(() => {});
      else navigator.clipboard.writeText(msg).then(() => {
        const t = this.add.text(w / 2, h * 0.75, 'Copied!', { fontSize: '11px', fontFamily: F_BODY, color: C.teal }).setOrigin(0.5);
        this.tweens.add({ targets: t, alpha: 0, delay: 600, duration: 300, onComplete: () => t.destroy() });
      });
    });

    const { hit: shopHit } = createGlassBtn(this, w * 0.7, btnY, 'SHOP', { w: 110, color: C.gold, fontSize: '12px' });
    shopHit.on('pointerdown', (p: any, lx: number, ly: number, e: Phaser.Types.Input.EventData) => {
      e.stopPropagation(); this.scene.stop('GameScene'); this.scene.start('ShopScene', { from: 'MenuScene' });
    });

    const { hit: menuHit } = createGlassBtn(this, w * 0.5, h * 0.77, 'MENU', { w: 100, h: 30, color: C.muted, fontSize: '11px' });
    menuHit.on('pointerdown', (p: any, lx: number, ly: number, e: Phaser.Types.Input.EventData) => {
      e.stopPropagation(); this.scene.stop('GameScene'); this.scene.start('MenuScene');
    });
  }

  private doContinue(_data: GameOverData) {
    store.markContinueUsed();
    // Resume the paused GameScene in-place (keep the stack!)
    const gameScene = this.scene.get('GameScene') as any;
    if (gameScene?.revive) {
      gameScene.revive();
      this.scene.resume('GameScene');
      this.scene.stop(); // remove this overlay
    } else {
      // Fallback: restart if scene doesn't support revive
      this.scene.stop('GameScene');
      this.scene.start('GameScene');
    }
  }

  private doRetry() {
    if (!this.canTap) return;
    sound.snap();
    // Kill the old game scene and start fresh
    this.scene.stop('GameScene');
    this.scene.start('GameScene');
  }
}
