import Phaser from 'phaser';
import { BLOCK_THEMES } from '../BlockThemes';

export class PreloadScene extends Phaser.Scene {
  constructor() { super({ key: 'PreloadScene' }); }

  preload() {
    // Load all block sprites for all themes
    for (const theme of BLOCK_THEMES) {
      for (let i = 0; i < 8; i++) {
        const key = `block_${theme.id}_${i}`;
        this.load.image(key, `assets/blocks/${theme.id}/${i}.png`);
      }
    }
  }

  create() {
    this.scene.start('MenuScene');
  }
}
