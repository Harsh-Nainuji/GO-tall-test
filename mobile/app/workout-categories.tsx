import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  ChevronLeft,
  Sparkles,
  Check,
  Dumbbell,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  Calendar,
  Layers,
  Zap,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { useAppStore, CLINICAL_STRETCHES, StretchExercise } from '../lib/store';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassBackgroundCanvas from '../components/GlassBackgroundCanvas';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WorkoutCategoriesScreen() {
  const router = useRouter();
  const categories = useAppStore((state) => state.categories || []);
  const categoryQuestions = useAppStore((state) => state.categoryQuestions || []);
  const workoutDaysPerWeek = useAppStore((state) => state.workoutDaysPerWeek ?? 4);
  const activePlanDay = useAppStore((state) => state.activePlanDay);
  const weeklyPlan = useAppStore((state) => state.weeklyPlan ?? {});

  // Initially select the first category or 'cat-1'
  const [selectedCatId, setSelectedCatId] = useState<string>(
    categories[0]?.id || 'cat-1'
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isActivating, setIsActivating] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const selectedCategory = categories.find((c) => c.id === selectedCatId) || categories[0];

  // Retrieve questions specifically tied to this category
  const activeQuestions = categoryQuestions.filter(
    (q) => q.active && (q.categoryId === selectedCategory?.id || q.categoryId === selectedCategory?.slug)
  );

  const handleSelectOption = (questionId: string, optionLabel: string) => {
    Haptics.selectionAsync().catch(() => {});
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionLabel,
    }));
  };

  const handleActivateCategory = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setIsActivating(true);

    // Filter CLINICAL_STRETCHES matching this category's workoutIds
    const catWorkoutIds = selectedCategory?.workoutIds || [];
    let matchingExercises = CLINICAL_STRETCHES.filter((stretch) => {
      const sIdStr = String(stretch.id);
      const stretchNumStr = `stretch-${Number(stretch.id) + 1}`;
      return catWorkoutIds.includes(sIdStr) || catWorkoutIds.includes(stretchNumStr);
    });

    if (matchingExercises.length === 0) {
      // Fallback: match by title keywords or category text
      matchingExercises = CLINICAL_STRETCHES.filter(
        (s) =>
          s.category.toLowerCase().includes(selectedCategory?.slug.toLowerCase() || '') ||
          s.targetZone.toLowerCase().includes(selectedCategory?.name.toLowerCase() || '')
      );
      if (matchingExercises.length === 0) {
        matchingExercises = CLINICAL_STRETCHES.slice(0, 4);
      }
    }

    // Rebuild schedule prioritizing these category workouts
    const scheduleDays = Object.keys(weeklyPlan);
    const daysToUse = scheduleDays.length > 0 ? scheduleDays : ['Monday', 'Tuesday', 'Thursday', 'Saturday'];
    const newPlan: Record<string, StretchExercise[]> = {};

    daysToUse.forEach((day, idx) => {
      // Mix category exercises with global stretches
      const primary = matchingExercises[idx % matchingExercises.length];
      const secondary = matchingExercises[(idx + 1) % matchingExercises.length] || CLINICAL_STRETCHES[idx % CLINICAL_STRETCHES.length];
      const tertiary = CLINICAL_STRETCHES[(idx + 2) % CLINICAL_STRETCHES.length];
      const quaternary = CLINICAL_STRETCHES[(idx + 3) % CLINICAL_STRETCHES.length];

      const roster: StretchExercise[] = [];
      [primary, secondary, tertiary, quaternary].forEach((item) => {
        if (item && !roster.some((r) => r.id === item.id)) {
          roster.push(item);
        }
      });
      newPlan[day] = roster;
    });

    // Update store state
    useAppStore.setState({
      weeklyPlan: newPlan,
      activePlanDay: daysToUse[0],
    });

    setSuccessBanner(`Activated "${selectedCategory?.name}"! Schedule calibrated.`);

    setTimeout(() => {
      setIsActivating(false);
      router.back();
    }, 900);
  };

  return (
    <GlassBackgroundCanvas>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ChevronLeft size={20} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Workout Categories</Text>
            <Text style={styles.headerSubtitle}>Personalized Routines & Diagnostics</Text>
          </View>

          <View style={styles.placeholder} />
        </View>

        {successBanner && (
          <Animated.View entering={FadeInDown} style={styles.successBar}>
            <CheckCircle2 size={16} color="#10B981" />
            <Text style={styles.successBarText}>{successBanner}</Text>
          </Animated.View>
        )}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Section Introduction */}
          <View style={styles.introCard}>
            <View style={styles.introHeader}>
              <View style={styles.introIconBox}>
                <Layers size={18} color="#0284C7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.introTitle}>Select Your Training Focus</Text>
                <Text style={styles.introSub}>
                  Switch between height growth traction, posture correction, weight gain, or bodybuilder V-taper.
                </Text>
              </View>
            </View>
          </View>

          {/* Categories Grid */}
          <Text style={styles.sectionHeader}>Available Categories ({categories.length})</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => {
              const isSelected = cat.id === selectedCatId;
              const workoutCount = cat.workoutIds?.length || 0;

              return (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.8}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setSelectedCatId(cat.id);
                  }}
                  style={[
                    styles.categoryCard,
                    isSelected && styles.categoryCardSelected,
                    { borderColor: isSelected ? cat.color || '#0284C7' : 'rgba(226, 232, 240, 0.8)' },
                  ]}
                >
                  <View style={styles.categoryCardTop}>
                    <View
                      style={[
                        styles.catIconWrap,
                        { backgroundColor: `${cat.color || '#0284C7'}18` },
                      ]}
                    >
                      <Text style={styles.catEmoji}>{cat.icon || '🌱'}</Text>
                    </View>

                    {isSelected && (
                      <View
                        style={[
                          styles.activeBadge,
                          { backgroundColor: cat.color || '#0284C7' },
                        ]}
                      >
                        <Check size={10} color="#FFFFFF" strokeWidth={3} />
                        <Text style={styles.activeBadgeText}>ACTIVE</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.catName} numberOfLines={2}>
                    {cat.name}
                  </Text>
                  <Text style={styles.catDesc} numberOfLines={2}>
                    {cat.description}
                  </Text>

                  <View style={styles.catBottomRow}>
                    <View style={styles.workoutCountPill}>
                      <Dumbbell size={11} color="#64748B" />
                      <Text style={styles.workoutCountText}>
                        {workoutCount > 0 ? `${workoutCount} exercises` : 'Dynamic pool'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selected Category Diagnostic Questions */}
          {selectedCategory && (
            <Animated.View entering={FadeInUp.duration(300)} style={styles.diagnosticSection}>
              <View style={styles.diagnosticHeaderRow}>
                <View style={styles.diagnosticTitleGroup}>
                  <View
                    style={[
                      styles.diagnosticBadge,
                      { backgroundColor: `${selectedCategory.color || '#0284C7'}15` },
                    ]}
                  >
                    <Text style={styles.diagnosticBadgeIcon}>{selectedCategory.icon}</Text>
                    <Text
                      style={[
                        styles.diagnosticBadgeText,
                        { color: selectedCategory.color || '#0284C7' },
                      ]}
                    >
                      {selectedCategory.name}
                    </Text>
                  </View>
                  <Text style={styles.diagnosticTitle}>Targeted Diagnostic Questions</Text>
                  <Text style={styles.diagnosticSubtitle}>
                    Answer these clinical calibration questions to tune your routine intensity.
                  </Text>
                </View>
              </View>

              {activeQuestions.length === 0 ? (
                <GlassCard style={styles.noQuestionsCard}>
                  <CheckCircle2 size={24} color="#10B981" />
                  <Text style={styles.noQuestionsTitle}>Pre-Calibrated Protocol</Text>
                  <Text style={styles.noQuestionsSub}>
                    This standard biomechanical category is ready to activate immediately into your weekly schedule.
                  </Text>
                </GlassCard>
              ) : (
                <View style={styles.questionsList}>
                  {activeQuestions.map((q, qIdx) => {
                    const currentSelected = answers[q.id] || q.options[0]?.label;

                    return (
                      <GlassCard key={q.id} style={styles.questionCard}>
                        <View style={styles.questionCardHeader}>
                          <View style={styles.qIndexPill}>
                            <Text style={styles.qIndexText}>Question {qIdx + 1}</Text>
                          </View>
                          <Text style={styles.questionText}>{q.questionText}</Text>
                          {q.subtitle && (
                            <Text style={styles.questionSubText}>{q.subtitle}</Text>
                          )}
                        </View>

                        <View style={styles.optionsList}>
                          {q.options.map((opt, oIdx) => {
                            const isChosen = currentSelected === opt.label;
                            return (
                              <TouchableOpacity
                                key={oIdx}
                                activeOpacity={0.8}
                                onPress={() => handleSelectOption(q.id, opt.label)}
                                style={[
                                  styles.optionItem,
                                  isChosen && styles.optionItemChosen,
                                ]}
                              >
                                <View style={styles.optionItemLeft}>
                                  {opt.icon && (
                                    <Text style={styles.optionEmoji}>{opt.icon}</Text>
                                  )}
                                  <View style={{ flex: 1 }}>
                                    <Text
                                      style={[
                                        styles.optionLabel,
                                        isChosen && styles.optionLabelChosen,
                                      ]}
                                    >
                                      {opt.label}
                                    </Text>
                                    {opt.sublabel && (
                                      <Text style={styles.optionSublabel}>
                                        {opt.sublabel}
                                      </Text>
                                    )}
                                  </View>
                                </View>

                                <View
                                  style={[
                                    styles.optionRadio,
                                    isChosen && styles.optionRadioChosen,
                                  ]}
                                >
                                  {isChosen && (
                                    <View style={styles.optionRadioInner} />
                                  )}
                                </View>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </GlassCard>
                    );
                  })}
                </View>
              )}

              {/* Action Button */}
              <View style={styles.ctaContainer}>
                <GlassButton
                  onPress={handleActivateCategory}
                  disabled={isActivating}
                  style={styles.activateButton}
                >
                  <LinearGradient
                    colors={['#0284C7', '#2563EB']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <Zap size={18} color="#FFFFFF" />
                  <Text style={styles.activateButtonText}>
                    {isActivating
                      ? 'Calibrating Routine...'
                      : `Activate ${selectedCategory.name} Routine`}
                  </Text>
                  <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />
                </GlassButton>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </GlassBackgroundCanvas>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  placeholder: {
    width: 38,
  },
  successBar: {
    marginHorizontal: 20,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  successBarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  introCard: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.85)',
    marginBottom: 16,
  },
  introHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  introIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(2, 132, 199, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  introTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  introSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  categoryCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    justifyContent: 'space-between',
    minHeight: 140,
  },
  categoryCardSelected: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  catIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catEmoji: {
    fontSize: 20,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  catName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    lineHeight: 17,
  },
  catDesc: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 14,
    marginBottom: 8,
  },
  catBottomRow: {
    marginTop: 'auto',
  },
  workoutCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(241, 245, 249, 0.8)',
    alignSelf: 'flex-start',
  },
  workoutCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  diagnosticSection: {
    marginTop: 8,
  },
  diagnosticHeaderRow: {
    marginBottom: 14,
  },
  diagnosticTitleGroup: {
    gap: 4,
  },
  diagnosticBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  diagnosticBadgeIcon: {
    fontSize: 12,
  },
  diagnosticBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  diagnosticTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  diagnosticSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 16,
  },
  noQuestionsCard: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    marginBottom: 16,
    gap: 8,
  },
  noQuestionsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  noQuestionsSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  questionsList: {
    gap: 14,
    marginBottom: 20,
  },
  questionCard: {
    padding: 16,
  },
  questionCardHeader: {
    marginBottom: 12,
  },
  qIndexPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  qIndexText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
  },
  questionText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 19,
  },
  questionSubText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 4,
    lineHeight: 15,
  },
  optionsList: {
    gap: 8,
  },
  optionItem: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionItemChosen: {
    backgroundColor: 'rgba(240, 249, 255, 0.95)',
    borderColor: '#0284C7',
  },
  optionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  optionEmoji: {
    fontSize: 16,
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  optionLabelChosen: {
    color: '#0284C7',
    fontWeight: '800',
  },
  optionSublabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRadioChosen: {
    borderColor: '#0284C7',
  },
  optionRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0284C7',
  },
  ctaContainer: {
    marginTop: 8,
  },
  activateButton: {
    height: 54,
    borderRadius: 27,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  activateButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

