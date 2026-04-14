import { store } from './Store';
import { ads } from './AdManager';

const REMOVE_ADS_ID = 'com.stackoblock.game.removeads';

let storePlugin: any = null;
let initialized = false;
let readyPromise: Promise<void> | null = null;

export const purchases = {
  async init() {
    if (initialized) return readyPromise ?? Promise.resolve();
    initialized = true;

    readyPromise = (async () => {
      try {
        const CdvPurchase = (window as any).CdvPurchase;
        if (!CdvPurchase) {
          console.warn('[IAP] CdvPurchase not available — running in browser?');
          return;
        }

        storePlugin = CdvPurchase.store;
        console.log('[IAP] Registering product', REMOVE_ADS_ID);

        storePlugin.register([{
          id: REMOVE_ADS_ID,
          type: CdvPurchase.ProductType.NON_CONSUMABLE,
          platform: CdvPurchase.Platform.APPLE_APPSTORE,
        }]);

        storePlugin.when().approved((transaction: any) => {
          console.log('[IAP] Transaction approved', transaction?.products);
          transaction.verify();
        });

        storePlugin.when().verified((receipt: any) => {
          console.log('[IAP] Receipt verified — granting ad-free');
          store.setAdFree();
          ads.removeBanner();
          (window as any).__hideAds?.();
          receipt.finish();
        });

        storePlugin.when().productUpdated((product: any) => {
          console.log('[IAP] productUpdated', product.id, 'owned:', product.owned, 'canPurchase:', product.canPurchase);
          if (product.id === REMOVE_ADS_ID && product.owned) {
            store.setAdFree();
            ads.removeBanner();
            (window as any).__hideAds?.();
          }
        });

        storePlugin.error((err: any) => {
          console.warn('[IAP] store error', err?.code, err?.message);
        });

        console.log('[IAP] initialize()');
        await storePlugin.initialize([CdvPurchase.Platform.APPLE_APPSTORE]);
        console.log('[IAP] update()');
        await storePlugin.update();
        const p = storePlugin.get(REMOVE_ADS_ID);
        console.log('[IAP] init complete, product loaded?', !!p, 'offers:', p?.offers?.length);
      } catch (e) {
        console.warn('[IAP] init failed:', e);
      }
    })();

    return readyPromise;
  },

  /** Buy Remove Ads */
  async buyRemoveAds(): Promise<boolean> {
    if (store.isAdFree()) return true; // already purchased

    try {
      const CdvPurchase = (window as any).CdvPurchase;
      const isNative = !!(window as any).Capacitor?.isNativePlatform?.();
      if (!storePlugin || !CdvPurchase) {
        if (isNative) {
          console.warn('Store not available on native platform');
          return false;
        }
        // Browser-only fallback for local dev/testing
        console.warn('Store not available, simulating purchase (browser dev only)');
        store.setAdFree();
        ads.removeBanner();
        (window as any).__hideAds?.();
        return true;
      }

      // Ensure init finished + product list populated
      if (readyPromise) await readyPromise;

      let product = storePlugin.get(REMOVE_ADS_ID);
      if (!product || !product.getOffer?.()) {
        console.warn('[IAP] Product not ready, calling update() and retrying');
        try { await storePlugin.update(); } catch (e) { console.warn('[IAP] update() failed', e); }
        product = storePlugin.get(REMOVE_ADS_ID);
      }

      if (!product) {
        const msg = 'Product not found. Make sure Paid Apps agreement is signed and you are logged in with a Sandbox tester.';
        console.warn('[IAP]', msg);
        alert(msg);
        return false;
      }

      const offer = product.getOffer();
      if (!offer) {
        console.warn('[IAP] Product exists but no offer', product);
        alert('This product is not available for purchase right now. Please try again later.');
        return false;
      }

      console.log('[IAP] Ordering offer', offer.id);
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
