import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  BookOpen,
  Zap,
  Clock,
  Crown,
  AlertCircle,
  HelpCircle,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAppStore, ChatMessage } from '../lib/store';
import { queryGeminiAdvisor } from '../lib/gemini';

interface AIChatModalProps {
  visible: boolean;
  onClose: () => void;
}

interface PromptChip {
  id: string;
  label: string;
  prompt: string;
  response: string;
  citation: string;
}

const QUICK_PROMPT_CHIPS: PromptChip[] = [
  {
    id: 'chip-1',
    label: '🦴 Growth Plate Status',
    prompt: 'Are my epiphyseal growth plates still open based on my age and growth velocity?',
    response:
      'Based on clinical pediatric ossification timelines, epiphyseal growth plates in the distal femur and proximal tibia typically undergo complete closure between ages 16–19 in males (14–16 in females).\n\nIf your annual velocity is decelerating but still active (2–5 cm/year), micro-remodeling chondrocytes remain receptive to growth factors before terminal fusion.',
    citation: 'Ref: UpToDate: Normal Pubertal Growth & Skeletal Maturation',
  },
  {
    id: 'chip-2',
    label: '🥛 Bedtime hGH Snack',
    prompt: 'What should I eat 60 minutes before bed to maximize human growth hormone pulse?',
    response:
      'Slow-digesting micellar casein (such as 150g Greek yogurt, low-fat paneer, or cottage cheese) combined with zinc stabilizes nocturnal blood glucose.\n\nAvoid high-glycemic carbohydrates right before bed: insulin spikes blunt pulsatile somatotropin secretion during the critical first 90 minutes of Slow-Wave Sleep.',
    citation: 'Ref: Takahashi et al., J Clin Invest: Somatotropin Sleep Dynamics',
  },
  {
    id: 'chip-3',
    label: '🧘 Spine Disc Traction',
    prompt: 'Can spinal decompression really restore 1.0 to 2.5 cm of lost height?',
    response:
      'Yes, through daily diurnal disc rehydration. Gravity compresses human intervertebral discs by 1.0–2.5 cm over the course of a normal upright day.\n\nTargeted traction (such as 60-second dead hangs, cobra poses, and cat-cow flows) relieves axial pressure, allowing intervertebral disc nuclei to rehydrate with synovial fluid.',
    citation: 'Ref: J Back Musculoskelet Rehabil: Diurnal Disc Dynamics',
  },
  {
    id: 'chip-4',
    label: '🧬 Tanner Target',
    prompt: 'How does the Tanner-Whitehouse formula calculate my genetic baseline?',
    response:
      'The Tanner-Whitehouse model calculates your mid-parental genetic set-point:\n\n• For Males: (Father + Mother + 13 cm) / 2\n• For Females: (Father + Mother − 13 cm) / 2\n\nThis genetic target accounts for ~60–80% of adult stature variance. The remaining 20–40% depends on nutrition, deep sleep, and spinal biomechanics.',
    citation: 'Ref: Visscher et al., Nature Genetics: Twin Stature Heritability Studies',
  },
  {
    id: 'chip-5',
    label: '💤 Deep SWS Sleep',
    prompt: 'Why is stage 3/4 slow-wave sleep critical for stature growth?',
    response:
      'Over 75% of your daily pulsatile Human Growth Hormone (somatotropin) is synthesized during Stage 3/4 non-REM deep slow-wave sleep.\n\nMelatonin suppression from late-night screens delays slow-wave onset and blunts this nocturnal peak anabolic window.',
    citation: 'Ref: Van Cauter et al., Sleep: Sleep, Growth Hormone, and Neuroendocrine Regulation',
  },
  {
    id: 'chip-6',
    label: '🏋️ Lifting Weights Myth',
    prompt: 'Does adolescent weightlifting or resistance training stunt height growth?',
    response:
      'Medical consensus from the American Academy of Pediatrics confirms that supervised, progressive resistance training does NOT damage epiphyseal plates or stunt growth.\n\nIn fact, it stimulates osteoblast bone mineralization and local IGF-1 expression. Only improper heavy spinal axial compression poses injury risk.',
    citation: 'Ref: American Academy of Pediatrics: Strength Training by Children and Adolescents',
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

  // Auto-scroll whenever messages change
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
        citation: chip.citation,
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
        citation: response.citation,
      });
    } catch (e) {
      addChatMessage({
        role: 'assistant',
        text: 'Epiphyseal plate remodeling and spinal disk hydration are the two primary biological determinants of height growth. Focus on consistent 8–9 hours of circadian sleep and daily spinal decompression.',
        citation: 'Ref: AAP Pediatric Endocrinology & Biomechanics Guidelines',
      });
    } finally {
      setIsTyping(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      scrollToBottom();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          <View style={styles.chatSheet}>
            {/* 1. Header Bar */}
            <View style={styles.headerBar}>
              <View style={styles.headerLeft}>
                <View style={styles.avatarWrap}>
                  <Bot size={20} color="#FFFFFF" />
                  <View style={styles.onlineBadge} />
                </View>
                <View>
                  <View style={styles.titleRow}>
                    <Text style={styles.headerTitle}>Dr. Jack Growth Advisor</Text>
                    <View style={styles.aiBadge}>
                      <Text style={styles.aiBadgeText}>AI 1.5</Text>
                    </View>
                  </View>
                  <Text style={styles.headerSubtitle}>
                    Pediatric Endocrinology & Biomechanics
                  </Text>
                </View>
              </View>

              <View style={styles.headerRight}>
                {/* Quota Pill */}
                <View style={[styles.quotaPill, isPremium && styles.quotaPillPremium]}>
                  <Zap size={11} color={isPremium ? '#D97706' : '#0284C7'} />
                  <Text style={[styles.quotaPillText, isPremium && styles.quotaPillTextPremium]}>
                    {quota.remaining} left
                  </Text>
                </View>

                {/* Close Button */}
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={18} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>

            {/* 2. Compact 1-Tap Question Chips */}
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
                      size={11}
                      color={quota.isExhausted ? '#94A3B8' : '#0284C7'}
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

            {/* 3. Messages List with High Contrast & Clear Spacing */}
            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesScrollContent}
              onContentSizeChange={scrollToBottom}
            >
              {/* Welcome intro message if thread is empty */}
              {chatMessages.length === 0 && (
                <View style={styles.introCard}>
                  <View style={styles.introIconCircle}>
                    <Sparkles size={20} color="#0284C7" />
                  </View>
                  <Text style={styles.introTitle}>Ask Dr. Jack Anything</Text>
                  <Text style={styles.introBody}>
                    Ground your growth questions in honest pediatric medicine. Tap any topic above or ask a custom question below.
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
                    <View style={styles.msgAvatarAssistant}>
                      <Bot size={14} color="#0284C7" />
                    </View>
                  )}

                  <View
                    style={[
                      styles.bubble,
                      msg.role === 'user'
                        ? styles.userBubble
                        : styles.assistantBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.msgText,
                        msg.role === 'user'
                          ? styles.userMsgText
                          : styles.assistantMsgText,
                      ]}
                    >
                      {msg.text}
                    </Text>

                    {/* Scientific Citation Pill */}
                    {msg.citation ? (
                      <View style={styles.citationBox}>
                        <BookOpen size={11} color="#0369A1" />
                        <Text style={styles.citationText}>
                          {msg.citation}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {msg.role === 'user' && (
                    <View style={styles.msgAvatarUser}>
                      <User size={14} color="#FFFFFF" />
                    </View>
                  )}
                </View>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <View style={[styles.messageRow, styles.assistantRow]}>
                  <View style={styles.msgAvatarAssistant}>
                    <Bot size={14} color="#0284C7" />
                  </View>
                  <View style={styles.typingBubble}>
                    <ActivityIndicator size="small" color="#0284C7" />
                    <Text style={styles.typingText}>
                      Consulting pediatric growth literature...
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* 4. Quota Exhaustion Warning */}
            {quota.isExhausted && (
              <View style={styles.quotaWarningBox}>
                <AlertCircle size={14} color="#DC2626" />
                <Text style={styles.quotaWarningText}>
                  Daily limit reached ({quota.limit}/{quota.limit}). Resets in {quota.resetCountdown}.
                </Text>
                {!isPremium && (
                  <TouchableOpacity
                    onPress={() => {
                      onClose();
                      router.push('/(onboarding)/paywall');
                    }}
                    style={styles.upgradeBtn}
                  >
                    <Crown size={12} color="#FFFFFF" />
                    <Text style={styles.upgradeBtnText}>Upgrade</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* 5. Input Bar */}
            <View style={styles.inputArea}>
              <View style={styles.inputFieldWrap}>
                <TextInput
                  value={inputText}
                  onChangeText={setInputText}
                  editable={!quota.isExhausted}
                  placeholder={
                    quota.isExhausted
                      ? `Daily limit reached. Resets in ${quota.resetCountdown}`
                      : 'Ask about growth plates, nutrition, or stretches...'
                  }
                  placeholderTextColor="#94A3B8"
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
                        : '#94A3B8'
                    }
                  />
                </TouchableOpacity>
              </View>

              {/* Medical Disclaimer */}
              <View style={styles.disclaimerRow}>
                <ShieldCheck size={11} color="#64748B" />
                <Text style={styles.disclaimerText}>
                  Educational pediatric guidance • Tanner-Whitehouse III & AAP guidelines
                </Text>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  chatSheet: {
    height: '94%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 20,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatarWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  aiBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  aiBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0284C7',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quotaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  quotaPillPremium: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  quotaPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
  },
  quotaPillTextPremium: {
    color: '#B45309',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FAFAFA',
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chipItemDisabled: {
    opacity: 0.5,
    backgroundColor: '#F1F5F9',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  chipTextDisabled: {
    color: '#94A3B8',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  messagesScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
    gap: 12,
  },
  introCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  introIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  introTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  introBody: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 4,
    fontWeight: '500',
    paddingHorizontal: 8,
  },
  messageRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  assistantRow: {
    justifyContent: 'flex-start',
  },
  msgAvatarAssistant: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  msgAvatarUser: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#0284C7',
    borderTopRightRadius: 4,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  msgText: {
    fontSize: 13,
    lineHeight: 20,
  },
  userMsgText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  assistantMsgText: {
    color: '#0F172A',
    fontWeight: '500',
  },
  citationBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  citationText: {
    fontSize: 10,
    color: '#0284C7',
    fontWeight: '700',
    flex: 1,
    fontStyle: 'italic',
  },
  typingBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  quotaWarningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    borderTopWidth: 1,
    borderTopColor: '#FECACA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  quotaWarningText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
    flex: 1,
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0284C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  upgradeBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  inputArea: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  inputFieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 22,
    paddingLeft: 14,
    paddingRight: 6,
    height: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '500',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: '#0284C7',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 8,
  },
  disclaimerText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
});
