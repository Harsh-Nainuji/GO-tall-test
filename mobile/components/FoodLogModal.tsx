// ✓ Modal rules applied — GlassCard, ScrollView, 85% maxHeight, SlideInDown
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Search, Plus, Utensils, Check, Flame, X, Sparkles, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import BottomSheet from './ui/BottomSheet';
import SkeletonShimmer from './ui/SkeletonShimmer';
import { useAppStore, LoggedMeal } from '../lib/store';
import { formatMacro } from '../lib/growth-calc';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { colors } from '../lib/theme';

interface FoodLogModalProps {
  visible: boolean;
  onClose: () => void;
  initialFood?: FoodItem | null;
}

export interface FoodItem {
  id: string;
  name: string;
  serving_size?: string;
  category?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  calcium?: number;
  zinc?: number;
  vitaminD3?: number;
  clinicalRationale?: string;
}

export const DEFAULT_PRESETS: FoodItem[] = [
  { id: 'p1', name: 'Greek Yogurt 0%', serving_size: '200g', category: 'High Protein', calories: 120, protein: 22, carbs: 8, fat: 0, calcium: 250, clinicalRationale: 'Casein & whey protein matrix for sustained skeletal repair' },
  { id: 'p2', name: 'Boiled Eggs (2)', serving_size: '2 large eggs', category: 'High Protein', calories: 156, protein: 13, carbs: 1, fat: 11, calcium: 50, clinicalRationale: 'Complete amino acid profile rich in leucine and choline' },
  { id: 'p3', name: 'Whole Milk', serving_size: '250ml', category: 'Bone Mineralization', calories: 152, protein: 8, carbs: 12, fat: 8, calcium: 300, clinicalRationale: 'High bioavailability calcium with vitamin D cofactor' },
  { id: 'p4', name: 'Paneer / Cottage Cheese', serving_size: '150g', category: 'Bedtime Anabolic', calories: 260, protein: 20, carbs: 4, fat: 18, calcium: 400, clinicalRationale: 'Slow-digesting micellar casein protects nocturnal growth pulse' },
  { id: 'p5', name: 'Chicken Breast', serving_size: '150g', category: 'High Protein', calories: 247, protein: 46, carbs: 0, fat: 5, calcium: 20, clinicalRationale: 'Lean structural protein essential for collagen type II synthesis' },
  { id: 'p6', name: 'Atlantic Salmon Fillet', serving_size: '150g', category: 'Bone Mineralization', calories: 280, protein: 34, carbs: 0, fat: 15, calcium: 15, vitaminD3: 600, clinicalRationale: 'High natural Vitamin D3 and Omega-3 for osteoblast activation' },
  { id: 'p7', name: 'Pumpkin Seeds (Pepitas)', serving_size: '30g', category: 'Growth Micronutrients', calories: 160, protein: 9, carbs: 4, fat: 13, zinc: 2.2, clinicalRationale: 'Dense zinc source supporting pediatric pituitary somatotropin' },
];

const MEAL_CATEGORIES: LoggedMeal['category'][] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const FOOD_CATEGORY_FILTERS = ['All', 'High Protein', 'Bone Mineralization', 'Bedtime Anabolic', 'Growth Micronutrients'];

