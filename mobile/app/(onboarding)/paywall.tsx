import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Check,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Dna,
  Sparkles,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useAppStore } from '../../lib/store';
import {
  initRevenueCat,
  getRevenueCatOfferings,
  purchaseRevenueCatPackage,
  restoreRevenueCatPurchases,
} from '../../lib/revenuecat';
import GlassCard from '../../components/GlassCard';
import GlassButton from '../../components/GlassButton';
import GlassBackgroundCanvas from '../../components/GlassBackgroundCanvas';
import AuthModal from '../../components/AuthModal';

const COMPARISON_ROWS = [
  { feature: 'Dr. Jack AI Growth Chat Quota', free: '5/day', monthly: '20/day', annual: '50/day', lifetime: '100/day' },
  { feature: 'Spinal Decompression Protocol', free: '2 Weeks', monthly: 'Full 6 Wks', annual: 'Full 6 Wks', lifetime: 'Full 6 Wks' },
  { feature: 'Somatotropin (hGH) Pulse Sync', free: false, monthly: true, annual: true, lifetime: true },
  { feature: 'Clinical Bone Nutrition Matrix', free: false, monthly: true, annual: true, lifetime: true },
  { feature: 'Tanner-Whitehouse Biological Calc', free: true, monthly: true, annual: true, lifetime: true },
  { feature: 'AI Pelvic Posture Calibration', free: false, monthly: true, annual: true, lifetime: true },
  { feature: 'Height Trajectory Scans', free: '1 Baseline', monthly: 'Monthly', annual: 'Unlimited', lifetime: 'Unlimited' },
  { feature: 'VIP Priority Cloud Sync', free: false, monthly: true, annual: true, lifetime: true },
  { feature: 'Recurring Charges', free: '$0 Forever', monthly: '$9.99/mo', annual: '$4.99/mo', lifetime: 'Zero (One-Time)' },
];

const PLAN_FEATURES = {
  annual: [
    '50 Dr. Jack AI Growth chats per day',
    'Complete 6-week progressive spinal decompression protocol',
    'Nocturnal Somatotropin (hGH) peak pulse synchronization',
    'Clinical bone mineralization & bedtime casein timing',
    'AI-powered pelvic & cervical posture calibration',
    'Save 50% ($4.99/mo billed $59.99/year)',
  ],
  monthly: [
    '20 Dr. Jack AI Growth chats per day',
    'Complete 6-week progressive spinal decompression protocol',
    'Nocturnal Somatotropin (hGH) peak pulse synchronization',
    'Clinical bone mineralization nutrition matrix',
    'Cancel anytime with zero recurring commitment',
  ],
  lifetime: [
    '100 Dr. Jack AI Growth chats per day',
    'Permanent lifetime access to all 6-week protocols',
    'Nocturnal Somatotropin (hGH) peak pulse synchronization',
    'Clinical bone mineralization & bedtime casein timing',
    'Unlimited height trajectory recalculations forever',
    'One-time payment with zero recurring charges',
  ],
  free: [
    '5 Dr. Jack AI Growth chats per day',
    '2-week baseline spinal decompression routine',
    'Tanner-Whitehouse III biometric calculations',
    'Daily water intake & streak logging',
  ],
};

