import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Utensils,
  Plus,
  Activity,
  ShieldCheck,
  Trash2,
  Apple,
  Wheat,
  Droplet,
  Sparkles,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAppStore } from '../../lib/store';
import GlassCard from '../../components/GlassCard';
import GlassButton from '../../components/GlassButton';
import GlassBackgroundCanvas from '../../components/GlassBackgroundCanvas';
import CircularProgressRingGlass from '../../components/CircularProgressRingGlass';
import FoodLogModal from '../../components/FoodLogModal';

export default function NutritionScreen() {
  const meals = useAppStore((state) => state.meals);
  const deleteMeal = useAppStore((state) => state.deleteMeal);

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Compute live nutritional totals from store
  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const targetCalories = 2400;
  const calPct = Math.min(100, Math.round((totalCalories / targetCalories) * 100));

  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
  const targetProtein = 130;
  const proteinPct = Math.min(100, Math.round((totalProtein / targetProtein) * 100));

  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
  const targetCarbs = 260;
  const carbsPct = Math.min(100, Math.round((totalCarbs / targetCarbs) * 100));

  const totalFat = meals.reduce((sum, m) => sum + m.fat, 0);
  const targetFat = 70;
  const fatPct = Math.min(100, Math.round((totalFat / targetFat) * 100));

  return (
    <GlassBackgroundCanvas>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <Animated.View
          entering={FadeInDown.delay(50).springify()}
          style={styles.headerContainer}
        >
          <View style={styles.brandPill}>
            <Activity size={14} color="#2563EB" />
            <Text style={styles.brandText}>GoTall</Text>
            <View style={styles.onlineDot} />
          </View>

          <GlassButton
            onPress={() => setIsLogModalOpen(true)}
            style={styles.logActionBtn}
          >
            <Plus size={14} color="#FFFFFF" />
            <Text style={styles.logActionBtnText}>Log Food</Text>
          </GlassButton>
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title Section */}
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={styles.titleSection}
          >
            <Text style={styles.subheadingText}>Bone Matrix Nutrition</Text>
            <Text style={styles.headingText}>Daily Fuel & Macros</Text>
          </Animated.View>

          {/* Central Calories Meter Card */}
          <Animated.View entering={FadeInDown.delay(180).springify()}>
            <GlassCard style={styles.cardSpacing}>
              <View style={styles.meterCenterWrap}>
                <CircularProgressRingGlass
                  size={140}
                  strokeWidth={11}
                  percentage={calPct}
                  color="#2563EB"
                  valueText={`${totalCalories}`}
                  unitText={`of ${targetCalories} kcal`}
                  label="Daily Caloric Intake"
                  sublabel={`${calPct}% of target reached`}
                />
              </View>

              {/* 3 Macro Gauges */}
              <View style={styles.macroRow}>
                {/* Protein */}
                <View style={styles.macroCol}>
                  <View style={[styles.macroIconWrap, { backgroundColor: 'rgba(249, 115, 22, 0.12)' }]}>
                    <Apple size={14} color="#F97316" />
                  </View>
                  <Text style={styles.macroLabel}>Protein</Text>
                  <Text style={styles.macroValue}>{totalProtein}g</Text>
                  <View style={styles.macroProgressBarBg}>
                    <View
                      style={[
                        styles.macroProgressBarFill,
                        { width: `${proteinPct}%`, backgroundColor: '#F97316' },
                      ]}
                    />
                  </View>
                  <Text style={styles.macroGoal}>Goal {targetProtein}g</Text>
                </View>

                {/* Carbs */}
                <View style={[styles.macroCol, styles.macroColBorder]}>
                  <View style={[styles.macroIconWrap, { backgroundColor: 'rgba(37, 99, 235, 0.12)' }]}>
                    <Wheat size={14} color="#2563EB" />
                  </View>
                  <Text style={styles.macroLabel}>Carbs</Text>
                  <Text style={styles.macroValue}>{totalCarbs}g</Text>
                  <View style={styles.macroProgressBarBg}>
                    <View
                      style={[
                        styles.macroProgressBarFill,
                        { width: `${carbsPct}%`, backgroundColor: '#2563EB' },
                      ]}
                    />
                  </View>
                  <Text style={styles.macroGoal}>Goal {targetCarbs}g</Text>
                </View>

                {/* Fats */}
                <View style={styles.macroCol}>
                  <View style={[styles.macroIconWrap, { backgroundColor: 'rgba(234, 179, 8, 0.15)' }]}>
                    <Droplet size={14} color="#CA8A04" />
                  </View>
                  <Text style={styles.macroLabel}>Fats</Text>
                  <Text style={styles.macroValue}>{totalFat}g</Text>
                  <View style={styles.macroProgressBarBg}>
                    <View
                      style={[
                        styles.macroProgressBarFill,
                        { width: `${fatPct}%`, backgroundColor: '#EAB308' },
                      ]}
                    />
                  </View>
                  <Text style={styles.macroGoal}>Goal {targetFat}g</Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Logged Meals Header */}
          <Animated.View
            entering={FadeInDown.delay(260).springify()}
            style={styles.sectionHeaderRow}
          >
            <Text style={styles.sectionTitle}>
              Today&apos;s Logged Meals ({meals.length})
            </Text>
            <GlassButton
              onPress={() => setIsLogModalOpen(true)}
              style={styles.addMealBtn}
            >
              <Plus size={12} color="#2563EB" />
              <Text style={styles.addMealBtnText}>Add Meal</Text>
            </GlassButton>
          </Animated.View>

          {/* Live Meals List */}
          <Animated.View entering={FadeInDown.delay(320).springify()} style={styles.mealsListWrap}>
            {meals.map((m) => (
              <GlassCard key={m.id} style={styles.mealCard}>
                <View style={styles.mealRow}>
                  <View style={styles.mealIconWrap}>
                    <Utensils size={18} color="#2563EB" />
                  </View>

                  <View style={styles.mealDetails}>
                    <View style={styles.mealMetaRow}>
                      <Text style={styles.mealCategory}>{m.category}</Text>
                      <Text style={styles.mealTime}>• {m.time}</Text>
                    </View>
                    <Text style={styles.mealName}>{m.name}</Text>
                    <Text style={styles.mealNutrients}>
                      {m.calories} kcal • {m.protein}g P • {m.carbs}g C • {m.fat}g F
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => deleteMeal(m.id)}
                    style={styles.deleteBtn}
                    accessibilityLabel="Delete meal"
                  >
                    <Trash2 size={15} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ))}

            {meals.length === 0 && (
              <GlassCard style={styles.emptyCard}>
                <View style={styles.emptyIconWrap}>
                  <Utensils size={28} color="#94A3B8" />
                </View>
                <Text style={styles.emptyTitle}>No meals logged yet today</Text>
                <Text style={styles.emptySubtitle}>
                  Track your protein, calcium, and collagen intake to fuel epiphyseal bone growth.
                </Text>
                <GlassButton
                  onPress={() => setIsLogModalOpen(true)}
                  style={styles.emptyActionBtn}
                >
                  <Plus size={14} color="#FFFFFF" />
                  <Text style={styles.emptyActionBtnText}>Log First Meal</Text>
                </GlassButton>
              </GlassCard>
            )}
          </Animated.View>

          {/* Scientific Citation Card */}
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <GlassCard style={styles.citationCard}>
              <View style={styles.citationRow}>
                <ShieldCheck size={16} color="#2563EB" />
                <Text style={styles.citationText}>
                  Skeletal cartilage cells (chondrocytes) require positive nitrogen balance and amino acids (glycine, leucine) to synthesize type II collagen matrix.
                </Text>
              </View>
            </GlassCard>
          </Animated.View>
        </ScrollView>

        {/* Food Log Modal */}
        <FoodLogModal
          visible={isLogModalOpen}
          onClose={() => setIsLogModalOpen(false)}
        />
      </SafeAreaView>
    </GlassBackgroundCanvas>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  brandText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  logActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  logActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  titleSection: {
    marginVertical: 12,
  },
  subheadingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  headingText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  cardSpacing: {
    marginBottom: 20,
    padding: 20,
  },
  meterCenterWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.6)',
  },
  macroCol: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 4,
  },
  macroColBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
  },
  macroIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 1,
  },
  macroProgressBarBg: {
    width: '80%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(226, 232, 240, 0.8)',
    marginTop: 6,
    overflow: 'hidden',
  },
  macroProgressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  macroGoal: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  addMealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 246, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(191, 219, 254, 0.9)',
  },
  addMealBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  mealsListWrap: {
    gap: 10,
    marginBottom: 20,
  },
  mealCard: {
    padding: 14,
    borderRadius: 18,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mealIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealDetails: {
    flex: 1,
  },
  mealMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  mealCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    textTransform: 'uppercase',
  },
  mealTime: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  mealName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  mealNutrients: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(241, 245, 249, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    padding: 28,
    alignItems: 'center',
    borderRadius: 24,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(241, 245, 249, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  emptySubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 4,
    paddingHorizontal: 10,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: '#2563EB',
  },
  emptyActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  citationCard: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  citationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  citationText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#475569',
    flex: 1,
    lineHeight: 16,
  },
});
