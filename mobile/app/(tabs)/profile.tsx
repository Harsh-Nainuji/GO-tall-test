import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Target,
  AlignJustify,
  Apple,
  Moon,
  Activity,
  ShieldCheck,
  Award,
  Flame,
  ChevronRight,
  Sparkles,
  LogIn,
  LogOut,
  CheckCircle2,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useAppStore, AchievementBadgeItem } from '../../lib/store';
import { calculateTarget, cmToFtIn } from '../../lib/growth-calc';
import GlassCard from '../../components/GlassCard';
import GlassButton from '../../components/GlassButton';
import GlassBackgroundCanvas from '../../components/GlassBackgroundCanvas';
import BadgeModal from '../../components/BadgeModal';
import AuthModal from '../../components/AuthModal';
import AppSpotlightTour from '../../components/AppSpotlightTour';

export default function ProfileScreen() {
  const quizData = useAppStore((state) => state.quizData);
  const badges = useAppStore((state) => state.badges);
  const unlockedBadgeIds = useAppStore((state) => state.unlockedBadgeIds);
  const streakDays = useAppStore((state) => state.streakDays);
  const user = useAppStore((state) => state.user);
  const signOut = useAppStore((state) => state.signOut);

  const [selectedBadge, setSelectedBadge] = useState<AchievementBadgeItem | null>(null);
  const [authModalVisible, setAuthModalVisible] = useState<boolean>(false);
  const [tourVisible, setTourVisible] = useState<boolean>(false);

  const safeData = quizData || {
    gender: 'male' as const,
    age: 17,
    ethnicity: 'Global Population Standard',
    currentHeight: 172.4,
    fatherHeight: 178.0,
    motherHeight: 164.5,
    growthRate: '2 – 5 cm / year',
    shoeSize: 9,
    sleepHours: '8 – 10 hours',
    dietType: 'High protein balanced',
    smokeDrink: 'No, never',
    sittingHours: '4 – 8 hrs',
    motivation: 'Maximize my genetic height potential',
    dreamHeight: 182,
    activityLevel: 'Moderate Active',
  };
  const result = calculateTarget(safeData);

  const unlockedCount = unlockedBadgeIds.length;
  const totalBadges = badges.length;

  const goals = [
    {
      title: 'Genetic Potential Target',
      sub: `${result.target.toFixed(1)} cm (${cmToFtIn(result.target)}) projected ceiling`,
      icon: Target,
      color: '#2563EB',
    },
    {
      title: 'Spinal Alignment & Posture',
      sub: 'Reclaim 1.0–2.5 cm disc compression',
      icon: AlignJustify,
      color: '#10B981',
    },
    {
      title: 'Bone Matrix Nutrition',
      sub: 'High protein nitrogen retention & zinc',
      icon: Apple,
      color: '#F97316',
    },
    {
      title: 'Circadian SWS Somatotropin',
      sub: '8–10 hours slow-wave sleep window',
      icon: Moon,
      color: '#8B5CF6',
    },
  ];

  return (
    <GlassBackgroundCanvas>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <Animated.View
          entering={FadeInDown.delay(50).springify()}
          style={styles.headerContainer}
        >
          <View style={styles.brandPill}>
            <Activity size={14} color="#2563EB" />
            <Text style={styles.brandText}>GoTall</Text>
            <View style={styles.onlineDot} />
          </View>

          <View style={styles.streakBadge}>
            <Flame size={14} color="#D97706" />
            <Text style={styles.streakBadgeText}>{streakDays} Day Streak</Text>
          </View>
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* User Bio & Cloud Auth Card */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <GlassCard style={styles.userBioCard}>
              <View style={styles.userBioRow}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitials}>
                    {user?.name
                      ? user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)
                      : 'HM'}
                  </Text>
                </View>

                <View style={styles.userInfoCol}>
                  <View style={styles.userHeaderLine}>
                    <Text style={styles.userName}>
                      {user?.name || 'Harsh Maheshkumar'}
                    </Text>
                    {user?.isLoggedIn && (
                      <View style={styles.verifiedBadge}>
                        <CheckCircle2 size={12} color="#0284C7" />
                        <Text style={styles.verifiedText}>
                          {user.provider === 'google'
                            ? 'Google'
                            : user.provider === 'apple'
                            ? 'Apple'
                            : 'Verified'}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.userSubtitle}>
                    {user?.email
                      ? user.email
                      : `Age ${safeData.age} • Biological Baseline Calibrated`}
                  </Text>

                  <View style={styles.staturePillsRow}>
                    <View style={styles.currentHeightPill}>
                      <Text style={styles.currentHeightPillText}>
                        Current: {(safeData.currentHeight ?? 172.4).toFixed(1)} cm
                      </Text>
                    </View>
                    <View style={styles.targetHeightPill}>
                      <Text style={styles.targetHeightPillText}>
                        Ceiling: {result.target.toFixed(1)} cm
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Cloud Account CTA or Sign Out Button */}
              {user?.isLoggedIn ? (
                <View style={styles.authActionRow}>
                  <TouchableOpacity
                    style={styles.signOutBtn}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      signOut();
                    }}
                    activeOpacity={0.7}
                  >
                    <LogOut size={14} color="#64748B" />
                    <Text style={styles.signOutBtnText}>Sign Out</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.authCtaBox}>
                  <View style={styles.authCtaTextCol}>
                    <Text style={styles.authCtaTitle}>Cloud Synchronization</Text>
                    <Text style={styles.authCtaSub}>
                      Save your growth trajectory and routine logs safely.
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.signInBtn}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setAuthModalVisible(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <LogIn size={13} color="#FFFFFF" />
                    <Text style={styles.signInBtnText}>Sign In / Sign Up</Text>
                  </TouchableOpacity>
                </View>
              )}
            </GlassCard>
          </Animated.View>

          {/* Achievement Badges Section */}
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            style={styles.sectionHeaderRow}
          >
            <View style={styles.sectionTitleWithIcon}>
              <Award size={18} color="#D97706" />
              <Text style={styles.sectionTitle}>Achievement Badges</Text>
            </View>
            <View style={styles.badgeCountPill}>
              <Text style={styles.badgeCountPillText}>
                {unlockedCount} of {totalBadges} Unlocked
              </Text>
            </View>
          </Animated.View>

          {/* Badges Grid (2-column) */}
          <Animated.View entering={FadeInDown.delay(280).springify()} style={styles.badgesGrid}>
            {badges.map((badge) => {
              const isUnlocked = unlockedBadgeIds.includes(badge.id);

              return (
                <GlassButton
                  key={badge.id}
                  onPress={() => setSelectedBadge(badge)}
                  style={styles.badgeItemWrapper}
                >
                  <GlassCard
                    style={[
                      styles.badgeCard,
                      isUnlocked ? styles.badgeCardUnlocked : styles.badgeCardLocked,
                      isUnlocked
                        ? { elevation: 2, shadowColor: '#F59E0B', shadowOpacity: 0.15, shadowRadius: 6 }
                        : undefined,
                    ]}
                  >
                    <View style={styles.badgeTopRow}>
                      <View
                        style={[
                          styles.badgeIconBox,
                          isUnlocked ? styles.badgeIconBoxUnlocked : styles.badgeIconBoxLocked,
                        ]}
                      >
                        <Text style={styles.badgeIconEmoji}>{badge.icon}</Text>
                      </View>

                      <View
                        style={[
                          styles.tierTag,
                          isUnlocked ? styles.tierTagUnlocked : styles.tierTagLocked,
                        ]}
                      >
                        <Text
                          style={[
                            styles.tierTagText,
                            isUnlocked ? styles.tierTagTextUnlocked : styles.tierTagTextLocked,
                          ]}
                        >
                          {badge.tier}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.badgeTextWrap}>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.badgeTitle,
                          isUnlocked ? styles.badgeTitleUnlocked : styles.badgeTitleLocked,
                        ]}
                      >
                        {badge.title}
                      </Text>
                      <Text
                        numberOfLines={2}
                        style={styles.badgeDescription}
                      >
                        {badge.description}
                      </Text>
                    </View>

                    <View style={styles.badgeFooter}>
                      <Text style={styles.badgeXpText}>+{badge.xpReward} XP</Text>
                      <Text
                        style={[
                          styles.badgeStatusText,
                          isUnlocked ? styles.badgeStatusUnlocked : styles.badgeStatusLocked,
                        ]}
                      >
                        {isUnlocked ? 'Unlocked ✓' : 'Locked'}
                      </Text>
                    </View>
                  </GlassCard>
                </GlassButton>
              );
            })}
          </Animated.View>

          {/* Goals / Roadmap Section */}
          <Animated.View
            entering={FadeInDown.delay(360).springify()}
            style={styles.sectionHeaderRow}
          >
            <Text style={styles.sectionTitle}>Your Clinical Growth Roadmap</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(420).springify()} style={styles.goalsListWrap}>
            {goals.map((g, i) => {
              const Icon = g.icon;
              return (
                <GlassCard key={i} style={styles.goalCard}>
                  <View style={styles.goalRow}>
                    <View
                      style={[
                        styles.goalIconWrap,
                        { backgroundColor: `${g.color}15` },
                      ]}
                    >
                      <Icon size={18} color={g.color} />
                    </View>
                    <View style={styles.goalInfoCol}>
                      <Text style={styles.goalTitle}>{g.title}</Text>
                      <Text style={styles.goalSub}>{g.sub}</Text>
                    </View>
                  </View>
                </GlassCard>
              );
            })}
          </Animated.View>

          {/* Interactive Feature Tour Replay Button */}
          <Animated.View entering={FadeInDown.delay(450).springify()}>
            <GlassCard style={styles.tourReplayCard}>
              <View style={styles.tourReplayLeft}>
                <View style={styles.tourReplayIconBadge}>
                  <Sparkles size={16} color="#0284C7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tourReplayTitle}>Interactive Guided Tour</Text>
                  <Text style={styles.tourReplaySub}>
                    Highlights and explains every feature of GoTall step by step.
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.tourReplayBtn}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setTourVisible(true);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.tourReplayBtnText}>Watch Tour</Text>
              </TouchableOpacity>
            </GlassCard>
          </Animated.View>

          {/* Scientific Disclaimer Card */}
          <Animated.View entering={FadeInDown.delay(480).springify()}>
            <GlassCard style={styles.citationCard}>
              <View style={styles.citationRow}>
                <ShieldCheck size={16} color="#2563EB" />
                <Text style={styles.citationText}>
                  All biometrics are calibrated to the Tanner–Whitehouse III model and CDC/WHO stature standards. Zero synthetic claims.
                </Text>
              </View>
            </GlassCard>
          </Animated.View>
        </ScrollView>

        {/* Badge Detail Modal */}
        <BadgeModal
          visible={!!selectedBadge}
          badge={selectedBadge}
          isUnlocked={selectedBadge ? unlockedBadgeIds.includes(selectedBadge.id) : false}
          onClose={() => setSelectedBadge(null)}
        />

        {/* Authentication Modal */}
        <AuthModal
          visible={authModalVisible}
          onClose={() => setAuthModalVisible(false)}
        />

        {/* Guided Feature Walkthrough Tour */}
        <AppSpotlightTour
          visible={tourVisible}
          onClose={() => setTourVisible(false)}
        />
      </SafeAreaView>
    </GlassBackgroundCanvas>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  brandText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(254, 243, 199, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(253, 230, 138, 0.9)',
  },
  streakBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  userBioCard: {
    padding: 18,
    marginVertical: 12,
  },
  userBioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderWidth: 2,
    borderColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2563EB',
  },
  userInfoCol: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  userHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
  },
  authActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.6)',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  signOutBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  authCtaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  authCtaTextCol: {
    flex: 1,
    marginRight: 10,
  },
  authCtaTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0369A1',
  },
  authCtaSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  signInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  signInBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tourReplayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    marginTop: 14,
  },
  tourReplayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  tourReplayIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tourReplayTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0369A1',
  },
  tourReplaySub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  tourReplayBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  tourReplayBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  staturePillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  currentHeightPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 246, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(191, 219, 254, 0.9)',
  },
  currentHeightPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  targetHeightPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(240, 253, 244, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(187, 247, 208, 0.9)',
  },
  targetHeightPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 12,
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  badgeCountPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: 'rgba(254, 243, 199, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(253, 230, 138, 0.9)',
  },
  badgeCountPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  badgeItemWrapper: {
    width: '48%',
  },
  badgeCard: {
    padding: 14,
    borderRadius: 20,
    minHeight: 148,
    justifyContent: 'space-between',
  },
  badgeCardUnlocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderColor: 'rgba(252, 211, 77, 0.8)',
  },
  badgeCardLocked: {
    backgroundColor: 'rgba(248, 250, 252, 0.45)',
    borderColor: 'rgba(226, 232, 240, 0.6)',
    opacity: 0.65,
  },
  badgeTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  badgeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIconBoxUnlocked: {
    backgroundColor: 'rgba(254, 243, 199, 0.9)',
  },
  badgeIconBoxLocked: {
    backgroundColor: 'rgba(241, 245, 249, 0.8)',
  },
  badgeIconEmoji: {
    fontSize: 22,
  },
  tierTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tierTagUnlocked: {
    backgroundColor: 'rgba(254, 243, 199, 0.9)',
  },
  tierTagLocked: {
    backgroundColor: 'rgba(241, 245, 249, 0.8)',
  },
  tierTagText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tierTagTextUnlocked: {
    color: '#92400E',
  },
  tierTagTextLocked: {
    color: '#64748B',
  },
  badgeTextWrap: {
    marginTop: 8,
  },
  badgeTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  badgeTitleUnlocked: {
    color: '#0F172A',
  },
  badgeTitleLocked: {
    color: '#475569',
  },
  badgeDescription: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
    lineHeight: 14,
  },
  badgeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.6)',
  },
  badgeXpText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
  badgeStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgeStatusUnlocked: {
    color: '#15803D',
  },
  badgeStatusLocked: {
    color: '#94A3B8',
  },
  goalsListWrap: {
    gap: 10,
    marginBottom: 20,
  },
  goalCard: {
    padding: 14,
    borderRadius: 18,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalInfoCol: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  goalSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  citationCard: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  citationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  citationText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#475569',
    flex: 1,
    lineHeight: 16,
  },
});
