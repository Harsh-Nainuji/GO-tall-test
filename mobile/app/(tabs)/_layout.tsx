import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Home, Apple, BedDouble, AlignJustify, ListTodo, User } from 'lucide-react-native';
import { useAppStore } from '../../lib/store';

export default function TabLayout() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const isPremium = useAppStore((state) => state.isPremium);
  const hasHydrated = useAppStore((state) => state.hasHydrated);

  // Protected route guard: if user has no account at all, redirect to landing page
  useEffect(() => {
    const hasAccount = Boolean(user?.isLoggedIn || user?.email || user?.id || isPremium);
    if (hasHydrated && !hasAccount) {
      router.replace('/');
    }
  }, [hasHydrated, user, isPremium]);

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
        }}
      />
      <Tabs.Screen
        name="sleep"
        options={{
          title: 'Sleep',
          tabBarIcon: ({ color, size }) => <BedDouble color={color} size={size} strokeWidth={2.3} />,
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
