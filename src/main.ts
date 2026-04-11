import Phaser from 'phaser';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';
import { ShopScene } from './scenes/ShopScene';
import { store } from './Store';
import { ads } from './AdManager';
import { purchases } from './PurchaseManager';

// Initialize AdMob and In-App Purchases
ads.init();
purchases.init();

// Hide HTML ad placeholder if ad-free
const adBanner = document.getElementById('ad-banner');
if (store.isAdFree() && adBanner) {
  adBanner.classList.add('hidden');
}

// Show native AdMob banner (replaces HTML placeholder)
if (!store.isAdFree()) {
  ads.showBanner();
  if (adBanner) adBanner.classList.add('hidden'); // hide HTML placeholder, use native
}

// Expose hide function for scenes to call
(window as any).__hideAds = () => {
  adBanner?.classList.add('hidden');
  ads.removeBanner();
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
