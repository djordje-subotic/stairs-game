import Phaser from 'phaser';
import { createStair, createFragment, isDanger, DEFAULT_SW, SH, DY } from '../StairGfx';
import { getDifficulty, getNextTier, type SlideDir } from '../Difficulty';
import { sound } from '../SoundManager';
import { store } from '../Store';
import { F_HEAD, F_BODY, C } from '../Theme';
import { BackgroundManager } from '../BackgroundManager';

const MIN_WIDTH = 10;

type PowerUpType = 'slow' | 'shield' | 'x2';
interface ActivePowerUp { type: PowerUpType; remaining: number }

export class GameScene extends Phaser.Scene {
  private score = 0;
  private combo = 0;
  private goodStreak = 0;
  private bestCombo = 0;
  private coinsEarned = 0;
  private multiplier = 1;
  private stairW = DEFAULT_SW;

  // HUD
  private scoreText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private tierText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;
  private coinText!: Phaser.GameObjects.Text;
  private multText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBg!: Phaser.GameObjects.Graphics;
  private powerUpIcon!: Phaser.GameObjects.Text;
  private dirArrow!: Phaser.GameObjects.Text;
  private widthBar!: Phaser.GameObjects.Graphics;
  private vibeText!: Phaser.GameObjects.Text;

  // Game objects
  private placed: Phaser.GameObjects.Container[] = [];
  private slider!: Phaser.GameObjects.Container;

  // State — stairs stack CENTERED, straight up
  private lastX = 0;    // left edge of last placed stair
  private lastY = 0;
  private lastW = DEFAULT_SW;
  private targetY = 0;  // Y position for next stair
  private slideDir: SlideDir = 'right';

  private sliding = true;
  private dead = false;
  private baseSpeed = 4.5;
  private currentSpeed = 4.5;
  private accel = 0;
  private prevTier = '';

  private activePower: ActivePowerUp | null = null;
  private shieldUsed = false;

  // Camera — only moves Y
  private camY = 0;

  // Background
  private bgMgr!: BackgroundManager;

  // Particles
  private pGfx!: Phaser.GameObjects.Graphics;
  private ps: { x: number; y: number; vx: number; vy: number; life: number; c: number; s: number }[] = [];
  private vignetteGfx!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    sound.init();
    this.score = 0;
    this.combo = 0;
    this.goodStreak = 0;
    this.bestCombo = 0;
    this.coinsEarned = 0;
    this.multiplier = 1;
    this.stairW = DEFAULT_SW;
    this.sliding = true;
    this.dead = false;
    this.prevTier = '';
    this.activePower = null;
    this.shieldUsed = false;
    this.placed = [];
    this.ps = [];
    this.slideDir = 'right';

    const { width, height } = this.scale;
    const diff = getDifficulty(0);
    this.baseSpeed = diff.speed;
    this.currentSpeed = diff.speed;
    this.accel = diff.accel;

    // Background
    this.bgMgr = new BackgroundManager(this);
    this.pGfx = this.add.graphics().setDepth(80);
    this.vignetteGfx = this.add.graphics().setScrollFactor(0).setDepth(85).setAlpha(0);

    // ---- First stair — CENTERED ----
    const sx = (width - this.stairW) / 2;
    const sy = height * 0.7;
    const first = createStair(this, sx, sy, this.stairW, 0);
    this.placed.push(first);
    this.lastX = sx;
    this.lastY = sy;
    this.lastW = this.stairW;
    this.targetY = sy - DY;
    this.camY = this.targetY;

    store.resetContinueUsed();

    // Slider
    this.spawnSlider();

    // ---- HUD ----
    // Top offset for Dynamic Island / notch
    const TOP = 75;

