import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  Activity,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Sparkles,
  Flame,
  Check,
  X,
  Clock,
  RotateCcw,
  Zap,
} from 'lucide-react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

import { useAppStore, DailyTodo } from '../../lib/store';
import GlassCard from '../../components/GlassCard';
import GlassButton from '../../components/GlassButton';
import GlassBackgroundCanvas from '../../components/GlassBackgroundCanvas';

const CATEGORIES: Array<DailyTodo['category']> = ['Habit', 'Spinal', 'Nutrition', 'Recovery', 'Custom'];

const CATEGORY_META: Record<DailyTodo['category'], { emoji: string; color: string; bg: string }> = {
  Habit: { emoji: '💧', color: '#0284C7', bg: '#E0F2FE' },
  Spinal: { emoji: '🧘', color: '#10B981', bg: '#D1FAE5' },
  Nutrition: { emoji: '💊', color: '#F97316', bg: '#FFEDD5' },
  Recovery: { emoji: '🌙', color: '#8B5CF6', bg: '#EDE9FE' },
  Custom: { emoji: '✨', color: '#2563EB', bg: '#DBEAFE' },
};

const QUICK_SUGGESTIONS = [
  { title: '10-Min Morning Sunlight Exposure', category: 'Habit' as const, icon: '☀️' },
  { title: 'Magnesium Glycinate (200mg) Before Sleep', category: 'Recovery' as const, icon: '🌙' },
  { title: 'Post-Desk Hamstring & Hip Flexor Stretch', category: 'Spinal' as const, icon: '🧘' },
  { title: 'Electrolyte Mineral Hydration Boost', category: 'Nutrition' as const, icon: '💧' },
];

