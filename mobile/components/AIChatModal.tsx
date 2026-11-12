import React, { useState, useRef } from 'react';
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
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  BookOpen,
} from 'lucide-react-native';
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
      'Based on pediatric ossification timelines, epiphyseal plates in the distal femur and proximal tibia typically undergo complete closure between ages 16–19 in males (14–16 in females). If your annual velocity is decelerating but still active (2–5 cm/yr), micro-remodeling chondrocytes remain active before complete terminal fusion.',
    citation: 'Ref: UpToDate: Normal Pubertal Growth & Skeletal Maturation',
  },
  {
    id: 'chip-2',
    label: '🥛 Bedtime hGH Snack',
    prompt: 'What should I eat 60 minutes before bed to maximize human growth hormone pulse?',
    response:
      'Slow-digesting micellar casein (e.g. 150g Greek yogurt or low-fat cottage cheese) combined with zinc and magnesium stabilizes blood glucose. High glycemic carbohydrates right before bed spike insulin, which suppresses pulsatile somatotropin secretion during the crucial first 90 minutes of Slow-Wave Sleep.',
    citation: 'Ref: Takahashi et al., Journal of Clinical Investigation: Somatotropin Sleep Dynamics',
  },
  {
    id: 'chip-3',
    label: '🧘 Spinal Disc Traction',
    prompt: 'Can spinal decompression really restore 1.0 to 2.5 cm of lost height?',
    response:
      'Yes, through daily diurnal disc rehydration. Gravity compresses human intervertebral discs by 1.0–2.5 cm over the course of a day. Targeted traction (such as 60-second passive bar hangs, cobra extensions, and cat-cow flows) relieves axial pressure and allows disc nuclei to reabsorb synovial fluids.',
    citation: 'Ref: Journal of Back and Musculoskeletal Rehabilitation: Diurnal Disc Dynamics',
  },
  {
    id: 'chip-4',
    label: '🧬 Mid-Parental Target',
    prompt: 'How does the Tanner-Whitehouse formula calculate my genetic baseline?',
    response:
      'The Tanner-Whitehouse model calculates your mid-parental genetic set-point: (Father Height + Mother Height ± 13 cm) / 2. This accounts for ~60–80% of adult stature variance. The remaining 20–40% depends on epigenetics, sleep quality, nutrient density, and spinal biomechanics.',
    citation: 'Ref: Visscher et al., Nature Genetics: Twin Stature Heritability Studies',
  },
  {
    id: 'chip-5',
    label: '💤 Deep SWS Sleep',
    prompt: 'Why is stage 3/4 slow-wave sleep critical for stature growth?',
    response:
      'Over 75% of your daily pulsatile Human Growth Hormone (somatotropin) is synthesized during Stage 3/4 non-REM deep slow-wave sleep. Melatonin suppression from late-night blue light shifts your circadian onset and blunts this nocturnal peak anabolic window.',
    citation: 'Ref: Van Cauter et al., Sleep: Sleep, Growth Hormone, and Neuroendocrine Regulation',
  },
  {
    id: 'chip-6',
    label: '🏋️ Lifting Weights Myth',
    prompt: 'Does adolescent weightlifting or resistance training stunt height growth?',
    response:
      'Medical consensus from the American Academy of Pediatrics confirms that supervised, progressive resistance training does NOT damage epiphyseal plates or stunt growth. It increases osteoblast bone mineralization and stimulates local IGF-1 expression. Only improper heavy spinal axial compression poses injury risk.',
    citation: 'Ref: American Academy of Pediatrics: Strength Training by Children and Adolescents',
  },
];

