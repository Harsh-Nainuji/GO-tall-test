// ✓ Modal rules applied — GlassCard, ScrollView, 85% maxHeight, SlideInDown
import React, { useState, useRef, useEffect } from 'react';
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
import {
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  Zap,
  Lock,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import BottomSheet from './ui/BottomSheet';
import { useAppStore } from '../lib/store';
import { queryGeminiAdvisor } from '../lib/gemini';
import { colors } from '../lib/theme';

interface AIChatModalProps {
  visible: boolean;
  onClose: () => void;
}

interface PromptChip {
  id: string;
  label: string;
  prompt: string;
  response: string;
}

const QUICK_PROMPT_CHIPS: PromptChip[] = [
  {
    id: 'chip-1',
    label: '🦴 Growth plates',
    prompt: 'Are my growth plates still active at my age?',
    response:
      'Growth plates usually stay open until ages 16 to 19 for boys, and 14 to 16 for girls. Daily stretching and balanced food support your natural growth window.',
  },
  {
    id: 'chip-2',
    label: '🥛 Bedtime snack',
    prompt: 'What snack should I eat before bed for growth?',
    response:
      'A light protein snack like warm milk, paneer, or Greek yogurt helps your body build tissue while you sleep.',
  },
  {
    id: 'chip-3',
    label: '🧘 Spine stretch',
    prompt: 'Can stretching make me taller today?',
    response:
      'Yes. Simple spine decompression and dead hangs relieve daily pressure and help restore disc height.',
  },
  {
    id: 'chip-4',
    label: '💤 Sleep hours',
    prompt: 'How many hours should I sleep each night?',
    response:
      'Aim for 8 to 9 hours of deep sleep. Most natural growth hormone releases during sound, uninterrupted sleep.',
  },
  {
    id: 'chip-5',
    label: '🏋️ Lifting weights',
    prompt: 'Does lifting weights stunt my height growth?',
    response:
      'No. Proper exercise strengthens bones. Just keep good form and avoid heavy loads on your spine.',
  },
];

export default function AIChatModal({ visible, onClose }: AIChatModalProps) {
  const router = useRouter();
  const chatMessages = useAppStore((state) => state.chatMessages);
  const addChatMessage = useAppStore((state) => state.addChatMessage);
  const quizData = useAppStore((state) => state.quizData);
  const isPremium = useAppStore((state) => state.isPremium);
  const getAiQuota = useAppStore((state) => state.getAiQuota);
  const incrementAiQuestionsUsed = useAppStore((state) => state.incrementAiQuestionsUsed);

  const quota = getAiQuota();

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<React.ElementRef<typeof ScrollView>>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 120);
  };

  useEffect(() => {
    if (visible) {
      scrollToBottom();
    }
  }, [visible, chatMessages.length, isTyping]);

  const handleSendPrompt = (chip: PromptChip) => {
    if (quota.isExhausted) return;
    Haptics.selectionAsync().catch(() => {});
    incrementAiQuestionsUsed();

    addChatMessage({
      role: 'user',
      text: chip.prompt,
    });

    setIsTyping(true);
    scrollToBottom();

    setTimeout(() => {
      addChatMessage({
        role: 'assistant',
        text: chip.response,
      });
      setIsTyping(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      scrollToBottom();
    }, 500);
  };

  const handleCustomSend = async () => {
    const query = inputText.trim();
    if (!query || quota.isExhausted) return;

    Haptics.selectionAsync().catch(() => {});
    incrementAiQuestionsUsed();

    addChatMessage({
      role: 'user',
      text: query,
    });
    setInputText('');
    setIsTyping(true);
    scrollToBottom();

    try {
      const response = await queryGeminiAdvisor(query, {
        age: quizData?.age || undefined,
        gender: quizData?.gender || undefined,
        currentHeight: quizData?.currentHeight || undefined,
        growthRate: quizData?.growthRate || undefined,
      });

      addChatMessage({
        role: 'assistant',
        text: response.text,
      });
    } catch {
      addChatMessage({
        role: 'assistant',
        text: 'Consistent deep sleep, good nutrition, and daily stretching best support your natural growth.',
      });
    } finally {
      setIsTyping(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      scrollToBottom();
    }
  };

  // Badge color based on questions used: green 0-2, amber 3-4, red 5
  const getBadgeStyle = () => {
    if (quota.used >= 5) {
      return { bg: '#FEE2E2', border: '#FCA5A5', text: '#DC2626' };
    }
    if (quota.used >= 3) {
      return { bg: '#FEF3C7', border: '#FCD34D', text: '#D97706' };
    }
    return { bg: '#DCFCE7', border: '#86EFAC', text: '#16A34A' };
  };

  const badgeStyle = getBadgeStyle();

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Dr. Jack AI Coach">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        {/* Top Quota Pill */}
        <View style={styles.topBar}>
          <View
            style={[
              styles.quotaPill,
              { backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border },
            ]}
          >
            <Zap size={13} color={badgeStyle.text} />
            <Text style={[styles.quotaPillText, { color: badgeStyle.text }]}>
              {quota.used} / {quota.limit} questions used today
            </Text>
          </View>
        </View>

        {/* Suggestion Chips */}
        <View style={styles.chipsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}
          >
            {QUICK_PROMPT_CHIPS.map((chip) => (
              <TouchableOpacity
                key={chip.id}
                onPress={() => handleSendPrompt(chip)}
                disabled={quota.isExhausted}
                style={[
                  styles.chipItem,
                  quota.isExhausted && styles.chipItemDisabled,
                ]}
                activeOpacity={0.7}
              >
                <Sparkles
                  size={12}
                  color={quota.isExhausted ? colors.slate400 : colors.blue600}
                />
                <Text
                  style={[
                    styles.chipText,
                    quota.isExhausted && styles.chipTextDisabled,
                  ]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Messages List */}
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesScrollContent}
          onContentSizeChange={scrollToBottom}
        >
          {chatMessages.length === 0 && (
            <View style={styles.introCard}>
              <Sparkles size={24} color={colors.blue600} />
              <Text style={styles.introTitle}>Ask anything about your height</Text>
              <Text style={styles.introBody}>
                Tap a suggestion above or type your question below.
              </Text>
            </View>
          )}

          {chatMessages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                msg.role === 'user' ? styles.userRow : styles.assistantRow,
              ]}
            >
              {msg.role === 'assistant' && (
                <View style={styles.avatarAssistant}>
                  <Bot size={14} color={colors.blue600} />
                </View>
              )}

              <View
                style={[
                  styles.bubble,
                  msg.role === 'user' ? styles.userBubble : styles.assistantBubble,
                ]}
              >
                <Text
                  style={[
                    styles.msgText,
                    msg.role === 'user' ? styles.userMsgText : styles.assistantMsgText,
                  ]}
                >
                  {msg.text}
                </Text>
              </View>

              {msg.role === 'user' && (
                <View style={styles.avatarUser}>
                  <User size={14} color="#FFFFFF" />
                </View>
              )}
            </View>
          ))}

          {isTyping && (
            <View style={[styles.messageRow, styles.assistantRow]}>
              <View style={styles.avatarAssistant}>
                <Bot size={14} color={colors.blue600} />
              </View>
              <View style={styles.typingBubble}>
                <ActivityIndicator size="small" color={colors.blue600} />
                <Text style={styles.typingText}>Thinking...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Locked Countdown Banner when limit reached */}
        {quota.isExhausted && (
          <View style={styles.lockedBanner}>
            <Lock size={14} color="#DC2626" />
            <Text style={styles.lockedText}>
              Daily limit reached. Resets in {quota.resetCountdown}.
            </Text>
          </View>
        )}

        {/* Input Bar */}
        <View style={styles.inputArea}>
          <View style={styles.inputWrap}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              editable={!quota.isExhausted}
              placeholder={
                quota.isExhausted
                  ? `Limit reached. Resets in ${quota.resetCountdown}`
                  : 'Ask a growth question...'
              }
              placeholderTextColor={colors.slate400}
              onSubmitEditing={handleCustomSend}
              returnKeyType="send"
              style={styles.textInput}
            />

            <TouchableOpacity
              onPress={handleCustomSend}
              disabled={!inputText.trim() || quota.isExhausted}
              style={[
                styles.sendBtn,
                inputText.trim() && !quota.isExhausted && styles.sendBtnActive,
              ]}
              activeOpacity={0.7}
            >
              <Send
                size={16}
                color={
                  inputText.trim() && !quota.isExhausted
                    ? '#FFFFFF'
                    : colors.slate400
                }
              />
            </TouchableOpacity>
          </View>

          <View style={styles.disclaimerRow}>
            <ShieldCheck size={11} color={colors.slate400} />
            <Text style={styles.disclaimerText}>
              For fitness guidance only. Always consult your doctor.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    minHeight: 460,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  quotaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  quotaPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chipsContainer: {
    paddingBottom: 8,
  },
  chipsScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  chipItemDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate900,
  },
  chipTextDisabled: {
    color: colors.slate400,
  },
  messagesContainer: {
    maxHeight: 320,
    minHeight: 200,
  },
  messagesScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 12,
  },
  introCard: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  introTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.slate900,
    marginTop: 6,
  },
  introBody: {
    fontSize: 13,
    color: colors.slate600,
    textAlign: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  assistantRow: {
    justifyContent: 'flex-start',
  },
  avatarAssistant: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  avatarUser: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.blue600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: colors.blue600,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#F1F5F9',
    borderBottomLeftRadius: 4,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMsgText: {
    color: '#FFFFFF',
  },
  assistantMsgText: {
    color: colors.slate900,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
  },
  typingText: {
    fontSize: 12,
    color: colors.slate600,
  },
  lockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  lockedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
    flex: 1,
  },
  inputArea: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: colors.slate900,
    paddingVertical: 6,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  sendBtnActive: {
    backgroundColor: colors.blue600,
  },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  disclaimerText: {
    fontSize: 11,
    color: colors.slate400,
  },
});
