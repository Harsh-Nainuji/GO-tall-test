import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Utensils, Plus, Check, Sparkles, Flame } from 'lucide-react-native';
import { useAppStore, LoggedMeal } from '../lib/store';

interface FoodLogModalProps {
  visible: boolean;
  onClose: () => void;
}

interface QuickFoodPreset {
  name: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: LoggedMeal['category'];
  highlight: string;
}

const VERIFIED_PRESETS: QuickFoodPreset[] = [
  {
    name: 'Greek Yogurt 0%',
    serving: '200g bowl',
    calories: 120,
    protein: 22,
    carbs: 8,
    fat: 0,
    category: 'Breakfast',
    highlight: '250mg Calcium',
  },
  {
    name: 'Grilled Chicken Breast',
    serving: '150g cooked',
    calories: 247,
    protein: 46,
    carbs: 0,
    fat: 5,
    category: 'Lunch',
    highlight: 'High Chondrocyte Leucine',
  },
  {
    name: 'Hard Boiled Eggs (x2)',
    serving: '2 large eggs',
    calories: 156,
    protein: 13,
    carbs: 1,
    fat: 11,
    category: 'Snack',
    highlight: '88 IU Vitamin D3',
  },
  {
    name: 'Organic Whole Milk',
    serving: '1 glass (250ml)',
    calories: 152,
    protein: 8,
    carbs: 12,
    fat: 8,
    category: 'Bedtime Anabolic',
    highlight: '290mg Calcium + IGF-1',
  },
  {
    name: 'Steamed Edamame in Pods',
    serving: '150g bowl',
    calories: 188,
    protein: 18,
    carbs: 14,
    fat: 8,
    category: 'Snack',
    highlight: '2.1mg Bone Zinc',
  },
  {
    name: 'Wild Salmon Fillet',
    serving: '150g baked',
    calories: 280,
    protein: 34,
    carbs: 0,
    fat: 15,
    category: 'Dinner',
    highlight: '570 IU D3 + Omega-3',
  },
  {
    name: 'Low Fat Cottage Cheese',
    serving: '200g bowl',
    calories: 164,
    protein: 28,
    carbs: 6,
    fat: 2,
    category: 'Bedtime Anabolic',
    highlight: 'Slow Casein for Sleep hGH',
  },
];

