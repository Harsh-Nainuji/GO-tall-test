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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Send,
  Sparkles,
  Bot,
  User,
  Volume2,
  VolumeX,
  ShieldAlert,
  Clock,
  Zap,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useAppStore } from '../lib/store';
import { queryGeminiAdvisor } from '../lib/gemini';
import { speakText, stopSpeech } from '../lib/tts';
import { colors, gradients } from '../lib/theme';
import GlassCard from '../components/ui/GlassCard';

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
      'Growth plates typically remain active until ages 16 to 19 in boys, and 14 to 16 in girls. Regular spinal traction and optimal nutrition support this natural growth window.',
  },
  {
    id: 'chip-2',
    label: '🥛 Bedtime snack',
    prompt: 'What snack should I eat before bed for height growth?',
    response:
      'A protein-rich snack like warm milk, paneer, or Greek yogurt provides essential amino acids that fuel tissue and bone growth during deep sleep.',
  },
  {
    id: 'chip-3',
    label: '🧘 Spine decompression',
    prompt: 'Can stretching and dead hangs decompress my spine?',
    response:
      'Yes. Daily passive hangs and axial spinal traction relieve disc compression, restore hydration to intervertebral discs, and improve upright posture.',
  },
  {
    id: 'chip-4',
    label: '💤 Sleep & HGH',
    prompt: 'How many hours of sleep maximize natural growth hormone?',
    response:
      'Aim for 8 to 9 hours of uninterrupted sleep. Up to 75% of daily human growth hormone (HGH) is secreted during slow-wave stage 3 and 4 deep sleep.',
  },
];

