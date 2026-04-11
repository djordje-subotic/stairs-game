import { AdMob, BannerAdSize, BannerAdPosition, BannerAdPluginEvents, AdmobConsentStatus, RewardAdPluginEvents, AdLoadInfo, AdMobRewardItem } from '@capacitor-community/admob';
import { store } from './Store';

const BANNER_ID = 'ca-app-pub-3307486877162157/3234259924';
const REWARDED_ID = 'ca-app-pub-3307486877162157/8384299813';

let initialized = false;
let rewardedResolve: ((watched: boolean) => void) | null = null;

export const ads = {
  async init() {
    if (initialized) return;
    initialized = true;

    try {
      await AdMob.initialize({
        initializeForTesting: false,
      });

      // Listen for rewarded ad events
      AdMob.addListener(RewardAdPluginEvents.Rewarded, (_info: AdMobRewardItem) => {
        // User watched the full ad — grant continue
        if (rewardedResolve) { rewardedResolve(true); rewardedResolve = null; }
      });

      AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        // Ad dismissed without completing — no reward
        if (rewardedResolve) { rewardedResolve(false); rewardedResolve = null; }
      });

      AdMob.addListener(RewardAdPluginEvents.FailedToLoad, () => {
        if (rewardedResolve) { rewardedResolve(false); rewardedResolve = null; }
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
      await AdMob.prepareRewardVideoAd({ adId: REWARDED_ID });

      return new Promise<boolean>((resolve) => {
        rewardedResolve = resolve;
        AdMob.showRewardVideoAd();
        // Timeout fallback — if no event fires in 60s, assume failed
        setTimeout(() => {
          if (rewardedResolve) { rewardedResolve(false); rewardedResolve = null; }
        }, 60000);
      });
    } catch (e) {
      console.warn('Rewarded ad failed:', e);
      return false;
    }
  },
};
