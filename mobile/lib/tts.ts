import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

/**
 * Strips hallucinated prefixes (e.g. "Hello Senate") and markdown formatting before passing to TTS
 */
export function cleanTextForTTS(rawText: string): string {
  if (!rawText) return '';

  return (
    rawText
      // Strip hallucinated prefixes
      .replace(/^(hello|hi|dear)\s+(senate|congress|court|board|committee|assembly)[:,\.\s-]*/i, '')
      .replace(/^senate[:,\.\s-]*/i, '')
      // Strip citations and reference footers like Ref: Gemini...
      .replace(/Ref:\s*Gemini[^\n]+/gi, '')
      // Strip markdown symbols: asterisks, hashes, backticks, tildes, brackets
      .replace(/[\*_#`~]/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Plays text aloud using native expo-speech on mobile or window.speechSynthesis on web
 */
export async function speakText(
  text: string,
  options?: {
    onDone?: () => void;
    onStopped?: () => void;
    onError?: (err: any) => void;
  }
): Promise<void> {
  const clean = cleanTextForTTS(text);
  if (!clean) return;

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';
      utterance.onend = () => options?.onDone?.();
      utterance.onerror = (e) => options?.onError?.(e);
      window.speechSynthesis.speak(utterance);
    }
    return;
  }

  try {
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      await Speech.stop();
    }

    Speech.speak(clean, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.95,
      onDone: options?.onDone,
      onStopped: options?.onStopped,
      onError: options?.onError,
    });
  } catch (err) {
    console.warn('TTS Speech error:', err);
    options?.onError?.(err);
  }
}

/**
 * Stops any ongoing text-to-speech output
 */
export async function stopSpeech(): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    return;
  }

  try {
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      await Speech.stop();
    }
  } catch (err) {
    console.warn('TTS stop error:', err);
  }
}
