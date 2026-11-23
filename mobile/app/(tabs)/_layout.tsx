import React, { useEffect, useMemo } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Home, Apple, BedDouble, AlignJustify, ListTodo, User } from 'lucide-react-native';
import { useAppStore } from '../../lib/store';
import { resolvePlanEntitlements } from '../../lib/entitlements';

export default function TabLayout() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const isPremium = useAppStore((state) => state.isPremium);
  const activePlanId = useAppStore((state) => state.activePlanId);
  const subscriptionTier = useAppStore((state) => state.subscriptionTier);
  const liveCatalogPlans = useAppStore((state) => state.liveCatalogPlans);
  const hasHydrated = useAppStore((state) => state.hasHydrated);

  const entitlements = useMemo(() => {
    return resolvePlanEntitlements(activePlanId, isPremium, subscriptionTier, liveCatalogPlans);
  }, [activePlanId, isPremium, subscriptionTier, liveCatalogPlans]);

  // Protected route guard: if user has no account at all, redirect to landing page
  useEffect(() => {
    const isLoggedIn = Boolean(user?.isLoggedIn && (user?.id || user?.email));
    if (hasHydrated && !isLoggedIn) {
      router.replace('/');
    }
  }, [hasHydrated, user?.isLoggedIn, user?.email, user?.id]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          height: 68,
          paddingBottom: 10,
          paddingTop: 8,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          elevation: 4,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.04,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} strokeWidth={2.3} />,
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrition',
          tabBarIcon: ({ color, size }) => <Apple color={color} size={size} strokeWidth={2.3} />,
          tabBarBadge: !entitlements.canAccessClinicalNutrition ? 'PRO' : undefined,
          tabBarBadgeStyle: {
            fontSize: 7.5,
            fontWeight: '800',
            backgroundColor: '#D97706',
            color: '#FFFFFF',
            minWidth: 26,
            height: 14,
            lineHeight: 14,
            borderRadius: 7,
          },
        }}
      />
      <Tabs.Screen
        name="sleep"
        options={{
          title: 'Sleep',
          tabBarIcon: ({ color, size }) => <BedDouble color={color} size={size} strokeWidth={2.3} />,
          tabBarBadge: !entitlements.canAccessSomatotropinSleepSync ? 'PRO' : undefined,
          tabBarBadgeStyle: {
            fontSize: 7.5,
            fontWeight: '800',
            backgroundColor: '#D97706',
            color: '#FFFFFF',
            minWidth: 26,
            height: 14,
            lineHeight: 14,
            borderRadius: 7,
          },
        }}
      />
      <Tabs.Screen
        name="stretches"
        options={{
          title: 'Stretches',
          tabBarIcon: ({ color, size }) => <AlignJustify color={color} size={size} strokeWidth={2.3} />,
        }}
      />
      <Tabs.Screen
        name="todos"
        options={{
          title: 'To-Do',
          tabBarIcon: ({ color, size }) => <ListTodo color={color} size={size} strokeWidth={2.3} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} strokeWidth={2.3} />,
        }}
      />
    </Tabs>
  );
}
