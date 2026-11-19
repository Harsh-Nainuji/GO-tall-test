import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  ChevronLeft,
  Crown,
  Sparkles,
  Check,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Star,
  Award,
  HeartHandshake,
  ArrowRight,
  Clock,
  Dna,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { useAppStore } from '../lib/store';
import GlassCard from '../components/GlassCard';
import GlassBackgroundCanvas from '../components/GlassBackgroundCanvas';
import { colors } from '../lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PlanDetails {
  id: string;
  name: string;
  tagline: string;
  price: string;
  period: string;
  savings?: string;
  badge?: string;
  badgeColor?: string;
  isPopular?: boolean;
  features: string[];
}

const PLANS: PlanDetails[] = [
  {
    id: 'Free',
    name: 'Free Starter',
    tagline: 'Essential height growth estimation & basic logging',
    price: '$0',
    period: 'forever',
    features: [
      'Tanner-Whitehouse III biological ceiling calculation',
      'Basic weekly spinal decompression routine',
      'Standard circadian sleep log',
      'Daily water intake tracking',
    ],
  },
  {
    id: 'Pro Monthly',
    name: 'Tallgrame Pro Monthly',
    tagline: 'Complete 6-week progressive biomechanical protocol',
    price: '$9.99',
    period: 'per month',
    badge: 'FLEXIBLE',
    badgeColor: '#0284C7',
    features: [
      'Full 6-week progressive spinal elongation protocol',
      'Nocturnal Somatotropin (hGH) secretion peak tracker',
      'Clinical bone mineralization nutrition matrix',
      'AI-powered cervical & pelvic posture calibration',
      'Unlock all achievement badges & XP rewards',
      'Cancel anytime with zero commitment',
    ],
  },
  {
    id: 'Pro Annual',
    name: 'Tallgrame Pro Annual',
    tagline: 'Maximum biological millimeter retention with 50% savings',
    price: '$59.99',
    period: 'per year ($4.99/mo)',
    savings: 'SAVE 50%',
    badge: 'BEST VALUE',
    badgeColor: '#10B981',
    isPopular: true,
    features: [
      'Everything in Pro Monthly included',
      'Save 50% compared to monthly billing',
      'Unlimited stature trajectory recalculations',
      'Parental genetics & epiphyseal plate fusion monitoring',
      'Priority cloud sync & multi-device backup',
      'Exclusive VIP Gold Crown status in profile',
      '7-day risk-free trial guarantee',
    ],
  },
];

const COMPARISON_ROWS = [
  { feature: '6-Week Biomechanical Protocol', free: false, monthly: true, annual: true },
  { feature: 'Somatotropin (hGH) Peak Sync', free: false, monthly: true, annual: true },
  { feature: 'Clinical Nutrition & Casein Timing', free: false, monthly: true, annual: true },
  { feature: 'Tanner-Whitehouse III Calculator', free: true, monthly: true, annual: true },
  { feature: 'AI Pelvic & Cervical Calibration', free: false, monthly: true, annual: true },
  { feature: 'Unlimited Height Trajectory Scans', free: false, monthly: false, annual: true },
  { feature: 'Priority Cross-Device Backup', free: false, monthly: true, annual: true },
];

