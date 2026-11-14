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
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import GlassCard from '../../components/ui/GlassCard';
import { useAuthStore } from '../../store/authStore';
import { colors, gradients } from '../../lib/theme';

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
    <LinearGradient colors={gradients.canvas} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ArrowLeft size={20} color={colors.slate900} />
          </TouchableOpacity>

          <View style={styles.titleSection}>
            <Text style={styles.title}>Reset password</Text>
            <Text style={styles.subtitle}>Enter your email to receive a password reset link.</Text>
          </View>

          {displayedError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{displayedError}</Text>
            </View>
          )}

          {isSent ? (
            <GlassCard style={styles.successCard}>
              <CheckCircle2 size={36} color={colors.green600} />
              <Text style={styles.successTitle}>Check your inbox</Text>
              <Text style={styles.successSubtitle}>
                We sent a password reset link to {email}. Tap the link to set a new password.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/sign-in' as any)}
                style={styles.submitBtn}
              >
                <Text style={styles.submitBtnText}>Return to Sign In</Text>
              </TouchableOpacity>
            </GlassCard>
          ) : (
            <GlassCard style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputRow}>
                  <Mail size={18} color={colors.slate400} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your registered email"
                    placeholderTextColor={colors.slate400}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleReset}
                disabled={isLoading}
                style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Send Reset Link</Text>
                )}
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.slate900,
  },
  subtitle: {
    fontSize: 14,
    color: colors.slate600,
    marginTop: 6,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '500',
  },
  formCard: {
    padding: 20,
    gap: 16,
  },
  successCard: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.slate900,
    marginTop: 6,
  },
  successSubtitle: {
    fontSize: 13,
    color: colors.slate600,
    textAlign: 'center',
    lineHeight: 18,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate600,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.slate900,
    padding: 0,
  },
  submitBtn: {
    backgroundColor: colors.blue600,
    borderRadius: 16,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: {
    backgroundColor: colors.slate400,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
  },
  footerText: {
    fontSize: 13,
    color: colors.slate600,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.blue600,
  },
});