export default function PaywallScreen() {
  const router = useRouter();
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const setPremium = useAppStore((state) => state.setPremium);
  const pendingRegistration = useAppStore((state) => state.pendingRegistration);
  const user = useAppStore((state) => state.user);
  const completeSubscriptionAndCreateAccount = useAppStore(
    (state) => state.completeSubscriptionAndCreateAccount
  );

  const [tier, setTier] = useState<'annual' | 'monthly' | 'lifetime' | 'free'>('annual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [rcPackage, setRcPackage] = useState<any>(null);

  // If user navigated directly without credentials, guide them back to details first
  React.useEffect(() => {
    if (!pendingRegistration?.email && !user?.isLoggedIn) {
      router.replace('/(onboarding)/details');
    }
  }, [pendingRegistration, user]);

  React.useEffect(() => {
    initRevenueCat()
      .then(() => getRevenueCatOfferings())
      .then((offering) => {
        if (offering && offering.availablePackages.length > 0) {
          setRcPackage(offering.availablePackages[0]);
        }
      })
      .catch(() => {});
  }, []);

  const getTierPricing = () => {
    switch (tier) {
      case 'annual':
        return { id: 'plan_pro_annual', name: 'Tallgrame Pro Annual', display: '$59.99', monthlyEquivalent: '$4.99/mo', chats: '50 chats/day' };
      case 'lifetime':
        return { id: 'plan_lifetime', name: 'Tallgrame Lifetime VIP', display: '$149.99', monthlyEquivalent: 'One-time', chats: '100 chats/day' };
      case 'free':
        return { id: 'plan_free', name: 'Free Starter', display: '$0', monthlyEquivalent: 'Forever', chats: '5 chats/day' };
      case 'monthly':
      default:
        return { id: 'plan_pro_monthly', name: 'Tallgrame Pro Monthly', display: '$9.99', monthlyEquivalent: '$9.99/mo', chats: '20 chats/day' };
    }
  };

  const handlePayment = async () => {
    try {
      Haptics.selectionAsync().catch(() => {});
      setIsProcessing(true);
      setPaymentError(null);

      const plan = getTierPricing();

      // If user selected Free Starter plan, create account immediately without billing
      if (tier === 'free') {
        await completeSubscriptionAndCreateAccount('free_starter', plan.name);
        setIsProcessing(false);
        setPaymentSuccess(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setTimeout(() => {
          router.replace('/(tabs)/home');
        }, 1000);
        return;
      }

      // Find matching package or use available package
      const offerings = await getRevenueCatOfferings();
      const packages = offerings?.availablePackages || [];
      const pkgToBuy =
        packages.find((p: any) =>
          tier === 'annual'
            ? p.identifier.includes('annual') || p.packageType === 'ANNUAL' || p.product?.identifier === 'yearly'
            : tier === 'lifetime'
            ? p.identifier.includes('lifetime') || p.packageType === 'LIFETIME' || p.product?.identifier === 'lifetime'
            : p.identifier.includes('monthly') || p.packageType === 'MONTHLY' || p.product?.identifier === 'monthly'
        ) || rcPackage || packages[0];

      if (pkgToBuy) {
        const res = await purchaseRevenueCatPackage(pkgToBuy);
        if (res.success) {
          await completeSubscriptionAndCreateAccount(
            res.customerInfo?.originalAppUserId || `rc_${Date.now()}`,
            plan.name
          );
          setIsProcessing(false);
          setPaymentSuccess(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          setTimeout(() => {
            router.replace('/(tabs)/home');
          }, 1200);
          return;
        } else {
          setIsProcessing(false);
          setPaymentError('Payment was not completed. Select your plan when ready to activate.');
          return;
        }
      }

      setIsProcessing(false);
      setPaymentError('Payment service temporarily unavailable. Please try again or select Free Starter.');
    } catch (err: any) {
      setIsProcessing(false);
      if (err?.userCancelled) {
        setPaymentError('Payment was cancelled. Your card was not charged.');
        return;
      }
      setPaymentError('Payment could not be completed. Please try again or choose Free Starter.');
    }
  };

  const handleRestore = async () => {
    Haptics.selectionAsync().catch(() => {});
    setIsProcessing(true);
    const res = await restoreRevenueCatPurchases();
    setIsProcessing(false);
    if (res.success) {
      setPremium(true);
      setPaymentSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setTimeout(() => {
        router.replace('/(tabs)/home');
      }, 1000);
    }
  };

  return (
    <GlassBackgroundCanvas>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Floating Close Button */}
        <View style={styles.topBar}>
          <View style={styles.trialPill}>
            <Zap size={12} color="#2563EB" />
            <Text style={styles.trialPillText}>7-DAY SCIENTIFIC TRIAL</Text>
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            accessibilityLabel="Close paywall"
          >
            <X size={18} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Pending Account Notice */}
          {pendingRegistration?.email && (
            <View style={styles.pendingAccountPill}>
              <View style={styles.pendingAccountLeft}>
                <Lock size={14} color="#0284C7" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.pendingAccountLabel}>ACCOUNT READY FOR</Text>
                  <Text style={styles.pendingAccountEmail} numberOfLines={1}>
                    {pendingRegistration.name} ({pendingRegistration.email})
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.editCredentialsButton}
                activeOpacity={0.7}
              >
                <Text style={styles.editCredentialsText}>Edit Details</Text>
              </TouchableOpacity>
            </View>
          )}

          {paymentError && (
            <View style={styles.paymentErrorBanner}>
              <Text style={styles.paymentErrorText}>{paymentError}</Text>
            </View>
          )}

          {/* Hero Headline */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>
              Unlock Your Complete{'\n'}Biometric Growth Plan
            </Text>
            <Text style={styles.heroSubtitle}>
              Evidence-based nitrogen retention targets, slow-wave sleep somatotropin optimization, and intervertebral spinal traction routines.
            </Text>
          </View>

          {/* Pricing Tiers Hierarchy with Detailed Features */}
          <Text style={styles.tierSectionTitle}>Choose Your Plan</Text>
          <View style={styles.tierList}>
            {/* Annual Plan (Featured) */}
            <TouchableOpacity
              key="tier-annual"
              style={[
                styles.tierCard,
                tier === 'annual' ? styles.tierCardActive : styles.tierCardInactive,
              ]}
              onPress={() => {
                setTier('annual');
                Haptics.selectionAsync().catch(() => {});
              }}
              activeOpacity={0.88}
            >
              <View style={styles.bestValueBadge}>
                <Text style={styles.bestValueText}>BEST VALUE • SAVE 50%</Text>
              </View>

              <View style={styles.tierCardHeader}>
                <View style={styles.tierRadio}>
                  {tier === 'annual' && <View style={styles.tierRadioInner} />}
                </View>
                <View style={styles.tierLeft}>
                  <Text style={styles.tierName}>Tallgrame Pro Annual</Text>
                  <Text style={styles.tierBilling}>$59.99 billed yearly ($4.99/mo) • 50 AI chats/day</Text>
                </View>
                <View style={styles.tierRight}>
                  <Text style={styles.tierPrice}>$4.99</Text>
                  <Text style={styles.tierPeriod}>/month</Text>
                </View>
              </View>

              <View style={styles.tierFeatureBox}>
                {PLAN_FEATURES.annual.map((feat, fIdx) => (
                  <View key={fIdx} style={styles.featureLine}>
                    <Check size={13} color="#10B981" strokeWidth={2.5} />
                    <Text style={styles.featureLineText}>{feat}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>

            {/* Monthly Plan */}
            <TouchableOpacity
              key="tier-monthly"
              style={[
                styles.tierCard,
                tier === 'monthly' ? styles.tierCardActive : styles.tierCardInactive,
              ]}
              onPress={() => {
                setTier('monthly');
                Haptics.selectionAsync().catch(() => {});
              }}
              activeOpacity={0.88}
            >
              <View style={[styles.bestValueBadge, { backgroundColor: '#0284C7' }]}>
                <Text style={styles.bestValueText}>FLEXIBLE</Text>
              </View>

              <View style={styles.tierCardHeader}>
                <View style={styles.tierRadio}>
                  {tier === 'monthly' && <View style={styles.tierRadioInner} />}
                </View>
                <View style={styles.tierLeft}>
                  <Text style={styles.tierName}>Tallgrame Pro Monthly</Text>
                  <Text style={styles.tierBilling}>Cancel anytime • 20 AI chats/day</Text>
                </View>
                <View style={styles.tierRight}>
                  <Text style={styles.tierPrice}>$9.99</Text>
                  <Text style={styles.tierPeriod}>/month</Text>
                </View>
              </View>

              <View style={styles.tierFeatureBox}>
                {PLAN_FEATURES.monthly.map((feat, fIdx) => (
                  <View key={fIdx} style={styles.featureLine}>
                    <Check size={13} color="#0284C7" strokeWidth={2.5} />
                    <Text style={styles.featureLineText}>{feat}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>

            {/* Lifetime Plan */}
            <TouchableOpacity
              key="tier-lifetime"
              style={[
                styles.tierCard,
                tier === 'lifetime' ? styles.tierCardActive : styles.tierCardInactive,
              ]}
              onPress={() => {
                setTier('lifetime');
                Haptics.selectionAsync().catch(() => {});
              }}
              activeOpacity={0.88}
            >
              <View style={[styles.bestValueBadge, { backgroundColor: '#8B5CF6' }]}>
                <Text style={styles.bestValueText}>ONE-TIME • VIP</Text>
              </View>

              <View style={styles.tierCardHeader}>
                <View style={styles.tierRadio}>
                  {tier === 'lifetime' && <View style={styles.tierRadioInner} />}
                </View>
                <View style={styles.tierLeft}>
                  <Text style={styles.tierName}>Tallgrame Lifetime VIP</Text>
                  <Text style={styles.tierBilling}>One-time fee • 100 AI chats/day</Text>
                </View>
                <View style={styles.tierRight}>
                  <Text style={[styles.tierPrice, { color: '#7C3AED' }]}>$149.99</Text>
                  <Text style={styles.tierPeriod}>forever</Text>
                </View>
              </View>

              <View style={styles.tierFeatureBox}>
                {PLAN_FEATURES.lifetime.map((feat, fIdx) => (
                  <View key={fIdx} style={styles.featureLine}>
                    <Check size={13} color="#7C3AED" strokeWidth={2.5} />
                    <Text style={styles.featureLineText}>{feat}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>

            {/* Free Starter Plan */}
            <TouchableOpacity
              key="tier-free"
              style={[
                styles.tierCard,
                tier === 'free' ? styles.tierCardActive : styles.tierCardInactive,
              ]}
              onPress={() => {
                setTier('free');
                Haptics.selectionAsync().catch(() => {});
              }}
              activeOpacity={0.88}
            >
              <View style={[styles.bestValueBadge, { backgroundColor: '#64748B' }]}>
                <Text style={styles.bestValueText}>FREE FOREVER</Text>
              </View>

              <View style={styles.tierCardHeader}>
                <View style={styles.tierRadio}>
                  {tier === 'free' && <View style={styles.tierRadioInner} />}
                </View>
                <View style={styles.tierLeft}>
                  <Text style={styles.tierName}>Free Starter</Text>
                  <Text style={styles.tierBilling}>Essential stature tracking • 5 AI chats/day</Text>
                </View>
                <View style={styles.tierRight}>
                  <Text style={[styles.tierPrice, { color: '#64748B' }]}>$0</Text>
                  <Text style={styles.tierPeriod}>forever</Text>
                </View>
              </View>

              <View style={styles.tierFeatureBox}>
                {PLAN_FEATURES.free.map((feat, fIdx) => (
                  <View key={fIdx} style={styles.featureLine}>
                    <Check size={13} color="#64748B" strokeWidth={2.5} />
                    <Text style={styles.featureLineText}>{feat}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          </View>

          {/* Feature Comparison Matrix */}
          <GlassCard style={styles.comparisonCard}>
            <View style={styles.comparisonHeader}>
              <Dna size={16} color="#2563EB" />
              <Text style={styles.comparisonTitle}>Side-by-Side Plan Comparison</Text>
            </View>

            <View style={styles.comparisonTable}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableColHeader, { flex: 2.2 }]}>Feature</Text>
                <Text style={[styles.tableColHeader, { flex: 1, textAlign: 'center' }]}>Free</Text>
                <Text style={[styles.tableColHeader, { flex: 1, textAlign: 'center', color: '#0284C7' }]}>Monthly</Text>
                <Text style={[styles.tableColHeader, { flex: 1, textAlign: 'center', color: '#10B981' }]}>Annual</Text>
                <Text style={[styles.tableColHeader, { flex: 1, textAlign: 'center', color: '#7C3AED' }]}>VIP</Text>
              </View>

              {COMPARISON_ROWS.map((row, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={styles.tableFeatureName} numberOfLines={2}>
                    {row.feature}
                  </Text>
                  <View style={styles.tableIconCell}>
                    {typeof row.free === 'string' ? (
                      <Text style={styles.tableValueText}>{row.free}</Text>
                    ) : row.free ? (
                      <Check size={12} color="#10B981" strokeWidth={2.5} />
                    ) : (
                      <Text style={styles.tableMinusText}>–</Text>
                    )}
                  </View>
                  <View style={styles.tableIconCell}>
                    {typeof row.monthly === 'string' ? (
                      <Text style={[styles.tableValueText, { color: '#0284C7' }]}>{row.monthly}</Text>
                    ) : (
                      <Check size={12} color="#0284C7" strokeWidth={2.5} />
                    )}
                  </View>
                  <View style={styles.tableIconCell}>
                    {typeof row.annual === 'string' ? (
                      <Text style={[styles.tableValueText, { color: '#10B981', fontWeight: '800' }]}>{row.annual}</Text>
                    ) : (
                      <Check size={12} color="#10B981" strokeWidth={2.5} />
                    )}
                  </View>
                  <View style={styles.tableIconCell}>
                    {typeof row.lifetime === 'string' ? (
                      <Text style={[styles.tableValueText, { color: '#7C3AED', fontWeight: '800' }]}>{row.lifetime}</Text>
                    ) : (
                      <Check size={12} color="#7C3AED" strokeWidth={2.5} />
                    )}
                  </View>
                </View>
              ))}
            </View>
          </GlassCard>

          {/* Security & In-App Purchase Guarantee */}
          <View style={styles.trustBanner}>
            <Lock size={13} color="#2563EB" />
            <Text style={styles.trustText}>
              256-Bit Encrypted Payment • Google Play &amp; Apple Store Safety
            </Text>
          </View>

          {/* Primary Action Button */}
          {paymentSuccess ? (
            <View style={styles.successBanner}>
              <Check size={18} color="#FFFFFF" strokeWidth={3} />
              <Text style={styles.successText}>Plan Unlocked! Loading Dashboard...</Text>
            </View>
          ) : (
            <GlassButton
              onPress={handlePayment}
              disabled={isProcessing}
              style={styles.ctaButton}
            >
              <LinearGradient
                colors={tier === 'free' ? ['#0284C7', '#0369A1'] : ['#2563EB', '#1D4ED8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              {isProcessing ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.ctaButtonText}>
                    {tier === 'annual'
                      ? 'Activate Pro Annual • $59.99/yr ($4.99/mo)'
                      : tier === 'monthly'
                      ? 'Activate Pro Monthly • $9.99/mo'
                      : tier === 'lifetime'
                      ? 'Activate Lifetime VIP • $149.99'
                      : 'Activate Free Account (5 AI chats/day)'}
                  </Text>
                  <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />
                </>
              )}
            </GlassButton>
          )}

          <Text style={styles.termsDisclaimer}>
            Recurring billing for monthly/annual plans. Cancel anytime from App Store or Play Store subscriptions. Lifetime plan is a one-time charge.
          </Text>

          {/* Restore / Sign In Row */}
          <View style={styles.restoreRow}>
            <TouchableOpacity onPress={handleRestore} activeOpacity={0.7}>
              <Text style={styles.restoreLinkText}>Restore Purchases</Text>
            </TouchableOpacity>
            <Text style={styles.restoreDivider}>•</Text>
            <TouchableOpacity onPress={() => setIsAuthModalVisible(true)} activeOpacity={0.7}>
              <Text style={styles.restoreLinkText}>Already Subscribed? Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <AuthModal
          visible={isAuthModalVisible}
          onClose={() => setIsAuthModalVisible(false)}
          defaultMode="signin"
          onSuccessRedirect="/(tabs)/home"
        />
      </SafeAreaView>
    </GlassBackgroundCanvas>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trialPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 246, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(191, 219, 254, 0.85)',
  },
  trialPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 0.8,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: 10,
  },
  heroTitle: {
    fontSize: 23,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 29,
  },
  heroSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 17,
    paddingHorizontal: 8,
  },
  tierSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 10,
    marginBottom: 10,
  },
  tierList: {
    gap: 12,
    marginBottom: 14,
  },
  tierCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    position: 'relative',
    gap: 10,
  },
  tierCardInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  tierCardActive: {
    backgroundColor: '#F8FAFC',
    borderColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    right: 18,
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  bestValueText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  tierCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  tierRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  tierLeft: {
    flex: 1,
  },
  tierName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  tierBilling: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  tierRight: {
    alignItems: 'flex-end',
  },
  tierPrice: {
    fontSize: 19,
    fontWeight: '900',
    color: '#2563EB',
  },
  tierPeriod: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tierFeatureBox: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 6,
  },
  featureLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  featureLineText: {
    fontSize: 11,
    color: '#334155',
    flex: 1,
    lineHeight: 15,
  },
  comparisonCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    marginBottom: 14,
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
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tableColHeader: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6.5,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  tableFeatureName: {
    flex: 2.2,
    fontSize: 10.5,
    color: '#475569',
  },
  tableIconCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableValueText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  tableMinusText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '700',
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(239, 246, 255, 0.7)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(219, 234, 254, 0.8)',
    marginBottom: 14,
  },
  trustText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E40AF',
  },
  ctaButton: {
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  successBanner: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  successText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  termsDisclaimer: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
    lineHeight: 14,
  },
  pendingAccountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  pendingAccountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  pendingAccountLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.5,
  },
  pendingAccountEmail: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
    marginTop: 1,
  },
  editCredentialsButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  editCredentialsText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
  },
  paymentErrorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 10,
    marginBottom: 14,
  },
  paymentErrorText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '700',
    textAlign: 'center',
  },
  restoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  restoreLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
  restoreDivider: {
    fontSize: 12,
    color: '#94A3B8',
  },
});
