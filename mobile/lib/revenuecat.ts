import { Platform } from 'react-native';
import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  PurchasesOffering,
  LOG_LEVEL,
} from 'react-native-purchases';

export const REVENUECAT_API_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_KEY ||
  process.env.NEXT_PUBLIC_REVENUECAT_KEY ||
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ||
  '';

export const ENTITLEMENT_ID = 'pro_access';

let isInitialized = false;

/**
 * Returns whether RevenueCat is configured with a valid API key
 */
export const isRevenueCatConfigured = (): boolean => {
  return (
    !!REVENUECAT_API_KEY &&
    !REVENUECAT_API_KEY.includes('your-revenuecat') &&
    REVENUECAT_API_KEY.startsWith('test_') || REVENUECAT_API_KEY.startsWith('goog_') || REVENUECAT_API_KEY.startsWith('appl_')
  );
};

/**
 * Initializes RevenueCat SDK with the live API key
 */
export async function initRevenueCat(userId?: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    // Native in-app purchases SDK is not active on web browsers
    return false;
  }

  if (isInitialized) {
    if (userId) {
      try {
        await Purchases.logIn(userId);
      } catch (e) {
        console.warn('RevenueCat logIn error:', e);
      }
    }
    return true;
  }

  try {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
      appUserID: userId || null,
    });
    isInitialized = true;
    return true;
  } catch (error) {
    console.warn('RevenueCat configuration error:', error);
    return false;
  }
}

/**
 * Retrieves available offerings (packages/paywalls) from RevenueCat
 */
export async function getRevenueCatOfferings(): Promise<PurchasesOffering | null> {
  if (Platform.OS === 'web' || !isRevenueCatConfigured()) {
    return null;
  }

  try {
    await initRevenueCat();
    const offerings = await Purchases.getOfferings();
    if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
      return offerings.current;
    }
    return null;
  } catch (error) {
    console.warn('Error fetching RevenueCat offerings:', error);
    return null;
  }
}

/**
 * Purchases a package through RevenueCat
 */
export async function purchaseRevenueCatPackage(
  pkg: PurchasesPackage
): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: any }> {
  if (Platform.OS === 'web') {
    return { success: false, error: 'Web purchases not supported via native in-app purchases' };
  }

  try {
    await initRevenueCat();
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isPro =
      typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined' ||
      Object.keys(customerInfo.entitlements.active).length > 0;

    return { success: isPro, customerInfo };
  } catch (error: any) {
    if (error.userCancelled) {
      return { success: false, error: 'User cancelled transaction' };
    }
    console.warn('RevenueCat purchase error:', error);
    return { success: false, error };
  }
}

/**
 * Restores previous purchases
 */
export async function restoreRevenueCatPurchases(): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
}> {
  if (Platform.OS === 'web') {
    return { success: false };
  }

  try {
    await initRevenueCat();
    const customerInfo = await Purchases.restorePurchases();
    const isPro =
      typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined' ||
      Object.keys(customerInfo.entitlements.active).length > 0;

    return { success: isPro, customerInfo };
  } catch (error) {
    console.warn('RevenueCat restore error:', error);
    return { success: false };
  }
}

