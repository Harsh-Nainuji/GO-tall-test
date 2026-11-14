import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useAppStore } from '../../lib/store';
import { cmToFtIn, calculateHeightPotential } from '../../lib/growth-calc';
import GlassCard from '../../components/GlassCard';
import GlassButton from '../../components/GlassButton';
import GlassBackgroundCanvas from '../../components/GlassBackgroundCanvas';
import AuthModal from '../../components/AuthModal';

export default function PersonalDetailsScreen() {
  const router = useRouter();
  const quizData = useAppStore((state) => state.quizData);
  const setPendingRegistration = useAppStore((state) => state.setPendingRegistration);
  const pendingRegistration = useAppStore((state) => state.pendingRegistration);

  const [name, setName] = useState(pendingRegistration?.name || '');
  const [email, setEmail] = useState(pendingRegistration?.email || '');
  const [password, setPassword] = useState(pendingRegistration?.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);

  // Calculate target for summary card
  const trajectory = quizData
    ? calculateHeightPotential({
        currentHeight: quizData.currentHeight,
        fatherCm: quizData.fatherCm || quizData.fatherHeight,
        motherCm: quizData.motherCm || quizData.motherHeight,
        gender: quizData.gender,
        age: quizData.age,
        growthPastYear: quizData.growthRate,
        footGrowthStopped: false,
      })
    : null;

  const targetHeight = trajectory?.target || 182.0;

  const handleContinue = () => {
    Haptics.selectionAsync().catch(() => {});
    setErrorMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    // Save pending credentials (account will only be created AFTER successful subscription)
    setPendingRegistration({
      name: trimmedName,
      email: trimmedEmail,
      password,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.push('/(onboarding)/paywall');
  };

  return (
    <GlassBackgroundCanvas>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Top Bar */}
            <View style={styles.topNavRow}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <ChevronLeft size={20} color="#0F172A" />
              </TouchableOpacity>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>STEP 3 OF 4 • ACCOUNT SETUP</Text>
              </View>
              <View style={{ width: 38 }} />
            </View>

            {/* Header */}
            <Animated.View entering={FadeInDown.duration(400)} style={styles.headerBlock}>
              <View style={styles.iconCircle}>
                <User size={24} color="#0284C7" strokeWidth={2.5} />
              </View>
              <Text style={styles.headline}>Personal Details</Text>
              <Text style={styles.subheadline}>
                Save your Tanner-Whitehouse height forecast and link your personalized daily routine.
              </Text>
            </Animated.View>

            {/* Summary Biometrics Pill */}
            {trajectory && (
              <Animated.View entering={FadeInDown.delay(100)} style={styles.summaryCardWrapper}>
                <GlassCard style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <View>
                      <Text style={styles.summaryLabel}>ESTIMATED GENETIC CEILING</Text>
                      <Text style={styles.summaryValue}>
                        {targetHeight.toFixed(1)} cm{' '}
                        <Text style={styles.summaryImperial}>({cmToFtIn(targetHeight)})</Text>
                      </Text>
                    </View>
                    <View style={styles.verifiedPill}>
                      <CheckCircle2 size={13} color="#0284C7" />
                      <Text style={styles.verifiedText}>Calibrated</Text>
                    </View>
                  </View>
                </GlassCard>
              </Animated.View>
            )}

            {/* Form Card */}
            <Animated.View entering={FadeInDown.delay(200)}>
              <GlassCard style={styles.formCard}>
                {errorMessage && (
                  <View style={styles.errorBox}>
                    <AlertCircle size={15} color="#DC2626" />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                )}

                {/* Name Field */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>FULL NAME</Text>
                  <View style={styles.inputWrap}>
                    <User size={18} color="#94A3B8" />
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="e.g. Alex Sharma"
                      placeholderTextColor="#94A3B8"
                      style={styles.input}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                {/* Email Field */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
                  <View style={styles.inputWrap}>
                    <Mail size={18} color="#94A3B8" />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="alex@example.com"
                      placeholderTextColor="#94A3B8"
                      style={styles.input}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Password Field */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>CREATE PASSWORD (MIN 6 CHARACTERS)</Text>
                  <View style={styles.inputWrap}>
                    <Lock size={18} color="#94A3B8" />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="••••••••"
                      placeholderTextColor="#94A3B8"
                      style={styles.input}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      {showPassword ? (
                        <EyeOff size={18} color="#94A3B8" />
                      ) : (
                        <Eye size={18} color="#94A3B8" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Security Guarantee Note */}
                <View style={styles.securityNote}>
                  <ShieldCheck size={14} color="#0284C7" />
                  <Text style={styles.securityNoteText}>
                    Account created and activated upon plan subscription. Your data is protected by Supabase JWT & Row-Level Security.
                  </Text>
                </View>
              </GlassCard>
            </Animated.View>

            {/* Bottom Actions */}
            <Animated.View entering={FadeInUp.delay(300)} style={styles.bottomSection}>
              <GlassButton onPress={handleContinue} style={styles.primaryButton}>
                <LinearGradient
                  colors={['#0284C7', '#2563EB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.primaryButtonText}>Continue to Choose Plan</Text>
                <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />
              </GlassButton>

              {/* Already have an account */}
              <TouchableOpacity
                onPress={() => setIsAuthModalVisible(true)}
                style={styles.signInLink}
                activeOpacity={0.7}
              >
                <Text style={styles.signInLinkText}>
                  Already have an account? <Text style={styles.signInLinkBold}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Existing User Sign In Modal */}
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  stepBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 0.5,
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 18,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E0F2FE',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headline: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subheadline: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    paddingHorizontal: 16,
    fontWeight: '500',
  },
  summaryCardWrapper: {
    marginBottom: 16,
  },
  summaryCard: {
    padding: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  summaryImperial: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
  },
  formCard: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    padding: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  securityNoteText: {
    fontSize: 11,
    color: '#0369A1',
    lineHeight: 15,
    flex: 1,
    fontWeight: '500',
  },
  bottomSection: {
    alignItems: 'center',
    gap: 14,
  },
  primaryButton: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  signInLink: {
    paddingVertical: 6,
  },
  signInLinkText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  signInLinkBold: {
    color: '#0284C7',
    fontWeight: '800',
  },
});

