import '../global.css';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppStore } from '../lib/store';
import { setupRevenueCatCustomerInfoListener } from '../lib/revenuecat';

export default function RootLayout() {
  const fetchLiveContent = useAppStore((state) => state.fetchLiveContent);

  useEffect(() => {
    // Fetch live content from connected Supabase backend on app mount
    fetchLiveContent().catch(() => {});

    // Sync subscription status with RevenueCat in real-time
    const unsubscribeRC = setupRevenueCatCustomerInfoListener((isPro, customerInfo) => {
      const state = useAppStore.getState();
      const hasActivePaidEntitlement =
        customerInfo?.entitlements?.active &&
        Object.keys(customerInfo.entitlements.active).length > 0;

      // Only upgrade if RevenueCat reports verified active entitlement; never promote Free Starter inadvertently
      if (isPro && hasActivePaidEntitlement) {
        if (!state.isPremium) {
          state.setPremium(true);
        }
      } else if (!isPro) {
        if (state.isPremium && state.activePlanId !== 'plan_lifetime') {
          state.setPremium(false);
        }
      }
    });

    return () => {
      if (typeof unsubscribeRC === 'function') {
        unsubscribeRC();
      }
    };
  }, [fetchLiveContent]);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 280,
        }}
      />
    </SafeAreaProvider>
  );
}

