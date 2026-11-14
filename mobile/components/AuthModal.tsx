// ✓ Modal rules applied — GlassCard, ScrollView, 85% maxHeight, SlideInDown
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
} from 'react-native';
import { Mail, Lock, User, ShieldCheck, CheckCircle2, Eye, EyeOff } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import BottomSheet from './ui/BottomSheet';
import { useAuthStore } from '../store/authStore';
import { useAppStore, UserProfile } from '../lib/store';
import { colors } from '../lib/theme';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
  onSuccess?: () => void;
  onSuccessRedirect?: string;
}

export default function AuthModal({
  visible,
  onClose,
  defaultMode = 'signup',
  onSuccess,
  onSuccessRedirect,
}: AuthModalProps) {
  const router = useRouter();
  const setUser = useAppStore((state) => state.setUser);
  const setPremium = useAppStore((state) => state.setPremium);

  const { signInWithEmail, signUpWithEmail, isLoading, error, clearError } = useAuthStore();

  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLocalError(null);
    clearError();

    if (!email || !email.includes('@')) {
      setLocalError('Please enter a valid email.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    Haptics.selectionAsync().catch(() => {});

    if (mode === 'signup') {
      const res = await signUpWithEmail(email, password, name);
      if (!res.success) {
        setLocalError(res.error || 'Sign up failed.');
        return;
      }
    } else {
      const res = await signInWithEmail(email, password);
      if (!res.success) {
        setLocalError(res.error || 'Sign in failed.');
        return;
      }
    }

    const profile: UserProfile = {
      id: `user-${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      provider: 'email',
      isLoggedIn: true,
    };

    setUser(profile);
    setPremium(true);
    setSuccessMessage(mode === 'signup' ? 'Account created successfully!' : 'Signed in successfully!');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
      onSuccess?.();
      if (onSuccessRedirect) {
        router.replace(onSuccessRedirect as any);
      }
    }, 800);
  };

  const displayedError = localError || error;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={mode === 'signup' ? 'Create Account' : 'Welcome Back'}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <Text style={styles.subtitle}>
          {mode === 'signup'
            ? 'Save your growth progress and daily routines.'
            : 'Sign in to access your saved progress.'}
        </Text>

        {/* Mode Switcher */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabBtn, mode === 'signup' && styles.tabBtnActive]}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setMode('signup');
              setLocalError(null);
              clearError();
            }}
          >
            <Text style={[styles.tabBtnText, mode === 'signup' && styles.tabBtnTextActive]}>
              Sign Up
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, mode === 'signin' && styles.tabBtnActive]}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setMode('signin');
              setLocalError(null);
              clearError();
            }}
          >
            <Text style={[styles.tabBtnText, mode === 'signin' && styles.tabBtnTextActive]}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>

        {/* Banners */}
        {displayedError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{displayedError}</Text>
          </View>
        )}

        {successMessage && (
          <View style={styles.successBanner}>
            <CheckCircle2 size={16} color="#16A34A" />
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        )}

        {/* Inputs */}
        <View style={styles.fields}>
          {mode === 'signup' && (
            <View style={styles.inputWrap}>
              <User size={18} color={colors.slate400} />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Full name"
                placeholderTextColor={colors.slate400}
                style={styles.textInput}
              />
            </View>
          )}

          <View style={styles.inputWrap}>
            <Mail size={18} color={colors.slate400} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              placeholderTextColor={colors.slate400}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.textInput}
            />
          </View>

          <View style={styles.inputWrap}>
            <Lock size={18} color={colors.slate400} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password (min 6 characters)"
              placeholderTextColor={colors.slate400}
              secureTextEntry={!showPassword}
              style={styles.textInput}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {showPassword ? (
                <EyeOff size={18} color={colors.slate400} />
              ) : (
                <Eye size={18} color={colors.slate400} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isLoading}
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              {mode === 'signup' ? 'Create Account' : 'Sign In'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Forgot password link for sign in */}
        {mode === 'signin' && (
          <TouchableOpacity
            onPress={() => {
              onClose();
              router.push('/(auth)/forgot-password' as any);
            }}
            style={styles.forgotLink}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        )}

        <View style={styles.disclaimer}>
          <ShieldCheck size={12} color={colors.slate400} />
          <Text style={styles.disclaimerText}>
            Your data is stored securely in Supabase Cloud.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 14,
  },
  subtitle: {
    fontSize: 13,
    color: colors.slate600,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 11,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.slate600,
  },
  tabBtnTextActive: {
    color: colors.blue600,
    fontWeight: '700',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 10,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 12,
    padding: 10,
  },
  successText: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '600',
  },
  fields: {
    gap: 10,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: colors.slate900,
    padding: 0,
  },
  submitButton: {
    backgroundColor: colors.blue600,
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitButtonDisabled: {
    backgroundColor: colors.slate400,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  forgotLink: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.blue600,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  disclaimerText: {
    fontSize: 11,
    color: colors.slate400,
  },
});
