import Phaser from 'phaser';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';
import { ShopScene } from './scenes/ShopScene';
import { store } from './Store';

// Ad banner — no click to remove, that's in the menu now
const adBanner = document.getElementById('ad-banner');
if (store.isAdFree() && adBanner) {
  adBanner.classList.add('hidden');
}

// Expose hide function for scenes to call
(window as any).__hideAds = () => {
  adBanner?.classList.add('hidden');
};

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#06060c',
  scale: {
    mode: Phaser.Scale.RESIZE,
  },
  scene: [MenuScene, GameScene, GameOverScene, ShopScene],
};

new Phaser.Game(config);
