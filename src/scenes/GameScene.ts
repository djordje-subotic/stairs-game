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
    this.progressBg.fillRoundedRect(width / 2 - 50, TOP + 32, 100, 4, 2);
    this.progressBar = this.add.graphics().setScrollFactor(0).setDepth(101);

    this.widthBar = this.add.graphics().setScrollFactor(0).setDepth(101);

    this.coinText = this.add.text(width - 14, TOP - 16, '0 ●', {
      fontSize: '11px', fontFamily: F_BODY, fontStyle: '700', color: C.gold,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);

    this.comboText = this.add.text(width / 2, TOP + 48, '', {
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

    // Vignette on high combo
    if (this.combo >= 5) {
      this.vignetteGfx.clear();
      const a = Math.min((this.combo - 4) * 0.012, 0.07);
      this.vignetteGfx.setAlpha(a);
      const theme = this.bgMgr.getTheme();
      this.vignetteGfx.fillGradientStyle(theme.bokeh1, theme.bokeh1, 0x000000, 0x000000, 1, 1, 0, 0);
      this.vignetteGfx.fillRect(0, 0, width, 35);
      this.vignetteGfx.fillGradientStyle(0x000000, 0x000000, theme.bokeh1, theme.bokeh1, 0, 0, 1, 1);
      this.vignetteGfx.fillRect(0, height - 35, width, 35);
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

    // Trail particles from slider
    if (this.sliding && !this.dead && this.ps.length < 150) {
      const lx = this.slideDir === 'right' ? this.slider.x : this.slider.x + this.stairW;
      const ly = this.slider.y + SH / 2;
      if (Math.random() > 0.6) {
        const theme = this.bgMgr.getTheme();
        this.ps.push({
          x: lx, y: ly + Phaser.Math.FloatBetween(-4, 4),
          vx: this.slideDir === 'right' ? 1.2 : -1.2,
          vy: Phaser.Math.FloatBetween(-0.2, 0.2),
          life: Phaser.Math.FloatBetween(0.12, 0.3),
          c: theme.bokeh1, s: 2,
        });
      }
    }

    // Combo flame around score
    if (this.combo >= 3) {
      const sx = width / 2;
      const sy = 50;
      if (Math.random() > 0.5) {
        this.ps.push({
          x: sx + Phaser.Math.FloatBetween(-15, 15),
          y: this.cameras.main.scrollY + sy,
          vx: Phaser.Math.FloatBetween(-0.3, 0.3),
          vy: Phaser.Math.FloatBetween(-1.5, -0.4),
          life: Phaser.Math.FloatBetween(0.25, 0.45),
          c: Math.random() > 0.5 ? 0xfdcb6e : 0xe17055, s: 2.5,
        });
      }
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

    // Particles
    const pc = perfect ? 0x00cec9 : good ? 0xffffff : 0xff6b6b;
    this.burst(px + newW / 2, py, pc, perfect ? 10 + this.combo * 2 : good ? 5 : 3);

    // Dust
    for (let i = 0; i < 3; i++) {
      this.ps.push({
        x: px + Phaser.Math.FloatBetween(0, newW), y: py + SH,
        vx: Phaser.Math.FloatBetween(-0.8, 0.8), vy: Phaser.Math.FloatBetween(-0.4, 0.3),
        life: Phaser.Math.FloatBetween(0.15, 0.35), c: 0xffffff, s: 1.5,
      });
    }

    // Shake
    if (perfect) {
      this.cameras.main.shake(Math.min(40 + this.combo * 5, 80), Math.min(0.003 + this.combo * 0.0007, 0.009));
    } else if (!good) {
      this.cameras.main.shake(50, 0.003);
    }

    // Ripple on perfect
    if (perfect) {
      const ring = this.add.circle(px + newW / 2, py + SH / 2, 10, 0x00cec9, 0).setDepth(25);
      ring.setStrokeStyle(2, 0x00cec9, 0.5);
      this.tweens.add({ targets: ring, scaleX: 4, scaleY: 4, alpha: 0, duration: 350, onComplete: () => ring.destroy() });
      if (this.combo >= 5) {
        const r2 = this.add.circle(px + newW / 2, py + SH / 2, 8, 0, 0).setDepth(25);
        r2.setStrokeStyle(1.5, 0xffffff, 0.3);
        this.tweens.add({ targets: r2, scaleX: 5, scaleY: 5, alpha: 0, duration: 400, delay: 60, onComplete: () => r2.destroy() });
      }
      if (this.combo >= 8) {
        this.cameras.main.zoom = 1.015;
        this.tweens.add({ targets: this.cameras.main, zoom: 1, duration: 120 });
      }
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

    // Combo tier names
    let label = '', color = '#00cec9';
    if (perfect && this.combo >= 15) { label = 'ASCENDED'; color = '#ffffff'; }
    else if (perfect && this.combo >= 12) { label = 'TRANSCENDENT'; color = '#f0c674'; }
    else if (perfect && this.combo >= 8) { label = 'GODLIKE'; color = '#ffd56e'; }
    else if (perfect && this.combo >= 5) { label = 'BLAZING'; color = '#e17055'; }
    else if (perfect && this.combo >= 3) { label = 'FIRE'; color = '#fdcb6e'; }
    else if (perfect && this.combo > 1) { label = `PERFECT ×${this.combo}`; }
    else if (perfect) { label = 'PERFECT!'; }
    else if (good) { label = 'GOOD'; color = '#ffeaa7'; }
    else { label = 'CLOSE!'; color = '#ff6b6b'; }
    this.comboText.setText(label).setColor(color).setAlpha(1);
    this.tweens.add({ targets: this.comboText, alpha: 0, duration: 450, delay: 250 });

    // Popup
    const ptxt = perfect && this.combo > 1 ? `+${this.combo}` : '+1';
    const pop = this.add.text(px + newW / 2, py - 6, ptxt, {
      fontSize: perfect ? '18px' : '12px', fontFamily: F_HEAD, fontStyle: '700',
      color: perfect ? '#00cec9' : '#dfe6e9',
    }).setOrigin(0.5).setDepth(90);
    this.tweens.add({ targets: pop, y: pop.y - 22, alpha: 0, duration: 350, onComplete: () => pop.destroy() });

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

    const sx = this.slider.x, sy = this.slider.y;
    this.slider.destroy();

    const skin = store.getCurrentSkin();
    const mc = skin.palette[this.score % 8].fg;
    for (let i = 0; i < 10; i++) {
      const frag = this.add.rectangle(
        sx + Phaser.Math.Between(0, this.stairW), sy + Phaser.Math.Between(0, SH),
        Phaser.Math.Between(8, 16), Phaser.Math.Between(5, 12), mc, 0.8,
      ).setDepth(30);
      this.tweens.add({
        targets: frag,
        x: frag.x + Phaser.Math.Between(-80, 80), y: frag.y + Phaser.Math.Between(60, 250),
        rotation: Phaser.Math.FloatBetween(-2, 2), alpha: 0,
        duration: Phaser.Math.Between(350, 600), ease: 'Quad.easeIn',
        onComplete: () => frag.destroy(),
      });
    }

    const { width, height } = this.scale;
    const wf = this.add.rectangle(width / 2, height / 2, width, height, 0xffffff, 0.18).setScrollFactor(0).setDepth(95);
    this.tweens.add({ targets: wf, alpha: 0, duration: 120, onComplete: () => wf.destroy() });
    const rf = this.add.rectangle(width / 2, height / 2, width, height, 0xff0000, 0.08).setScrollFactor(0).setDepth(95);
    this.tweens.add({ targets: rf, alpha: 0, duration: 250, delay: 80, onComplete: () => rf.destroy() });

    this.cameras.main.shake(130, 0.01);
    this.haptic([50, 20, 80]);

    this.time.delayedCall(350, () => {
      this.scene.start('GameOverScene', { score: this.score, bestCombo: this.bestCombo, coins: this.coinsEarned });
    });
  }

  private checkMilestone(score: number, x: number, y: number) {
    const milestones: Record<number, string> = { 10: 'DOUBLE DIGITS', 25: 'QUARTER CENTURY', 50: 'FIFTY', 100: 'CENTURION' };
    const lbl = milestones[score];
    if (!lbl) return;

    const skin = store.getCurrentSkin();
    const count = score >= 50 ? 35 : 20;
    for (let i = 0; i < count; i++) {
      this.ps.push({
        x: x + Phaser.Math.FloatBetween(-20, 20 + this.stairW), y: y - 5,
        vx: Phaser.Math.FloatBetween(-4, 4), vy: Phaser.Math.FloatBetween(-7, -2),
        life: Phaser.Math.FloatBetween(0.5, 1.1),
        c: skin.palette[i % skin.palette.length].fg, s: Phaser.Math.FloatBetween(2, 4.5),
      });
    }

    const { width, height } = this.scale;
    const mt = this.add.text(width / 2, height * 0.35, lbl, {
      fontSize: '18px', fontFamily: F_HEAD, fontStyle: '700', color: '#ffffff', letterSpacing: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(110).setAlpha(0);
    mt.setShadow(0, 2, '#000000', 6, true, true);
    this.tweens.add({ targets: mt, alpha: 1, scaleX: { from: 0.5, to: 1 }, scaleY: { from: 0.5, to: 1 }, duration: 280, ease: 'Back.easeOut' });
    this.tweens.add({ targets: mt, alpha: 0, y: mt.y - 15, duration: 350, delay: 1000, onComplete: () => mt.destroy() });

    if (score >= 50) { this.time.timeScale = 0.15; this.time.delayedCall(8, () => { this.time.timeScale = 1; }); }
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
    const next = getNextTier(this.score);
    if (!next) { this.progressBar.fillStyle(0xff4757, 0.7); this.progressBar.fillRoundedRect(width / 2 - 50, 87, 100, 4, 2); return; }
    const diff = getDifficulty(this.score);
    const p = (this.score - diff.tierStart) / (diff.tierEnd - diff.tierStart);
    const bw = Math.max(3, 100 * p);
    const cols: Record<string, number> = { 'NICE': 0xf0c674, 'FAST': 0xfab1a0, 'HARD': 0xff6b6b, 'INSANE': 0xff4757 };
    this.progressBar.fillStyle(cols[next.name] || 0xa29bfe, 0.6);
    this.progressBar.fillRoundedRect(width / 2 - 50, 87, bw, 4, 2);
  }

  private updateWidthBar() {
    this.widthBar.clear();
    const { width } = this.scale;
    const pct = this.stairW / DEFAULT_SW;
    const bx = width / 2 - 35;
    this.widthBar.fillStyle(0xffffff, 0.04);
    this.widthBar.fillRoundedRect(bx, 95, 70, 3, 1.5);
    const c = pct > 0.6 ? 0x4ecdc4 : pct > 0.35 ? 0xf0c674 : 0xff6b6b;
    this.widthBar.fillStyle(c, 0.5);
    this.widthBar.fillRoundedRect(bx, 95, 70 * pct, 3, 1.5);
  }

  private burst(x: number, y: number, c: number, n: number) {
    for (let i = 0; i < n; i++) {
      this.ps.push({ x, y, vx: Phaser.Math.FloatBetween(-3, 3), vy: Phaser.Math.FloatBetween(-4.5, -1), life: Phaser.Math.FloatBetween(0.4, 0.9), c, s: Phaser.Math.FloatBetween(2, 3.5) });
    }
  }

  private haptic(pattern: number | number[]) {
    try { navigator.vibrate?.(pattern); } catch (_) { /* */ }
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
