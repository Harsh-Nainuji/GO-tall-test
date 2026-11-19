import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { logError } from '../lib/logger';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  signInWithOAuth: (provider: 'google' | 'apple') => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  isLoading: false,
  error: null,
  isInitialized: false,

  initialize: async () => {
    if (!isSupabaseConfigured()) {
      set({ isInitialized: true });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ session, user: session?.user ?? null, isInitialized: true });

      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session, user: session?.user ?? null });
      });
    } catch (err: any) {
      logError('Auth initialization failed', err);
      set({ isInitialized: true });
    }
  },

  signInWithEmail: async (email: string, pass: string) => {
    set({ isLoading: true, error: null });
    if (!isSupabaseConfigured()) {
      set({ isLoading: false });
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });

      if (error) {
        set({ error: error.message, isLoading: false });
        return { success: false, error: error.message };
      }

      set({ session: data.session, user: data.user, isLoading: false });

      // Automatically ensure corresponding profile row in Supabase
      if (data.user) {
        try {
          await supabase.from('profiles').upsert(
            {
              id: data.user.id,
              user_id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.display_name || data.user.email?.split('@')[0] || 'User',
              gender: 'Male',
              age: 16,
              current_height: 170,
              predicted_height: 180,
              potential_gain: 10,
              growth_plate_status: 'Open (Accelerated)',
              subscription_tier: 'Free',
            },
            { onConflict: 'id' }
          );
        } catch (profileErr) {
          console.warn('Could not auto-create profile row:', profileErr);
        }
      }

      return { success: true };
    } catch (err: any) {
      const message = err?.message || 'Sign in failed';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  signUpWithEmail: async (email: string, pass: string, name?: string) => {
    set({ isLoading: true, error: null });
    if (!isSupabaseConfigured()) {
      set({ isLoading: false });
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: pass,
        options: {
          data: {
            display_name: name?.trim() || email.split('@')[0],
          },
        },
      });

      if (error) {
        set({ error: error.message, isLoading: false });
        return { success: false, error: error.message };
      }

      set({ session: data.session, user: data.user, isLoading: false });

      // Automatically ensure corresponding profile row in Supabase
      if (data.user) {
        try {
          await supabase.from('profiles').upsert(
            {
              id: data.user.id,
              user_id: data.user.id,
              email: data.user.email,
              name: name?.trim() || data.user.user_metadata?.display_name || data.user.email?.split('@')[0] || 'User',
              gender: 'Male',
              age: 16,
              current_height: 170,
              predicted_height: 180,
              potential_gain: 10,
              growth_plate_status: 'Open (Accelerated)',
              subscription_tier: 'Free',
            },
            { onConflict: 'id' }
          );
        } catch (profileErr) {
          console.warn('Could not auto-create profile row:', profileErr);
        }
      }

      return { success: true };
    } catch (err: any) {
      const message = err?.message || 'Sign up failed';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  signInWithOAuth: async (provider) => {
    set({ isLoading: true, error: null });
    if (!isSupabaseConfigured()) {
      set({ isLoading: false, error: 'Auth not configured' });
      return { success: false, error: 'Auth not configured' };
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: 'gotall://auth/callback',
        },
      });
      if (error) {
        set({ error: error.message, isLoading: false });
        return { success: false, error: error.message };
      }
      set({ isLoading: false });
      return { success: true };
    } catch (err: any) {
      const message = err?.message || `${provider} sign in failed`;
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err: any) {
        logError('Sign out error', err);
      }
    }
    set({ session: null, user: null, isLoading: false });
  },

  sendPasswordReset: async (email: string) => {
    set({ isLoading: true, error: null });
    if (!isSupabaseConfigured()) {
      set({ isLoading: false });
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) {
        set({ error: error.message, isLoading: false });
        return { success: false, error: error.message };
      }
      set({ isLoading: false });
      return { success: true };
    } catch (err: any) {
      const message = err?.message || 'Reset password request failed';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  updatePassword: async (newPassword: string) => {
    set({ isLoading: true, error: null });
    if (!isSupabaseConfigured()) {
      set({ isLoading: false });
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        set({ error: error.message, isLoading: false });
        return { success: false, error: error.message };
      }
      set({ isLoading: false });
      return { success: true };
    } catch (err: any) {
      const message = err?.message || 'Password update failed';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  clearError: () => set({ error: null }),
}));
