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
import { Mail, Lock, User, Eye, EyeOff, Dna } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import GlassCard from '../../components/ui/GlassCard';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../lib/store';
import { colors } from '../../lib/theme';

const DARK_GRADIENT = ['#0F172A', '#1E293B', '#0F172A'] as const;

export default function SignUpScreen() {
  const router = useRouter();
  const { signUpWithEmail, signInWithOAuth, isLoading, error, clearError } = useAuthStore();
  const setUser = useAppStore((state) => state.setUser);
  const setPremium = useAppStore((state) => state.setPremium);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSignUp = async () => {
    setLocalError(null);
    clearError();

    if (!name.trim()) {
      setLocalError('Please enter your full name.');
      return;
    }
    if (!email || !email.includes('@')) {
      setLocalError('Please enter a valid email.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    Haptics.selectionAsync().catch(() => {});
    const res = await signUpWithEmail(email, password, name);

    if (!res.success) {
      setLocalError(res.error || 'Sign up failed.');
      return;
    }

    setUser({
      id: `user-${Date.now()}`,
      name: name.trim(),
      email,
      provider: 'email',
      isLoggedIn: true,
    });
    setPremium(true);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.replace('/(onboarding)/quiz');
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
          {/* Wordmark */}
          <View style={styles.wordmarkSection}>
            <View style={styles.dnaGlow}>
              <LinearGradient
                colors={['#38BDF8', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.dnaGradient}
              >
                <Dna size={32} color="#FFFFFF" strokeWidth={2.2} />
              </LinearGradient>
            </View>
            <Text style={styles.wordmark}>Tollgram</Text>
          </View>

          {/* Headline */}
          <Text style={styles.headline}>Create your account</Text>

          {/* Form Card */}
          <GlassCard style={styles.formCard}>
            {/* Error banner */}
            {displayedError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{displayedError}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputRow}>
                <User size={18} color="#64748B" />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  placeholderTextColor="#64748B"
                  autoCapitalize="words"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputRow}>
                <Mail size={18} color="#64748B" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#64748B"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputRow}>
                <Lock size={18} color="#64748B" />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 6 characters"
                  placeholderTextColor="#64748B"
                  secureTextEntry={!showPassword}
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  {showPassword ? (
                    <EyeOff size={18} color="#64748B" />
                  ) : (
                    <Eye size={18} color="#64748B" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputRow}>
                <Lock size={18} color="#64748B" />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter your password"
                  placeholderTextColor="#64748B"
                  secureTextEntry={!showConfirmPassword}
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  {showConfirmPassword ? (
                    <EyeOff size={18} color="#64748B" />
                  ) : (
                    <Eye size={18} color="#64748B" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Primary CTA */}
            <TouchableOpacity
              onPress={handleSignUp}
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
                  <Text style={styles.ctaText}>Start your Tollgram journey</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>— or —</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* OAuth */}
            <View style={styles.oauthRow}>
              <TouchableOpacity
                onPress={() => signInWithOAuth('google')}
                style={styles.oauthBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.oauthBtnText}>🇬 Google</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => signInWithOAuth('apple')}
                style={[styles.oauthBtn, styles.oauthBtnApple]}
                activeOpacity={0.8}
              >
                <Text style={[styles.oauthBtnText, { color: '#FFFFFF' }]}>🍎 Apple</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>

          {/* Footer */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-in' as any)}>
              <Text style={styles.footerLink}>Sign in</Text>
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
    paddingTop: 72,
    paddingBottom: 48,
  },
  wordmarkSection: {
    alignItems: 'center',
    marginBottom: 28,
    gap: 14,
  },
  dnaGlow: {
    width: 72,
    height: 72,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 12,
  },
  dnaGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  headline: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: -0.4,
  },
  formCard: {
    padding: 22,
    gap: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  errorBanner: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(252, 165, 165, 0.5)',
    borderRadius: 12,
    padding: 12,
  },
  errorBannerText: {
    fontSize: 13,
    color: '#FCA5A5',
    fontWeight: '600',
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
    marginTop: 4,
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  dividerText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  oauthRow: {
    flexDirection: 'row',
    gap: 12,
  },
  oauthBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  oauthBtnApple: {
    backgroundColor: '#1A1A1A',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  oauthBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
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
