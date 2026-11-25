import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Sparkles } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const GREETINGS = [
  { text: 'Welcome', lang: 'English' },
  { text: 'Bienvenido', lang: 'Spanish' },
  { text: 'Bienvenue', lang: 'French' },
  { text: 'ようこそ', lang: 'Japanese' },
  { text: 'नमस्ते', lang: 'Hindi' },
  { text: 'Willkommen', lang: 'German' },
];

interface MultilingualWelcomeSplashProps {
  onFinish: () => void;
}

export default function MultilingualWelcomeSplash({
  onFinish,
}: MultilingualWelcomeSplashProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<'cycling' | 'logo' | 'exit'>('cycling');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reanimated values for word transitions
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(12);

  // Logo zoom-in values
  const logoScale = useSharedValue(0.75);
  const logoOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.8);
  const glowOpacity = useSharedValue(0);

  // Exit screen transition
  const screenScale = useSharedValue(1);
  const screenOpacity = useSharedValue(1);

  // Smooth, readable, non-flickering per-language sequence
  useEffect(() => {
    if (phase !== 'cycling') return;

    // Reset and animate current greeting in smoothly
    textOpacity.value = 0;
    textTranslateY.value = 12;

    textOpacity.value = withTiming(1, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
    textTranslateY.value = withTiming(0, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });

    // After holding cleanly, fade out before swapping to next language
    const fadeOutTimer = setTimeout(() => {
      textOpacity.value = withTiming(0, {
        duration: 180,
        easing: Easing.in(Easing.ease),
      });
      textTranslateY.value = withTiming(-8, {
        duration: 180,
        easing: Easing.in(Easing.ease),
      });
    }, 460);

    stepTimerRef.current = setTimeout(() => {
      if (currentIndex + 1 < GREETINGS.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        triggerLogoReveal();
      }
    }, 660);

    return () => {
      clearTimeout(fadeOutTimer);
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    };
  }, [currentIndex, phase]);

  const triggerLogoReveal = () => {
    setPhase('logo');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    // Calm, luxurious logo zoom-in
    logoOpacity.value = withTiming(1, {
      duration: 420,
      easing: Easing.out(Easing.cubic),
    });
    logoScale.value = withSpring(1, {
      damping: 20,
      stiffness: 90,
      mass: 1,
    });

    // Glowing aura expanding gently
    glowOpacity.value = withTiming(0.75, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
    glowScale.value = withSpring(1.15, {
      damping: 18,
      stiffness: 80,
    });

    // Smooth, subtle exit transition into the app
    timerRef.current = setTimeout(() => {
      setPhase('exit');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

      screenScale.value = withTiming(1.08, {
        duration: 480,
        easing: Easing.out(Easing.cubic),
      });
      screenOpacity.value = withTiming(
        0,
        {
          duration: 450,
          easing: Easing.out(Easing.cubic),
        },
        (finished) => {
          if (finished) {
            runOnJS(onFinish)();
          }
        }
      );
    }, 1050);
  };

  const handleSkip = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onFinish();
  };

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const animatedScreenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
    transform: [{ scale: screenScale.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedScreenStyle]}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#090D16', '#0F172A', '#1E1B4B', '#0F172A']}
        locations={[0, 0.35, 0.75, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient background glow dots */}
      <View style={styles.ambientGlowTop} />
      <View style={styles.ambientGlowBottom} />

      {/* Skip button in top right */}
      <TouchableOpacity
        onPress={handleSkip}
        style={styles.skipButton}
        activeOpacity={0.7}
      >
        <Text style={styles.skipButtonText}>Skip</Text>
      </TouchableOpacity>

      {/* Center content */}
      <View style={styles.centerContent}>
        {phase === 'cycling' ? (
          <Animated.View style={[styles.cyclingWrap, animatedTextStyle]}>
            <View style={styles.welcomeTagRow}>
              <Sparkles size={14} color="#60A5FA" />
              <Text style={styles.langSubtitle}>
                {GREETINGS[currentIndex].lang}
              </Text>
            </View>
            <Text style={styles.welcomeWord}>
              {GREETINGS[currentIndex].text}
            </Text>
            <View style={styles.progressDotsRow}>
              {GREETINGS.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === currentIndex && styles.activeDot,
                    i < currentIndex && styles.pastDot,
                  ]}
                />
              ))}
            </View>
          </Animated.View>
        ) : (
          <View style={styles.logoStageWrap}>
            {/* Ambient radiant glow ring behind logo */}
            <Animated.View style={[styles.logoGlowAura, animatedGlowStyle]} />

            {/* Tallgrame App Icon with Spring Zoom-In */}
            <Animated.View style={[styles.logoBox, animatedLogoStyle]}>
              <Image
                source={require('../assets/icon.png')}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </Animated.View>

            <Animated.View entering={FadeIn.delay(120).duration(250)} style={styles.logoTitleWrap}>
              <Text style={styles.appName}>Tallgrame</Text>
              <Text style={styles.appTagline}>
                Clinical Stature Optimization
              </Text>
            </Animated.View>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    zIndex: 9999,
    backgroundColor: '#090D16',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambientGlowTop: {
    position: 'absolute',
    top: -80,
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 0.9,
    borderRadius: (SCREEN_WIDTH * 0.9) / 2,
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
    filter: 'blur(50px)',
  },
  ambientGlowBottom: {
    position: 'absolute',
    bottom: -60,
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    borderRadius: (SCREEN_WIDTH * 0.8) / 2,
    backgroundColor: 'rgba(124, 58, 237, 0.22)',
    filter: 'blur(50px)',
  },
  skipButton: {
    position: 'absolute',
    top: 54,
    right: 24,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 10,
  },
  skipButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
    letterSpacing: 0.4,
  },
  centerContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  cyclingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  langSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#93C5FD',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  welcomeWord: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    textAlign: 'center',
    marginVertical: 12,
    textShadowColor: 'rgba(59, 130, 246, 0.6)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 18,
  },
  progressDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeDot: {
    width: 18,
    backgroundColor: '#3B82F6',
  },
  pastDot: {
    backgroundColor: 'rgba(96, 165, 250, 0.6)',
  },
  logoStageWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlowAura: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(59, 130, 246, 0.35)',
  },
  logoBox: {
    width: 104,
    height: 104,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoTitleWrap: {
    alignItems: 'center',
    marginTop: 18,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginTop: 4,
  },
});
