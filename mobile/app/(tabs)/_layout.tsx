import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Apple, BedDouble, AlignJustify, User } from 'lucide-react-native';

export default function TabLayout() {
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
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(226, 232, 240, 0.8)',
          elevation: 8,
          shadowColor: '#1e3a8a',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
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
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} strokeWidth={2.3} />,
        }}
      />
    </Tabs>
  );
}
