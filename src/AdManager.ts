import { AdMob, BannerAdSize, BannerAdPosition, BannerAdPluginEvents, AdmobConsentStatus, RewardAdPluginEvents, AdLoadInfo, AdMobRewardItem } from '@capacitor-community/admob';
import { store } from './Store';

const BANNER_ID = 'ca-app-pub-3307486877162157/3234259924';
const REWARDED_ID = 'ca-app-pub-3307486877162157/8384299813';

let initialized = false;
let rewardedResolve: ((watched: boolean) => void) | null = null;
let rewardEarned = false;

export const ads = {
  async init() {
    if (initialized) return;
    initialized = true;

    try {
      await AdMob.initialize({
        initializeForTesting: false,
      });

      // Rewarded event — AdMob may fire this before or after Dismissed.
      // Just flag it; we resolve on Dismissed or FailedToShow so the promise
      // always settles even if Dismissed arrives first.
      AdMob.addListener(RewardAdPluginEvents.Rewarded, (_info: AdMobRewardItem) => {
        rewardEarned = true;
        if (rewardedResolve) { rewardedResolve(true); rewardedResolve = null; rewardEarned = false; }
      });

      AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        if (rewardedResolve) { rewardedResolve(rewardEarned); rewardedResolve = null; rewardEarned = false; }
      });

      AdMob.addListener(RewardAdPluginEvents.FailedToLoad, () => {
        if (rewardedResolve) { rewardedResolve(false); rewardedResolve = null; rewardEarned = false; }
      });

      AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => {
        if (rewardedResolve) { rewardedResolve(rewardEarned); rewardedResolve = null; rewardEarned = false; }
      });

    } catch (e) {
      console.warn('AdMob init failed:', e);
    }
  },

  /** Show banner ad at bottom of screen */
  async showBanner() {
    if (store.isAdFree()) return;
    try {
      await AdMob.showBanner({
        adId: BANNER_ID,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
      });
    } catch (e) {
      console.warn('Banner failed:', e);
    }
  },

  /** Hide banner ad */
  async hideBanner() {
    try {
      await AdMob.hideBanner();
    } catch (_) { /* */ }
  },

  /** Remove banner completely */
  async removeBanner() {
    try {
      await AdMob.removeBanner();
    } catch (_) { /* */ }
  },

  /** Show rewarded ad — returns true if user watched it fully */
  async showRewarded(): Promise<boolean> {
    try {
      rewardEarned = false;
      await AdMob.prepareRewardVideoAd({ adId: REWARDED_ID });

      return new Promise<boolean>((resolve) => {
        rewardedResolve = resolve;
        AdMob.showRewardVideoAd();
        // Safety timeout — resolve with whatever reward state we have so UI never locks
        setTimeout(() => {
          if (rewardedResolve) { rewardedResolve(rewardEarned); rewardedResolve = null; rewardEarned = false; }
        }, 120000);
      });
    } catch (e) {
      console.warn('Rewarded ad failed:', e);
      return false;
    }
  },
};
