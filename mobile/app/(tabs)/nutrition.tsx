import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
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
  Check,
  Flame,
  ChevronRight,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAppStore } from '../../lib/store';
import GlassCard from '../../components/GlassCard';
import GlassButton from '../../components/GlassButton';
import GlassBackgroundCanvas from '../../components/GlassBackgroundCanvas';
import CircularProgressRingGlass from '../../components/CircularProgressRingGlass';
import FoodLogModal, { FoodItem, DEFAULT_PRESETS } from '../../components/FoodLogModal';

const FOOD_CATEGORY_FILTERS = ['All', 'High Protein', 'Bone Mineralization', 'Bedtime Anabolic', 'Growth Micronutrients'];

export default function NutritionScreen() {
  const meals = useAppStore((state) => state.meals);
  const deleteMeal = useAppStore((state) => state.deleteMeal);
  const addMeal = useAppStore((state) => state.addMeal);
  const liveStoreMeals = useAppStore((state) => state.livePresetMeals);

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedFoodForModal, setSelectedFoodForModal] = useState<FoodItem | null>(null);
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState('All');
  const [quickAddedId, setQuickAddedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    useAppStore.getState().fetchLiveContent().catch(() => {});
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await useAppStore.getState().fetchLiveContent().catch(() => {});
    setIsRefreshing(false);
  };

  // Build unified live catalog from admin-managed livePresetMeals + DEFAULT_PRESETS
  const catalogFoods: FoodItem[] = useMemo(() => {
    const list: FoodItem[] = [];
    const seenNames = new Set<string>();

    if (Array.isArray(liveStoreMeals)) {
      liveStoreMeals.forEach((m: any) => {
        const normName = String(m.name || '').trim().toLowerCase();
        if (normName && !seenNames.has(normName)) {
          seenNames.add(normName);
          list.push({
            id: String(m.id),
            name: String(m.name).trim(),
            serving_size: m.serving_size || m.servingSize || '100g',
            category: m.category || 'High Protein',
            calories: Number(m.calories) || 0,
            protein: Number(m.protein) || 0,
            carbs: Number(m.carbs) || 0,
            fat: Number(m.fat) || 0,
            calcium: Number(m.calcium ?? 0),
            zinc: Number(m.zinc ?? 0),
            vitaminD3: Number(m.vitaminD3 ?? m.vitamin_d3 ?? 0),
            clinicalRationale: m.clinicalRationale || m.clinical_rationale || '',
          });
        }
      });
    }

    DEFAULT_PRESETS.forEach((p) => {
      const normName = p.name.trim().toLowerCase();
      if (!seenNames.has(normName)) {
        seenNames.add(normName);
        list.push(p);
      }
    });

    return list;
  }, [liveStoreMeals]);

  // Filter catalog by active category
  const filteredCatalog = useMemo(() => {
    if (selectedCatalogCategory === 'All') return catalogFoods;
    return catalogFoods.filter(
      (f) => (f.category || '').toLowerCase() === selectedCatalogCategory.toLowerCase()
    );
  }, [catalogFoods, selectedCatalogCategory]);

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

  // 1-Tap Quick Log directly from the screen
  const handleQuickLog = (item: FoodItem) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setQuickAddedId(item.id);

    addMeal({
      name: item.name,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      category: 'Lunch',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    setTimeout(() => {
      setQuickAddedId(null);
    }, 1500);
  };

  const handleOpenFoodModal = (item?: FoodItem) => {
    Haptics.selectionAsync().catch(() => {});
    setSelectedFoodForModal(item || null);
    setIsLogModalOpen(true);
  };

  return (
    <GlassBackgroundCanvas>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <Animated.View
          entering={FadeInDown.delay(50).springify()}
          style={styles.headerContainer}
        >
          <View style={styles.brandPill}>
            <Image
              source={require('../../assets/icon.png')}
              style={{ width: 18, height: 18, borderRadius: 5 }}
              resizeMode="cover"
            />
            <Text style={styles.brandText}>Tallgrame</Text>
            <View style={styles.onlineDot} />
          </View>
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#2563EB']}
            />
          }
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

          {/* VERIFIED GROWTH FOODS CATALOG SECTION (Admin-Managed Live Feed) */}
          <Animated.View entering={FadeInDown.delay(240).springify()}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>
                  Clinical Growth Foods ({filteredCatalog.length})
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Verified by pediatric endocrinology & bone matrix biology
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleOpenFoodModal()}
                style={styles.searchCatalogBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.searchCatalogBtnText}>Search all</Text>
                <ChevronRight size={13} color="#2563EB" />
              </TouchableOpacity>
            </View>

            {/* Category Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryChipsRow}
            >
              {FOOD_CATEGORY_FILTERS.map((cat) => {
                const isActive = selectedCatalogCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setSelectedCatalogCategory(cat);
                    }}
                    style={[
                      styles.catalogChip,
                      isActive && styles.catalogChipActive,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.catalogChipText,
                        isActive && styles.catalogChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Catalog Food Cards */}
            <View style={styles.catalogListWrap}>
              {filteredCatalog.slice(0, 6).map((item) => {
                const isLoggedNow = quickAddedId === item.id;
                return (
                  <GlassCard key={item.id} style={styles.catalogFoodCard}>
                    <TouchableOpacity
                      onPress={() => handleOpenFoodModal(item)}
                      style={styles.catalogCardInner}
                      activeOpacity={0.8}
                    >
                      <View style={styles.catalogInfoCol}>
                        <View style={styles.catalogTopRow}>
                          <Text style={styles.catalogFoodName} numberOfLines={1}>
                            {item.name}
                          </Text>
                          {item.category && (
                            <View style={styles.catalogTagPill}>
                              <Text style={styles.catalogTagText}>{item.category}</Text>
                            </View>
                          )}
                        </View>

                        <Text style={styles.catalogServing}>
                          {item.serving_size || '100g'} • {item.calories} kcal
                        </Text>

                        {item.clinicalRationale ? (
                          <Text style={styles.catalogRationale} numberOfLines={2}>
                            ✨ {item.clinicalRationale}
                          </Text>
                        ) : null}
                      </View>

                      {/* Nutrient Metrics & 1-Tap Log Button */}
                      <View style={styles.catalogActionsCol}>
                        <View style={styles.catalogMacrosBadge}>
                          <Text style={styles.catalogProteinText}>{item.protein}g P</Text>
                          {item.calcium ? (
                            <Text style={styles.catalogCaText}>{item.calcium}mg Ca</Text>
                          ) : null}
                        </View>

                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            handleQuickLog(item);
                          }}
                          style={[
                            styles.quickLogBtn,
                            isLoggedNow && styles.quickLogBtnSuccess,
                          ]}
                          activeOpacity={0.8}
                          accessibilityLabel={`Quick add ${item.name}`}
                        >
                          {isLoggedNow ? (
                            <>
                              <Check size={12} color="#FFFFFF" strokeWidth={3} />
                              <Text style={styles.quickLogBtnTextSuccess}>Added</Text>
                            </>
                          ) : (
                            <>
                              <Plus size={12} color="#FFFFFF" strokeWidth={2.5} />
                              <Text style={styles.quickLogBtnText}>+ Log</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  </GlassCard>
                );
              })}
            </View>
          </Animated.View>

          {/* Logged Meals Header */}
          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            style={styles.sectionHeaderRow}
          >
            <View>
              <Text style={styles.sectionTitle}>
                Today&apos;s Logged Meals ({meals.length})
              </Text>
              <Text style={styles.sectionSubtitle}>
                {totalProtein}g protein • {totalCalories} kcal consumed
              </Text>
            </View>

            <GlassButton
              onPress={() => handleOpenFoodModal()}
              style={styles.addMealBtn}
            >
              <Plus size={12} color="#2563EB" />
              <Text style={styles.addMealBtnText}>Add Meal</Text>
            </GlassButton>
          </Animated.View>

          {/* Live Meals List */}
          <Animated.View entering={FadeInDown.delay(360).springify()} style={styles.mealsListWrap}>
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
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      deleteMeal(m.id);
                    }}
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
                  onPress={() => handleOpenFoodModal()}
                  style={styles.emptyActionBtn}
                >
                  <Plus size={14} color="#FFFFFF" />
                  <Text style={styles.emptyActionBtnText}>Log First Meal</Text>
                </GlassButton>
              </GlassCard>
            )}
          </Animated.View>

          {/* Scientific Citation Card */}
          <Animated.View entering={FadeInDown.delay(420).springify()}>
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

        {/* Enhanced Synchronized Food Log Modal */}
        <FoodLogModal
          visible={isLogModalOpen}
          onClose={() => {
            setIsLogModalOpen(false);
            setSelectedFoodForModal(null);
          }}
          initialFood={selectedFoodForModal}
        />
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  brandText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
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
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
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
    marginBottom: 16,
    marginTop: 4,
  },
  subheadingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
    marginBottom: 20,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  macroCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  macroColBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#F1F5F9',
  },
  macroIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  macroLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  macroValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  macroProgressBarBg: {
    width: '80%',
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginVertical: 6,
    overflow: 'hidden',
  },
  macroProgressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  macroGoal: {
    fontSize: 9,
    fontWeight: '600',
    color: '#94A3B8',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
    fontWeight: '500',
  },
  searchCatalogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  searchCatalogBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  categoryChipsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 10,
  },
  catalogChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catalogChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  catalogChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  catalogChipTextActive: {
    color: '#2563EB',
  },
  catalogListWrap: {
    gap: 10,
    marginBottom: 16,
  },
  catalogFoodCard: {
    padding: 12,
    borderRadius: 18,
  },
  catalogCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catalogInfoCol: {
    flex: 1,
    marginRight: 10,
  },
  catalogTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  catalogFoodName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    flexShrink: 1,
  },
  catalogTagPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  catalogTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563EB',
  },
  catalogServing: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  catalogRationale: {
    fontSize: 10,
    color: '#0284C7',
    marginTop: 3,
    fontWeight: '500',
    lineHeight: 14,
  },
  catalogActionsCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  catalogMacrosBadge: {
    alignItems: 'flex-end',
  },
  catalogProteinText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#2563EB',
  },
  catalogCaText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  quickLogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  quickLogBtnSuccess: {
    backgroundColor: '#10B981',
  },
  quickLogBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quickLogBtnTextSuccess: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addMealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
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
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    padding: 28,
    alignItems: 'center',
    borderRadius: 20,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
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
