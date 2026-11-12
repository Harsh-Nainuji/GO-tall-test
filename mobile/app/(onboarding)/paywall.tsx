import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
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
  CreditCard,
  Sparkles,
  Lock,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useAppStore } from '../../lib/store';
import { openRazorpayCheckout } from '../../lib/razorpay';
import {
  initRevenueCat,
  getRevenueCatOfferings,
  purchaseRevenueCatPackage,
  restoreRevenueCatPurchases,
  isRevenueCatConfigured,
} from '../../lib/revenuecat';
import GlassCard from '../../components/GlassCard';
import GlassButton from '../../components/GlassButton';
import GlassBackgroundCanvas from '../../components/GlassBackgroundCanvas';

export default function PaywallScreen() {
  const router = useRouter();
  const setPremium = useAppStore((state) => state.setPremium);
  const setPaymentOrderId = useAppStore((state) => state.setPaymentOrderId);

  const [tier, setTier] = useState<'annual' | 'quarterly' | 'monthly'>('annual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [rcPackage, setRcPackage] = useState<any>(null);

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
        return { name: 'Annual Clinical Plan', amountPaise: 149900, display: '₹1,499', monthlyEquivalent: '₹125/mo' };
      case 'quarterly':
        return { name: 'Quarterly Plan', amountPaise: 59900, display: '₹599', monthlyEquivalent: '₹200/mo' };
      case 'monthly':
      default:
        return { name: 'Monthly Plan', amountPaise: 29900, display: '₹299', monthlyEquivalent: '₹299/mo' };
    }
  };

  const handlePayment = async () => {
    Haptics.selectionAsync().catch(() => {});
    setIsProcessing(true);

    if (rcPackage) {
      const res = await purchaseRevenueCatPackage(rcPackage);
      if (res.success) {
        setIsProcessing(false);
        setPaymentSuccess(true);
        setPremium(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setTimeout(() => {
          router.replace('/(tabs)/home');
        }, 1200);
        return;
      }
    }

    const plan = getTierPricing();

    openRazorpayCheckout({
      amountPaise: plan.amountPaise,
      planName: plan.name,
      userEmail: 'member@gotall.app',
      userName: 'GoTall Patient',
      onSuccess: (res) => {
        setIsProcessing(false);
        setPaymentSuccess(true);
        setPaymentOrderId(res.razorpay_payment_id);
        setPremium(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

        setTimeout(() => {
          router.replace('/(tabs)/home');
        }, 1200);
      },
      onFailure: (err) => {
        setIsProcessing(false);
        console.warn('Payment dismiss / error:', err);
      },
    });
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
            onPress={() => router.replace('/(tabs)/home')}
            accessibilityLabel="Close paywall"
          >
            <X size={18} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Headline */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>
              Unlock Your Complete{'\n'}Biometric Growth Plan
            </Text>
            <Text style={styles.heroSubtitle}>
              Evidence-based nitrogen retention targets, slow-wave sleep somatotropin optimization, and intervertebral spinal traction routines.
            </Text>
          </View>

          {/* Clinical Benefits Checklist (Glass Cards) */}
          <View style={styles.benefitsList}>
            {[
              {
                title: 'Biological Age-Adjusted Protein Targets',
                sub: 'Calculated using pediatric nitrogen retention benchmarks for bone matrix synthesis.',
              },
              {
                title: 'Slow-Wave Sleep Somatotropin Optimization',
                sub: 'Circadian timing cues aligned to peak slow-wave N3 stage HGH pulsatile release.',
              },
              {
                title: 'Targeted Spinal Decompression Protocols',
                sub: '8 step-by-step spinal exercises to decompress discs and correct posture deficits.',
              },
              {
                title: 'Dr. Jack: 24/7 AI Pediatric Growth Advisor',
                sub: 'Personalized nutritional and biomechanical growth guidance with clinical citations.',
              },
            ].map((b, i) => (
              <GlassCard key={i} style={styles.benefitCard}>
                <View style={styles.benefitIconBox}>
                  <Check size={14} color="#16A34A" strokeWidth={3} />
                </View>
                <View style={styles.benefitTextBox}>
                  <Text style={styles.benefitTitle}>{b.title}</Text>
                  <Text style={styles.benefitSub}>{b.sub}</Text>
                </View>
              </GlassCard>
            ))}
          </View>

          {/* Pricing Tiers Hierarchy */}
          <Text style={styles.tierSectionTitle}>Select Growth Protocol Membership</Text>
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
              activeOpacity={0.85}
            >
              <View style={styles.bestValueBadge}>
                <Text style={styles.bestValueText}>BEST VALUE • SAVE 60%</Text>
              </View>

              <View style={styles.tierLeft}>
                <Text style={styles.tierName}>Annual Clinical Plan</Text>
                <Text style={styles.tierBilling}>₹1,499 billed yearly (₹4.1/day)</Text>
              </View>

              <View style={styles.tierRight}>
                <Text style={styles.tierPrice}>₹125</Text>
                <Text style={styles.tierPeriod}>/month</Text>
              </View>
            </TouchableOpacity>

            {/* Quarterly Plan */}
            <TouchableOpacity
              key="tier-quarterly"
              style={[
                styles.tierCard,
                tier === 'quarterly' ? styles.tierCardActive : styles.tierCardInactive,
              ]}
              onPress={() => {
                setTier('quarterly');
                Haptics.selectionAsync().catch(() => {});
              }}
              activeOpacity={0.85}
            >
              <View style={styles.tierLeft}>
                <Text style={styles.tierName}>Quarterly Plan</Text>
                <Text style={styles.tierBilling}>₹599 billed every 3 months</Text>
              </View>

              <View style={styles.tierRight}>
                <Text style={styles.tierPrice}>₹200</Text>
                <Text style={styles.tierPeriod}>/month</Text>
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
              activeOpacity={0.85}
            >
              <View style={styles.tierLeft}>
                <Text style={styles.tierName}>Monthly Protocol</Text>
                <Text style={styles.tierBilling}>Cancel anytime with 1 tap</Text>
              </View>

              <View style={styles.tierRight}>
                <Text style={styles.tierPrice}>₹299</Text>
                <Text style={styles.tierPeriod}>/month</Text>
              </View>
            </TouchableOpacity>
          </View>

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
                colors={['#2563EB', '#1D4ED8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              {isProcessing ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.ctaButtonText}>
                    Start My 7-Day Growth Trial
                  </Text>
                  <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />
                </>
              )}
            </GlassButton>
          )}

          <Text style={styles.termsDisclaimer}>
            Recurring billing. Cancel anytime from App Store or Play Store subscriptions settings.
          </Text>
        </ScrollView>
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
    marginVertical: 12,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  heroSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  benefitsList: {
    gap: 8,
    marginVertical: 12,
  },
  benefitCard: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  benefitIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(220, 252, 231, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  benefitTextBox: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  benefitSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
    lineHeight: 15,
  },
  tierSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 10,
  },
  tierList: {
    gap: 10,
    marginBottom: 14,
  },
  tierCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  tierCardInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderColor: 'rgba(226, 232, 240, 0.85)',
  },
  tierCardActive: {
    backgroundColor: 'rgba(239, 246, 255, 0.85)',
    borderColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
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
  tierLeft: {
    flex: 1,
    marginRight: 8,
  },
  tierName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  tierBilling: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  tierRight: {
    alignItems: 'flex-end',
  },
  tierPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2563EB',
  },
  tierPeriod: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
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
    height: 54,
    borderRadius: 27,
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
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  successBanner: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  successText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  termsDisclaimer: {
    fontSize: 10,
    fontWeight: '500',
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 14,
    paddingHorizontal: 12,
  },
});
