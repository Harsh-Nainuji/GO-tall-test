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
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import GlassCard from '../../components/ui/GlassCard';
import { useAuthStore } from '../../store/authStore';
import { colors, gradients } from '../../lib/theme';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { updatePassword, isLoading, error, clearError } = useAuthStore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleUpdate = async () => {
    setLocalError(null);
    clearError();

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    Haptics.selectionAsync().catch(() => {});
    const res = await updatePassword(password);

    if (!res.success) {
      setLocalError(res.error || 'Password update failed.');
      return;
    }

    setIsSuccess(true);
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
            <Text style={styles.title}>Set new password</Text>
            <Text style={styles.subtitle}>Create a secure password for your account.</Text>
          </View>

          {displayedError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{displayedError}</Text>
            </View>
          )}

          {isSuccess ? (
            <GlassCard style={styles.successCard}>
              <CheckCircle2 size={36} color={colors.green600} />
              <Text style={styles.successTitle}>Password updated</Text>
              <Text style={styles.successSubtitle}>
                Your password has been changed. You can now sign in with your new password.
              </Text>
              <TouchableOpacity
                onPress={() => router.replace('/(auth)/sign-in' as any)}
                style={styles.submitBtn}
              >
                <Text style={styles.submitBtnText}>Sign In</Text>
              </TouchableOpacity>
            </GlassCard>
          ) : (
            <GlassCard style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.inputRow}>
                  <Lock size={18} color={colors.slate400} />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="At least 6 characters"
                    placeholderTextColor={colors.slate400}
                    secureTextEntry={!showPassword}
                    style={styles.input}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOff size={18} color={colors.slate400} />
                    ) : (
                      <Eye size={18} color={colors.slate400} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm New Password</Text>
                <View style={styles.inputRow}>
                  <Lock size={18} color={colors.slate400} />
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Repeat new password"
                    placeholderTextColor={colors.slate400}
                    secureTextEntry={!showPassword}
                    style={styles.input}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleUpdate}
                disabled={isLoading}
                style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </GlassCard>
          )}
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
});
