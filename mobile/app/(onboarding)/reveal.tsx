import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Activity,
  User,
  Shield,
  ArrowRight,
  TrendingUp,
  Zap,
  Moon,
  Dumbbell,
  Sparkles,
  CheckCircle2,
  UserPlus,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAppStore } from '../../lib/store';
import { calculateTarget, cmToFtIn, QuizData } from '../../lib/growth-calc';
import GlassCard from '../../components/GlassCard';
import GlassButton from '../../components/GlassButton';
import GlassBackgroundCanvas from '../../components/GlassBackgroundCanvas';
import StatureCalculationGraph from '../../components/StatureCalculationGraph';
import AuthModal from '../../components/AuthModal';

export default function RevealScreen() {
  const router = useRouter();
  const quizData = useAppStore((state) => state.quizData);
  const user = useAppStore((state) => state.user);
  const [calculationFinished, setCalculationFinished] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authDefaultMode, setAuthDefaultMode] = useState<'signin' | 'signup'>('signup');

  const safeData: QuizData = quizData || {
    gender: 'male',
    age: 17,
    ethnicity: 'Global Population Standard',
    currentHeight: 172.4,
    fatherHeight: 178.0,
    motherHeight: 164.5,
    growthRate: '2 – 5 cm / year',
    shoeSize: 'Increased half size',
    sleepHours: '8 – 10 hours',
    dietType: 'High protein balanced',
    smokeDrink: 'No, never',
    sittingHours: '4 – 8 hrs',
    motivation: 'Maximize my genetic height potential',
    dreamHeight: 182,
    activityLevel: 'Moderate Active',
  };

  const result = calculateTarget(safeData);
  const userCurrentHeight = safeData.currentHeight ?? 172.4;
  const potentialGain = Math.max(0, Math.round((result.target - userCurrentHeight) * 10) / 10);

  return (
    <GlassBackgroundCanvas>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={20} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.headerBadge}>
            <Activity size={14} color="#0284C7" />
            <Text style={styles.headerBadgeText}>GoTall Biometric Model</Text>
            <View style={styles.headerDot} />
          </View>

          <View style={styles.placeholderButton} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Section Title */}
          <View style={styles.titleSection}>
            <View style={styles.methodologyPill}>
              <Text style={styles.methodologyText}>
                Tanner–Whitehouse III Stature Engine
              </Text>
            </View>
            <Text style={styles.subheading}>BIOLOGICAL TRAJECTORY REPORT</Text>
            <Text style={styles.heading}>Your Predicted Adult Stature</Text>
          </View>

          {/* 1. DEDICATED PROGRESSIVE CALCULATION GRAPH */}
          <GlassCard style={styles.graphCard}>
            <StatureCalculationGraph
              currentHeight={userCurrentHeight}
              targetHeight={result.target}
              currentAge={safeData.age ?? 17}
              gender={safeData.gender ?? 'male'}
              onComplete={() => setCalculationFinished(true)}
            />
          </GlassCard>

          {/* 2. STATURE MILESTONE DISPLAY (CASCADES IN) */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <GlassCard style={styles.resultCard}>
              <View style={styles.targetRow}>
                <View>
                  <Text style={styles.cardLabel}>Current Stature</Text>
                  <Text style={styles.currentHeightText}>
                    {userCurrentHeight.toFixed(1)} cm
                  </Text>
                  <Text style={styles.imperialSubtext}>
                    {cmToFtIn(userCurrentHeight)}
                  </Text>
                </View>

                <View style={styles.alignEnd}>
                  <Text style={[styles.cardLabel, styles.accentColor]}>
                    Projected Genetic Ceiling
                  </Text>
                  <Text style={styles.targetHeightText}>
                    {result.target.toFixed(1)} cm
                  </Text>
                  <Text style={[styles.imperialSubtext, styles.accentSubcolor]}>
                    {cmToFtIn(result.target)}
                  </Text>
                </View>
              </View>

              {/* Epiphyseal Remaining Gain Pill */}
              <View style={styles.gainBanner}>
                <View style={styles.gainBannerLeft}>
                  <View style={styles.gainIconWrap}>
                    <TrendingUp size={16} color="#2563EB" />
                  </View>
                  <View>
                    <Text style={styles.gainTitle}>
                      Remaining Epiphyseal Growth Window
                    </Text>
                    <Text style={styles.gainSubtitle}>
                      95% Confidence: {result.rangeMin} – {result.rangeMax} cm
                    </Text>
                  </View>
                </View>

                <View style={styles.gainBadge}>
                  <Text style={styles.gainBadgeText}>
                    +{potentialGain.toFixed(1)} cm
                  </Text>
                </View>
              </View>

              {/* Growth Plate Status Notification */}
              <View
                style={[
                  styles.plateStatusBox,
                  result.platesLikelyClosed
                    ? styles.plateStatusBoxClosed
                    : styles.plateStatusBoxActive,
                ]}
              >
                <Zap
                  size={14}
                  color={result.platesLikelyClosed ? '#D97706' : '#16A34A'}
                />
                <Text
                  style={[
                    styles.plateStatusText,
                    result.platesLikelyClosed
                      ? styles.plateStatusTextClosed
                      : styles.plateStatusTextActive,
                  ]}
                >
                  {result.honestMessage}
                </Text>
              </View>
            </GlassCard>
          </Animated.View>

          {/* 3. THREE BIOLOGICAL ACCELERATION DRIVERS */}
          <Animated.View entering={FadeInDown.delay(350).springify()}>
            <Text style={styles.driversHeadline}>
              3 Biological Protocol Drivers to Maximize Stature
            </Text>

            <View style={styles.driversList}>
              {/* Driver 1 */}
              <GlassCard style={styles.driverCard}>
                <View style={styles.driverIconBox}>
                  <TrendingUp size={18} color="#2563EB" />
                </View>
                <View style={styles.driverTextBox}>
                  <View style={styles.driverTitleRow}>
                    <Text style={styles.driverTitle}>
                      Spinal Intervertebral Decompression
                    </Text>
                    <Text style={styles.driverGainTag}>+1.5 – 2.5 cm</Text>
                  </View>
                  <Text style={styles.driverDescription}>
                    Targeted axial traction relieves daily gravity compression,
                    allowing spinal disc nuclei to rehydrate synovial fluid.
                  </Text>
                </View>
              </GlassCard>

              {/* Driver 2 */}
              <GlassCard style={styles.driverCard}>
                <View style={[styles.driverIconBox, styles.driverIconPurple]}>
                  <Moon size={18} color="#9333EA" />
                </View>
                <View style={styles.driverTextBox}>
                  <View style={styles.driverTitleRow}>
                    <Text style={styles.driverTitle}>
                      Nocturnal Somatotropin (hGH) Peak
                    </Text>
                    <Text style={[styles.driverGainTag, styles.driverGainPurple]}>
                      +2.0 – 3.0 cm
                    </Text>
                  </View>
                  <Text style={styles.driverDescription}>
                    75% of daily human growth hormone is secreted during Stage
                    3/4 Slow-Wave Sleep before midnight.
                  </Text>
                </View>
              </GlassCard>

              {/* Driver 3 */}
              <GlassCard style={styles.driverCard}>
                <View style={[styles.driverIconBox, styles.driverIconOrange]}>
                  <Dumbbell size={18} color="#F97316" />
                </View>
                <View style={styles.driverTextBox}>
                  <View style={styles.driverTitleRow}>
                    <Text style={styles.driverTitle}>
                      Osteoblast Collagen Mineralization
                    </Text>
                    <Text style={[styles.driverGainTag, styles.driverGainOrange]}>
                      +1.0 – 1.5 cm
                    </Text>
                  </View>
                  <Text style={styles.driverDescription}>
                    Adequate amino acids, calcium, and zinc accelerate chondrocyte
                    hypertrophy in long bone epiphyseal plates.
                  </Text>
                </View>
              </GlassCard>
            </View>
          </Animated.View>

          {/* Growth Profile Creation Option */}
          <Animated.View entering={FadeInDown.delay(450).springify()}>
            {user?.isLoggedIn ? (
              <GlassCard style={styles.profileSavedCard}>
                <View style={styles.profileSavedIconWrap}>
                  <CheckCircle2 size={18} color="#10B981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.profileSavedTitle}>Growth Profile Connected</Text>
                  <Text style={styles.profileSavedSub}>
                    Trajectory synced to {user.name || user.email}
                  </Text>
                </View>
              </GlassCard>
            ) : (
              <GlassCard style={styles.createProfileCard}>
                <View style={styles.createProfileHeader}>
                  <View style={styles.createProfileIconWrap}>
                    <UserPlus size={18} color="#0284C7" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.createProfileTitle}>Save Your Growth Profile</Text>
                    <Text style={styles.createProfileSub}>
                      Save your Tanner-Whitehouse trajectory & sync across devices.
                    </Text>
                  </View>
                </View>

                <View style={styles.createProfileButtonsRow}>
                  <TouchableOpacity
                    onPress={() => {
                      setAuthDefaultMode('signup');
                      setAuthModalVisible(true);
                    }}
                    style={styles.signupButton}
                  >
                    <Sparkles size={14} color="#FFFFFF" />
                    <Text style={styles.signupButtonText}>Create Account</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setAuthDefaultMode('signin');
                      setAuthModalVisible(true);
                    }}
                    style={styles.signinButton}
                  >
                    <Text style={styles.signinButtonText}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            )}
          </Animated.View>

          {/* Primary Action Button */}
          <Animated.View entering={FadeInDown.delay(500).springify()}>
            <GlassButton
              onPress={() => router.push('/(onboarding)/details' as any)}
              style={styles.ctaButton}
            >
              <LinearGradient
                colors={['#2563EB', '#1D4ED8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.ctaButtonText}>
                Continue to Account Setup
              </Text>
              <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />
            </GlassButton>
            <Text style={styles.ctaDisclaimer}>
              Based on Tanner-Whitehouse III &amp; WHO Pediatric Percentiles
            </Text>
          </Animated.View>
        </ScrollView>

        <AuthModal
          visible={authModalVisible}
          onClose={() => setAuthModalVisible(false)}
          defaultMode={authDefaultMode}
          onSuccessRedirect="/(tabs)/home"
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  placeholderButton: {
    width: 38,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  titleSection: {
    alignItems: 'center',
    marginVertical: 12,
  },
  methodologyPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 246, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(191, 219, 254, 0.9)',
    marginBottom: 8,
  },
  methodologyText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  subheading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  heading: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginTop: 2,
    textAlign: 'center',
  },
  graphCard: {
    marginBottom: 16,
    padding: 16,
  },
  resultCard: {
    marginBottom: 20,
    padding: 20,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.6)',
    paddingBottom: 16,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  currentHeightText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  targetHeightText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#2563EB',
    marginTop: 2,
  },
  imperialSubtext: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 1,
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  accentColor: {
    color: '#2563EB',
  },
  accentSubcolor: {
    color: '#60A5FA',
  },
  gainBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(239, 246, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(219, 234, 254, 0.85)',
    borderRadius: 16,
    padding: 12,
    marginTop: 14,
  },
  gainBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  gainIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gainTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  gainSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  gainBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  gainBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  plateStatusBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  plateStatusBoxActive: {
    backgroundColor: 'rgba(240, 253, 244, 0.75)',
    borderColor: 'rgba(187, 247, 208, 0.85)',
  },
  plateStatusBoxClosed: {
    backgroundColor: 'rgba(254, 243, 199, 0.75)',
    borderColor: 'rgba(253, 230, 138, 0.85)',
  },
  plateStatusText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  plateStatusTextActive: {
    color: '#15803D',
  },
  plateStatusTextClosed: {
    color: '#92400E',
  },
  driversHeadline: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  driversList: {
    gap: 10,
    marginBottom: 24,
  },
  driverCard: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  driverIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverIconPurple: {
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
  },
  driverIconOrange: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
  },
  driverTextBox: {
    flex: 1,
  },
  driverTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  driverGainTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  driverGainPurple: {
    color: '#9333EA',
  },
  driverGainOrange: {
    color: '#F97316',
  },
  driverDescription: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  createProfileCard: {
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(186, 230, 253, 0.9)',
    backgroundColor: 'rgba(240, 249, 255, 0.85)',
  },
  createProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  createProfileIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createProfileTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  createProfileSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  createProfileButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  signupButton: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#0284C7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  signupButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  signinButton: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signinButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
  profileSavedCard: {
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(240, 253, 244, 0.85)',
    borderColor: 'rgba(187, 247, 208, 0.9)',
    borderWidth: 1,
  },
  profileSavedIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileSavedTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
  },
  profileSavedSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#15803D',
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
  ctaDisclaimer: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
  },
});
