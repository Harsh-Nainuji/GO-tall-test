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
  Share,
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
  Mic,
  Share2,
} from 'lucide-react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useAppStore } from '../lib/store';
import { queryGeminiAdvisor } from '../lib/gemini';
import { speakText, stopSpeech } from '../lib/tts';
import { colors } from '../lib/theme';

interface PromptChip {
  id: string;
  label: string;
  prompt: string;
}

const QUICK_PROMPT_CHIPS: PromptChip[] = [
  {
    id: 'chip-1',
    label: '🦴 Growth plates',
    prompt: 'Are my growth plates still active at my age?',
  },
  {
    id: 'chip-2',
    label: '🥛 Bedtime snack',
    prompt: 'What snack should I eat before bed for height growth?',
  },
  {
    id: 'chip-3',
    label: '🧘 Spine decompression',
    prompt: 'Can stretching and dead hangs decompress my spine?',
  },
  {
    id: 'chip-4',
    label: '💤 Sleep & HGH',
    prompt: 'How many hours of sleep maximize natural growth hormone?',
  },
];

/** Format a timestamp (ms since epoch or Date-ish) to "2:24 PM" */
function formatTimestamp(ts: number | string | undefined): string {
  if (!ts) return '';
  const d = new Date(ts);
  if (isNaN(d.getTime())) return '';
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Renders a string with **bold** markdown into an array of Text spans.
 * Also splits on \n for line breaks.
 */
function renderMarkdown(text: string): React.ReactNode {
  // Split by newlines first, then process bold within each line
  const lines = text.split('\n');
  const result: React.ReactNode[] = [];

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) {
      result.push(<Text key={`nl-${lineIdx}`}>{'\n'}</Text>);
    }

    // Check if it's a ### heading line
    if (line.startsWith('### ')) {
      result.push(
        <Text key={`h-${lineIdx}`} style={styles.mdHeading}>
          {line.replace(/^###\s*/, '')}
        </Text>,
      );
      return;
    }

    // Split by **bold**
    const parts = line.split(/\*\*(.*?)\*\*/g);
    parts.forEach((part, partIdx) => {
      if (partIdx % 2 === 1) {
        // Odd index = inside **...**
        result.push(
          <Text key={`b-${lineIdx}-${partIdx}`} style={styles.mdBold}>
            {part}
          </Text>,
        );
      } else if (part) {
        result.push(<Text key={`t-${lineIdx}-${partIdx}`}>{part}</Text>);
      }
    });
  });

  return result;
}

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
  const inputRef = useRef<TextInput>(null);

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

  // Per-bubble "Listen" button handler
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

  const handleShare = async (text: string) => {
    Haptics.selectionAsync().catch(() => {});
    try {
      await Share.share({ message: text });
    } catch {
      // dismissed
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const currentQuota = getAiQuota();
    if (currentQuota.isExhausted) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      return;
    }

    Haptics.selectionAsync().catch(() => {});
    setInputText('');

    addChatMessage({ role: 'user', text: query });
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
      addChatMessage({ role: 'assistant', text: result.text, citation: result.citation });
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
      {/* ── Dark Premium Header ───────────────────────────────────── */}
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
          <ArrowLeft size={20} color="#94A3B8" />
        </TouchableOpacity>

        {/* Gradient wordmark pill */}
        <View style={styles.headerCenter}>
          <LinearGradient
            colors={['#1E40AF', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.wordmarkPill}
          >
            <Sparkles size={13} color="#FFFFFF" />
            <Text style={styles.wordmarkText}>Tollgram AI</Text>
          </LinearGradient>
          <Text style={styles.headerSubtitle}>Powered by Gemini</Text>
        </View>

        {/* 5-question quota chip */}
        <View style={[styles.quotaChip, quota.isExhausted && styles.quotaChipExhausted]}>
          <Clock size={11} color={quota.isExhausted ? colors.amber600 : '#93C5FD'} />
          <Text style={[styles.quotaText, quota.isExhausted && styles.quotaTextExhausted]}>
            {quota.remaining}/5
          </Text>
        </View>
      </View>

      {/* Refill timer status bar */}
      <View style={styles.refillBar}>
        <Text style={styles.refillText}>
          {quota.isExhausted
            ? `Daily limit reached · Refills in ${quota.resetCountdown}`
            : `5 daily questions · Refill in ${quota.resetCountdown}`}
        </Text>
      </View>

      {/* ── Conversation area ─────────────────────────────────────── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        style={styles.flexOne}
      >
        <LinearGradient
          colors={['#F0F4FF', '#F8FAFF', '#FFFFFF']}
          style={styles.flexOne}
        >
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Welcome card */}
            {chatMessages.length === 0 && (
              <Animated.View entering={FadeInDown.duration(400)} style={styles.welcomeCard}>
                <LinearGradient
                  colors={['#1E3A8A', '#7C3AED']}
                  style={styles.sparkleOrb}
                >
                  <Sparkles size={22} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.welcomeTitle}>Ask Tollgram AI</Text>
                <Text style={styles.welcomeBody}>
                  Evidence-based guidance on growth plates, sleep, nutrition, and spinal biomechanics.
                </Text>
              </Animated.View>
            )}

            {/* Quick-prompt chips (2 × 2 grid) */}
            {chatMessages.length <= 1 && (
              <View style={styles.chipsSection}>
                <Text style={styles.chipsHeading}>Suggested topics</Text>
                <View style={styles.chipsGrid}>
                  {QUICK_PROMPT_CHIPS.map((chip) => (
                    <TouchableOpacity
                      key={chip.id}
                      onPress={() => handleSend(chip.prompt)}
                      disabled={isTyping || quota.isExhausted}
                      style={styles.chipButton}
                      activeOpacity={0.75}
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
              const ts = formatTimestamp((msg as any).timestamp);

              return (
                <Animated.View
                  key={msg.id}
                  entering={FadeInUp.duration(280)}
                  style={[
                    styles.messageRow,
                    isUser ? styles.messageRowUser : styles.messageRowAssistant,
                  ]}
                >
                  {!isUser && (
                    <View style={styles.avatarBot}>
                      <Bot size={15} color="#2563EB" />
                    </View>
                  )}

                  <View style={[styles.messageWrapper, isUser ? styles.messageWrapperUser : styles.messageWrapperAssistant]}>
                    <View
                      style={[
                        styles.messageBubble,
                        isUser ? styles.bubbleUser : styles.bubbleAssistant,
                      ]}
                    >
                      {isUser ? (
                        <Text style={[styles.messageText, styles.textUser]}>
                          {msg.text}
                        </Text>
                      ) : (
                        <Text style={[styles.messageText, styles.textAssistant]}>
                          {renderMarkdown(msg.text)}
                        </Text>
                      )}

                      {/* Assistant actions: Listen + Share + citation */}
                      {!isUser && (
                        <View style={styles.assistantFooterRow}>
                          <TouchableOpacity
                            onPress={() => handleToggleTTS(msg.id, msg.text)}
                            style={[styles.actionBtn, isSpeaking && styles.actionBtnActive]}
                            activeOpacity={0.7}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            {isSpeaking ? (
                              <>
                                <VolumeX size={13} color="#2563EB" />
                                <Text style={styles.actionBtnTextActive}>Stop</Text>
                              </>
                            ) : (
                              <>
                                <Volume2 size={13} color={colors.slate600} />
                                <Text style={styles.actionBtnText}>Listen</Text>
                              </>
                            )}
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => handleShare(msg.text)}
                            style={styles.actionBtn}
                            activeOpacity={0.7}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Share2 size={13} color={colors.slate600} />
                            <Text style={styles.actionBtnText}>Share</Text>
                          </TouchableOpacity>

                          {msg.citation ? (
                            <Text style={styles.citationText} numberOfLines={1}>
                              {msg.citation}
                            </Text>
                          ) : null}
                        </View>
                      )}
                    </View>

                    {/* Timestamp */}
                    {ts ? (
                      <Text style={[styles.timestamp, isUser ? styles.timestampUser : styles.timestampAssistant]}>
                        {ts}
                      </Text>
                    ) : null}
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
                  <Text style={styles.typingText}>Consulting clinical growth datasets…</Text>
                </View>
              </Animated.View>
            )}
          </ScrollView>
        </LinearGradient>

        {/* ── Input bar ────────────────────────────────────────────── */}
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
                ref={inputRef}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask about growth plates, stretches, sleep…"
                placeholderTextColor={colors.slate400}
                style={styles.textInput}
                multiline
                maxLength={400}
                returnKeyType="send"
                onSubmitEditing={() => handleSend()}
              />
              <TouchableOpacity
                onPress={inputText.trim() ? () => handleSend() : () => inputRef.current?.focus()}
                disabled={isTyping}
                style={[
                  styles.sendButton,
                  (!inputText.trim() || isTyping) && styles.sendButtonMic,
                ]}
                activeOpacity={0.8}
              >
                {inputText.trim() ? (
                  <Send size={18} color="#FFFFFF" />
                ) : (
                  <Mic size={18} color="#FFFFFF" />
                )}
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
    backgroundColor: '#0F172A',
  },
  flexOne: {
    flex: 1,
  },

  // ── Header ────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: '#0F172A',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(148, 163, 184, 0.15)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(148,163,184,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 3,
  },
  wordmarkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  wordmarkText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 2,
  },
  quotaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(37,99,235,0.18)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(147,197,253,0.3)',
  },
  quotaChipExhausted: {
    backgroundColor: 'rgba(217,119,6,0.15)',
    borderColor: 'rgba(252,211,77,0.35)',
  },
  quotaText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#93C5FD',
  },
  quotaTextExhausted: {
    color: colors.amber600,
  },

  // ── Refill bar ────────────────────────────────────────────────
  refillBar: {
    backgroundColor: '#1E293B',
    paddingVertical: 5,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  refillText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },

  // ── Scroll / messages ─────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 14,
  },

  // ── Welcome card ──────────────────────────────────────────────
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  sparkleOrb: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.slate900,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  welcomeBody: {
    fontSize: 13,
    color: colors.slate600,
    textAlign: 'center',
    lineHeight: 19,
  },

  // ── Chips ─────────────────────────────────────────────────────
  chipsSection: {
    marginBottom: 6,
  },
  chipsHeading: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.slate400,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
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
    paddingHorizontal: 13,
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

  // ── Message rows ──────────────────────────────────────────────
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
  messageWrapper: {
    maxWidth: '82%',
    gap: 3,
  },
  messageWrapperUser: {
    alignItems: 'flex-end',
  },
  messageWrapperAssistant: {
    alignItems: 'flex-start',
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
  mdBold: {
    fontWeight: '700',
    color: colors.slate900,
  },
  mdHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.slate900,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 10,
    color: colors.slate400,
    marginTop: 2,
  },
  timestampUser: {
    textAlign: 'right',
  },
  timestampAssistant: {
    textAlign: 'left',
    marginLeft: 4,
  },
  assistantFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  actionBtnText: {
    fontSize: 11,
    color: colors.slate600,
    fontWeight: '600',
  },
  actionBtnTextActive: {
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

  // ── Typing indicator ──────────────────────────────────────────
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

  // ── Input bar ─────────────────────────────────────────────────
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
    backgroundColor: '#F8FAFF',
    borderWidth: 1.5,
    borderColor: '#DDE3F5',
    borderRadius: 28,
    paddingHorizontal: 16,
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
  sendButtonMic: {
    backgroundColor: '#94A3B8',
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