export default function FoodLogModal({ visible, onClose }: FoodLogModalProps) {
  const addMeal = useAppStore((state) => state.addMeal);

  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [category, setCategory] = useState<LoggedMeal['category']>('Breakfast');

  const handleSelectPreset = (preset: QuickFoodPreset) => {
    addMeal({
      name: preset.name,
      calories: preset.calories,
      protein: preset.protein,
      carbs: preset.carbs,
      fat: preset.fat,
      category: preset.category,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    onClose();
  };

  const handleCustomSubmit = () => {
    if (!mealName.trim()) return;

    addMeal({
      name: mealName.trim(),
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      category,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    setMealName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end bg-black/50"
      >
        <View className="bg-white rounded-t-3xl p-6 max-h-[85%] border-t border-slate-200">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-4 border-b border-slate-100">
            <View className="flex-row items-center gap-2">
              <View className="w-9 h-9 rounded-xl bg-blue-50 items-center justify-center">
                <Utensils size={18} color="#0066FF" />
              </View>
              <View>
                <Text className="text-base font-black text-slate-900">Log Stature Nutrition</Text>
                <Text className="text-xs text-slate-400 font-medium">Bone matrix & amino acids</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
            >
              <X size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Tab Selector */}
          <View className="flex-row p-1 bg-slate-100 rounded-2xl my-4">
            <TouchableOpacity
              onPress={() => setActiveTab('presets')}
              className={`flex-1 py-2 rounded-xl items-center ${
                activeTab === 'presets' ? 'bg-white' : ''
              }`}
              style={activeTab === 'presets' ? { elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2 } : undefined}
            >
              <Text
                className={`text-xs font-bold ${
                  activeTab === 'presets' ? 'text-blue-600' : 'text-slate-500'
                }`}
              >
                Verified Clinical Foods
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('custom')}
              className={`flex-1 py-2 rounded-xl items-center ${
                activeTab === 'custom' ? 'bg-white' : ''
              }`}
              style={activeTab === 'custom' ? { elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2 } : undefined}
            >
              <Text
                className={`text-xs font-bold ${
                  activeTab === 'custom' ? 'text-blue-600' : 'text-slate-500'
                }`}
              >
                Custom Food Entry
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView showsVerticalScrollIndicator={false} className="mb-2">
            {activeTab === 'presets' ? (
              <View className="gap-2.5 pb-6">
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  1-Tap Growth Foods:
                </Text>

                {VERIFIED_PRESETS.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleSelectPreset(item)}
                    className="p-3.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-2xl flex-row items-center justify-between active:opacity-80"
                  >
                    <View className="flex-1 mr-3">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-sm font-bold text-slate-900">{item.name}</Text>
                        <Text className="text-[10px] font-semibold text-slate-400">
                          {item.serving}
                        </Text>
                      </View>
                      <Text className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                        {item.highlight}
                      </Text>
                    </View>

                    <View className="items-end">
                      <Text className="text-xs font-black text-slate-800">
                        {item.calories} kcal
                      </Text>
                      <Text className="text-[11px] font-bold text-blue-600">
                        {item.protein}g Protein
                      </Text>
                    </View>

                    <View className="w-7 h-7 rounded-full bg-blue-100 items-center justify-center ml-2.5">
                      <Plus size={14} color="#0066FF" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View className="gap-3.5 pb-6">
                <View>
                  <Text className="text-xs font-bold text-slate-700 mb-1">Food / Meal Name</Text>
                  <TextInput
                    value={mealName}
                    onChangeText={setMealName}
                    placeholder="e.g. Scrambled Eggs & Whole Wheat Toast"
                    placeholderTextColor="#94A3B8"
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                  />
                </View>

                {/* Category Picker */}
                <View>
                  <Text className="text-xs font-bold text-slate-700 mb-1.5">Meal Category</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {(['Breakfast', 'Lunch', 'Dinner', 'Bedtime Anabolic', 'Snack'] as const).map(
                      (cat) => (
                        <TouchableOpacity
                          key={cat}
                          onPress={() => setCategory(cat)}
                          className={`px-3 py-1.5 rounded-full border ${
                            category === cat
                              ? 'bg-blue-600 border-blue-600'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <Text
                            className={`text-[11px] font-bold ${
                              category === cat ? 'text-white' : 'text-slate-600'
                            }`}
                          >
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                </View>

                {/* Macros Input */}
                <View className="flex-row gap-2.5">
                  <View className="flex-1">
                    <Text className="text-[11px] font-bold text-slate-700 mb-1">Calories</Text>
                    <TextInput
                      value={calories}
                      onChangeText={setCalories}
                      keyboardType="numeric"
                      placeholder="kcal"
                      placeholderTextColor="#94A3B8"
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 text-center font-bold"
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-[11px] font-bold text-blue-600 mb-1">Protein (g)</Text>
                    <TextInput
                      value={protein}
                      onChangeText={setProtein}
                      keyboardType="numeric"
                      placeholder="g"
                      placeholderTextColor="#94A3B8"
                      className="p-2.5 bg-blue-50/50 border border-blue-200 rounded-xl text-xs text-blue-700 text-center font-bold"
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-[11px] font-bold text-slate-700 mb-1">Carbs (g)</Text>
                    <TextInput
                      value={carbs}
                      onChangeText={setCarbs}
                      keyboardType="numeric"
                      placeholder="g"
                      placeholderTextColor="#94A3B8"
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 text-center font-bold"
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-[11px] font-bold text-slate-700 mb-1">Fat (g)</Text>
                    <TextInput
                      value={fat}
                      onChangeText={setFat}
                      keyboardType="numeric"
                      placeholder="g"
                      placeholderTextColor="#94A3B8"
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 text-center font-bold"
                    />
                  </View>
                </View>

                {/* Submit button */}
                <TouchableOpacity
                  onPress={handleCustomSubmit}
                  disabled={!mealName.trim()}
                  className={`w-full py-3.5 rounded-2xl flex-row items-center justify-center gap-2 mt-2 ${
                    mealName.trim() ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                  style={mealName.trim() ? { elevation: 2, shadowColor: '#2563EB', shadowOpacity: 0.25, shadowRadius: 6 } : undefined}
                >
                  <Plus size={16} color={mealName.trim() ? '#FFFFFF' : '#94A3B8'} />
                  <Text
                    className={`font-black text-xs ${
                      mealName.trim() ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    Add Meal to Stature Log
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