    this.scoreText = this.add.text(width / 2, TOP + 4, '0', {
      fontSize: '40px', fontFamily: F_HEAD, fontStyle: '700', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100).setAlpha(0.9);
    this.scoreText.setShadow(0, 2, '#000000', 5, true, true);

    this.multText = this.add.text(width / 2 + 48, TOP - 8, '', {
      fontSize: '16px', fontFamily: F_HEAD, fontStyle: '700', color: C.gold,
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);

    this.progressBg = this.add.graphics().setScrollFactor(0).setDepth(100);
    this.progressBg.fillStyle(0xffffff, 0.05);
    this.progressBg.fillRoundedRect(width / 2 - 50, TOP + 34, 100, 4, 2);
    this.progressBar = this.add.graphics().setScrollFactor(0).setDepth(101);

    this.widthBar = this.add.graphics().setScrollFactor(0).setDepth(101);

    this.coinText = this.add.text(width - 14, TOP - 16, '0 ●', {
      fontSize: '11px', fontFamily: F_BODY, fontStyle: '700', color: C.gold,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);

    this.comboText = this.add.text(width / 2, TOP + 54, '', {
      fontSize: '14px', fontFamily: F_BODY, fontStyle: '600', color: C.gold,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    this.tierText = this.add.text(width / 2, height - 75, '', {
      fontSize: '16px', fontFamily: F_HEAD, fontStyle: '700', color: C.red, letterSpacing: 8,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100).setAlpha(0);

    this.powerUpIcon = this.add.text(14, TOP - 16, '', {
      fontSize: '11px', fontFamily: F_BODY, color: '#ffffff',
    }).setScrollFactor(0).setDepth(100);

    this.dirArrow = this.add.text(width / 2, height - 42, '', {
      fontSize: '24px', fontFamily: F_BODY, color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100).setAlpha(0);

    this.vibeText = this.add.text(width / 2, height / 2, '', {
      fontSize: '20px', fontFamily: F_HEAD, fontStyle: '700', color: '#ffffff', letterSpacing: 6,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100).setAlpha(0);

    this.hintText = this.add.text(width / 2, height - 40, 'TAP TO STACK', {
      fontSize: '11px', fontFamily: F_BODY, fontStyle: '600', color: C.dimWhite, letterSpacing: 5,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100).setAlpha(0.3);
    this.tweens.add({ targets: this.hintText, alpha: { from: 0.3, to: 0.06 }, duration: 700, yoyo: true, repeat: -1 });

    this.updateProgressBar();
    this.updateWidthBar();

    this.input.on('pointerdown', () => this.tap());
    this.input.keyboard?.on('keydown-SPACE', () => this.tap());

    this.time.delayedCall(100, () => sound.whoosh());
  }

  update(_t: number, dt: number) {
    if (this.sliding && !this.dead) {
      const mul = this.activePower?.type === 'slow' ? 0.45 : 1;
      this.currentSpeed += this.accel * mul;

      if (this.slideDir === 'right') {
        this.slider.x -= this.currentSpeed * mul;
        if (this.slider.x + this.stairW < this.lastX) this.handleMissOrShield();
      } else {
        this.slider.x += this.currentSpeed * mul;
        if (this.slider.x > this.lastX + this.lastW) this.handleMissOrShield();
      }
    }

    // Camera — only Y moves (centered X)
    this.camY = Phaser.Math.Linear(this.camY, this.targetY, 0.06);
    const { width, height } = this.scale;
    this.cameras.main.scrollX = 0;
    // Keep the top of the stack at ~55% from top (below Dynamic Island)
    this.cameras.main.scrollY = this.camY - height * 0.55;

    // Animate background orbs
    this.bgMgr.update(dt, this.camY);

    // Vignette on high combo — intensifies with streak
    if (this.combo >= 5) {
      this.vignetteGfx.clear();
      const a = Math.min((this.combo - 4) * 0.015, 0.1);
      this.vignetteGfx.setAlpha(a);
      const theme = this.bgMgr.getTheme();
      const vc = theme.accent1;
      this.vignetteGfx.fillGradientStyle(vc, vc, 0x000000, 0x000000, 1, 1, 0, 0);
      this.vignetteGfx.fillRect(0, 0, width, 45);
      this.vignetteGfx.fillGradientStyle(0x000000, 0x000000, vc, vc, 0, 0, 1, 1);
      this.vignetteGfx.fillRect(0, height - 45, width, 45);
    } else {
      this.vignetteGfx.clear();
    }

    // Particles
    this.pGfx.clear();
    this.ps = this.ps.filter(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life -= 0.03;
      if (p.life <= 0) return false;
      this.pGfx.fillStyle(p.c, p.life * 0.8);
      this.pGfx.fillCircle(p.x, p.y, p.s * p.life);
      return true;
    });

    // Trail particles from slider — theme colored
    if (this.sliding && !this.dead && this.ps.length < 200) {
      const lx = this.slideDir === 'right' ? this.slider.x : this.slider.x + this.stairW;
      const ly = this.slider.y + SH / 2;
      if (Math.random() > 0.5) {
        const theme = this.bgMgr.getTheme();
        const tc = [theme.accent1, theme.accent2, theme.accent3];
        this.ps.push({
          x: lx, y: ly + Phaser.Math.FloatBetween(-5, 5),
          vx: (this.slideDir === 'right' ? 1 : -1) * Phaser.Math.FloatBetween(0.8, 1.5),
          vy: Phaser.Math.FloatBetween(-0.3, 0.3),
          life: Phaser.Math.FloatBetween(0.15, 0.35),
          c: tc[Phaser.Math.Between(0, 2)], s: Phaser.Math.FloatBetween(1.5, 2.5),
        });
      }
    }

    // Combo flame around score — escalates with streak
    if (this.combo >= 3) {
      const sx = width / 2;
      const sy = 50;
      const intensity = Math.min(this.combo, 15);
      const spawnRate = 0.6 - intensity * 0.02; // more particles at higher combo
      if (Math.random() > spawnRate) {
        const flameColors = this.combo >= 12
          ? [0xffffff, 0xffeaa7, 0xff6348]
          : this.combo >= 8
          ? [0xff6348, 0xfeca57, 0xff4444]
          : this.combo >= 5
          ? [0xfdcb6e, 0xe17055, 0xff6348]
          : [0xfdcb6e, 0xe17055];
        this.ps.push({
          x: sx + Phaser.Math.FloatBetween(-18, 18),
          y: this.cameras.main.scrollY + sy,
          vx: Phaser.Math.FloatBetween(-0.4, 0.4),
          vy: Phaser.Math.FloatBetween(-2, -0.5),
          life: Phaser.Math.FloatBetween(0.25, 0.5),
          c: flameColors[Phaser.Math.Between(0, flameColors.length - 1)],
          s: Phaser.Math.FloatBetween(2, 3.5),
        });
      }
    }

    // Speed lines at high speed (creates sense of velocity)
    if (this.currentSpeed > 10 && this.sliding && !this.dead && Math.random() > 0.7) {
      const lineX = Phaser.Math.Between(0, width);
      const lineY = this.camY + Phaser.Math.Between(-height * 0.3, height);
      this.ps.push({
        x: lineX, y: lineY,
        vx: 0, vy: 3,
        life: Phaser.Math.FloatBetween(0.08, 0.15),
        c: 0xffffff, s: 0.5,
      });
    }
  }

  private handleMissOrShield() {
    if (this.activePower?.type === 'shield' && !this.shieldUsed) {
      this.shieldUsed = true;
      this.activePower = null;
      this.powerUpIcon.setText('');
      const { width, height } = this.scale;
      const f = this.add.rectangle(width / 2, height / 2, width, height, 0x00cec9, 0.1)
        .setScrollFactor(0).setDepth(95);
      this.tweens.add({ targets: f, alpha: 0, duration: 250, onComplete: () => f.destroy() });
      this.slider.x = this.lastX; // snap to prev stair's left edge
      this.sliding = false;
      this.landStair();
    } else {
      this.miss();
    }
  }

  private tap() {
    if (this.dead || !this.sliding) return;
    this.sliding = false;
    if (this.hintText.visible) this.hintText.setVisible(false);
    this.landStair();
  }

  private landStair() {
    const sL = this.slider.x;
    const sR = this.slider.x + this.stairW;
    const pL = this.lastX;
    const pR = this.lastX + this.lastW;

    const oL = Math.max(sL, pL);
    const oR = Math.min(sR, pR);
    const oW = oR - oL;

    if (oW <= MIN_WIDTH) { this.miss(); return; }

    const diff = getDifficulty(this.score);
    const hangL = Math.max(0, pL - sL);
    const hangR = Math.max(0, sR - pR);
    const totalHang = hangL + hangR;

    const perfect = totalHang <= diff.perfectRange;
    const good = totalHang <= diff.goodRange;

    this.score++;

    let newW = oW;
    if (perfect) {
      newW = this.stairW;
      this.combo++;
      this.goodStreak++;
      this.bestCombo = Math.max(this.combo, this.bestCombo);
      if (this.combo >= 3 && this.stairW < DEFAULT_SW) {
        const grow = Math.min(diff.growBack, DEFAULT_SW - this.stairW);
        newW = this.stairW + grow;
        if (grow > 0) sound.grow();
      }
      if (this.combo >= 10) this.multiplier = 3;
      else if (this.combo >= 5) this.multiplier = 2;
      else this.multiplier = 1;
    } else {
      this.combo = 0;
      this.multiplier = 1;
      if (good) this.goodStreak++; else this.goodStreak = 0;
    }

    // Coins
    let coins = 1;
    if (perfect) coins = 2 + Math.floor(this.combo / 2);
    if (this.activePower?.type === 'x2') coins *= 2;
    coins *= this.multiplier;
    this.coinsEarned += coins;
    this.coinText.setText(`${this.coinsEarned} ●`);

    // Power-up countdown
    if (this.activePower && this.activePower.type !== 'shield') {
      this.activePower.remaining--;
      if (this.activePower.remaining <= 0) { this.activePower = null; this.powerUpIcon.setText(''); }
      else this.powerUpIcon.setText(this.getPowerLabel());
    }

    // Sounds
    if (perfect) {
      sound.perfect();
      if (this.combo > 1) sound.combo(Math.min(this.combo, 10));
    } else if (good) {
      sound.snap(this.goodStreak);
      if (totalHang > 5) sound.chop();
    } else {
      sound.closecall();
      sound.chop();
    }

    // Hit-stop
    if (perfect && this.combo >= 2) {
      this.time.timeScale = 0.1;
      this.time.delayedCall(3, () => { this.time.timeScale = 1; });
    }

    const placedX = oL;
    const placedY = this.targetY;

    this.tweens.add({
      targets: this.slider, x: placedX, y: placedY, duration: 25, ease: 'Quad.easeOut',
      onComplete: () => this.afterLand(perfect, good, placedX, placedY, newW, hangL, hangR),
    });
  }

  private afterLand(perfect: boolean, good: boolean, px: number, py: number, newW: number, hangL: number, hangR: number) {
    this.slider.destroy();
    const ci = this.score % 8;

    const locked = createStair(this, px, py, newW, ci);
    this.placed.push(locked);

    // Bounce on stair below
    if (this.placed.length > 1) {
      const below = this.placed[this.placed.length - 2];
      this.tweens.add({ targets: below, scaleY: { from: 0.93, to: 1 }, duration: 80, ease: 'Bounce.easeOut' });
    }

    // Falling fragments
    if (!perfect) {
      if (hangR > 2) createFragment(this, px + newW, py, hangR, ci, 'right');
      if (hangL > 2) createFragment(this, px - hangL, py, hangL, ci, 'left');
    }

    // Particles — theme-colored for perfects
    const theme = this.bgMgr.getTheme();
    if (perfect) {
      const pc = this.combo >= 8 ? 0xfeca57 : 0x00cec9;
      const count = Math.min(10 + this.combo * 3, 40);
      this.burst(px + newW / 2, py, pc, count);
      // Extra theme-colored particles at high combo
      if (this.combo >= 5) {
        this.burst(px + newW / 2, py, theme.accent1, Math.floor(count * 0.5));
        this.burst(px + newW / 2, py, theme.accent2, Math.floor(count * 0.3));
      }
    } else if (good) {
      this.burst(px + newW / 2, py, 0xffffff, 5);
    } else {
      this.burst(px + newW / 2, py, 0xff6b6b, 4);
    }

    // Dust on landing
    const dustCount = perfect ? 5 : 3;
    for (let i = 0; i < dustCount; i++) {
      this.ps.push({
        x: px + Phaser.Math.FloatBetween(0, newW), y: py + SH,
        vx: Phaser.Math.FloatBetween(-1.2, 1.2), vy: Phaser.Math.FloatBetween(-0.5, 0.2),
        life: Phaser.Math.FloatBetween(0.15, 0.4), c: 0xffffff, s: 1.5,
      });
    }

    // Shake — more dramatic with combo
    if (perfect) {
      const shakeI = Math.min(45 + this.combo * 6, 100);
      const shakeM = Math.min(0.003 + this.combo * 0.001, 0.012);
      this.cameras.main.shake(shakeI, shakeM);
    } else if (!good) {
      this.cameras.main.shake(60, 0.004);
    }

    // Ripple on perfect — escalates dramatically
    if (perfect) {
      const cx = px + newW / 2, cy = py + SH / 2;
      const theme = this.bgMgr.getTheme();

      // Primary ripple ring
      const ring = this.add.circle(cx, cy, 10, 0x00cec9, 0).setDepth(25);
      ring.setStrokeStyle(2, 0x00cec9, 0.6);
      this.tweens.add({ targets: ring, scaleX: 4.5, scaleY: 4.5, alpha: 0, duration: 350, onComplete: () => ring.destroy() });

      // Second ring at combo 3+
      if (this.combo >= 3) {
        const r2 = this.add.circle(cx, cy, 6, 0, 0).setDepth(25);
        r2.setStrokeStyle(1.5, theme.accent1, 0.35);
        this.tweens.add({ targets: r2, scaleX: 6, scaleY: 6, alpha: 0, duration: 420, delay: 40, onComplete: () => r2.destroy() });
      }

      // Third ring + color flash at combo 5+
      if (this.combo >= 5) {
        const r3 = this.add.circle(cx, cy, 8, 0, 0).setDepth(25);
        r3.setStrokeStyle(1, 0xffffff, 0.25);
        this.tweens.add({ targets: r3, scaleX: 7, scaleY: 7, alpha: 0, duration: 500, delay: 80, onComplete: () => r3.destroy() });

        // Screen flash with theme color
        const { width, height } = this.scale;
        const flash = this.add.rectangle(width / 2, height / 2, width, height, theme.accent1, 0.04).setScrollFactor(0).setDepth(88);
        this.tweens.add({ targets: flash, alpha: 0, duration: 150, onComplete: () => flash.destroy() });
      }

      // Zoom punch at combo 8+
      if (this.combo >= 8) {
        this.cameras.main.zoom = 1.02;
        this.tweens.add({ targets: this.cameras.main, zoom: 1, duration: 150, ease: 'Quad.easeOut' });
      }

      // Bigger zoom at combo 15+
      if (this.combo >= 15) {
        this.cameras.main.zoom = 1.035;
        this.tweens.add({ targets: this.cameras.main, zoom: 1, duration: 200, ease: 'Quad.easeOut' });
      }
    }

    // CLUTCH — survived with tiny width (near-death)
    if (!perfect && newW < 25 && newW > MIN_WIDTH) {
      const { width: cw2, height: ch2 } = this.scale;
      const clutchTxt = this.add.text(cw2 / 2, ch2 * 0.42, 'CLUTCH!', {
        fontSize: '16px', fontFamily: F_HEAD, fontStyle: '700', color: '#ff6b6b', letterSpacing: 4,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(110).setAlpha(0);
      this.tweens.add({ targets: clutchTxt, alpha: 1, scaleX: { from: 1.5, to: 1 }, scaleY: { from: 1.5, to: 1 }, duration: 200, ease: 'Back.easeOut' });
      this.tweens.add({ targets: clutchTxt, alpha: 0, duration: 300, delay: 500, onComplete: () => clutchTxt.destroy() });
      this.haptic([5, 15, 5, 15, 5]);
    }

    // COMEBACK — recovered from danger zone to safe width
    if (newW > this.stairW && this.stairW < 35 && newW >= 50) {
      const { width: cw3, height: ch3 } = this.scale;
      const comeTxt = this.add.text(cw3 / 2, ch3 * 0.42, 'COMEBACK!', {
        fontSize: '16px', fontFamily: F_HEAD, fontStyle: '700', color: '#55efc4', letterSpacing: 4,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(110).setAlpha(0);
      this.tweens.add({ targets: comeTxt, alpha: 1, scaleX: { from: 0.5, to: 1.1 }, scaleY: { from: 0.5, to: 1.1 }, duration: 250, ease: 'Back.easeOut' });
      this.tweens.add({ targets: comeTxt, alpha: 0, scaleX: 1.2, scaleY: 1.2, duration: 350, delay: 600, onComplete: () => comeTxt.destroy() });
      // Bonus coins for comeback
      this.coinsEarned += 5;
      this.coinText.setText(`${this.coinsEarned} ●`);
      this.burst(px + newW / 2, py, 0x55efc4, 15);
      sound.milestone();
    }

    // Danger
    if (isDanger(newW)) {
      sound.danger();
      const { width, height } = this.scale;
      const df = this.add.rectangle(width / 2, height / 2, width, height, 0xff4757, 0.05).setScrollFactor(0).setDepth(90);
      this.tweens.add({ targets: df, alpha: 0, duration: 250, onComplete: () => df.destroy() });
    }

    // Grow flash
    if (newW > this.stairW) {
      const gf = this.add.rectangle(px + newW / 2, py + SH / 2, newW, SH, 0x00cec9, 0.15).setDepth(25);
      this.tweens.add({ targets: gf, alpha: 0, scaleX: 1.2, scaleY: 1.2, duration: 200, onComplete: () => gf.destroy() });
    }

    this.stairW = newW;

    // Score display
    const { width } = this.scale;
    const ss = Math.min(1 + this.score * 0.002, 1.12);
    this.scoreText.setText(`${this.score}`).setScale(ss);
    this.tweens.add({
      targets: this.scoreText, scaleX: { from: ss * 1.2, to: ss }, scaleY: { from: ss * 1.2, to: ss },
      duration: 90, ease: 'Back.easeOut',
    });

    // Multiplier
    this.multText.setText(this.multiplier > 1 ? `×${this.multiplier}` : '');

    // Combo tier names — escalating hype
    let label = '', color = '#00cec9';
    if (perfect && this.combo >= 20) { label = 'IMMORTAL'; color = '#ffffff'; }
    else if (perfect && this.combo >= 15) { label = 'ASCENDED'; color = '#ffffff'; }
    else if (perfect && this.combo >= 12) { label = 'UNSTOPPABLE'; color = '#f0c674'; }
    else if (perfect && this.combo >= 10) { label = 'GODLIKE'; color = '#ffd56e'; }
    else if (perfect && this.combo >= 8) { label = 'INSANE'; color = '#ff6348'; }
    else if (perfect && this.combo >= 5) { label = 'BLAZING'; color = '#e17055'; }
    else if (perfect && this.combo >= 3) { label = 'FIRE'; color = '#fdcb6e'; }
    else if (perfect && this.combo > 1) { label = `PERFECT ×${this.combo}`; }
    else if (perfect) { label = 'PERFECT!'; }
    else if (good) { label = 'GOOD'; color = '#ffeaa7'; }
    else { label = 'CLOSE!'; color = '#ff6b6b'; }

    // Scale up the combo text for high combos
    const comboScale = this.combo >= 10 ? 1.3 : this.combo >= 5 ? 1.15 : 1;
    this.comboText.setText(label).setColor(color).setAlpha(1).setScale(comboScale);
    this.tweens.add({
      targets: this.comboText, alpha: 0, scaleX: comboScale * 1.1, scaleY: comboScale * 1.1,
      duration: 500, delay: 300,
    });

    // Popup — bigger at high combo
    const popVal = perfect ? Math.max(this.combo, 1) : 1;
    const ptxt = `+${popVal}`;
    const popSize = perfect && this.combo >= 8 ? '22px' : perfect && this.combo >= 3 ? '18px' : perfect ? '16px' : '12px';
    const popColor = perfect && this.combo >= 8 ? '#feca57' : perfect ? '#00cec9' : good ? '#dfe6e9' : '#ff6b6b';
    const pop = this.add.text(px + newW / 2, py - 8, ptxt, {
      fontSize: popSize, fontFamily: F_HEAD, fontStyle: '700', color: popColor,
    }).setOrigin(0.5).setDepth(90);
    pop.setShadow(0, 1, '#000000', 4, true, true);
    this.tweens.add({
      targets: pop, y: pop.y - 28, alpha: 0,
      scaleX: { from: 1.2, to: 0.8 }, scaleY: { from: 1.2, to: 0.8 },
      duration: 400, ease: 'Quad.easeOut', onComplete: () => pop.destroy(),
    });

    // New best check
    if (this.score > store.getBest() && this.score > 1) {
      const nb = this.add.text(width / 2, 96, 'NEW BEST!', {
        fontSize: '13px', fontFamily: F_HEAD, fontStyle: '700', color: C.gold,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(110).setAlpha(0);
      this.tweens.add({ targets: nb, alpha: 1, duration: 200 });
      this.tweens.add({ targets: nb, alpha: 0, duration: 300, delay: 700, onComplete: () => nb.destroy() });
    }

    // Milestones
    this.checkMilestone(this.score, px, py);

    // Background theme change
    const themeName = this.bgMgr.onScoreChange(this.score);
    if (themeName) {
      this.vibeText.setText(themeName).setAlpha(0);
      this.tweens.add({ targets: this.vibeText, alpha: { from: 0, to: 0.5 }, scaleX: { from: 1.4, to: 1 }, scaleY: { from: 1.4, to: 1 }, duration: 250, ease: 'Back.easeOut' });
      this.tweens.add({ targets: this.vibeText, alpha: 0, duration: 350, delay: 700 });
    }

    this.updateProgressBar();
    this.updateWidthBar();
    this.haptic(perfect ? 15 : good ? 8 : [10, 30, 10]);

    // Tier
    const nextDiff = getDifficulty(this.score);
    if (nextDiff.label && nextDiff.label !== this.prevTier) {
      this.prevTier = nextDiff.label;
      this.tierText.setText(nextDiff.label).setAlpha(0);
      this.tweens.add({ targets: this.tierText, alpha: { from: 0, to: 1 }, scaleX: { from: 1.5, to: 1 }, scaleY: { from: 1.5, to: 1 }, duration: 250, ease: 'Back.easeOut' });
      this.tweens.add({ targets: this.tierText, alpha: 0, duration: 350, delay: 900 });
    }

    // Power-up
    if (!this.activePower && this.score > 5 && this.score % Phaser.Math.Between(8, 14) === 0) {
      this.spawnPowerUp(px, py);
    }

    // Update state
    this.lastX = px;
    this.lastY = py;
    this.lastW = newW;
    this.targetY = py - DY;

    // Next direction
    const dirs = nextDiff.directions;
    const prevDir = this.slideDir;
    const other = dirs.filter(d => d !== this.slideDir);
    this.slideDir = Math.random() < 0.6 ? Phaser.Utils.Array.GetRandom(other) : Phaser.Utils.Array.GetRandom(dirs);

    if (this.slideDir !== prevDir) {
      sound.dirSwitch();
      this.dirArrow.setText(this.slideDir === 'left' ? '→' : '←').setAlpha(1);
      this.tweens.add({ targets: this.dirArrow, alpha: 0, duration: 400, delay: 250 });
    }

    // Speed
    this.baseSpeed = nextDiff.speed + Phaser.Math.FloatBetween(-nextDiff.speedJitter, nextDiff.speedJitter);
    this.currentSpeed = this.baseSpeed;
    this.accel = nextDiff.accel;

    const delay = nextDiff.spawnDelay;
    const spawn = () => { if (!this.dead) { this.spawnSlider(); sound.whoosh(); } };
    if (delay > 0) this.time.delayedCall(delay, spawn); else spawn();

    this.cleanOldStairs();
  }

  private spawnSlider() {
    const { width } = this.scale;
    const edgeHL = this.slideDir === 'right' ? 'left' : 'right';
    const ci = (this.score + 1) % 8;
    const startX = this.slideDir === 'right' ? width + this.stairW : -this.stairW - 30;
    this.slider = createStair(this, startX, this.targetY, this.stairW, ci, edgeHL).setDepth(20);
    this.sliding = true;
  }

  private miss() {
    this.dead = true;
    this.sliding = false;
    sound.fall();
    store.addCoins(this.coinsEarned);

    // Slow-motion death
    this.time.timeScale = 0.3;

    const sx = this.slider.x, sy = this.slider.y;
    this.slider.destroy();

    const skin = store.getCurrentSkin();
    const mc = skin.palette[this.score % 8].fg;
    // More fragments for dramatic crumble
    for (let i = 0; i < 15; i++) {
      const frag = this.add.rectangle(
        sx + Phaser.Math.Between(0, this.stairW), sy + Phaser.Math.Between(0, SH),
        Phaser.Math.Between(6, 18), Phaser.Math.Between(4, 14), mc, 0.85,
      ).setDepth(30);
      this.tweens.add({
        targets: frag,
        x: frag.x + Phaser.Math.Between(-100, 100), y: frag.y + Phaser.Math.Between(80, 300),
        rotation: Phaser.Math.FloatBetween(-3, 3), alpha: 0,
        duration: Phaser.Math.Between(400, 700), ease: 'Quad.easeIn',
        onComplete: () => frag.destroy(),
      });
    }

    // Particles explosion at death point
    for (let i = 0; i < 20; i++) {
      this.ps.push({
        x: sx + this.stairW / 2, y: sy + SH / 2,
        vx: Phaser.Math.FloatBetween(-5, 5), vy: Phaser.Math.FloatBetween(-6, -1),
        life: Phaser.Math.FloatBetween(0.4, 1.0),
        c: mc, s: Phaser.Math.FloatBetween(1.5, 3.5),
      });
    }

    const { width, height } = this.scale;

    // White flash — sharp impact
    const wf = this.add.rectangle(width / 2, height / 2, width, height, 0xffffff, 0.22).setScrollFactor(0).setDepth(95);
    this.tweens.add({ targets: wf, alpha: 0, duration: 100, onComplete: () => wf.destroy() });

    // Red flash — danger/death
    const rf = this.add.rectangle(width / 2, height / 2, width, height, 0xff0000, 0.12).setScrollFactor(0).setDepth(95);
    this.tweens.add({ targets: rf, alpha: 0, duration: 300, delay: 60, onComplete: () => rf.destroy() });

    // Dark vignette closing in
    const vg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0).setScrollFactor(0).setDepth(94);
    this.tweens.add({ targets: vg, alpha: 0.3, duration: 400 });

    this.cameras.main.shake(150, 0.012);
    this.haptic([50, 20, 80]);

    // Restore time, then transition
    this.time.delayedCall(6, () => { this.time.timeScale = 1; });
    this.time.delayedCall(500, () => {
      // Pause this scene but keep it alive (for continue)
      this.scene.pause();
      this.scene.launch('GameOverScene', {
        score: this.score, bestCombo: this.bestCombo, coins: this.coinsEarned,
        stairW: this.stairW,
      });
    });
  }

  private checkMilestone(score: number, x: number, y: number) {
    const milestones: Record<number, string> = { 10: 'DOUBLE DIGITS', 25: 'QUARTER CENTURY', 50: 'FIFTY', 75: 'LEGENDARY', 100: 'CENTURION' };
    const lbl = milestones[score];
    if (!lbl) return;

    const skin = store.getCurrentSkin();
    const count = score >= 75 ? 45 : score >= 50 ? 35 : score >= 25 ? 25 : 20;
    for (let i = 0; i < count; i++) {
      this.ps.push({
        x: x + Phaser.Math.FloatBetween(-30, 30 + this.stairW), y: y - 5,
        vx: Phaser.Math.FloatBetween(-5, 5), vy: Phaser.Math.FloatBetween(-8, -2),
        life: Phaser.Math.FloatBetween(0.5, 1.3),
        c: skin.palette[i % skin.palette.length].fg, s: Phaser.Math.FloatBetween(2, 5),
      });
    }

    const { width, height } = this.scale;

    // Screen flash for milestone celebration
    const theme = this.bgMgr.getTheme();
    const mFlash = this.add.rectangle(width / 2, height / 2, width, height, theme.accent1, 0.06).setScrollFactor(0).setDepth(89);
    this.tweens.add({ targets: mFlash, alpha: 0, duration: 400, onComplete: () => mFlash.destroy() });

    // Milestone text with dramatic entrance
    const fontSize = score >= 75 ? '22px' : '18px';
    const mt = this.add.text(width / 2, height * 0.35, lbl, {
      fontSize, fontFamily: F_HEAD, fontStyle: '700', color: '#ffffff', letterSpacing: 6,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(110).setAlpha(0);
    mt.setShadow(0, 3, '#000000', 8, true, true);
    this.tweens.add({ targets: mt, alpha: 1, scaleX: { from: 0.3, to: 1 }, scaleY: { from: 0.3, to: 1 }, duration: 320, ease: 'Back.easeOut' });
    this.tweens.add({ targets: mt, alpha: 0, y: mt.y - 20, scaleX: 1.1, scaleY: 1.1, duration: 400, delay: 1200, onComplete: () => mt.destroy() });

    // Slow-mo for epic moments
    if (score >= 25) {
      const slowDur = score >= 100 ? 12 : score >= 75 ? 10 : score >= 50 ? 8 : 5;
      this.time.timeScale = 0.12;
      this.time.delayedCall(slowDur, () => { this.time.timeScale = 1; });
    }

    // Zoom punch on milestone
    this.cameras.main.zoom = score >= 75 ? 1.04 : 1.025;
    this.tweens.add({ targets: this.cameras.main, zoom: 1, duration: 250, ease: 'Quad.easeOut' });

    sound.milestone();
    this.haptic([10, 10, 10, 10, 10]);
  }

  private spawnPowerUp(x: number, y: number) {
    const types: PowerUpType[] = ['slow', 'shield', 'x2'];
    const type = types[Phaser.Math.Between(0, 2)];
    const labels: Record<PowerUpType, string> = { slow: '🐢 SLOW', shield: '🛡 SHIELD', x2: '×2 COINS' };
    const colors: Record<PowerUpType, string> = { slow: '#00cec9', shield: '#74b9ff', x2: '#ffd56e' };
    this.activePower = { type, remaining: type === 'shield' ? 999 : 5 };
    this.shieldUsed = false;
    this.powerUpIcon.setText(this.getPowerLabel());
    const popup = this.add.text(x + this.stairW / 2, y - 15, labels[type], {
      fontSize: '12px', fontFamily: F_HEAD, fontStyle: '700', color: colors[type],
    }).setOrigin(0.5).setDepth(95);
    this.tweens.add({ targets: popup, y: popup.y - 30, alpha: 0, scaleX: { from: 0.6, to: 1.2 }, scaleY: { from: 0.6, to: 1.2 }, duration: 600, ease: 'Quad.easeOut', onComplete: () => popup.destroy() });
  }

  private getPowerLabel(): string {
    if (!this.activePower) return '';
    const p = this.activePower;
    if (p.type === 'slow') return `🐢 ${p.remaining}`;
    if (p.type === 'shield') return '🛡';
    if (p.type === 'x2') return `×2 ${p.remaining}`;
    return '';
  }

  private updateProgressBar() {
    this.progressBar.clear();
    const { width } = this.scale;
    const barY = 75 + 34; // TOP + 34
    const next = getNextTier(this.score);
    if (!next) { this.progressBar.fillStyle(0xff4757, 0.7); this.progressBar.fillRoundedRect(width / 2 - 50, barY, 100, 4, 2); return; }
    const diff = getDifficulty(this.score);
    const p = (this.score - diff.tierStart) / (diff.tierEnd - diff.tierStart);
    const bw = Math.max(3, 100 * p);
    const cols: Record<string, number> = { 'NICE': 0xf0c674, 'FAST': 0xfab1a0, 'HARD': 0xff6b6b, 'INSANE': 0xff4757 };
    this.progressBar.fillStyle(cols[next.name] || 0xa29bfe, 0.6);
    this.progressBar.fillRoundedRect(width / 2 - 50, barY, bw, 4, 2);
  }

  private updateWidthBar() {
    this.widthBar.clear();
    const { width } = this.scale;
    const barY = 75 + 42; // TOP + 42, below progress bar
    const pct = this.stairW / DEFAULT_SW;
    const bx = width / 2 - 35;
    this.widthBar.fillStyle(0xffffff, 0.04);
    this.widthBar.fillRoundedRect(bx, barY, 70, 3, 1.5);
    const c = pct > 0.6 ? 0x4ecdc4 : pct > 0.35 ? 0xf0c674 : 0xff6b6b;
    this.widthBar.fillStyle(c, 0.5);
    this.widthBar.fillRoundedRect(bx, barY, 70 * pct, 3, 1.5);
  }

  private burst(x: number, y: number, c: number, n: number) {
    for (let i = 0; i < n; i++) {
      this.ps.push({ x, y, vx: Phaser.Math.FloatBetween(-3, 3), vy: Phaser.Math.FloatBetween(-4.5, -1), life: Phaser.Math.FloatBetween(0.4, 0.9), c, s: Phaser.Math.FloatBetween(2, 3.5) });
    }
  }

  private haptic(pattern: number | number[]) {
    try { navigator.vibrate?.(pattern); } catch (_) { /* */ }
  }

  /** Called from GameOverScene on continue — revive in-place */
  revive() {
    this.dead = false;
    this.sliding = true;
    this.combo = 0;
    this.multiplier = 1;
    this.goodStreak = 0;

    // Bonus width on revive
    this.stairW = Math.max(this.stairW + 15, 40);
    this.lastW = this.stairW;

    // Re-place a stair at last position with new width
    const ci = this.score % 8;
    const sx = this.lastX + (this.lastW - this.stairW) / 2;
    const rStair = createStair(this, Math.max(0, sx), this.lastY, this.stairW, ci);
    this.placed.push(rStair);
    this.lastX = Math.max(0, sx);

    // Flash green
    const { width, height } = this.scale;
    const flash = this.add.rectangle(width / 2, height / 2, width, height, 0x00cec9, 0.12).setScrollFactor(0).setDepth(95);
    this.tweens.add({ targets: flash, alpha: 0, duration: 400, onComplete: () => flash.destroy() });

    // Clear vignette
    this.vignetteGfx.clear();

    // Update HUD
    this.scoreText.setText(`${this.score}`);
    this.coinText.setText(`${this.coinsEarned} ●`);
    this.updateWidthBar();
    this.updateProgressBar();

    // Spawn next slider
    this.spawnSlider();
    sound.whoosh();
    sound.grow();
  }

  private cleanOldStairs() {
    const limit = this.cameras.main.scrollY + this.scale.height + SH * 3;
    while (this.placed.length > 12) {
      const old = this.placed.shift();
      if (old && old.y > limit) old.destroy();
      else if (old) { this.placed.unshift(old); break; }
    }
  }
}
