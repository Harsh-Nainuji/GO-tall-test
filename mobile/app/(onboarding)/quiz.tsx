import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Check,
  Info,
  Shield,
  ArrowRight,
  Activity,
  Zap,
  TrendingUp,
  BookOpen,
  Sparkles,
} from 'lucide-react-native';
import Animated, {
  FadeInUp,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useAppStore } from '../../lib/store';
import { QuizData, cmToFtIn } from '../../lib/growth-calc';
import GlassCard from '../../components/GlassCard';
import GlassButton from '../../components/GlassButton';
import GlassBackgroundCanvas from '../../components/GlassBackgroundCanvas';
import BiometricRulerGlass from '../../components/BiometricRulerGlass';
import AgeSelector from '../../components/AgeSelector';
import GlobeGraphic from '../../components/GlobeGraphic';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function QuizScreen() {
  const router = useRouter();
  const setQuizData = useAppStore((state) => state.setQuizData);

  // Stepped Questionnaire: 1 to 15
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State for All 15 Clinical Parameters
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<number>(17);
  const [ethnicity, setEthnicity] = useState<string>('South Asian');

  const [currentHeight, setCurrentHeight] = useState<number>(172);
  const [growthRate, setGrowthRate] = useState<string>('2 – 5 cm / year');
  const [shoeSize, setShoeSize] = useState<string>('Grew half size');

  const [fatherHeight, setFatherHeight] = useState<number>(178);
  const [fatherUnknown, setFatherUnknown] = useState<boolean>(false);
  const [motherHeight, setMotherHeight] = useState<number>(165);
  const [motherUnknown, setMotherUnknown] = useState<boolean>(false);
  const [dreamHeight, setDreamHeight] = useState<number>(183);

  const [sleepHours, setSleepHours] = useState<string>('8 – 10 hours');
  const [dietType, setDietType] = useState<string>('High protein balanced');
  const [smokeDrink, setSmokeDrink] = useState<string>('No, never');
  const [sittingHours, setSittingHours] = useState<string>('4 – 8 hrs');
  const [activityLevel, setActivityLevel] = useState<string>('Moderate Active');
  const [motivation, setMotivation] = useState<string>('Maximize my genetic height potential');

  // 15 Core Biometric Questions for Tanner-Whitehouse III & Posture Evaluation
  const totalSteps = 15;
  const progressPercent = (currentStep / totalSteps) * 100;

  // Stages definition for clear user context
  const getStageInfo = (step: number) => {
    if (step <= 3) return { stage: 1, title: 'Genetic & Biological Foundations' };
    if (step <= 6) return { stage: 2, title: 'Current Physical Stature & Velocity' };
    if (step <= 9) return { stage: 3, title: 'Mid-Parental Tanner Calculation' };
    return { stage: 4, title: 'Hormonal & Lifestyle Catalysts' };
  };

  const currentStage = getStageInfo(currentStep);

  const handleNext = () => {
    Haptics.selectionAsync().catch(() => {});
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Final submission
      const finalData: QuizData = {
        gender,
        age,
        ethnicity,
        currentHeight,
        fatherHeight: fatherUnknown ? undefined : fatherHeight,
        fatherCm: fatherUnknown ? undefined : fatherHeight,
        motherHeight: motherUnknown ? undefined : motherHeight,
        motherCm: motherUnknown ? undefined : motherHeight,
        growthRate,
        growthPastYear: growthRate.includes('Stopped') ? 'stopped' : 'normal',
        shoeSize,
        footGrowthStopped: shoeSize.includes('No shoe size change'),
        sleepHours,
        dietType,
        smokeDrink,
        sittingHours,
        motivation,
        dreamHeight,
        activityLevel,
      };
      setQuizData(finalData);
      router.push('/(onboarding)/reveal');
    }
  };

  const handleBack = () => {
    Haptics.selectionAsync().catch(() => {});
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.back();
    }
  };

  // Tanner Live Projection for Step 9
  const dimorphicOffset = gender === 'male' ? 13 : -13;
  const effectiveFather = fatherUnknown ? (gender === 'male' ? motherHeight + 13 : motherHeight) : fatherHeight;
  const effectiveMother = motherUnknown ? (gender === 'male' ? fatherHeight : fatherHeight - 13) : motherHeight;
  const liveTarget = Math.round(((effectiveFather + effectiveMother + dimorphicOffset) / 2) * 10) / 10;

  return (
    <GlassBackgroundCanvas>
      <SafeAreaView style={styles.safeArea}>
        {/* Navigation & Progress Header */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              accessibilityLabel="Go back"
            >
              <ChevronLeft size={20} color="#0F172A" />
            </TouchableOpacity>

            <View style={styles.stagePill}>
              <Text style={styles.stagePillText}>
                STAGE {currentStage.stage} OF 4 • {currentStage.title}
              </Text>
            </View>

            <View style={styles.stepCounterPill}>
              <Text style={styles.stepCounterText}>{currentStep}/{totalSteps}</Text>
            </View>
          </View>

          {/* Smooth Animated Progress Line */}
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercent}%` },
              ]}
            />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ========================================================================= */}
          {/* QUESTION 1: BIOLOGICAL SEX                                                */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <Animated.View entering={FadeInUp.duration(380).easing(Easing.out(Easing.cubic))}>
              <Text style={styles.questionNumber}>QUESTION 1 OF 15</Text>
              <Text style={styles.questionTitle}>Select Biological Sex</Text>
              <Text style={styles.questionSubtitle}>
                Calibrates sexual dimorphism calculation (+13 cm male / −13 cm female per the clinical Tanner-Whitehouse metric).
              </Text>

              <View style={styles.cardList}>
                {/* MALE OPTION */}
                <TouchableOpacity
                  key="opt-male"
                  style={[
                    styles.optionCard,
                    gender === 'male' ? styles.optionCardActive : styles.optionCardInactive,
                  ]}
                  onPress={() => {
                    setGender('male');
                    Haptics.selectionAsync().catch(() => {});
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.optionLeft}>
                    {/* Modern 3D Glass Badge Icon for Male */}
                    <View style={styles.modernBadgeMale}>
                      <LinearGradient
                        colors={['#38BDF8', '#0284C7']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.badgeGradientFill}
                      >
                        <Text style={styles.modernBadgeSymbol}>♂</Text>
                      </LinearGradient>
                    </View>

                    <View>
                      <View style={styles.optionTitleRow}>
                        <Text style={styles.optionTitle}>Male</Text>
                        <View style={styles.karyotypeChipBlue}>
                          <Text style={styles.karyotypeChipBlueText}>46, XY</Text>
                        </View>
                      </View>
                      <Text style={styles.optionDescription}>
                        +13.0 cm dimorphic stature offset
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.checkCircle,
                      gender === 'male' && styles.checkCircleActive,
                    ]}
                  >
                    {gender === 'male' && (
                      <Check size={14} color="#FFFFFF" strokeWidth={3} />
                    )}
                  </View>
                </TouchableOpacity>

                {/* FEMALE OPTION */}
                <TouchableOpacity
                  key="opt-female"
                  style={[
                    styles.optionCard,
                    gender === 'female' ? styles.optionCardActive : styles.optionCardInactive,
                  ]}
                  onPress={() => {
                    setGender('female');
                    Haptics.selectionAsync().catch(() => {});
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.optionLeft}>
                    {/* Modern 3D Glass Badge Icon for Female */}
                    <View style={styles.modernBadgeFemale}>
                      <LinearGradient
                        colors={['#F472B6', '#A855F7']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.badgeGradientFill}
                      >
                        <Text style={styles.modernBadgeSymbol}>♀</Text>
                      </LinearGradient>
                    </View>

                    <View>
                      <View style={styles.optionTitleRow}>
                        <Text style={styles.optionTitle}>Female</Text>
                        <View style={styles.karyotypeChipPurple}>
                          <Text style={styles.karyotypeChipPurpleText}>46, XX</Text>
                        </View>
                      </View>
                      <Text style={styles.optionDescription}>
                        −13.0 cm dimorphic stature offset
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.checkCircle,
                      gender === 'female' && styles.checkCircleActive,
                    ]}
                  >
                    {gender === 'female' && (
                      <Check size={14} color="#FFFFFF" strokeWidth={3} />
                    )}
                  </View>
                </TouchableOpacity>
              </View>

              <GlassCard style={styles.clinicalFactBox}>
                <View style={styles.factRow}>
                  <Info size={16} color="#0284C7" />
                  <Text style={styles.factText}>
                    Genetic sex determines the biological timing of epiphyseal growth plate ossification in distal long bones.
                  </Text>
                </View>
              </GlassCard>
            </Animated.View>
          )}

          {/* ========================================================================= */}
          {/* QUESTION 2: BIOLOGICAL AGE (AUTHENTIC SCHOOL RULER SCALE)                 */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <Animated.View entering={FadeInUp.duration(380).easing(Easing.out(Easing.cubic))}>
              <Text style={styles.questionNumber}>QUESTION 2 OF 15</Text>
              <Text style={styles.questionTitle}>What is your current age?</Text>
              <Text style={styles.questionSubtitle}>
                Epiphyseal plates undergo terminal fusion between ages 16–25. Your age establishes your remaining growth window.
              </Text>

              {/* Single Glassmorphic Card (No nested box inside box!) */}
              <GlassCard style={styles.rulerContainerCard}>
                <AgeSelector
                  value={age}
                  onChange={(val) => setAge(val)}
                  min={10}
                  max={26}
                />
              </GlassCard>

              {/* Biological Rationale for 10-26 Scale */}
              <GlassCard style={styles.clinicalFactBox}>
                <View style={styles.factRow}>
                  <BookOpen size={16} color="#0284C7" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.factTitle}>Biological Rationale for 10–26 Scale</Text>
                    <Text style={styles.factText}>
                      Long-bone chondrocytes activate in early puberty (~10 yrs) and complete terminal ossification between ages 18–25 (medial clavicular plates fuse last up to age 25). After 25, gains are achieved through spinal disc decompression.
                    </Text>
                  </View>
                </View>
              </GlassCard>
            </Animated.View>
          )}

          {/* ========================================================================= */}
          {/* QUESTION 3: ETHNICITY & ROTATING 3D GLASS GLOBE                          */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <Animated.View entering={FadeInUp.duration(380).easing(Easing.out(Easing.cubic))}>
              <Text style={styles.questionNumber}>QUESTION 3 OF 15</Text>
              <Text style={styles.questionTitle}>Select Genetic Population Standard</Text>
              <Text style={styles.questionSubtitle}>
                Calibrates percentile curves against World Health Organization (WHO) and regional demographic datasets.
              </Text>

              {/* 3D Translucent Illuminated Glass Globe Centerpiece */}
              <View style={styles.globeWrapper}>
                <GlobeGraphic size={110} />
              </View>

              <View style={styles.cardList}>
                {[
                  { name: 'South Asian', desc: 'India, Pakistan, Bangladesh, Sri Lanka' },
                  { name: 'East Asian', desc: 'China, Japan, Korea, Taiwan' },
                  { name: 'Caucasian / European', desc: 'European, North American, Mediterranean' },
                  { name: 'African / Afro-Caribbean', desc: 'Sub-Saharan & Diaspora populations' },
                  { name: 'Hispanic / Latino', desc: 'Central & South American populations' },
                  { name: 'Global Population Standard', desc: 'WHO Generalized International Standard' },
                ].map((item) => {
                  const isSelected = ethnicity === item.name;
                  return (
                    <TouchableOpacity
                      key={item.name}
                      style={[
                        styles.optionCard,
                        isSelected ? styles.optionCardActive : styles.optionCardInactive,
                      ]}
                      onPress={() => {
                        setEthnicity(item.name);
                        Haptics.selectionAsync().catch(() => {});
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.optionLeft}>
                        <View>
                          <Text style={styles.optionTitle}>{item.name}</Text>
                          <Text style={styles.optionDescription}>{item.desc}</Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.checkCircle,
                          isSelected && styles.checkCircleActive,
                        ]}
                      >
                        {isSelected && (
                          <Check size={14} color="#FFFFFF" strokeWidth={3} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          )}

          {/* ========================================================================= */}
          {/* QUESTION 4: CURRENT HEIGHT (HIGH-STABILITY BIOMETRIC RULER)               */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <Animated.View entering={FadeInUp.duration(380).easing(Easing.out(Easing.cubic))}>
              <Text style={styles.questionNumber}>QUESTION 4 OF 15</Text>
              <Text style={styles.questionTitle}>What is your current height?</Text>
              <Text style={styles.questionSubtitle}>
                Slide the biometric ruler or tap − / + for 1-cm precision. Dual metric and imperial units update live.
              </Text>

              <GlassCard style={styles.rulerContainerCard}>
                <BiometricRulerGlass
                  min={120}
                  max={230}
                  initialValue={currentHeight}
                  unit="cm"
                  subLabel="current standing stature"
                  onValueChange={(val) => setCurrentHeight(val)}
                />
              </GlassCard>

              {/* Prominent Clinical Source Box */}
              <GlassCard style={styles.clinicalFactBox}>
                <View style={styles.factRow}>
                  <BookOpen size={16} color="#0284C7" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.factTitle}>Clinical Source: CDC & WHO Stature Standard</Text>
                    <Text style={styles.factText}>
                      Measure barefoot upon waking. Intervertebral discs undergo 1.0–2.0 cm diurnal compression throughout the day due to gravity.
                    </Text>
                  </View>
                </View>
              </GlassCard>
            </Animated.View>
          )}

          {/* ========================================================================= */}
          {/* QUESTION 5: GROWTH VELOCITY                                              */}
          {/* ========================================================================= */}
          {currentStep === 5 && (
            <Animated.View entering={FadeInUp.duration(380).easing(Easing.out(Easing.cubic))}>
              <Text style={styles.questionNumber}>QUESTION 5 OF 15</Text>
              <Text style={styles.questionTitle}>Growth velocity over past 12 months?</Text>
              <Text style={styles.questionSubtitle}>
                Evaluates whether you are in your peak height velocity (PHV) spurt or approaching final epiphyseal fusion.
              </Text>

              <View style={styles.cardList}>
                {[
                  { title: '> 5 cm / year', sub: 'Rapid growth spurt (Peak Height Velocity)', tag: 'Spurt Active' },
                  { title: '2 – 5 cm / year', sub: 'Steady pubertal bone lengthening', tag: 'Normal' },
                  { title: '< 2 cm / year', sub: 'Decelerating growth (Terminal plate fusion phase)', tag: 'Closing' },
                  { title: '0 cm / year (Stopped)', sub: 'No height gain recorded over the past year', tag: 'Fused' },
                ].map((item) => {
                  const isSelected = growthRate === item.title;
                  return (
                    <TouchableOpacity
                      key={item.title}
                      style={[
                        styles.optionCard,
                        isSelected ? styles.optionCardActive : styles.optionCardInactive,
                      ]}
                      onPress={() => {
                        setGrowthRate(item.title);
                        Haptics.selectionAsync().catch(() => {});
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.optionLeft}>
                        <View>
                          <Text style={styles.optionTitle}>{item.title}</Text>
                          <Text style={styles.optionDescription}>{item.sub}</Text>
                        </View>
                      </View>
                      <View style={[styles.velocityBadge, isSelected && styles.velocityBadgeActive]}>
                        <Text style={[styles.velocityBadgeText, isSelected && styles.velocityBadgeTextActive]}>
                          {item.tag}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          )}

          {/* ========================================================================= */}
          {/* QUESTION 6: SHOE SIZE / FOOT ELONGATION                                   */}
          {/* ========================================================================= */}
          {currentStep === 6 && (
            <Animated.View entering={FadeInUp.duration(380).easing(Easing.out(Easing.cubic))}>
              <Text style={styles.questionNumber}>QUESTION 6 OF 15</Text>
              <Text style={styles.questionTitle}>Has your shoe size changed recently?</Text>
              <Text style={styles.questionSubtitle}>
                Distal-to-proximal growth rule: Feet and hands cease lengthening 6–12 months before spinal vertebral growth stops.
              </Text>

              <View style={styles.cardList}>
                {[
                  { title: 'Grew 1 or more full sizes', sub: 'Active distal skeletal expansion' },
                  { title: 'Grew half size', sub: 'Moderate continuous elongation' },
                  { title: 'No shoe size change in 12+ months', sub: 'Distal extremity growth plates are closed' },
                ].map((item) => {
                  const isSelected = shoeSize === item.title;
                  return (
                    <TouchableOpacity
                      key={item.title}
                      style={[
                        styles.optionCard,
                        isSelected ? styles.optionCardActive : styles.optionCardInactive,
                      ]}
                      onPress={() => {
                        setShoeSize(item.title);
                        Haptics.selectionAsync().catch(() => {});
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.optionLeft}>
                        <View>
                          <Text style={styles.optionTitle}>{item.title}</Text>
                          <Text style={styles.optionDescription}>{item.sub}</Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.checkCircle,
                          isSelected && styles.checkCircleActive,
                        ]}
                      >
                        {isSelected && (
                          <Check size={14} color="#FFFFFF" strokeWidth={3} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          )}

          {/* ========================================================================= */}
          {/* QUESTION 7: BIOLOGICAL FATHER'S HEIGHT                                    */}
          {/* ========================================================================= */}
          {currentStep === 7 && (
            <Animated.View entering={FadeInUp.duration(380).easing(Easing.out(Easing.cubic))}>
              <Text style={styles.questionNumber}>QUESTION 7 OF 15</Text>
              <Text style={styles.questionTitle}>Biological father&apos;s height?</Text>
              <Text style={styles.questionSubtitle}>
                Required for the Tanner mid-parental genetic target formula. If unknown, toggle the single-parent fallback.
              </Text>

              {!fatherUnknown ? (
                <GlassCard style={styles.rulerContainerCard}>
                  <BiometricRulerGlass
                    min={130}
                    max={230}
                    initialValue={fatherHeight}
                    unit="cm"
                    subLabel="father stature"
                    onValueChange={(val) => setFatherHeight(val)}
                  />
                </GlassCard>
              ) : (
                <GlassCard style={styles.unknownFallbackCard}>
                  <Text style={styles.unknownTitle}>Single Parent / Unknown Measurement</Text>
                  <Text style={styles.unknownSubtitle}>
                    Using maternal height + population sex-dimorphism fallback to project Tanner stature accurately.
                  </Text>
                </GlassCard>
              )}

              <TouchableOpacity
                onPress={() => setFatherUnknown(!fatherUnknown)}
                style={styles.toggleFallbackBtn}
              >
                <Text style={styles.toggleFallbackText}>
                  {fatherUnknown
                    ? '← I know father&apos;s height (use exact measurement)'
                    : 'I don&apos;t know father&apos;s height (use single-parent formula)'}
                </Text>
              </TouchableOpacity>

              {/* Prominent Clinical Source Box */}
              <GlassCard style={styles.clinicalFactBox}>
                <View style={styles.factRow}>
                  <BookOpen size={16} color="#0284C7" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.factTitle}>Clinical Source: Tanner Mid-Parental Height Formula</Text>
                    <Text style={styles.factText}>
                      Published by Tanner et al., Arch Dis Child. Paternal genetic contribution accounts for ~40% of baseline long-bone potential alleles.
                    </Text>
                  </View>
                </View>
              </GlassCard>
            </Animated.View>
          )}

          {/* ========================================================================= */}
          {/* QUESTION 8: BIOLOGICAL MOTHER'S HEIGHT                                    */}
          {/* ========================================================================= */}
          {currentStep === 8 && (
            <Animated.View entering={FadeInUp.duration(380).easing(Easing.out(Easing.cubic))}>
              <Text style={styles.questionNumber}>QUESTION 8 OF 15</Text>
              <Text style={styles.questionTitle}>Biological mother&apos;s height?</Text>
              <Text style={styles.questionSubtitle}>
                Maternal height calibrates the female X-chromosome growth velocity and uterine baseline.
              </Text>

              {!motherUnknown ? (
                <GlassCard style={styles.rulerContainerCard}>
                  <BiometricRulerGlass
                    min={120}
                    max={220}
                    initialValue={motherHeight}
                    unit="cm"
                    subLabel="mother stature"
                    onValueChange={(val) => setMotherHeight(val)}
                  />
                </GlassCard>
              ) : (
                <GlassCard style={styles.unknownFallbackCard}>
                  <Text style={styles.unknownTitle}>Single Parent / Unknown Measurement</Text>
                  <Text style={styles.unknownSubtitle}>
                    Using paternal height + population sex-dimorphism fallback to project Tanner stature accurately.
                  </Text>
                </GlassCard>
              )}

              <TouchableOpacity
                onPress={() => setMotherUnknown(!motherUnknown)}
                style={styles.toggleFallbackBtn}
              >
                <Text style={styles.toggleFallbackText}>
                  {motherUnknown
                    ? '← I know mother&apos;s height (use exact measurement)'
                    : 'I don&apos;t know mother&apos;s height (use single-parent formula)'}
                </Text>
              </TouchableOpacity>

              {/* Prominent Clinical Source Box */}
              <GlassCard style={styles.clinicalFactBox}>
                <View style={styles.factRow}>
                  <BookOpen size={16} color="#0284C7" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.factTitle}>Clinical Source: Tanner-Whitehouse III Model</Text>
                    <Text style={styles.factText}>
                      Maternal stature contributes crucial polygenic alleles for pubertal onset timing and final adult vertebral height.
                    </Text>
                  </View>
                </View>
              </GlassCard>
            </Animated.View>
          )}

          {/* ========================================================================= */}
          {/* QUESTION 9: TARGET / DREAM HEIGHT                                         */}
          {/* ========================================================================= */}
          {currentStep === 9 && (
            <Animated.View entering={FadeInUp.duration(380).easing(Easing.out(Easing.cubic))}>
              <Text style={styles.questionNumber}>QUESTION 9 OF 15</Text>
              <Text style={styles.questionTitle}>What is your target / dream height?</Text>
              <Text style={styles.questionSubtitle}>
                We calibrate your daily protocol targets and verify feasibility against biological growth boundaries.
              </Text>

              <GlassCard style={styles.rulerContainerCard}>
                <BiometricRulerGlass
                  min={140}
                  max={230}
                  initialValue={dreamHeight}
                  unit="cm"
                  subLabel="dream stature target"
                  onValueChange={(val) => setDreamHeight(val)}
                />
              </GlassCard>

              {/* Projected Tanner Target Reference */}
              <GlassCard style={styles.tannerPreviewCard}>
                <View style={styles.tannerPreviewRow}>
                  <View>
                    <Text style={styles.tannerPreviewLabel}>Projected Tanner Ceiling</Text>
                    <Text style={styles.tannerPreviewValue}>
                      {liveTarget.toFixed(1)} cm ({cmToFtIn(liveTarget)})
                    </Text>
                  </View>
                  <View style={styles.tannerPreviewBadge}>
                    <Text style={styles.tannerPreviewBadgeText}>
                      Gap: {(dreamHeight - liveTarget).toFixed(1)} cm
                    </Text>
                  </View>
                </View>
              </GlassCard>

              {/* Prominent Clinical Source Box */}
              <GlassCard style={styles.clinicalFactBox}>
                <View style={styles.factRow}>
                  <BookOpen size={16} color="#0284C7" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.factTitle}>Clinical Source: Epiphyseal Boundary Potential</Text>
                    <Text style={styles.factText}>
                      Calculated from mid-parental mean ± dimorphic offset. Target statures within 5 cm of the Tanner ceiling are biologically attainable through spinal disc hydration and active chondrocyte nutrition.
                    </Text>
                  </View>
                </View>
              </GlassCard>
            </Animated.View>
          )}

          {/* ========================================================================= */}
          {/* QUESTION 10: SLEEP DURATION                                               */}
          {/* ========================================================================= */}
          {currentStep === 10 && (
            <Animated.View entering={FadeInUp.duration(380).easing(Easing.out(Easing.cubic))}>
              <Text style={styles.questionNumber}>QUESTION 10 OF 15</Text>
              <Text style={styles.questionTitle}>Average nightly sleep duration?</Text>
              <Text style={styles.questionSubtitle}>
                Slow-wave deep sleep (NREM Stages 3 & 4) triggers 70–80% of daily human growth hormone (somatotropin) release.
              </Text>

              <View style={styles.cardList}>
                {[
                  { title: '< 6 hours', sub: 'Severe somatotropin suppression and elevated cortisol' },
                  { title: '6 – 8 hours', sub: 'Moderate pulsatile growth hormone release' },
                  { title: '8 – 10 hours', sub: 'Optimal slow-wave sleep somatotropin peak' },
                  { title: '10+ hours', sub: 'Extended anabolic tissue recovery' },
                ].map((item) => {
                  const isSelected = sleepHours === item.title;
                  return (
                    <TouchableOpacity
                      key={item.title}
                      style={[
                        styles.optionCard,
                        isSelected ? styles.optionCardActive : styles.optionCardInactive,
                      ]}
                      onPress={() => {
                        setSleepHours(item.title);
                        Haptics.selectionAsync().catch(() => {});
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.optionLeft}>
                        <View>
                          <Text style={styles.optionTitle}>{item.title}</Text>
                          <Text style={styles.optionDescription}>{item.sub}</Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.checkCircle,
                          isSelected && styles.checkCircleActive,
                        ]}
                      >
                        {isSelected && (
                          <Check size={14} color="#FFFFFF" strokeWidth={3} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          )}

          {/* ========================================================================= */}
          {/* QUESTION 11: DIET & NUTRITIONAL PROFILE                                    */}
          {/* ========================================================================= */}
          {currentStep === 11 && (
            <Animated.View entering={FadeInUp.duration(380).easing(Easing.out(Easing.cubic))}>
              <Text style={styles.questionNumber}>QUESTION 11 OF 15</Text>
              <Text style={styles.questionTitle}>Daily nutrition & diet profile?</Text>
              <Text style={styles.questionSubtitle}>
                Chondrocytes require complete essential amino acids, calcium, zinc, and collagen precursors for cartilage matrix synthesis.
              </Text>

              <View style={styles.cardList}>
                {[
                  { title: 'High protein balanced', sub: 'Meat, fish, eggs, dairy, paneer, pulses (1.6g/kg+)' },
                  { title: 'Vegetarian balanced', sub: 'Paneer, lentils, chickpeas, milk, nuts, grains' },
                  { title: 'Standard / Unregulated', sub: 'Variable protein with processed carbs' },
                  { title: 'Caloric restricted / Low protein', sub: 'Sub-optimal substrate for chondrocyte proliferation' },
                ].map((item) => {
                  const isSelected = dietType === item.title;
                  return (
                    <TouchableOpacity
                      key={item.title}
                      style={[
                        styles.optionCard,
                        isSelected ? styles.optionCardActive : styles.optionCardInactive,
                      ]}
                      onPress={() => {
                        setDietType(item.title);
                        Haptics.selectionAsync().catch(() => {});
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.optionLeft}>
                        <View>
                          <Text style={styles.optionTitle}>{item.title}</Text>
                          <Text style={styles.optionDescription}>{item.sub}</Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.checkCircle,
                          isSelected && styles.checkCircleActive,
                        ]}
                      >
                        {isSelected && (
                          <Check size={14} color="#FFFFFF" strokeWidth={3} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          )}

          {/* ========================================================================= */}
          {/* QUESTION 12: NICOTINE & ALCOHOL EXPOSURE                                  */}
          {/* ========================================================================= */}
          {currentStep === 12 && (
            <Animated.View entering={FadeInUp.duration(380).easing(Easing.out(Easing.cubic))}>
              <Text style={styles.questionNumber}>QUESTION 12 OF 15</Text>
              <Text style={styles.questionTitle}>Tobacco, vaping, or alcohol exposure?</Text>
              <Text style={styles.questionSubtitle}>
                Nicotine causes vasoconstriction of epiphyseal capillaries, inhibiting osteoblast delivery to the growth plate.
              </Text>

              <View style={styles.cardList}>
                {[
                  { title: 'No, never', sub: 'Optimal capillary micro-circulation to bone plates' },
                  { title: 'Occasional exposure', sub: 'Mild vascular constriction and sleep disruption' },
                  { title: 'Regular exposure', sub: 'Elevated risk of stunted ossification velocity' },
                ].map((item) => {
                  const isSelected = smokeDrink === item.title;
                  return (
                    <TouchableOpacity
                      key={item.title}
                      style={[
                        styles.optionCard,
                        isSelected ? styles.optionCardActive : styles.optionCardInactive,
                      ]}
                      onPress={() => {
                        setSmokeDrink(item.title);
                        Haptics.selectionAsync().catch(() => {});
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.optionLeft}>
                        <View>
                          <Text style={styles.optionTitle}>{item.title}</Text>
                          <Text style={styles.optionDescription}>{item.sub}</Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.checkCircle,
                          isSelected && styles.checkCircleActive,
                        ]}
                      >
                        {isSelected && (
                          <Check size={14} color="#FFFFFF" strokeWidth={3} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          )}

          {/* ========================================================================= */}
          {/* QUESTION 13: SEDENTARY SITTING TIME                                       */}
          {/* ========================================================================= */}
          {currentStep === 13 && (
            <Animated.View entering={FadeInUp.duration(380).easing(Easing.out(Easing.cubic))}>
              <Text style={styles.questionNumber}>QUESTION 13 OF 15</Text>
              <Text style={styles.questionTitle}>Hours spent sitting per day?</Text>
              <Text style={styles.questionSubtitle}>
                Prolonged seated slouching compresses the L1–L5 lumbar discs by up to 2.0 cm over the course of a day.
              </Text>

              <View style={styles.cardList}>
                {[
                  { title: '< 4 hours', sub: 'Low gravitational disc compression' },
                  { title: '4 – 8 hrs', sub: 'Moderate diurnal disc compaction' },
                  { title: '8+ hours', sub: 'High pelvic tilt and thoracic slouching risk' },
                ].map((item) => {
                  const isSelected = sittingHours === item.title;
                  return (
                    <TouchableOpacity
                      key={item.title}
                      style={[
                        styles.optionCard,
                        isSelected ? styles.optionCardActive : styles.optionCardInactive,
                      ]}
                      onPress={() => {
                        setSittingHours(item.title);
                        Haptics.selectionAsync().catch(() => {});
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.optionLeft}>
                        <View>
                          <Text style={styles.optionTitle}>{item.title}</Text>
                          <Text style={styles.optionDescription}>{item.sub}</Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.checkCircle,
                          isSelected && styles.checkCircleActive,
                        ]}
                      >
                        {isSelected && (
                          <Check size={14} color="#FFFFFF" strokeWidth={3} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          )}

          {/* ========================================================================= */}
          {/* QUESTION 14: PHYSICAL ACTIVITY LEVEL                                      */}
          {/* ========================================================================= */}
          {currentStep === 14 && (
            <Animated.View entering={FadeInUp.duration(380).easing(Easing.out(Easing.cubic))}>
              <Text style={styles.questionNumber}>QUESTION 14 OF 15</Text>
              <Text style={styles.questionTitle}>Weekly physical activity level?</Text>
              <Text style={styles.questionSubtitle}>
                Progressive dynamic loading stimulates local IGF-1 expression and osteoblast bone mineralization.
              </Text>

              <View style={styles.cardList}>
                {[
                  { title: 'Sedentary (< 1 hr/week)', sub: 'Low osteogenic remodeling stimulus' },
                  { title: 'Light Activity (1-3 hrs/week)', sub: 'Basic circulatory maintenance' },
                  { title: 'Moderate Active (3-5 hrs/week)', sub: 'Regular sports, sprinting, or resistance training' },
                  { title: 'High Athletic (6+ hrs/week)', sub: 'High bone remodeling and growth hormone pulse' },
                ].map((item) => {
                  const isSelected = activityLevel === item.title;
                  return (
                    <TouchableOpacity
                      key={item.title}
                      style={[
                        styles.optionCard,
                        isSelected ? styles.optionCardActive : styles.optionCardInactive,
                      ]}
                      onPress={() => {
                        setActivityLevel(item.title);
                        Haptics.selectionAsync().catch(() => {});
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.optionLeft}>
                        <View>
                          <Text style={styles.optionTitle}>{item.title}</Text>
                          <Text style={styles.optionDescription}>{item.sub}</Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.checkCircle,
                          isSelected && styles.checkCircleActive,
                        ]}
                      >
                        {isSelected && (
                          <Check size={14} color="#FFFFFF" strokeWidth={3} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          )}

          {/* ========================================================================= */}
          {/* QUESTION 15: PRIMARY PROTOCOL MOTIVATION                                  */}
          {/* ========================================================================= */}
          {currentStep === 15 && (
            <Animated.View entering={FadeInUp.duration(380).easing(Easing.out(Easing.cubic))}>
              <Text style={styles.questionNumber}>QUESTION 15 OF {totalSteps}</Text>
              <Text style={styles.questionTitle}>What is your primary motivation?</Text>
              <Text style={styles.questionSubtitle}>
                Customizes your daily protocol checklist and milestone celebration badges.
              </Text>

              <View style={styles.cardList}>
                {[
                  { title: 'Maximize my genetic height potential', sub: 'Unlock every millimeter before growth plates close' },
                  { title: 'Decompress spine & fix posture', sub: 'Reverse slouching, anterior pelvic tilt & spinal compression' },
                  { title: 'Athletic & sports performance', sub: 'Basketball, volleyball, swimming, athletic reach' },
                  { title: 'Personal confidence & presence', sub: 'Stand taller with commanding physical alignment' },
                ].map((item) => {
                  const isSelected = motivation === item.title;
                  return (
                    <TouchableOpacity
                      key={item.title}
                      style={[
                        styles.optionCard,
                        isSelected ? styles.optionCardActive : styles.optionCardInactive,
                      ]}
                      onPress={() => {
                        setMotivation(item.title);
                        Haptics.selectionAsync().catch(() => {});
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.optionLeft}>
                        <View>
                          <Text style={styles.optionTitle}>{item.title}</Text>
                          <Text style={styles.optionDescription}>{item.sub}</Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.checkCircle,
                          isSelected && styles.checkCircleActive,
                        ]}
                      >
                        {isSelected && (
                          <Check size={14} color="#FFFFFF" strokeWidth={3} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          )}

          {/* Continue / Next Button */}
          <View style={styles.bottomCtaRow}>
            <GlassButton
              onPress={handleNext}
              style={styles.continueButton}
            >
              <LinearGradient
                colors={['#0284C7', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.continueButtonText}>
                {currentStep === totalSteps ? 'Complete Clinical Analysis →' : 'Continue to Next Step'}
              </Text>
              <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />
            </GlassButton>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GlassBackgroundCanvas>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stagePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(240, 249, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(186, 230, 253, 0.85)',
  },
  stagePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.5,
  },
  stepCounterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  stepCounterText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    fontVariant: ['tabular-nums'],
  },
  progressBarTrack: {
    width: '100%',
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0284C7',
    borderRadius: 2.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 60,
  },
  questionNumber: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  categoryQuestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  catBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  catBadgeIcon: {
    fontSize: 12,
  },
  catBadgeName: {
    fontSize: 11,
    fontWeight: '700',
  },
  optionEmojiWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  optionEmoji: {
    fontSize: 18,
  },
  questionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  questionSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 16,
  },
  cardList: {
    gap: 10,
    marginBottom: 16,
  },
  // Authentic Frosted Glass Option Card (NO white opaque squares!)
  optionCard: {
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionCardInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  optionCardActive: {
    backgroundColor: 'rgba(224, 242, 254, 0.70)',
    borderWidth: 2,
    borderColor: '#0284C7',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  // Modern 3D Glass Badges for Question 1
  modernBadgeMale: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  modernBadgeFemale: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  badgeGradientFill: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernBadgeSymbol: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  karyotypeChipBlue: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(2, 132, 199, 0.12)',
  },
  karyotypeChipBlueText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
  },
  karyotypeChipPurple: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
  },
  karyotypeChipPurpleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9333EA',
  },
  optionDescription: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1.5,
    borderColor: 'rgba(148, 163, 184, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  velocityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  velocityBadgeActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  velocityBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  velocityBadgeTextActive: {
    color: '#FFFFFF',
  },
  globeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingVertical: 6,
  },
  clinicalFactBox: {
    padding: 14,
    marginTop: 6,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  factTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  factText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 16,
  },
  rulerContainerCard: {
    padding: 12,
    marginBottom: 14,
  },
  unknownFallbackCard: {
    padding: 18,
    marginBottom: 12,
  },
  unknownTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  unknownSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },
  toggleFallbackBtn: {
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 14,
  },
  toggleFallbackText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
    textDecorationLine: 'underline',
  },
  tannerPreviewCard: {
    padding: 14,
    marginBottom: 12,
    backgroundColor: 'rgba(240, 249, 255, 0.65)',
  },
  tannerPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tannerPreviewLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tannerPreviewValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0284C7',
    marginTop: 2,
  },
  tannerPreviewBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(2, 132, 199, 0.12)',
  },
  tannerPreviewBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  bottomCtaRow: {
    marginTop: 10,
  },
  continueButton: {
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
  continueButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