export default function FoodLogModal({ visible, onClose, initialFood }: FoodLogModalProps) {
  const addMeal = useAppStore((state) => state.addMeal);
  const liveStoreMeals = useAppStore((state) => state.livePresetMeals);
  const fetchLiveContent = useAppStore((state) => state.fetchLiveContent);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [quickAddedId, setQuickAddedId] = useState<string | null>(null);

  // Form values
  const [mealName, setMealName] = useState('');
  const [servingSize, setServingSize] = useState('1 serving');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [category, setCategory] = useState<LoggedMeal['category']>('Breakfast');

  // Race-condition guard for async network requests
  const activeQueryId = useRef(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Silent sync on modal open
  useEffect(() => {
    if (visible) {
      // Trigger background sync to ensure latest admin-added foods are fresh
      fetchLiveContent().catch(() => {});
      if (initialFood) {
        handleSelectFood(initialFood);
      }
    } else {
      setSearchQuery('');
      setSelectedCategoryFilter('All');
      setQuickAddedId(null);
    }
  }, [visible, initialFood]);

  // 2. Build unified in-memory candidate catalog (deduplicated)
  const masterCatalog: FoodItem[] = useMemo(() => {
    const list: FoodItem[] = [];
    const seenNames = new Set<string>();

    // Priority 1: live preset meals from Supabase/admin
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

    // Priority 2: default clinical presets for guaranteed fallback
    DEFAULT_PRESETS.forEach((p) => {
      const normName = p.name.trim().toLowerCase();
      if (!seenNames.has(normName)) {
        seenNames.add(normName);
        list.push(p);
      }
    });

    return list;
  }, [liveStoreMeals]);

  // 3. Smart weighted tokenized search + category filtering
  const [searchResults, setSearchResults] = useState<FoodItem[]>(masterCatalog);

  useEffect(() => {
    const queryTrimmed = searchQuery.trim().toLowerCase();
    const queryTokens = queryTrimmed.split(/\s+/).filter(Boolean);

    // Filter master catalog by active category first
    let pool = masterCatalog;
    if (selectedCategoryFilter !== 'All') {
      pool = pool.filter(
        (f) => (f.category || '').toLowerCase() === selectedCategoryFilter.toLowerCase()
      );
    }

    if (queryTokens.length === 0) {
      setSearchResults(pool);
      setIsLoading(false);
      return;
    }

    // Rank each food item with relevance score
    const scored: Array<{ item: FoodItem; score: number }> = [];

    pool.forEach((item) => {
      const nameLower = item.name.toLowerCase();
      const catLower = (item.category || '').toLowerCase();
      const ratLower = (item.clinicalRationale || '').toLowerCase();

      let score = 0;

      // Exact match gets highest score
      if (nameLower === queryTrimmed) {
        score += 1000;
      } else if (nameLower.startsWith(queryTrimmed)) {
        // Starts with prefix
        score += 500;
      }

      // Check tokens
      let allTokensMatch = true;
      queryTokens.forEach((token) => {
        if (nameLower.includes(token)) {
          score += 150;
          if (nameLower.startsWith(token)) score += 50;
        } else if (catLower.includes(token)) {
          score += 80;
        } else if (ratLower.includes(token)) {
          score += 40;
        } else {
          allTokensMatch = false;
        }
      });

      if (allTokensMatch) {
        score += 200;
      }

      if (score > 0) {
        scored.push({ item, score });
      }
    });

    // Sort descending by relevance score
    scored.sort((a, b) => b.score - a.score);
    const inMemoryMatches = scored.map((s) => s.item);

    setSearchResults(inMemoryMatches);

    // 4. Parallel race-condition safe Supabase query for large server datasets
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (isSupabaseConfigured() && inMemoryMatches.length < 5) {
      activeQueryId.current += 1;
      const myQueryId = activeQueryId.current;
      setIsLoading(true);

      debounceTimer.current = setTimeout(async () => {
        try {
          const { data, error } = await supabase
            .from('meals')
            .select('*')
            .is('user_id', null)
            .eq('active', true)
            .ilike('name', `%${queryTrimmed}%`)
            .limit(20);

          // Discard if user continued typing (new query dispatched)
          if (myQueryId !== activeQueryId.current) return;

          if (!error && data && data.length > 0) {
            const mappedDb = data.map((m: any) => ({
              id: String(m.id),
              name: String(m.name).trim(),
              serving_size: m.serving_size || '100g',
              category: m.category || 'High Protein',
              calories: Number(m.calories) || 0,
              protein: Number(m.protein) || 0,
              carbs: Number(m.carbs) || 0,
              fat: Number(m.fat) || 0,
              calcium: Number(m.calcium ?? 0),
              zinc: Number(m.zinc ?? 0),
              vitaminD3: Number(m.vitamin_d3 ?? 0),
              clinicalRationale: m.clinical_rationale || '',
            }));

            // Merge unique matches with in-memory matches
            const combinedMap = new Map<string, FoodItem>();
            inMemoryMatches.forEach((f) => combinedMap.set(f.name.toLowerCase(), f));
            mappedDb.forEach((f: FoodItem) => {
              if (!combinedMap.has(f.name.toLowerCase())) {
                combinedMap.set(f.name.toLowerCase(), f);
              }
            });

            setSearchResults(Array.from(combinedMap.values()));
          }
        } catch {
          // Graceful fallback to in-memory matches
        } finally {
          if (myQueryId === activeQueryId.current) {
            setIsLoading(false);
          }
        }
      }, 150);
    } else {
      setIsLoading(false);
    }

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery, selectedCategoryFilter, masterCatalog]);

  // Autofill form when an item is tapped for customization
  const handleSelectFood = (item: FoodItem) => {
    Haptics.selectionAsync().catch(() => {});
    setMealName(item.name);
    setServingSize(item.serving_size || '1 serving');
    setCalories(String(item.calories));
    setProtein(String(item.protein));
    setCarbs(String(item.carbs));
    setFat(String(item.fat));
  };

  // 1-Tap Quick Add: logs immediately with success notification
  const handleQuickAdd = (item: FoodItem) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setQuickAddedId(item.id);

    addMeal({
      name: item.name,
      calories: Math.round(Number(item.calories) || 0),
      protein: Math.round((Number(item.protein) || 0) * 10) / 10,
      carbs: Math.round((Number(item.carbs) || 0) * 10) / 10,
      fat: Math.round((Number(item.fat) || 0) * 10) / 10,
      category,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    setTimeout(() => {
      setQuickAddedId(null);
      onClose();
    }, 450);
  };

  const handleSaveMeal = () => {
    if (!mealName.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    addMeal({
      name: mealName.trim(),
      calories: Math.round(Number(calories) || 0),
      protein: Math.round((Number(protein) || 0) * 10) / 10,
      carbs: Math.round((Number(carbs) || 0) * 10) / 10,
      fat: Math.round((Number(fat) || 0) * 10) / 10,
      category,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    // Reset form
    setMealName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setSearchQuery('');
    onClose();
  };

  const handleCreateCustomFromQuery = () => {
    if (!searchQuery.trim()) return;
    Haptics.selectionAsync().catch(() => {});
    setMealName(searchQuery.trim());
    setCalories('200');
    setProtein('20');
    setCarbs('10');
    setFat('5');
    setSearchQuery('');
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Log Clinical Fuel">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Synchronized Live Search Bar */}
          <View style={styles.searchBox}>
            <Search size={16} color={colors.blue600} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search verified foods, protein, calcium..."
              placeholderTextColor={colors.slate400}
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={16} color={colors.slate400} />
              </TouchableOpacity>
            )}
            {isLoading && <ActivityIndicator size="small" color={colors.blue600} />}
          </View>

          {/* Category Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipRow}
          >
            {FOOD_CATEGORY_FILTERS.map((cat) => {
              const isActive = selectedCategoryFilter === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setSelectedCategoryFilter(cat);
                  }}
                  style={[
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive && styles.filterChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Suggested / Search Results Header */}
          <View style={styles.resultsHeaderRow}>
            <Text style={styles.sectionLabel}>
              {searchQuery.trim()
                ? `Results for "${searchQuery}" (${searchResults.length})`
                : selectedCategoryFilter !== 'All'
                ? `${selectedCategoryFilter} Foods (${searchResults.length})`
                : `Verified Clinical Catalog (${searchResults.length})`}
            </Text>
            <Text style={styles.resultsHeaderHint}>Tap row to edit • Tap + to 1-tap log</Text>
          </View>

          {/* Results List */}
          {isLoading && searchResults.length === 0 ? (
            <View style={styles.skeletonList}>
              <SkeletonShimmer height={58} borderRadius={16} />
              <SkeletonShimmer height={58} borderRadius={16} />
              <SkeletonShimmer height={58} borderRadius={16} />
            </View>
          ) : searchResults.length > 0 ? (
            <View style={styles.resultsList}>
              {searchResults.slice(0, 15).map((item) => {
                const isQuickAdded = quickAddedId === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => handleSelectFood(item)}
                    style={[
                      styles.foodRow,
                      mealName === item.name && styles.foodRowSelected,
                    ]}
                    activeOpacity={0.7}
                  >
                    <View style={styles.foodInfo}>
                      <View style={styles.foodNameRow}>
                        <Text style={styles.foodName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        {item.category && (
                          <View style={styles.catBadgePill}>
                            <Text style={styles.catBadgeText}>{item.category}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.foodServing}>
                        {item.serving_size || '100g'}
                        {item.calcium ? ` • ${item.calcium}mg Ca` : ''}
                        {item.zinc ? ` • ${item.zinc}mg Zn` : ''}
                      </Text>
                      {item.clinicalRationale ? (
                        <Text style={styles.rationaleSnippet} numberOfLines={1}>
                          ✨ {item.clinicalRationale}
                        </Text>
                      ) : null}
                    </View>

                    <View style={styles.foodMacros}>
                      <Text style={styles.foodCalories}>{formatMacro(item.calories, 0)} kcal</Text>
                      <Text style={styles.foodProtein}>{formatMacro(item.protein)}g P</Text>
                    </View>

                    {/* 1-Tap Quick Add Button */}
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleQuickAdd(item);
                      }}
                      style={[
                        styles.plusIconWrap,
                        isQuickAdded && styles.plusIconWrapSuccess,
                      ]}
                      activeOpacity={0.8}
                      accessibilityLabel={`Quick add ${item.name}`}
                    >
                      {isQuickAdded ? (
                        <Check size={14} color="#FFFFFF" strokeWidth={3} />
                      ) : (
                        <Plus size={14} color={colors.blue600} strokeWidth={2.5} />
                      )}
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <AlertCircle size={22} color={colors.slate400} />
              <Text style={styles.emptyText}>
                No verified foods found matching &ldquo;{searchQuery}&rdquo;.
              </Text>
              <TouchableOpacity
                onPress={handleCreateCustomFromQuery}
                style={styles.customAddBtn}
                activeOpacity={0.7}
              >
                <Plus size={14} color="#2563EB" />
                <Text style={styles.customAddBtnText}>
                  Create custom food &ldquo;{searchQuery}&rdquo;
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Custom Edit / Log Section */}
          <View style={styles.formCard}>
            <View style={styles.formHeaderRow}>
              <Text style={styles.formTitle}>
                {mealName ? 'Confirm & Log Details' : 'Manual Entry'}
              </Text>
              <Text style={styles.formSubtitle}>Adjust portion or macros</Text>
            </View>

            {/* Food Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>FOOD NAME</Text>
              <TextInput
                value={mealName}
                onChangeText={setMealName}
                placeholder="e.g. Boiled eggs, Salmon, Casein shake"
                placeholderTextColor={colors.slate400}
                style={styles.input}
              />
            </View>

            {/* Meal Time Selector */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>MEAL SLOT</Text>
              <View style={styles.categoryRow}>
                {MEAL_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setCategory(cat);
                    }}
                    style={[
                      styles.categoryPill,
                      category === cat && styles.categoryPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryPillText,
                        category === cat && styles.categoryPillTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Nutrients Grid */}
            <View style={styles.nutrientsGrid}>
              <View style={styles.nutrientField}>
                <Text style={styles.fieldLabel}>CALORIES</Text>
                <TextInput
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.slate400}
                  style={styles.nutrientInput}
                />
              </View>

              <View style={styles.nutrientField}>
                <Text style={styles.fieldLabel}>PROTEIN (G)</Text>
                <TextInput
                  value={protein}
                  onChangeText={setProtein}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.slate400}
                  style={styles.nutrientInput}
                />
              </View>

              <View style={styles.nutrientField}>
                <Text style={styles.fieldLabel}>CARBS (G)</Text>
                <TextInput
                  value={carbs}
                  onChangeText={setCarbs}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.slate400}
                  style={styles.nutrientInput}
                />
              </View>

              <View style={styles.nutrientField}>
                <Text style={styles.fieldLabel}>FAT (G)</Text>
                <TextInput
                  value={fat}
                  onChangeText={setFat}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.slate400}
                  style={styles.nutrientInput}
                />
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSaveMeal}
              disabled={!mealName.trim()}
              style={[
                styles.saveButton,
                !mealName.trim() && styles.saveButtonDisabled,
              ]}
              activeOpacity={0.8}
            >
              <Check size={16} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.saveButtonText}>
                {mealName ? `Save "${mealName}" to ${category}` : 'Save Food Entry'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    minHeight: 480,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.slate900,
    fontWeight: '500',
    padding: 0,
  },
  filterChipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#2563EB',
  },
  resultsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.slate600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultsHeaderHint: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  skeletonList: {
    gap: 8,
  },
  resultsList: {
    gap: 8,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  foodRowSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#F0F9FF',
  },
  foodInfo: {
    flex: 1,
    marginRight: 8,
  },
  foodNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  foodName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.slate900,
  },
  catBadgePill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  catBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#2563EB',
  },
  foodServing: {
    fontSize: 11,
    color: colors.slate600,
    marginTop: 2,
    fontWeight: '500',
  },
  rationaleSnippet: {
    fontSize: 10,
    color: '#0284C7',
    marginTop: 2,
    fontWeight: '500',
  },
  foodMacros: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  foodCalories: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.slate900,
  },
  foodProtein: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.blue600,
  },
  plusIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIconWrapSuccess: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 18,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    fontSize: 13,
    color: colors.slate600,
    textAlign: 'center',
  },
  customAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  customAddBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    marginTop: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  formHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.slate900,
  },
  formSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  fieldGroup: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.slate600,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.slate900,
    fontWeight: '500',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 6,
  },
  categoryPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryPillActive: {
    backgroundColor: colors.blue600,
    borderColor: colors.blue600,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.slate600,
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  nutrientsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  nutrientField: {
    flex: 1,
    gap: 4,
  },
  nutrientInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '700',
    color: colors.slate900,
    textAlign: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.blue600,
    borderRadius: 16,
    paddingVertical: 12,
    marginTop: 4,
  },
  saveButtonDisabled: {
    backgroundColor: colors.slate400,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
