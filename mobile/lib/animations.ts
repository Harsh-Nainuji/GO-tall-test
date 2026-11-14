import {
  FadeIn,
  FadeOut,
  FadeInDown,
  SlideInDown,
  SlideOutDown,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export const animationConfigs = {
  // Card Staggered Entrance
  cardEntrance: (index: number = 0) => FadeInDown.delay(index * 80).springify(),

  // Spring Settings
  buttonPressSpring: { damping: 15, stiffness: 300 },
  ringFillSpring: { damping: 20, stiffness: 90 },
  waterBaselineSpring: { damping: 18, stiffness: 80 },

  // Timing Durations
  modalDuration: 350,
  tabSwitchDuration: 200,
  countUpDuration: 800,
  waveCycleDuration: 3000,
  orbFloatHalfDuration: 1500,

  // Modal Transitions
  modalEntering: SlideInDown.duration(350).easing(Easing.out(Easing.quad)),
  modalExiting: SlideOutDown.duration(300).easing(Easing.in(Easing.quad)),
  backdropEntering: FadeIn.duration(250),
  backdropExiting: FadeOut.duration(200),
  tabEntering: FadeIn.duration(200),
};

export const haptics = {
  // Discrete Value Change (slider, picker, chip, day click)
  selection: () => {
    Haptics.selectionAsync().catch(() => {});
  },

  // Primary Call-to-Action Press (+ Add Water, Log Sleep, Start Timer)
  ctaPress: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },

  // Success Notification (Logged, Done)
  success: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },

  // Error / Warning (Limit reached)
  error: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  },
};
