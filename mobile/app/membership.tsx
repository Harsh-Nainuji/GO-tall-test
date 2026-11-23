import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
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
  ArrowRight,
  Dna,
  Receipt,
  CreditCard,
  Calendar,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { useAppStore } from '../lib/store';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import GlassCard from '../components/GlassCard';
import GlassBackgroundCanvas from '../components/GlassBackgroundCanvas';
import {
  getRevenueCatOfferings,
  purchaseRevenueCatPackage,
  PRODUCT_IDS,
  DEFAULT_PLAN_FEATURES,
} from '../lib/revenuecat';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PlanDetails {
  id: string;
  productId: string;
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

interface PaymentHistoryItem {
  id: string;
  plan_name: string;
  amount_paise: number;
  currency: string;
  status: string;
  created_at: string;
  revenuecat_original_transaction_id?: string;
}

const DEFAULT_PLANS: PlanDetails[] = [
  {
    id: 'Free',
    productId: 'free',
    name: 'Free Starter',
    tagline: 'Essential height growth estimation & basic logging',
    price: '$0',
    period: 'forever',
    features: DEFAULT_PLAN_FEATURES.free,
  },
  {
    id: 'Pro Monthly',
    productId: PRODUCT_IDS.MONTHLY,
    name: 'Tallgrame Pro Monthly',
    tagline: 'Complete 6-week progressive biomechanical protocol',
    price: '$9.99',
    period: 'per month',
    badge: 'FLEXIBLE',
    badgeColor: '#0284C7',
    features: DEFAULT_PLAN_FEATURES.monthly,
  },
  {
    id: 'Pro Annual',
    productId: PRODUCT_IDS.YEARLY,
    name: 'Tallgrame Pro Annual',
    tagline: 'Maximum biological millimeter retention with 50% savings',
    price: '$59.99',
    period: 'per year ($4.99/mo)',
    savings: 'SAVE 50%',
    badge: 'BEST VALUE',
    badgeColor: '#10B981',
    isPopular: true,
    features: DEFAULT_PLAN_FEATURES.yearly,
  },
  {
    id: 'Lifetime VIP',
    productId: PRODUCT_IDS.LIFETIME,
    name: 'Tallgrame Lifetime VIP',
    tagline: 'Permanent one-time access with zero recurring fees',
    price: '$149.99',
    period: 'one-time purchase',
    savings: 'LIFETIME ACCESS',
    badge: 'VIP PERMANENT',
    badgeColor: '#8B5CF6',
    features: DEFAULT_PLAN_FEATURES.lifetime,
  },
];

const COMPARISON_ROWS = [
  { feature: '6-Week Biomechanical Protocol', free: false, monthly: true, annual: true, lifetime: true },
  { feature: 'Daily Dr. Jack AI Growth Chat Quota', free: '5/day', monthly: '20/day', annual: '50/day', lifetime: '100/day' },
  { feature: 'Somatotropin (hGH) Peak Sync', free: false, monthly: true, annual: true, lifetime: true },
  { feature: 'Clinical Nutrition & Casein Timing', free: false, monthly: true, annual: true, lifetime: true },
  { feature: 'Tanner-Whitehouse III Calculator', free: true, monthly: true, annual: true, lifetime: true },
  { feature: 'AI Pelvic & Cervical Calibration', free: false, monthly: true, annual: true, lifetime: true },
  { feature: 'Unlimited Height Trajectory Scans', free: false, monthly: false, annual: true, lifetime: true },
  { feature: 'Priority Cloud Backup & Cross-Device Sync', free: false, monthly: true, annual: true, lifetime: true },
  { feature: 'Zero Recurring Fees & Lifetime Updates', free: false, monthly: false, annual: false, lifetime: true },
];

export default function MembershipScreen() {
  const router = useRouter();

  const user = useAppStore((state) => state.user);
  const isPremium = useAppStore((state) => state.isPremium);
  const subscriptionTier = useAppStore((state) => state.subscriptionTier) || (isPremium ? 'Pro Annual' : 'Free');
  const liveCatalogPlans = useAppStore((state) => state.liveCatalogPlans);
  const setPremium = useAppStore((state) => state.setPremium);
  const setSubscriptionTier = useAppStore((state) => state.setSubscriptionTier);

  const [plans, setPlans] = useState<PlanDetails[]>(DEFAULT_PLANS);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(subscriptionTier);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Fetch payment history for authenticated user
  const fetchPaymentHistory = async () => {
    if (!user?.id || !isSupabaseConfigured()) return;
    try {
      setIsLoadingHistory(true);
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data && !error) {
        setPaymentHistory(data as PaymentHistoryItem[]);
      }
    } catch (e) {
      console.warn('Payment history fetch error:', e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchPaymentHistory();
  }, [user?.id]);

  // Load dynamic offerings & prices from RevenueCat
  useEffect(() => {
    getRevenueCatOfferings()
      .then((offering) => {
        if (!offering) return;
        const available = offering.availablePackages || [];
        setPackages(available);

        const metadataFeatures = offering.metadata?.features;

        setPlans((prev) =>
          prev.map((plan) => {
            if (plan.id === 'Free') return plan;

            const matchedPkg = available.find(
              (p: any) =>
                p.product?.identifier === plan.productId ||
                p.identifier.toLowerCase().includes(plan.productId) ||
                (plan.productId === PRODUCT_IDS.MONTHLY && p.packageType === 'MONTHLY') ||
                (plan.productId === PRODUCT_IDS.YEARLY && p.packageType === 'ANNUAL') ||
                (plan.productId === PRODUCT_IDS.LIFETIME && p.packageType === 'LIFETIME')
            );

            if (!matchedPkg) return plan;

            const dynamicPrice = matchedPkg.product?.priceString || plan.price;
            const dynamicFeatures =
              (metadataFeatures as Record<string, string[]> | undefined)?.[plan.productId] || plan.features;

            return {
              ...plan,
              price: dynamicPrice,
              features: dynamicFeatures,
            };
          })
        );
      })
      .catch((err) => {
        console.warn('RevenueCat offering load error:', err);
      });
  }, []);

  // Sync with Admin Studio live plans if present in store
  useEffect(() => {
    if (liveCatalogPlans && liveCatalogPlans.length > 0) {
      setPlans((prev) =>
        prev.map((plan) => {
          const matched = liveCatalogPlans.find((lp) =>
            plan.id === 'Free'
              ? lp.id.includes('free')
              : plan.id === 'Pro Monthly'
              ? lp.id.includes('monthly')
              : plan.id === 'Pro Annual'
              ? lp.id.includes('annual')
              : lp.id.includes('lifetime')
          );
          if (matched) {
            return {
              ...plan,
              price: matched.priceUsd > 0 ? `$${matched.priceUsd}` : '$0',
              tagline: matched.tagline || plan.tagline,
              features:
                matched.marketingFeatures && matched.marketingFeatures.length > 0
                  ? matched.marketingFeatures
                  : plan.features,
            };
          }
          return plan;
        })
      );
    }
  }, [liveCatalogPlans]);

  const handleSelectPlan = (planId: string) => {
    Haptics.selectionAsync().catch(() => {});
    setSelectedPlanId(planId);
  };

  const handleConfirmPlanPurchase = async () => {
    try {
      Haptics.selectionAsync().catch(() => {});
      setIsLoading(true);

      if (selectedPlanId === 'Free') {
        setPremium(false);
        setSubscriptionTier('Free Starter');
        if (user?.id && isSupabaseConfigured()) {
          try {
            await supabase.from('profiles').update({
              active_plan_id: 'plan_free',
              subscription_tier: 'Free Starter',
              is_premium: false,
            }).eq('user_id', user.id);
          } catch {}
        }
        setIsLoading(false);
        setSuccessBanner('Switched to Free Starter plan.');
        setTimeout(() => setSuccessBanner(null), 3000);
        return;
      }

      const plan = plans.find((p) => p.id === selectedPlanId);
      const pkgToBuy =
        packages.find(
          (p: any) =>
            p.product?.identifier === plan?.productId ||
            p.identifier.toLowerCase().includes(plan?.productId || '')
        ) || packages[0];

      if (pkgToBuy) {
        const res = await purchaseRevenueCatPackage(pkgToBuy);
        if (res.success) {
          const activePlanTitle = plan?.name || selectedPlanId;
          setPremium(true);
          setSubscriptionTier(activePlanTitle);

          // Update user profile and record payment in database
          if (user?.id && isSupabaseConfigured()) {
            const planId =
              selectedPlanId === 'Pro Monthly'
                ? 'plan_pro_monthly'
                : selectedPlanId === 'Pro Annual'
                ? 'plan_pro_annual'
                : selectedPlanId === 'Lifetime VIP'
                ? 'plan_lifetime'
                : 'plan_free';

            const amountPaise =
              selectedPlanId === 'Pro Annual'
                ? 5999
                : selectedPlanId === 'Lifetime VIP'
                ? 14999
                : 999;

            const txnId = res.customerInfo?.originalAppUserId || `rc_tx_${Date.now()}`;

            try {
              await supabase
                .from('profiles')
                .update({
                  active_plan_id: planId,
                  subscription_tier: activePlanTitle,
                  is_premium: true,
                })
                .eq('user_id', user.id);
            } catch {}

            try {
              await supabase
                .from('payments')
                .insert({
                  user_id: user.id,
                  revenuecat_original_transaction_id: txnId,
                  plan_name: activePlanTitle,
                  amount_paise: amountPaise,
                  currency: 'USD',
                  status: 'success',
                });
            } catch {}

            fetchPaymentHistory();
          }

          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          setSuccessBanner(`VIP Unlocked: ${activePlanTitle}!`);
          setTimeout(() => setSuccessBanner(null), 3500);
          setIsLoading(false);
          return;
        }
      }

      setIsLoading(false);
      Alert.alert(
        'Purchase Incomplete',
        'Could not complete purchase. Please verify your payment details and try again.',
        [{ text: 'OK' }]
      );
      return;
    } catch (err: any) {
      console.warn('Purchase error:', err);
      setIsLoading(false);
      Alert.alert('Subscription Notice', err?.message || 'Could not complete transaction.');
    }
  };

  const isCurrentActive =
    selectedPlanId === subscriptionTier ||
    (selectedPlanId === 'Pro Annual' && subscriptionTier.includes('Annual')) ||
    (selectedPlanId === 'Pro Monthly' && subscriptionTier.includes('Monthly')) ||
    (selectedPlanId === 'Lifetime VIP' && subscriptionTier.includes('Lifetime')) ||
    (selectedPlanId === 'Free' && !isPremium);

  const formatPaymentDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <GlassBackgroundCanvas>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
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
                  <Text style={styles.activeLabel}>CURRENT ACTIVE PLAN</Text>
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
                    {isPremium ? 'ACTIVE' : 'STANDARD'}
                  </Text>
                </View>
              </View>

              <Text style={styles.activeSummaryDesc}>
                {subscriptionTier.includes('Lifetime')
                  ? 'Your Lifetime VIP access is permanently active. Unrestricted access to all 6-week progressive routines, nocturnal Somatotropin sync, and priority AI coaching with zero recurring charges.'
                  : subscriptionTier.includes('Annual')
                  ? 'Your Annual VIP tier is active. Full access to all 6 weeks of clinical biomechanics, daily Somatotropin pulse synchrony, and priority 50 daily AI chats.'
                  : subscriptionTier.includes('Monthly')
                  ? 'Your Monthly VIP tier is active. Full 6-week progressive routine, nutritional casein timing, and 20 daily AI chats are enabled.'
                  : 'You are currently on the Free Starter plan with baseline stature calculations and 5 daily AI queries. Select a plan below to upgrade.'}
              </Text>
            </GlassCard>
          </Animated.View>

          {/* Section: Select a Tier */}
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Upgrade or Change Plan</Text>
            <Text style={styles.sectionSubtitle}>
              Select your preferred tier and tap activate to apply immediately
            </Text>
          </View>

          {/* Plan Cards */}
          <View style={styles.plansList}>
            {plans.map((plan, index) => {
              const isSelected = selectedPlanId === plan.id;
              const isCurrent =
                subscriptionTier === plan.name ||
                subscriptionTier === plan.id ||
                (plan.id === 'Free' && !isPremium);

              return (
                <Animated.View
                  key={plan.id}
                  entering={FadeInDown.delay(140 + index * 40).springify()}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => handleSelectPlan(plan.id)}
                    style={[
                      styles.planCard,
                      isSelected && styles.planCardSelected,
                      plan.isPopular && !isSelected && styles.planCardPopularBorder,
                      plan.id === 'Lifetime VIP' && !isSelected && styles.planCardLifetimeBorder,
                    ]}
                  >
                    {/* Badge Tag */}
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
                              <Text style={styles.currentPlanPillText}>CURRENT</Text>
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
                        <View
                          style={[
                            styles.savingsPill,
                            plan.id === 'Lifetime VIP' && { backgroundColor: '#EDE9FE' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.savingsPillText,
                              plan.id === 'Lifetime VIP' && { color: '#6D28D9' },
                            ]}
                          >
                            {plan.savings}
                          </Text>
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
              onPress={handleConfirmPlanPurchase}
              disabled={isLoading || isCurrentActive}
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
                    : selectedPlanId === 'Lifetime VIP'
                    ? ['#7C3AED', '#4C1D95']
                    : ['#0284C7', '#2563EB']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Sparkles size={16} color="#FFFFFF" />
                  <Text style={styles.confirmPlanBtnText}>
                    {isCurrentActive
                      ? `${subscriptionTier} is Currently Active`
                      : selectedPlanId === 'Free'
                      ? 'Switch to Free Starter Plan'
                      : selectedPlanId === 'Lifetime VIP'
                      ? 'Upgrade to Lifetime VIP Access'
                      : `Activate ${selectedPlanId}`}
                  </Text>
                  {!isCurrentActive && <ArrowRight size={16} color="#FFFFFF" />}
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Feature Comparison Matrix */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <GlassCard style={styles.comparisonCard}>
              <View style={styles.comparisonHeader}>
                <Dna size={16} color="#2563EB" />
                <Text style={styles.comparisonTitle}>Plan Comparison Matrix</Text>
              </View>

              <View style={styles.comparisonTable}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableColHeader, { flex: 2.2 }]}>Capability</Text>
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
          </Animated.View>

          {/* Payment History Section */}
          <Animated.View entering={FadeInDown.delay(350).springify()}>
            <GlassCard style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Receipt size={16} color="#0F172A" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyTitle}>Payment History</Text>
                  <Text style={styles.historySubtitle}>Past purchases and subscription charges</Text>
                </View>
              </View>

              {isLoadingHistory ? (
                <View style={styles.historyLoadingWrap}>
                  <ActivityIndicator size="small" color="#2563EB" />
                </View>
              ) : paymentHistory.length === 0 ? (
                <View style={styles.historyEmptyWrap}>
                  <CreditCard size={28} color="#94A3B8" />
                  <Text style={styles.historyEmptyTitle}>No Previous Invoices</Text>
                  <Text style={styles.historyEmptySub}>
                    When you subscribe or upgrade, your transaction receipts and invoices will appear here.
                  </Text>
                </View>
              ) : (
                <View style={styles.historyList}>
                  {paymentHistory.map((item) => {
                    const displayAmount =
                      item.currency === 'USD'
                        ? `$${(item.amount_paise / 100).toFixed(2)}`
                        : `₹${(item.amount_paise / 100).toFixed(0)}`;

                    return (
                      <View key={item.id} style={styles.historyItemRow}>
                        <View style={styles.historyItemLeft}>
                          <Text style={styles.historyItemPlan}>{item.plan_name}</Text>
                          <View style={styles.historyItemMeta}>
                            <Calendar size={11} color="#64748B" />
                            <Text style={styles.historyItemDate}>{formatPaymentDate(item.created_at)}</Text>
                            {item.revenuecat_original_transaction_id && (
                              <Text style={styles.historyTxnId}>
                                • ID: {item.revenuecat_original_transaction_id.slice(-8)}
                              </Text>
                            )}
                          </View>
                        </View>
                        <View style={styles.historyItemRight}>
                          <Text style={styles.historyItemAmount}>{displayAmount}</Text>
                          <View style={styles.historyStatusPill}>
                            <CheckCircle2 size={10} color="#059669" />
                            <Text style={styles.historyStatusText}>
                              {item.status?.toUpperCase() || 'COMPLETED'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </GlassCard>
          </Animated.View>

          {/* Guarantee Notice */}
          <Animated.View entering={FadeInDown.delay(380).springify()}>
            <View style={styles.guaranteeCard}>
              <ShieldCheck size={20} color="#059669" />
              <View style={{ flex: 1 }}>
                <Text style={styles.guaranteeTitle}>Secure Billing &amp; Privacy Guarantee</Text>
                <Text style={styles.guaranteeText}>
                  All payments are processed securely with 256-bit encryption. Subscriptions can be managed or cancelled at any time directly through your app store settings.
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
    gap: 10,
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
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
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
    color: '#15803D',
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
  planCardLifetimeBorder: {
    borderColor: '#DDD6FE',
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
    paddingTop: 8,
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
    fontSize: 9.5,
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
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
  },
  tableMinusText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '700',
  },
  historyCard: {
    padding: 18,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  historySubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  historyLoadingWrap: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  historyEmptyWrap: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  historyEmptyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 4,
  },
  historyEmptySub: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 15,
  },
  historyList: {
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  historyItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  historyItemLeft: {
    flex: 1,
    gap: 3,
  },
  historyItemPlan: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  historyItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyItemDate: {
    fontSize: 11,
    color: '#64748B',
  },
  historyTxnId: {
    fontSize: 11,
    color: '#94A3B8',
  },
  historyItemRight: {
    alignItems: 'flex-end',
    gap: 3,
  },
  historyItemAmount: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  historyStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  historyStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
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
