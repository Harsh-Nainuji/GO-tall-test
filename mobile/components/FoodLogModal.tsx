// ✓ Modal rules applied — GlassCard, ScrollView, 85% maxHeight, SlideInDown
import React, { useState, useEffect, useRef } from 'react';
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
import { Search, Plus, Utensils, Check, Flame } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import BottomSheet from './ui/BottomSheet';
import SkeletonShimmer from './ui/SkeletonShimmer';
import { useAppStore, LoggedMeal } from '../lib/store';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { colors } from '../lib/theme';

interface FoodLogModalProps {
  visible: boolean;
  onClose: () => void;
}

interface FoodItem {
  id: string;
  name: string;
  serving_size?: string;
  category?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const DEFAULT_PRESETS: FoodItem[] = [
  { id: 'p1', name: 'Greek Yogurt', serving_size: '200g', calories: 120, protein: 22, carbs: 8, fat: 0 },
  { id: 'p2', name: 'Boiled Eggs (2)', serving_size: '2 eggs', calories: 156, protein: 13, carbs: 1, fat: 11 },
  { id: 'p3', name: 'Whole Milk', serving_size: '250ml', calories: 152, protein: 8, carbs: 12, fat: 8 },
  { id: 'p4', name: 'Paneer Bowl', serving_size: '150g', calories: 260, protein: 20, carbs: 4, fat: 18 },
  { id: 'p5', name: 'Chicken Breast', serving_size: '150g', calories: 247, protein: 46, carbs: 0, fat: 5 },
];

const MEAL_CATEGORIES: LoggedMeal['category'][] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export default function FoodLogModal({ visible, onClose }: FoodLogModalProps) {
  const addMeal = useAppStore((state) => state.addMeal);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>(DEFAULT_PRESETS);
  const [isLoading, setIsLoading] = useState(false);

  // Form values
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [category, setCategory] = useState<LoggedMeal['category']>('Breakfast');

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 300ms debounced search against Supabase meals table
  useEffect(() => {
    if (!visible) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!searchQuery.trim()) {
      setSearchResults(DEFAULT_PRESETS);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        if (isSupabaseConfigured()) {
          const { data, error } = await supabase
            .from('meals')
            .select('*')
            .ilike('name', `%${searchQuery.trim()}%`)
            .limit(10);

          if (!error && data && data.length > 0) {
            setSearchResults(
              data.map((m: any) => ({
                id: m.id,
                name: m.name,
                serving_size: m.serving_size || '1 serving',
                category: m.category || 'High Protein',
                calories: Number(m.calories) || 0,
                protein: Number(m.protein) || 0,
                carbs: Number(m.carbs) || 0,
                fat: Number(m.fat) || 0,
              }))
            );
          } else {
            // Local fallback filter
            const filtered = DEFAULT_PRESETS.filter((p) =>
              p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setSearchResults(filtered);
          }
        } else {
          const filtered = DEFAULT_PRESETS.filter((p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setSearchResults(filtered);
        }
      } catch {
        setSearchResults(DEFAULT_PRESETS);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery, visible]);

  // Autofill form when an item is tapped
  const handleSelectFood = (item: FoodItem) => {
    Haptics.selectionAsync().catch(() => {});
    setMealName(item.name);
    setCalories(String(item.calories));
    setProtein(String(item.protein));
    setCarbs(String(item.carbs));
    setFat(String(item.fat));
  };

  const handleSaveMeal = () => {
    if (!mealName.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    addMeal({
      name: mealName.trim(),
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
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

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Log Food">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Search Box */}
          <View style={styles.searchBox}>
            <Search size={16} color={colors.slate400} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search foods..."
              placeholderTextColor={colors.slate400}
              style={styles.searchInput}
            />
          </View>

          {/* Quick List / Search Results */}
          <Text style={styles.sectionLabel}>
            {searchQuery.trim() ? 'Search results' : 'Suggested foods'}
          </Text>

          {isLoading ? (
            <View style={styles.skeletonList}>
              <SkeletonShimmer height={52} borderRadius={16} />
              <SkeletonShimmer height={52} borderRadius={16} />
              <SkeletonShimmer height={52} borderRadius={16} />
            </View>
          ) : searchResults.length > 0 ? (
            <View style={styles.resultsList}>
              {searchResults.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleSelectFood(item)}
                  style={styles.foodRow}
                  activeOpacity={0.7}
                >
                  <View style={styles.foodInfo}>
                    <Text style={styles.foodName}>{item.name}</Text>
                    <Text style={styles.foodServing}>{item.serving_size || '1 serving'}</Text>
                  </View>

                  <View style={styles.foodMacros}>
                    <Text style={styles.foodCalories}>{item.calories} kcal</Text>
                    <Text style={styles.foodProtein}>{item.protein}g protein</Text>
                  </View>

                  <View style={styles.plusIconWrap}>
                    <Plus size={14} color={colors.blue600} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No food found. Enter details below.</Text>
          )}

          {/* Custom Form Section */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Food details</Text>

            {/* Food Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Name</Text>
              <TextInput
                value={mealName}
                onChangeText={setMealName}
                placeholder="e.g. Boiled eggs, Milk, Paneer"
                placeholderTextColor={colors.slate400}
                style={styles.input}
              />
            </View>

            {/* Category Pills */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Meal time</Text>
              <View style={styles.categoryRow}>
                {MEAL_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
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
                <Text style={styles.fieldLabel}>Calories</Text>
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
                <Text style={styles.fieldLabel}>Protein (g)</Text>
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
                <Text style={styles.fieldLabel}>Carbs (g)</Text>
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
                <Text style={styles.fieldLabel}>Fat (g)</Text>
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
              <Check size={16} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save food</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    minHeight: 460,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.slate900,
    padding: 0,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
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
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.slate900,
  },
  foodServing: {
    fontSize: 11,
    color: colors.slate400,
    marginTop: 2,
  },
  foodMacros: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  foodCalories: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate900,
  },
  foodProtein: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.blue600,
  },
  plusIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: colors.slate400,
    paddingVertical: 8,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    marginTop: 6,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.slate900,
  },
  fieldGroup: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate600,
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
  },
  categoryPillActive: {
    backgroundColor: colors.blue600,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
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
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '600',
    color: colors.slate900,
    textAlign: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
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
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