export default function MembershipScreen() {
  const router = useRouter();

  const isPremium = useAppStore((state) => state.isPremium);
  const subscriptionTier = useAppStore((state) => state.subscriptionTier) || (isPremium ? 'Pro Monthly' : 'Free');
  const setSubscriptionTier = useAppStore((state) => state.setSubscriptionTier);

  const [selectedPlanId, setSelectedPlanId] = useState<string>(subscriptionTier);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    Haptics.selectionAsync().catch(() => {});
    setSelectedPlanId(planId);
  };

  const handleConfirmPlanChange = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setSubscriptionTier(selectedPlanId);

    const planName = PLANS.find((p) => p.id === selectedPlanId)?.name || selectedPlanId;
    setSuccessBanner(`Your plan is now active: ${planName}`);

    setTimeout(() => {
      setSuccessBanner(null);
    }, 3500);
  };

  const isCurrentActive = selectedPlanId === subscriptionTier;

  return (
    <GlassBackgroundCanvas>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ChevronLeft size={20} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Membership &amp; Plan</Text>
            <Text style={styles.headerSubtitle}>Personalized Stature Optimization</Text>
          </View>

          <View style={styles.brandPill}>
            <Crown size={12} color="#D97706" />
            <Text style={styles.brandPillText}>VIP</Text>
          </View>
        </View>

        {successBanner && (
          <Animated.View entering={FadeInDown} style={styles.successBanner}>
            <CheckCircle2 size={16} color="#10B981" />
            <Text style={styles.successBannerText}>{successBanner}</Text>
          </Animated.View>
        )}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Active Plan Summary Card */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <GlassCard style={styles.activeSummaryCard}>
              <View style={styles.activeSummaryHeader}>
                <View style={styles.activeIconWrap}>
                  <Crown size={22} color={isPremium ? '#D97706' : '#64748B'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activeLabel}>CURRENT ACTIVE STATUS</Text>
                  <Text style={styles.activeTierTitle}>{subscriptionTier}</Text>
                </View>
                <View
                  style={[
                    styles.activeStatusPill,
                    isPremium ? styles.activeStatusPillPro : styles.activeStatusPillFree,
                  ]}
                >
                  <Text
                    style={[
                      styles.activeStatusText,
                      isPremium ? styles.activeStatusTextPro : styles.activeStatusTextFree,
                    ]}
                  >
                    {isPremium ? 'VIP UNLOCKED' : 'STANDARD'}
                  </Text>
                </View>
              </View>

              <Text style={styles.activeSummaryDesc}>
                {subscriptionTier === 'Pro Annual'
                  ? 'Your Annual VIP tier is active. You have full access to all 6 weeks of clinical biomechanics, daily Somatotropin pulse synchrony, and priority Tanner-Whitehouse calculations.'
                  : subscriptionTier === 'Pro Monthly'
                  ? 'Your Monthly VIP tier is active. Full 6-week progressive routine and nutritional casein timing are enabled.'
                  : 'You are currently on the Free Starter plan with baseline stature calculations. Upgrade to Pro to unlock the complete clinical growth protocol.'}
              </Text>
            </GlassCard>
          </Animated.View>

          {/* Section: Select a Tier */}
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Choose Your Training Tier</Text>
            <Text style={styles.sectionSubtitle}>
              Upgrade or switch between plans anytime with instant activation
            </Text>
          </View>

          {/* Plan Cards */}
          <View style={styles.plansList}>
            {PLANS.map((plan, index) => {
              const isSelected = selectedPlanId === plan.id;
              const isCurrent = subscriptionTier === plan.id;

              return (
                <Animated.View
                  key={plan.id}
                  entering={FadeInDown.delay(140 + index * 50).springify()}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => handleSelectPlan(plan.id)}
                    style={[
                      styles.planCard,
                      isSelected && styles.planCardSelected,
                      plan.isPopular && !isSelected && styles.planCardPopularBorder,
                    ]}
                  >
                    {/* Best Value or Savings Tag */}
                    {plan.badge && (
                      <View
                        style={[
                          styles.planBadgeTag,
                          { backgroundColor: plan.badgeColor || '#0284C7' },
                        ]}
                      >
                        <Text style={styles.planBadgeTagText}>{plan.badge}</Text>
                      </View>
                    )}

                    <View style={styles.planCardTop}>
                      <View style={styles.planRadio}>
                        {isSelected && <View style={styles.planRadioInner} />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.planNameRow}>
                          <Text style={styles.planNameText}>{plan.name}</Text>
                          {isCurrent && (
                            <View style={styles.currentPlanPill}>
                              <Text style={styles.currentPlanPillText}>ACTIVE</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.planTaglineText}>{plan.tagline}</Text>
                      </View>
                    </View>

                    {/* Price Block */}
                    <View style={styles.priceRow}>
                      <Text style={styles.priceNumber}>{plan.price}</Text>
                      <Text style={styles.pricePeriod}> / {plan.period}</Text>
                      {plan.savings && (
                        <View style={styles.savingsPill}>
                          <Text style={styles.savingsPillText}>{plan.savings}</Text>
                        </View>
                      )}
                    </View>

                    {/* Features List */}
                    <View style={styles.featuresList}>
                      {plan.features.map((feature, fIdx) => (
                        <View key={fIdx} style={styles.featureItem}>
                          <Check size={14} color="#10B981" strokeWidth={2.5} />
                          <Text style={styles.featureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>

          {/* Action Button: Confirm Selection */}
          <Animated.View entering={FadeInUp.delay(260)} style={styles.actionBtnWrapper}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleConfirmPlanChange}
              disabled={isCurrentActive}
              style={[
                styles.confirmPlanBtn,
                isCurrentActive && styles.confirmPlanBtnDisabled,
              ]}
            >
              <LinearGradient
                colors={
                  isCurrentActive
                    ? ['#94A3B8', '#64748B']
                    : selectedPlanId === 'Free'
                    ? ['#64748B', '#475569']
                    : ['#0284C7', '#2563EB']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Sparkles size={16} color="#FFFFFF" />
              <Text style={styles.confirmPlanBtnText}>
                {isCurrentActive
                  ? `${subscriptionTier} is Currently Active`
                  : selectedPlanId === 'Free'
                  ? 'Switch to Free Starter Plan'
                  : `Activate ${selectedPlanId} ⚡`}
              </Text>
              {!isCurrentActive && <ArrowRight size={16} color="#FFFFFF" />}
            </TouchableOpacity>
          </Animated.View>

          {/* Feature Comparison Matrix */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <GlassCard style={styles.comparisonCard}>
              <View style={styles.comparisonHeader}>
                <Dna size={16} color="#2563EB" />
                <Text style={styles.comparisonTitle}>Clinical Tier Comparison</Text>
              </View>

              <View style={styles.comparisonTable}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableColHeader, { flex: 2 }]}>Capability</Text>
                  <Text style={[styles.tableColHeader, { flex: 1, textAlign: 'center' }]}>Free</Text>
                  <Text style={[styles.tableColHeader, { flex: 1, textAlign: 'center', color: '#0284C7' }]}>Pro</Text>
                </View>

                {COMPARISON_ROWS.map((row, idx) => (
                  <View key={idx} style={styles.tableRow}>
                    <Text style={styles.tableFeatureName} numberOfLines={1}>
                      {row.feature}
                    </Text>
                    <View style={styles.tableIconCell}>
                      {row.free ? (
                        <Check size={14} color="#10B981" />
                      ) : (
                        <Text style={styles.tableMinusText}>–</Text>
                      )}
                    </View>
                    <View style={styles.tableIconCell}>
                      <Check size={14} color="#0284C7" strokeWidth={2.5} />
                    </View>
                  </View>
                ))}
              </View>
            </GlassCard>
          </Animated.View>

          {/* Guarantee & Medical Transparency Notice */}
          <Animated.View entering={FadeInDown.delay(350).springify()}>
            <View style={styles.guaranteeCard}>
              <ShieldCheck size={20} color="#059669" />
              <View style={{ flex: 1 }}>
                <Text style={styles.guaranteeTitle}>Clinical Science &amp; Easy Cancellation</Text>
                <Text style={styles.guaranteeText}>
                  All biometrical projections are calibrated to the Tanner-Whitehouse III model and CDC/WHO stature standards.
                  Subscriptions can be canceled or adjusted anytime in your phone settings with zero penalty.
                </Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </GlassBackgroundCanvas>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  brandPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  successBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    gap: 16,
  },
  activeSummaryCard: {
    padding: 18,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  activeSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  activeTierTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 1,
  },
  activeStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  activeStatusPillPro: {
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  activeStatusPillFree: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeStatusText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  activeStatusTextPro: {
    color: '#1D4ED8',
  },
  activeStatusTextFree: {
    color: '#64748B',
  },
  activeSummaryDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  sectionHeading: {
    marginTop: 4,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  plansList: {
    gap: 14,
  },
  planCard: {
    position: 'relative',
    padding: 18,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 12,
    overflow: 'hidden',
  },
  planCardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#F8FAFC',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  planCardPopularBorder: {
    borderColor: '#A7F3D0',
  },
  planBadgeTag: {
    position: 'absolute',
    top: 0,
    right: 24,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  planBadgeTagText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  planCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  planRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  planRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563EB',
  },
  planNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  currentPlanPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  currentPlanPillText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#15803D',
  },
  planTaglineText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingVertical: 4,
  },
  priceNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  pricePeriod: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 2,
  },
  savingsPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 10,
  },
  savingsPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  featuresList: {
    gap: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  featureText: {
    fontSize: 11.5,
    color: '#334155',
    flex: 1,
    lineHeight: 16,
  },
  actionBtnWrapper: {
    marginTop: 4,
  },
  confirmPlanBtn: {
    position: 'relative',
    height: 52,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 4,
  },
  confirmPlanBtnDisabled: {
    opacity: 0.65,
    shadowOpacity: 0,
  },
  confirmPlanBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  comparisonCard: {
    padding: 16,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  comparisonTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  comparisonTable: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tableColHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  tableFeatureName: {
    flex: 2,
    fontSize: 11,
    color: '#475569',
  },
  tableIconCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableMinusText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '700',
  },
  guaranteeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(236, 253, 245, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(167, 243, 208, 0.7)',
  },
  guaranteeTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#065F46',
  },
  guaranteeText: {
    fontSize: 10.5,
    color: '#047857',
    marginTop: 2,
    lineHeight: 15,
  },
});