export default function TodosScreen() {
  const todos = useAppStore((state) => state.todos ?? []);
  const toggleTodo = useAppStore((state) => state.toggleTodo);
  const addTodo = useAppStore((state) => state.addTodo);
  const deleteTodo = useAppStore((state) => state.deleteTodo);
  const resetDailyTodos = useAppStore((state) => state.resetDailyTodos);
  const streakDays = useAppStore((state) => state.streakDays);

  const [selectedFilter, setSelectedFilter] = useState<'All' | DailyTodo['category']>('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<DailyTodo['category']>('Habit');

  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllCompleted = totalCount > 0 && completedCount === totalCount;

  const filteredTodos = useMemo(() => {
    if (selectedFilter === 'All') return todos;
    return todos.filter((t) => t.category === selectedFilter);
  }, [todos, selectedFilter]);

  const handleToggle = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    toggleTodo(id);
    if (!todos.find((t) => t.id === id)?.completed && completedCount + 1 === totalCount) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  };

  const handleAddNew = () => {
    if (!newTitle.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const meta = CATEGORY_META[newCategory];
    addTodo({
      title: newTitle.trim(),
      category: newCategory,
      icon: meta.emoji,
    });
    setNewTitle('');
    setModalVisible(false);
  };

  const handleAddSuggestion = (sug: typeof QUICK_SUGGESTIONS[0]) => {
    Haptics.selectionAsync().catch(() => {});
    addTodo({
      title: sug.title,
      category: sug.category,
      icon: sug.icon,
    });
  };

  return (
    <GlassBackgroundCanvas>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* ============================================================== */}
        {/* TOP CAMERA / DYNAMIC ISLAND PROGRESS LINE (User Requested)    */}
        {/* Fills up smoothly as habits are checked off                    */}
        {/* ============================================================== */}
        <View style={styles.topCameraProgressWrapper}>
          <View style={styles.notchTrack}>
            <LinearGradient
              colors={isAllCompleted ? ['#10B981', '#34D399'] : ['#38BDF8', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.notchFill, { width: `${progressPct}%` }]}
            />
          </View>

          {/* Mini dynamic badge directly beneath front camera area */}
          <View style={styles.notchMetaRow}>
            <View style={[styles.notchStatusPill, isAllCompleted && styles.notchStatusPillSuccess]}>
              <View style={[styles.notchStatusDot, isAllCompleted && styles.notchStatusDotSuccess]} />
              <Text style={[styles.notchStatusText, isAllCompleted && styles.notchStatusTextSuccess]}>
                {isAllCompleted
                  ? 'All Daily Habits Completed! 🌟 Stature Maximized'
                  : `${completedCount} of ${totalCount} Done • ${progressPct}%`}
              </Text>
            </View>
          </View>
        </View>

        {/* Top Header */}
        <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.headerContainer}>
          <View style={styles.brandPill}>
            <Activity size={13} color="#2563EB" />
            <Text style={styles.brandText}>Tallgrame Protocol</Text>
            <View style={styles.onlineDot} />
          </View>

          <View style={styles.headerRightActions}>
            <View style={styles.streakBadge}>
              <Flame size={13} color="#D97706" />
              <Text style={styles.streakBadgeText}>{streakDays}d Streak</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setModalVisible(true);
              }}
              style={styles.addBtnHeader}
            >
              <Plus size={14} color="#FFFFFF" strokeWidth={2.8} />
              <Text style={styles.addBtnHeaderText}>Add</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title Section */}
          <Animated.View entering={FadeInDown.delay(90).springify()} style={styles.titleSection}>
            <Text style={styles.subheadingText}>Circadian Stature Optimization</Text>
            <Text style={styles.headingText}>Daily Growth To-Do</Text>
          </Animated.View>

          {/* Filter Chips Bar */}
          <Animated.View entering={FadeInDown.delay(130).springify()} style={styles.filterChipsRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setSelectedFilter('All');
                }}
                style={[styles.filterChip, selectedFilter === 'All' && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, selectedFilter === 'All' && styles.filterChipTextActive]}>
                  All ({todos.length})
                </Text>
              </TouchableOpacity>

              {CATEGORIES.map((cat) => {
                const count = todos.filter((t) => t.category === cat).length;
                const isSelected = selectedFilter === cat;
                const meta = CATEGORY_META[cat];
                return (
                  <TouchableOpacity
                    key={cat}
                    activeOpacity={0.75}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setSelectedFilter(cat);
                    }}
                    style={[
                      styles.filterChip,
                      isSelected && [styles.filterChipActive, { borderColor: meta.color }],
                    ]}
                  >
                    <Text style={styles.filterChipEmoji}>{meta.emoji}</Text>
                    <Text
                      style={[
                        styles.filterChipText,
                        isSelected && [styles.filterChipTextActive, { color: meta.color }],
                      ]}
                    >
                      {cat} {count > 0 ? `(${count})` : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>

          {/* Task List */}
          <Animated.View entering={FadeInDown.delay(170).springify()} style={styles.taskListContainer}>
            {filteredTodos.length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <Sparkles size={28} color="#0284C7" />
                <Text style={styles.emptyTitle}>No habits in this category</Text>
                <Text style={styles.emptySubtitle}>Tap "+ Add" above to add a custom daily habit.</Text>
              </GlassCard>
            ) : (
              filteredTodos.map((todo) => {
                const isDone = todo.completed;
                const meta = CATEGORY_META[todo.category] || CATEGORY_META.Custom;

                return (
                  <Animated.View key={todo.id} layout={Layout.springify()}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => handleToggle(todo.id)}
                      style={[
                        styles.todoCardTouch,
                        isDone && styles.todoCardTouchDone,
                      ]}
                    >
                      <GlassCard
                        style={[
                          styles.todoCard,
                          isDone && styles.todoCardDone,
                        ]}
                      >
                        {/* Checkbox */}
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => handleToggle(todo.id)}
                          style={[
                            styles.checkboxCircle,
                            isDone && styles.checkboxCircleDone,
                          ]}
                        >
                          {isDone ? (
                            <Check size={14} color="#FFFFFF" strokeWidth={3} />
                          ) : (
                            <Circle size={14} color="#94A3B8" />
                          )}
                        </TouchableOpacity>

                        {/* Title & Info */}
                        <View style={styles.todoContentCol}>
                          <View style={styles.todoMetaRow}>
                            <View
                              style={[
                                styles.categoryTag,
                                { backgroundColor: meta.bg, borderColor: `${meta.color}40` },
                              ]}
                            >
                              <Text style={styles.categoryTagEmoji}>{meta.emoji}</Text>
                              <Text style={[styles.categoryTagText, { color: meta.color }]}>
                                {todo.category}
                              </Text>
                            </View>

                            {todo.isDefault && (
                              <View style={styles.defaultProtocolTag}>
                                <Text style={styles.defaultProtocolText}>Core Protocol</Text>
                              </View>
                            )}
                          </View>

                          <Text
                            style={[
                              styles.todoTitle,
                              isDone && styles.todoTitleDone,
                            ]}
                            numberOfLines={2}
                          >
                            {todo.title}
                          </Text>

                          {isDone && todo.completedAt && (
                            <View style={styles.completedTimeRow}>
                              <Clock size={10} color="#10B981" />
                              <Text style={styles.completedTimeText}>Completed today</Text>
                            </View>
                          )}
                        </View>

                        {/* Delete Button (Allowed for custom items or user cleanup) */}
                        {!todo.isDefault && (
                          <TouchableOpacity
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                              deleteTodo(todo.id);
                            }}
                            style={styles.deleteBtn}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Trash2 size={15} color="#94A3B8" />
                          </TouchableOpacity>
                        )}
                      </GlassCard>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })
            )}
          </Animated.View>

          {/* Quick Suggestions Section */}
          <Animated.View entering={FadeInDown.delay(220).springify()} style={styles.suggestionsSection}>
            <View style={styles.suggestionsHeader}>
              <Zap size={14} color="#2563EB" />
              <Text style={styles.suggestionsTitle}>Suggested Clinical Additions</Text>
            </View>

            <View style={styles.suggestionsList}>
              {QUICK_SUGGESTIONS.map((sug, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  onPress={() => handleAddSuggestion(sug)}
                  style={styles.suggestionPill}
                >
                  <Text style={styles.suggestionEmoji}>{sug.icon}</Text>
                  <Text style={styles.suggestionText}>{sug.title}</Text>
                  <Plus size={13} color="#2563EB" strokeWidth={2.5} />
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Daily Reset Button */}
          {completedCount > 0 && (
            <Animated.View entering={FadeInDown.delay(260).springify()} style={styles.resetWrapper}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  resetDailyTodos();
                }}
                style={styles.resetBtn}
              >
                <RotateCcw size={12} color="#64748B" />
                <Text style={styles.resetBtnText}>Reset Today's Habits</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </ScrollView>

        {/* ============================================================== */}
        {/* ADD CUSTOM HABIT / TO-DO MODAL                                 */}
        {/* ============================================================== */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalOverlay}
          >
            <GlassCard style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderTitleRow}>
                  <View style={styles.modalIconWrap}>
                    <Sparkles size={16} color="#2563EB" />
                  </View>
                  <Text style={styles.modalTitle}>Add Daily Habit / To-Do</Text>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                  <X size={16} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Habit Title</Text>
              <TextInput
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="e.g., Morning 500ml lemon water..."
                placeholderTextColor="#94A3B8"
                style={styles.textInput}
                autoFocus
              />

              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoryPickerRow}>
                {CATEGORIES.map((cat) => {
                  const isSelected = newCategory === cat;
                  const meta = CATEGORY_META[cat];
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => {});
                        setNewCategory(cat);
                      }}
                      style={[
                        styles.catChoiceChip,
                        isSelected && [styles.catChoiceChipActive, { borderColor: meta.color }],
                      ]}
                    >
                      <Text style={styles.catChoiceEmoji}>{meta.emoji}</Text>
                      <Text
                        style={[
                          styles.catChoiceText,
                          isSelected && [styles.catChoiceTextActive, { color: meta.color }],
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleAddNew}
                style={[styles.saveTaskBtn, !newTitle.trim() && styles.saveTaskBtnDisabled]}
                disabled={!newTitle.trim()}
              >
                <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.saveTaskBtnText}>Add to Daily Protocol</Text>
              </TouchableOpacity>
            </GlassCard>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </GlassBackgroundCanvas>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  // Dynamic Camera / Notch Progress Bar (Apple-Grade)
  topCameraProgressWrapper: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 8,
    alignItems: 'center',
    gap: 6,
  },
  notchTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(226, 232, 240, 0.85)',
    overflow: 'hidden',
  },
  notchFill: {
    height: '100%',
    borderRadius: 3,
  },
  notchMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notchStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  notchStatusPillSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  notchStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#2563EB',
  },
  notchStatusDotSuccess: {
    backgroundColor: '#10B981',
  },
  notchStatusText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  notchStatusTextSuccess: {
    color: '#047857',
  },

  // Header
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  brandText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  streakBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
  addBtnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  addBtnHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Titles
  titleSection: {
    marginTop: 4,
    marginBottom: 14,
  },
  subheadingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 4,
  },
  headingText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },

  // Filter chips
  filterChipsRow: {
    marginBottom: 16,
  },
  chipsScroll: {
    gap: 6,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  filterChipEmoji: {
    fontSize: 12,
  },
  filterChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },

  // Task List
  taskListContainer: {
    gap: 10,
    marginBottom: 24,
  },
  todoCardTouch: {
    borderRadius: 18,
  },
  todoCardTouchDone: {
    opacity: 0.82,
  },
  todoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  todoCardDone: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },
  checkboxCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCircleDone: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  todoContentCol: {
    flex: 1,
    gap: 3,
  },
  todoMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryTagEmoji: {
    fontSize: 9,
  },
  categoryTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  defaultProtocolTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultProtocolText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#3B82F6',
  },
  todoTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 18,
  },
  todoTitleDone: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  completedTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  completedTimeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  deleteBtn: {
    padding: 6,
  },

  // Empty state
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },

  // Suggestions
  suggestionsSection: {
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  suggestionsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestionsList: {
    gap: 8,
  },
  suggestionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  suggestionEmoji: {
    fontSize: 14,
    marginRight: 8,
  },
  suggestionText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },

  // Reset
  resetWrapper: {
    alignItems: 'center',
    marginTop: 8,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  resetBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  categoryPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  catChoiceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catChoiceChipActive: {
    backgroundColor: '#EFF6FF',
  },
  catChoiceEmoji: {
    fontSize: 11,
  },
  catChoiceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  catChoiceTextActive: {
    fontWeight: '800',
  },
  saveTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingVertical: 13,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  saveTaskBtnDisabled: {
    opacity: 0.5,
    backgroundColor: '#94A3B8',
  },
  saveTaskBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
