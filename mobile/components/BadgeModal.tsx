import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { X, Sparkles, Award, CheckCircle2 } from 'lucide-react-native';
import { AchievementBadgeItem } from '../lib/store';

interface BadgeModalProps {
  visible: boolean;
  badge: AchievementBadgeItem | null;
  isUnlocked: boolean;
  onClose: () => void;
}

export default function BadgeModal({
  visible,
  badge,
  isUnlocked,
  onClose,
}: BadgeModalProps) {
  if (!badge) return null;

  const getTierColors = (tier: AchievementBadgeItem['tier']) => {
    switch (tier) {
      case 'gold':
        return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' };
      case 'silver':
        return { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' };
      case 'platinum':
        return { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' };
      case 'bronze':
      default:
        return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    }
  };

  const colors = getTierColors(badge.tier);

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/60 p-6">
        <View className="bg-white rounded-3xl p-6 w-full max-w-sm items-center border border-slate-200 shadow-xl">
          {/* Close button */}
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
          >
            <X size={16} color="#64748B" />
          </TouchableOpacity>

          {/* Badge Icon */}
          <View
            className={`w-20 h-20 rounded-3xl items-center justify-center text-4xl mb-4 border-2 ${
              isUnlocked ? `${colors.bg} ${colors.border}` : 'bg-slate-100 border-slate-200 opacity-60'
            }`}
          >
            <Text className="text-4xl">{badge.icon}</Text>
          </View>

          {/* Tier pill */}
          <View className={`px-2.5 py-0.5 rounded-full border mb-2 ${colors.bg} ${colors.border}`}>
            <Text className={`text-[10px] font-black uppercase tracking-wider ${colors.text}`}>
              {badge.tier} Milestone
            </Text>
          </View>

          {/* Title & Description */}
          <Text className="text-lg font-black text-slate-900 text-center mb-1">
            {badge.title}
          </Text>
          <Text className="text-xs text-slate-500 text-center leading-relaxed mb-4">
            {badge.description}
          </Text>

          {/* Requirements Box */}
          <View className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl mb-4 space-y-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-[11px] text-slate-500 font-medium">Metric Requirement:</Text>
              <Text className="text-xs font-bold text-slate-800">
                {badge.targetMetric} &ge; {badge.targetValue}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-[11px] text-slate-500 font-medium">Milestone Reward:</Text>
              <Text className="text-xs font-bold text-amber-600 flex-row items-center gap-1">
                +{badge.xpReward} XP
              </Text>
            </View>
          </View>

          {/* Status Indicator */}
          {isUnlocked ? (
            <View className="w-full py-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex-row items-center justify-center gap-1.5 mb-2">
              <CheckCircle2 size={16} color="#059669" />
              <Text className="text-xs font-bold text-emerald-800">
                Unlocked & Added to Profile
              </Text>
            </View>
          ) : (
            <View className="w-full py-3 bg-slate-100 rounded-2xl items-center justify-center mb-2">
              <Text className="text-xs font-bold text-slate-500">
                Locked — Progressively Earned Through Habits
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={onClose}
            className="w-full py-3 bg-slate-900 rounded-2xl items-center justify-center mt-2"
          >
            <Text className="text-white text-xs font-black">Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

