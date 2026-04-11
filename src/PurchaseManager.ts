import { store } from './Store';
import { ads } from './AdManager';

const REMOVE_ADS_ID = 'com.stackoblock.game.removeads';

let storePlugin: any = null;
let initialized = false;

export const purchases = {
  async init() {
    if (initialized) return;
    initialized = true;

    try {
      // cordova-plugin-purchase exposes CdvPurchase on window
      const CdvPurchase = (window as any).CdvPurchase;
      if (!CdvPurchase) {
        console.warn('CdvPurchase not available — running in browser?');
        return;
      }

      storePlugin = CdvPurchase.store;

      // Register the product
      storePlugin.register([{
        id: REMOVE_ADS_ID,
        type: CdvPurchase.ProductType.NON_CONSUMABLE,
        platform: CdvPurchase.Platform.APPLE_APPSTORE,
      }]);

      // Handle approved purchases
      storePlugin.when().approved((transaction: any) => {
        // Verify and finish
        transaction.verify();
      });

      storePlugin.when().verified((receipt: any) => {
        // Grant the purchase
        store.setAdFree();
        ads.removeBanner();
        (window as any).__hideAds?.();
        receipt.finish();
        console.log('Remove Ads purchased successfully!');
      });

      // Check if already owned (restore purchases)
      storePlugin.when().productUpdated((product: any) => {
        if (product.id === REMOVE_ADS_ID && product.owned) {
          store.setAdFree();
          ads.removeBanner();
          (window as any).__hideAds?.();
        }
      });

      // Initialize the store
      await storePlugin.initialize([CdvPurchase.Platform.APPLE_APPSTORE]);
      await storePlugin.update();

    } catch (e) {
      console.warn('Purchase init failed:', e);
    }
  },

  /** Buy Remove Ads */
  async buyRemoveAds(): Promise<boolean> {
    if (store.isAdFree()) return true; // already purchased

    try {
      const CdvPurchase = (window as any).CdvPurchase;
      if (!storePlugin || !CdvPurchase) {
        // Fallback for testing — just set ad-free
        console.warn('Store not available, simulating purchase');
        store.setAdFree();
        ads.removeBanner();
        (window as any).__hideAds?.();
        return true;
      }

      const product = storePlugin.get(REMOVE_ADS_ID);
      if (!product) {
        console.warn('Product not found');
        return false;
      }

      const offer = product.getOffer();
      if (!offer) {
        console.warn('No offer available');
        return false;
      }

      await offer.order();
      return true;

    } catch (e) {
      console.warn('Purchase failed:', e);
      return false;
    }
  },

  /** Restore previous purchases */
  async restore(): Promise<boolean> {
    try {
      if (!storePlugin) return false;
      await storePlugin.restorePurchases();
      return store.isAdFree();
    } catch (e) {
      console.warn('Restore failed:', e);
      return false;
    }
  },
};