export default function ChatScreen() {
  const router = useRouter();
  const chatMessages = useAppStore((state) => state.chatMessages);
  const addChatMessage = useAppStore((state) => state.addChatMessage);
  const quizData = useAppStore((state) => state.quizData);
  const getAiQuota = useAppStore((state) => state.getAiQuota);
  const incrementAiQuestionsUsed = useAppStore((state) => state.incrementAiQuestionsUsed);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const scrollViewRef = useRef<React.ElementRef<typeof ScrollView>>(null);

  const quota = getAiQuota();

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 120);
  };

  useEffect(() => {
    scrollToBottom();
    return () => {
      stopSpeech();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages.length, isTyping]);

  const handleToggleTTS = async (msgId: string, text: string) => {
    Haptics.selectionAsync().catch(() => {});

    if (speakingMessageId === msgId) {
      await stopSpeech();
      setSpeakingMessageId(null);
      return;
    }

    setSpeakingMessageId(msgId);
    await speakText(text, {
      onDone: () => setSpeakingMessageId(null),
      onStopped: () => setSpeakingMessageId(null),
      onError: () => setSpeakingMessageId(null),
    });
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    // Check strict 5-question limit
    const currentQuota = getAiQuota();
    if (currentQuota.isExhausted) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      return;
    }

    Haptics.selectionAsync().catch(() => {});
    setInputText('');

    // Append user query
    addChatMessage({
      role: 'user',
      text: query,
    });

    incrementAiQuestionsUsed();
    setIsTyping(true);

    try {
      const userProfile = quizData
        ? {
            age: quizData.age,
            gender: quizData.gender || undefined,
            currentHeight: quizData.currentHeight,
            growthRate: quizData.growthRate,
          }
        : undefined;

      const result = await queryGeminiAdvisor(query, userProfile);

      addChatMessage({
        role: 'assistant',
        text: result.text,
        citation: result.citation,
      });
    } catch {
      addChatMessage({
        role: 'assistant',
        text: 'Unable to reach Gemini advisor right now. Please check your network connection and try again.',
      });
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <LinearGradient colors={gradients.canvas} style={StyleSheet.absoluteFill} />

      {/* Header mirroring Gemini Clean Layout */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            stopSpeech();
            router.back();
          }}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Back"
        >
          <ArrowLeft size={20} color={colors.slate900} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <View style={styles.headerBadgeRow}>
            <Sparkles size={16} color={colors.blue600} />
            <Text style={styles.headerTitle}>GoTall Clinical Advisor</Text>
          </View>
          <Text style={styles.headerSubtitle}>Powered by Google Gemini 3.5</Text>
        </View>

        {/* 24-Hour Rolling Quota Chip */}
        <View style={[styles.quotaChip, quota.isExhausted && styles.quotaChipExhausted]}>
          <Clock size={11} color={quota.isExhausted ? colors.amber600 : colors.blue600} />
          <Text style={[styles.quotaText, quota.isExhausted && styles.quotaTextExhausted]}>
            {quota.remaining}/5 left
          </Text>
        </View>
      </View>

      {/* Rolling Refill Timer Status Bar */}
      <View style={styles.refillBar}>
        <Text style={styles.refillText}>
          {quota.isExhausted
            ? `Daily limit reached. Refills in ${quota.resetCountdown}`
            : `5 daily questions • Refill countdown: ${quota.resetCountdown}`}
        </Text>
      </View>

      {/* Main Conversation Stream */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        style={styles.flexOne}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Welcome Card if chat empty */}
          {chatMessages.length === 0 && (
            <Animated.View entering={FadeInDown.duration(400)} style={styles.welcomeCard}>
              <View style={styles.sparkleIconOrb}>
                <Sparkles size={24} color="#2563EB" />
              </View>
              <Text style={styles.welcomeTitle}>Ask your stature questions</Text>
              <Text style={styles.welcomeBody}>
                Trained on the Tanner-Whitehouse III method and peer-reviewed spinal biomechanics. Get
                evidence-based guidance on growth plates, sleep, and nutrition.
              </Text>
            </Animated.View>
          )}

          {/* Quick Prompt Suggestion Chips */}
          {chatMessages.length <= 1 && (
            <View style={styles.chipsSection}>
              <Text style={styles.chipsHeading}>Suggested Topics</Text>
              <View style={styles.chipsGrid}>
                {QUICK_PROMPT_CHIPS.map((chip) => (
                  <TouchableOpacity
                    key={chip.id}
                    onPress={() => handleSend(chip.prompt)}
                    disabled={isTyping || quota.isExhausted}
                    style={styles.chipButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.chipLabel}>{chip.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Messages */}
          {chatMessages.map((msg) => {
            const isUser = msg.role === 'user';
            const isSpeaking = speakingMessageId === msg.id;

            return (
              <Animated.View
                key={msg.id}
                entering={FadeInUp.duration(280)}
                style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAssistant]}
              >
                {!isUser && (
                  <View style={styles.avatarBot}>
                    <Bot size={15} color="#2563EB" />
                  </View>
                )}

                <View
                  style={[
                    styles.messageBubble,
                    isUser ? styles.bubbleUser : styles.bubbleAssistant,
                  ]}
                >
                  <Text style={[styles.messageText, isUser ? styles.textUser : styles.textAssistant]}>
                    {msg.text}
                  </Text>

                  {/* Assistant Actions Bar: TTS & Citation */}
                  {!isUser && (
                    <View style={styles.assistantFooterRow}>
                      {/* TTS Speak Aloud Button */}
                      <TouchableOpacity
                        onPress={() => handleToggleTTS(msg.id, msg.text)}
                        style={[styles.ttsButton, isSpeaking && styles.ttsButtonActive]}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX size={14} color="#2563EB" />
                            <Text style={styles.ttsButtonTextActive}>Stop</Text>
                          </>
                        ) : (
                          <>
                            <Volume2 size={14} color={colors.slate600} />
                            <Text style={styles.ttsButtonText}>Listen</Text>
                          </>
                        )}
                      </TouchableOpacity>

                      {msg.citation ? (
                        <Text style={styles.citationText} numberOfLines={1}>
                          {msg.citation}
                        </Text>
                      ) : null}
                    </View>
                  )}
                </View>

                {isUser && (
                  <View style={styles.avatarUser}>
                    <User size={15} color="#FFFFFF" />
                  </View>
                )}
              </Animated.View>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <Animated.View entering={FadeInUp.duration(250)} style={styles.typingRow}>
              <View style={styles.avatarBot}>
                <Bot size={15} color="#2563EB" />
              </View>
              <View style={styles.typingBubble}>
                <ActivityIndicator size="small" color="#2563EB" />
                <Text style={styles.typingText}>Consulting clinical growth datasets...</Text>
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          {quota.isExhausted ? (
            <View style={styles.exhaustedBox}>
              <ShieldAlert size={16} color={colors.amber600} />
              <Text style={styles.exhaustedText}>
                5/5 daily questions used. Refills in {quota.resetCountdown}.
              </Text>
            </View>
          ) : (
            <View style={styles.inputRow}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask about growth plates, stretches, sleep..."
                placeholderTextColor={colors.slate400}
                style={styles.textInput}
                multiline
                maxLength={400}
                returnKeyType="send"
                onSubmitEditing={() => handleSend()}
              />
              <TouchableOpacity
                onPress={() => handleSend()}
                disabled={!inputText.trim() || isTyping}
                style={[
                  styles.sendButton,
                  (!inputText.trim() || isTyping) && styles.sendButtonDisabled,
                ]}
                activeOpacity={0.8}
              >
                <Send size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.disclaimerText}>
            For educational guidance. Does not substitute professional medical advice.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  flexOne: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.slate900,
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.slate400,
    marginTop: 1,
  },
  quotaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  quotaChipExhausted: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  quotaText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.blue600,
  },
  quotaTextExhausted: {
    color: colors.amber600,
  },
  refillBar: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  refillText: {
    fontSize: 11,
    color: colors.slate600,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 14,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  sparkleIconOrb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  welcomeTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.slate900,
    marginBottom: 6,
  },
  welcomeBody: {
    fontSize: 13,
    color: colors.slate600,
    textAlign: 'center',
    lineHeight: 18,
  },
  chipsSection: {
    marginBottom: 10,
  },
  chipsHeading: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate600,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAssistant: {
    justifyContent: 'flex-start',
  },
  avatarBot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  avatarUser: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.blue600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: colors.blue600,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 4,
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  textUser: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  textAssistant: {
    color: colors.slate900,
  },
  assistantFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 10,
  },
  ttsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ttsButtonActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  ttsButtonText: {
    fontSize: 11,
    color: colors.slate600,
    fontWeight: '600',
  },
  ttsButtonTextActive: {
    fontSize: 11,
    color: colors.blue600,
    fontWeight: '700',
  },
  citationText: {
    fontSize: 10,
    color: colors.slate400,
    flex: 1,
    textAlign: 'right',
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typingText: {
    fontSize: 12,
    color: colors.slate600,
    fontStyle: 'italic',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 10 : 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: colors.slate900,
    maxHeight: 90,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.blue600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.slate400,
  },
  exhaustedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  exhaustedText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.amber600,
    flex: 1,
  },
  disclaimerText: {
    fontSize: 10,
    color: colors.slate400,
    textAlign: 'center',
    marginTop: 8,
  },
});
