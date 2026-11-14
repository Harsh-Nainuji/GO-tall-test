// ✓ Modal rules applied — GlassCard, ScrollView, 85% maxHeight, SlideInDown
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { CheckCircle2, Lock } from 'lucide-react-native';
import BottomSheet from './ui/BottomSheet';
import { AchievementBadgeItem } from '../lib/store';
import { colors } from '../lib/theme';

interface ExtendedBadge extends AchievementBadgeItem {
  icon_url?: string;
}

interface BadgeModalProps {
  visible: boolean;
  badge: ExtendedBadge | null;
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

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={badge.title}
      subtitle={`${badge.tier.toUpperCase()} Milestone`}
    >
      <View style={styles.container}>
        {/* Badge Icon or Image */}
        <View
          style={[
            styles.iconWrapper,
            isUnlocked ? styles.iconUnlocked : styles.iconLocked,
          ]}
        >
          {badge.icon_url ? (
            <Image
              source={{ uri: badge.icon_url }}
              style={styles.badgeImage}
              contentFit="contain"
              accessibilityLabel={badge.title}
            />
          ) : (
            <Text style={styles.emojiText}>{badge.icon}</Text>
          )}
        </View>

        {/* Description */}
        <Text style={styles.descriptionText}>{badge.description}</Text>

        {/* Requirements */}
        <View style={styles.metricsBox}>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Requirement:</Text>
            <Text style={styles.metricValue}>
              {badge.targetMetric} ≥ {badge.targetValue}
            </Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Reward:</Text>
            <Text style={styles.rewardValue}>+{badge.xpReward} XP</Text>
          </View>
        </View>

        {/* Status Pill */}
        {isUnlocked ? (
          <View style={styles.unlockedPill}>
            <CheckCircle2 size={16} color={colors.green600} />
            <Text style={styles.unlockedPillText}>Unlocked and earned ✓</Text>
          </View>
        ) : (
          <View style={styles.lockedPill}>
            <Lock size={15} color={colors.slate400} />
            <Text style={styles.lockedPillText}>Locked. Complete your daily habits.</Text>
          </View>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginVertical: 4,
  },
  iconUnlocked: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  iconLocked: {
    backgroundColor: colors.slate100,
    borderColor: colors.slate200,
    opacity: 0.6,
  },
  badgeImage: {
    width: 52,
    height: 52,
  },
  emojiText: {
    fontSize: 40,
  },
  descriptionText: {
    fontSize: 13,
    color: colors.slate600,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  metricsBox: {
    width: '100%',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.70)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.90)',
    gap: 6,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: colors.slate400,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate900,
  },
  rewardValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.amber600,
  },
  unlockedPill: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  unlockedPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  lockedPill: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: colors.slate100,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  lockedPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate400,
  },
});