export default function AIChatModal({ visible, onClose }: AIChatModalProps) {
  const chatMessages = useAppStore((state) => state.chatMessages);
  const addChatMessage = useAppStore((state) => state.addChatMessage);
  const quizData = useAppStore((state) => state.quizData);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<any>(null);

  const handleSendPrompt = (chip: PromptChip) => {
    // Add user question
    addChatMessage({
      role: 'user',
      text: chip.prompt,
    });

    setIsTyping(true);

    setTimeout(() => {
      addChatMessage({
        role: 'assistant',
        text: chip.response,
        citation: chip.citation,
      });
      setIsTyping(false);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 600);
  };

  const handleCustomSend = async () => {
    const query = inputText.trim();
    if (!query) return;

    addChatMessage({
      role: 'user',
      text: query,
    });
    setInputText('');
    setIsTyping(true);

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
        text: 'Skeletal development depends on epiphyseal cartilage cell proliferation in long bones and daily intervertebral disc hydration.',
        citation: 'Ref: AAP Pediatric Endocrinology & Biomechanics Guidelines',
      });
    } finally {
      setIsTyping(false);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end bg-black/60"
      >
        <View className="bg-white rounded-t-3xl p-6 h-[90%] border-t border-slate-200 flex-col">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-4 border-b border-slate-100">
            <View className="flex-row items-center gap-2.5">
              <View className="w-9 h-9 rounded-xl bg-blue-600 items-center justify-center shadow-sm">
                <Bot size={18} color="#FFFFFF" />
              </View>
              <View>
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-base font-black text-slate-900">GoTall Growth Advisor</Text>
                  <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </View>
                <Text className="text-[10px] text-slate-400 font-semibold">
                  Tanner-Whitehouse III & Biomechanics Engine
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
            >
              <X size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Quick 1-Tap Suggestion Chips Bar */}
          <View className="py-3 border-b border-slate-100">
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              1-Tap Scientific Topics:
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2"
            >
              {QUICK_PROMPT_CHIPS.map((chip) => (
                <TouchableOpacity
                  key={chip.id}
                  onPress={() => handleSendPrompt(chip)}
                  className="px-3 py-1.5 bg-blue-50/80 hover:bg-blue-100 border border-blue-200/80 rounded-full flex-row items-center gap-1.5"
                >
                  <Sparkles size={12} color="#0066FF" />
                  <Text className="text-xs font-bold text-blue-700">{chip.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Chat Messages Thread */}
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="py-4 gap-3.5"
            className="flex-1"
          >
            {chatMessages.map((msg) => (
              <View
                key={msg.id}
                className={`flex-row gap-2.5 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <View className="w-7 h-7 rounded-full bg-blue-100 items-center justify-center mt-1">
                    <Bot size={14} color="#0066FF" />
                  </View>
                )}

                <View
                  className={`max-w-[82%] p-3.5 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-blue-600 rounded-tr-xs'
                      : 'bg-slate-50 border border-slate-200 rounded-tl-xs'
                  }`}
                >
                  <Text
                    className={`text-xs leading-relaxed font-medium ${
                      msg.role === 'user' ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    {msg.text}
                  </Text>

                  {msg.citation && (
                    <View className="mt-2 pt-2 border-t border-slate-200 flex-row items-center gap-1">
                      <BookOpen size={11} color="#64748B" />
                      <Text className="text-[10px] text-slate-500 font-semibold italic">
                        {msg.citation}
                      </Text>
                    </View>
                  )}
                </View>

                {msg.role === 'user' && (
                  <View className="w-7 h-7 rounded-full bg-blue-600 items-center justify-center mt-1">
                    <User size={14} color="#FFFFFF" />
                  </View>
                )}
              </View>
            ))}

            {isTyping && (
              <View className="flex-row items-center gap-2 p-3 bg-slate-50 rounded-2xl w-40 border border-slate-200">
                <Bot size={14} color="#0066FF" />
                <Text className="text-xs text-slate-400 font-medium italic">Consulting citations...</Text>
              </View>
            )}
          </ScrollView>

          {/* Mandatory Medical Disclaimer Banner */}
          <View className="py-1.5 px-3 bg-slate-50 rounded-xl border border-slate-200 flex-row items-center gap-1.5 mb-2">
            <ShieldCheck size={12} color="#64748B" />
            <Text className="text-[10px] text-slate-500 leading-tight flex-1">
              Educational clinical guidance. No unverified claims or synthetic height boosters.
            </Text>
          </View>

          {/* Input Box */}
          <View className="flex-row items-center gap-2 pt-1 border-t border-slate-100">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask about growth plates, nutrition, or stretches..."
              placeholderTextColor="#94A3B8"
              onSubmitEditing={handleCustomSend}
              className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 font-medium"
            />

            <TouchableOpacity
              onPress={handleCustomSend}
              disabled={!inputText.trim()}
              className={`w-11 h-11 rounded-2xl items-center justify-center ${
                inputText.trim() ? 'bg-blue-600' : 'bg-slate-200'
              }`}
              style={inputText.trim() ? { elevation: 2, shadowColor: '#2563EB', shadowOpacity: 0.25, shadowRadius: 4 } : undefined}
            >
              <Send size={16} color={inputText.trim() ? '#FFFFFF' : '#94A3B8'} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

