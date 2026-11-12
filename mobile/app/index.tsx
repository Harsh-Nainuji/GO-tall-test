import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Activity,
  ShieldCheck,
  ArrowRight,
  Dna,
  Moon,
  Sparkles,
  Zap,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import GlassBackgroundCanvas from '../components/GlassBackgroundCanvas';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';

export default function WelcomeScreen() {
  const router = useRouter();

  // Smooth, non-jiggly bottom-to-top fluid entrance animations
  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(20);

  const heroOpacity = useSharedValue(0);
  const heroY = useSharedValue(25);

  const cardsOpacity = useSharedValue(0);
  const cardsY = useSharedValue(30);

  const buttonOpacity = useSharedValue(0);
  const buttonY = useSharedValue(25);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) });
    headerY.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) });

    heroOpacity.value = withDelay(100, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
    heroY.value = withDelay(100, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));

    cardsOpacity.value = withDelay(200, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
    cardsY.value = withDelay(200, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));

    buttonOpacity.value = withDelay(300, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
    buttonY.value = withDelay(300, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));

  const heroStyle = useAnimatedStyle(() => ({
    opacity: heroOpacity.value,
    transform: [{ translateY: heroY.value }],
  }));

  const cardsStyle = useAnimatedStyle(() => ({
    opacity: cardsOpacity.value,
    transform: [{ translateY: cardsY.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonY.value }],
  }));

  return (
    <GlassBackgroundCanvas>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Header Pill */}
          <Animated.View style={[headerStyle, styles.headerWrap]}>
            <View style={styles.brandPill}>
              <Activity size={14} color="#0284C7" />
              <Text style={styles.brandText}>GoTall Stature Science</Text>
              <View style={styles.brandDot} />
            </View>
          </Animated.View>

          {/* Hero Section */}
          <Animated.View style={[heroStyle, styles.heroSection]}>
            <View style={styles.heroEmblem}>
              <LinearGradient
                colors={['#0284C7', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.emblemGradient}
              >
                <Dna size={36} color="#FFFFFF" strokeWidth={2.4} />
              </LinearGradient>
            </View>

            <View style={styles.protocolPill}>
              <Zap size={11} color="#0284C7" />
              <Text style={styles.protocolPillText}>
                Evidence-Based Pediatric Protocol
              </Text>
            </View>

            <Text style={styles.heroTitle}>
              Discover Your Biological{'\n'}Height Window
            </Text>

            <Text style={styles.heroSubtitle}>
              Clinical trajectory projection powered by the{' '}
              <Text style={styles.heroBold}>Tanner–Whitehouse III model</Text>, CDC & WHO growth charts, and epiphyseal velocity analysis.
            </Text>
          </Animated.View>

          {/* Clinical Transparency Cards (Authentic Frosted Glass Cards) */}
          <Animated.View style={[cardsStyle, styles.cardsList]}>
            {[
              {
                icon: Dna,
                color: '#0284C7',
                title: 'Tanner Genetic Target',
                desc: 'Parental genetics determine 60–80% of adult stature potential. (Ref: Nature Genetics)',
              },
              {
                icon: Moon,
                color: '#8B5CF6',
                title: 'Nocturnal Somatotropin Pulse',
                desc: '75% of pulsatile growth hormone is secreted during Stage 3/4 deep sleep. (Ref: J Clin Invest)',
              },
              {
                icon: Sparkles,
                color: '#10B981',
                title: 'Spinal Decompression & Posture',
                desc: 'Decompress compressed discs to reclaim 1.0–2.5 cm lost to sedentary slouching. (Ref: JBMR)',
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <GlassCard key={idx} style={styles.featureCard}>
                  <View style={styles.featureRow}>
                    <View
                      style={[
                        styles.featureIconWrap,
                        { backgroundColor: `${item.color}18` },
                      ]}
                    >
                      <Icon size={18} color={item.color} />
                    </View>
                    <View style={styles.featureDetails}>
                      <Text style={styles.featureTitle}>{item.title}</Text>
                      <Text style={styles.featureDesc}>{item.desc}</Text>
                    </View>
                  </View>
                </GlassCard>
              );
            })}
          </Animated.View>

          {/* Action Bottom Section */}
          <Animated.View style={[buttonStyle, styles.bottomSection]}>
            {/* Primary Action Button */}
            <GlassButton
              onPress={() => router.push('/(onboarding)/quiz')}
              style={styles.primaryCta}
            >
              <LinearGradient
                colors={['#0284C7', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.primaryCtaText}>Start Clinical Assessment</Text>
              <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />
            </GlassButton>

            {/* Direct Jump to Dashboard */}
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/home')}
              style={styles.demoLink}
              activeOpacity={0.7}
            >
              <Text style={styles.demoLinkText}>
                Open Dashboard (Glassmorphic Demo) →
              </Text>
            </TouchableOpacity>

            {/* Medical Disclaimer Card */}
            <GlassCard style={styles.disclaimerCard}>
              <View style={styles.disclaimerRow}>
                <ShieldCheck size={13} color="#0284C7" />
                <Text style={styles.disclaimerTitle}>Scientific Disclaimer</Text>
              </View>
              <Text style={styles.disclaimerText}>
                Height potential is largely genetic. Once growth plates close (typically age 16–21), biological bone elongation ceases. We help you achieve 100% of your genetic ceiling through nutrition, sleep, and spinal decompression.
              </Text>
            </GlassCard>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </GlassBackgroundCanvas>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    justifyContent: 'space-between',
    flexGrow: 1,
  },
  headerWrap: {
    alignItems: 'center',
    marginTop: 4,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  brandText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  heroEmblem: {
    width: 72,
    height: 72,
    borderRadius: 26,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  emblemGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  protocolPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(240, 249, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(186, 230, 253, 0.9)',
    marginBottom: 10,
  },
  protocolPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
    paddingHorizontal: 8,
    fontWeight: '500',
  },
  heroBold: {
    fontWeight: '800',
    color: '#0F172A',
  },
  cardsList: {
    gap: 10,
    marginVertical: 18,
  },
  featureCard: {
    padding: 14,
    borderRadius: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  featureDetails: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  featureDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
    fontWeight: '500',
  },
  bottomSection: {
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  primaryCta: {
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
    shadowOpacity: 0.3,
    shadowRadius: 14,
  },
  primaryCtaText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  demoLink: {
    paddingVertical: 6,
  },
  demoLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  disclaimerCard: {
    padding: 12,
    borderRadius: 16,
    width: '100%',
  },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  disclaimerTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  disclaimerText: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 14,
    fontWeight: '500',
  },
});
