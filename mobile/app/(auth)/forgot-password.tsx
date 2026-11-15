import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, ArrowLeft, CheckCircle2, Dna } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import GlassCard from '../../components/ui/GlassCard';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../lib/theme';

const DARK_GRADIENT = ['#0F172A', '#1E293B', '#0F172A'] as const;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { sendPasswordReset, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleReset = async () => {
    setLocalError(null);
    clearError();

    if (!email || !email.includes('@')) {
      setLocalError('Please enter a valid email.');
      return;
    }

    Haptics.selectionAsync().catch(() => {});
    const res = await sendPasswordReset(email);

    if (!res.success) {
      setLocalError(res.error || 'Failed to send reset link.');
      return;
    }

    setIsSent(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  const displayedError = localError || error;

  return (
    <LinearGradient colors={DARK_GRADIENT} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Wordmark */}
          <View style={styles.wordmarkSection}>
            <View style={styles.dnaGlow}>
              <LinearGradient
                colors={['#38BDF8', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.dnaGradient}
              >
                <Dna size={28} color="#FFFFFF" strokeWidth={2.2} />
              </LinearGradient>
            </View>
            <Text style={styles.wordmark}>Tollgram</Text>
          </View>

          <View style={styles.titleSection}>
            <Text style={styles.title}>Reset password</Text>
            <Text style={styles.subtitle}>
              Enter your email to receive a reset link.{'\n'}
              We'll send it via our connected Supabase auth service.
            </Text>
          </View>

          {displayedError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{displayedError}</Text>
            </View>
          ) : null}

          {isSent ? (
            <GlassCard style={styles.successCard}>
              <CheckCircle2 size={40} color="#34D399" />
              <Text style={styles.successTitle}>Check your inbox</Text>
              <Text style={styles.successSubtitle}>
                We sent a password reset link to {email}. Tap the link to set a new password.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/sign-in' as any)}
                style={styles.ctaWrapper}
              >
                <LinearGradient
                  colors={['#38BDF8', '#2563EB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ctaGradient}
                >
                  <Text style={styles.ctaText}>Return to Sign In</Text>
                </LinearGradient>
              </TouchableOpacity>
            </GlassCard>
          ) : (
            <GlassCard style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputRow}>
                  <Mail size={18} color="#64748B" />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your registered email"
                    placeholderTextColor="#64748B"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleReset}
                disabled={isLoading}
                activeOpacity={0.85}
                style={styles.ctaWrapper}
              >
                <LinearGradient
                  colors={['#38BDF8', '#2563EB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ctaGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.ctaText}>Send Reset Link</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </GlassCard>
          )}

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Remember your password?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-in' as any)}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 48,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  wordmarkSection: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  dnaGlow: {
    width: 60,
    height: 60,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 18,
    elevation: 10,
  },
  dnaGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.8,
  },
  titleSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    lineHeight: 20,
  },
  errorBanner: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(252, 165, 165, 0.5)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    fontSize: 13,
    color: '#FCA5A5',
    fontWeight: '600',
  },
  formCard: {
    padding: 22,
    gap: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  successCard: {
    padding: 28,
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    padding: 0,
  },
  ctaWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
  },
  ctaGradient: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 28,
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '800',
    color: '#38BDF8',
  },
});
