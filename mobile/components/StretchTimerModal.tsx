import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Dimensions,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';

// Resilient native video loader: In modern Expo Go (SDK 52+), the legacy ExponentAV native
// module is not bundled. Dynamically checking prevents uncaught evaluation errors at startup.
let NativeVideoComponent: any = null;
let NativeResizeMode: any = { COVER: 'cover', CONTAIN: 'contain', STRETCH: 'stretch' };

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ExpoAv = require('expo-av');
  if (ExpoAv && ExpoAv.Video) {
    NativeVideoComponent = ExpoAv.Video;
    NativeResizeMode = ExpoAv.ResizeMode || NativeResizeMode;
  }
} catch {
  // In Expo Go or builds without ExponentAV native binary
  NativeVideoComponent = null;
}
import {
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Film,
  FileImage,
  Flame,
  Activity,
  Layers,
} from 'lucide-react-native';
import CircularProgressRingGlass from './CircularProgressRingGlass';
import { useAppStore, StretchExercise } from '../lib/store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StretchTimerModalProps {
  visible: boolean;
  exercise: StretchExercise | null;
  onClose: () => void;
}

export default function StretchTimerModal({
  visible,
  exercise,
  onClose,
}: StretchTimerModalProps) {
  const markStretchComplete = useAppStore((state) => state.markStretchComplete);
  const completedStretches = useAppStore((state) => state.completedStretches);

  const initialSeconds = exercise?.durationSeconds || 60;
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const videoRef = useRef<any>(null);

  // Sync state whenever a new exercise is opened
  useEffect(() => {
    if (exercise) {
      const dur = exercise.durationSeconds || 60;
      setTimeLeft(dur);
      setIsRunning(false);
      setIsCompleted(completedStretches.includes(Number(exercise.id)));
    }
  }, [exercise, completedStretches]);

  // High precision countdown timer
  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer finished
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setIsCompleted(true);
      if (exercise) {
        markStretchComplete(Number(exercise.id));
      }
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, exercise, markStretchComplete]);

  if (!exercise) return null;

  const totalDuration = exercise.durationSeconds || 60;
  const progressPct = Math.round(((totalDuration - timeLeft) / totalDuration) * 100);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setIsRunning(false);
    setTimeLeft(totalDuration);
    if (videoRef.current && typeof videoRef.current.setPositionAsync === 'function') {
      videoRef.current.setPositionAsync(0).catch(() => {});
    }
  };

  const handleManualComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setIsRunning(false);
    setTimeLeft(0);
    setIsCompleted(true);
    markStretchComplete(Number(exercise.id));
  };

  const isVideo = exercise.media_type === 'video' && !!exercise.media_url;
  const isImageOrGif = (exercise.media_type === 'image' || exercise.media_type === 'gif') && !!exercise.media_url;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Soft Ice-Blue Gradient Background Canvas */}
        <LinearGradient
          colors={['#EFF6FF', '#DBEAFE', '#F8FAFC']}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Modal Top Bar */}
        <View style={styles.headerRow}>
          <View style={styles.headerTextGroup}>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.categoryPill,
                  exercise.category === 'Height Growth'
                    ? styles.pillGrowth
                    : exercise.category === 'Strength'
                    ? styles.pillStrength
                    : styles.pillPosture,
                ]}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    exercise.category === 'Height Growth'
                      ? styles.textGrowth
                      : exercise.category === 'Strength'
                      ? styles.textStrength
                      : styles.textPosture,
                  ]}
                >
                  {exercise.category || 'Height Growth'}
                </Text>
              </View>

              <Text style={styles.targetZoneTag}>• {exercise.targetZone}</Text>
            </View>

            <Text style={styles.exerciseTitle} numberOfLines={1}>
              {exercise.title}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              onClose();
            }}
            style={styles.closeBtn}
          >
            <X size={18} color="#475569" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ============================================================== */}
          {/* MEDIA VIEWER: Looping Muted Video or Cached High-Res Image/GIF */}
          {/* ============================================================== */}
          <View style={styles.mediaContainer}>
            {isVideo ? (
              NativeVideoComponent ? (
                <NativeVideoComponent
                  ref={videoRef}
                  source={{ uri: exercise.media_url! }}
                  style={styles.mediaPlayer}
                  resizeMode={NativeResizeMode.COVER}
                  shouldPlay={true}
                  isLooping={true}
                  isMuted={true}
                  useNativeControls={false}
                />
              ) : (
                <LinearGradient
                  colors={['#0F172A', '#1E293B', '#0F172A']}
                  style={styles.fallbackMedia}
                >
                  <View style={styles.fallbackCenterContent}>
                    <View style={styles.fallbackIconWrap}>
                      <Film size={32} color="#38BDF8" />
                    </View>
                    <Text style={styles.fallbackTitle}>Biomechanical Motion</Text>
                    <Text style={styles.fallbackSubtitle}>
                      Active stretching protocol in progress
                    </Text>
                    {exercise.media_url ? (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                          if (exercise.media_url) {
                            Linking.openURL(exercise.media_url).catch(() => {});
                          }
                        }}
                        style={styles.videoLinkPill}
                      >
                        <Play size={12} color="#FFFFFF" fill="#FFFFFF" />
                        <Text style={styles.videoLinkText}>Open Video Guide</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </LinearGradient>
              )
            ) : isImageOrGif ? (
              <Image
                source={{ uri: exercise.media_url! }}
                style={styles.mediaPlayer}
                contentFit="cover"
                transition={300}
                cachePolicy="memory-disk"
              />
            ) : (
              /* Fallback 3D Anatomical Visualizer */
              <LinearGradient
                colors={['#1E293B', '#0F172A']}
                style={styles.fallbackMedia}
              >
                <View style={styles.fallbackCenterContent}>
                  <View style={styles.fallbackIconWrap}>
                    <Activity size={32} color="#38BDF8" />
                  </View>
                  <Text style={styles.fallbackTitle}>Spinal Traction Active</Text>
                  <Text style={styles.fallbackSubtitle}>
                    Follow the calibrated biomechanical breathing cues
                  </Text>
                </View>
              </LinearGradient>
            )}

            {/* Media Type Floating Tag */}
            <View style={styles.mediaOverlayBadge}>
              {isVideo ? (
                <>
                  <Film size={12} color="#FFFFFF" />
                  <Text style={styles.mediaOverlayText}>Looping Video Demonstration</Text>
                </>
              ) : isImageOrGif ? (
                <>
                  <FileImage size={12} color="#FFFFFF" />
                  <Text style={styles.mediaOverlayText}>Visual Form Guide</Text>
                </>
              ) : (
                <>
                  <Layers size={12} color="#FFFFFF" />
                  <Text style={styles.mediaOverlayText}>Clinical Motion Sensor</Text>
                </>
              )}
            </View>
          </View>

          {/* ============================================================== */}
          {/* CIRCULAR COUNTDOWN TIMER & CONTROLS SECTION                   */}
          {/* ============================================================== */}
          <View style={styles.glassTimerCard}>
            <View style={styles.timerGaugeWrap}>
              <CircularProgressRingGlass
                size={148}
                strokeWidth={11}
                percentage={progressPct}
                color={isCompleted ? '#10B981' : isRunning ? '#0284C7' : '#2563EB'}
                gradientSecondary={isCompleted ? '#34D399' : '#38BDF8'}
                valueText={formatTime(timeLeft)}
                unitText={isCompleted ? 'Done!' : isRunning ? 'Remaining' : 'Ready'}
                label={isCompleted ? 'Goal Hit' : `${totalDuration}s Session`}
              />
            </View>

            {/* Timer Controls Row */}
            <View style={styles.controlsRow}>
              {/* Reset Button */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleResetTimer}
                style={styles.iconCircleBtn}
              >
                <RotateCcw size={16} color="#64748B" />
              </TouchableOpacity>

              {/* Start / Pause Main Action Pill */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleToggleTimer}
                style={[
                  styles.primaryTimerBtn,
                  isRunning ? styles.btnRunning : styles.btnPaused,
                ]}
              >
                {isRunning ? (
                  <>
                    <Pause size={17} color="#FFFFFF" />
                    <Text style={styles.primaryTimerBtnText}>Pause Session</Text>
                  </>
                ) : (
                  <>
                    <Play size={17} color="#FFFFFF" />
                    <Text style={styles.primaryTimerBtnText}>
                      {timeLeft === totalDuration ? 'Start Timer' : 'Resume'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Manual Complete Checkbox */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleManualComplete}
                style={[
                  styles.iconCircleBtn,
                  isCompleted && styles.iconCircleBtnDone,
                ]}
              >
                <CheckCircle2
                  size={19}
                  color={isCompleted ? '#FFFFFF' : '#64748B'}
                />
              </TouchableOpacity>
            </View>

            {/* Completion Banner */}
            {isCompleted && (
              <View style={styles.completeBanner}>
                <Sparkles size={14} color="#059669" />
                <Text style={styles.completeBannerText}>
                  Spinal Decompression Logged (+XP Earned)
                </Text>
              </View>
            )}
          </View>

          {/* ============================================================== */}
          {/* BIOMECHANICAL CLINICAL BENEFIT CARD                            */}
          {/* ============================================================== */}
          <View style={styles.glassInfoCard}>
            <View style={styles.infoCardHeader}>
              <ShieldCheck size={16} color="#2563EB" />
              <Text style={styles.infoCardTitle}>Biomechanical Action Target</Text>
            </View>
            <Text style={styles.infoCardBody}>{exercise.clinicalBenefit}</Text>
          </View>

          {/* ============================================================== */}
          {/* STEP-BY-STEP EXECUTION INSTRUCTIONS                            */}
          {/* ============================================================== */}
          <View style={styles.stepsSection}>
            <Text style={styles.stepsSectionTitle}>
              Execution Steps ({exercise.instructions.length} steps)
            </Text>

            <View style={styles.stepsList}>
              {exercise.instructions.map((step, idx) => (
                <View key={idx} style={styles.stepItemRow}>
                  <View style={styles.stepIndexPill}>
                    <Text style={styles.stepIndexText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Contraindication Caution */}
          {exercise.contraindications && (
            <View style={styles.cautionCard}>
              <ShieldAlert size={15} color="#D97706" />
              <Text style={styles.cautionText}>
                <Text style={styles.cautionBold}>Clinical Caution: </Text>
                {exercise.contraindications}
              </Text>
            </View>
          )}

          {/* Bottom Dismiss / Complete Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              onClose();
            }}
            style={styles.doneBtn}
          >
            <Text style={styles.doneBtnText}>
              {isCompleted ? 'Close & Save Progress' : 'Dismiss Exercise'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#F0F6FF',
  },
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 18 : 22,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.7)',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  headerTextGroup: {
    flex: 1,
    paddingRight: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
    borderWidth: 1,
  },
  pillGrowth: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  pillStrength: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  pillPosture: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  textGrowth: {
    color: '#1D4ED8',
  },
  textStrength: {
    color: '#4338CA',
  },
  textPosture: {
    color: '#047857',
  },
  targetZoneTag: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  exerciseTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  mediaContainer: {
    width: '100%',
    height: 220,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  mediaPlayer: {
    width: '100%',
    height: '100%',
  },
  fallbackMedia: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackCenterContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  fallbackIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  fallbackTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  fallbackSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  videoLinkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
    marginTop: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  videoLinkText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  mediaOverlayBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  mediaOverlayText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  glassTimerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  timerGaugeWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleBtnDone: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  primaryTimerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  btnRunning: {
    backgroundColor: '#D97706',
  },
  btnPaused: {
    backgroundColor: '#2563EB',
  },
  primaryTimerBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  completeBanner: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(209, 250, 229, 0.8)',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  completeBannerText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '800',
  },
  glassInfoCard: {
    backgroundColor: 'rgba(239, 246, 255, 0.7)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 16,
    marginBottom: 16,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 6,
  },
  infoCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E3A8A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCardBody: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '500',
    lineHeight: 18,
  },
  stepsSection: {
    marginBottom: 16,
  },
  stepsSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 10,
  },
  stepsList: {
    gap: 8,
  },
  stepItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 12,
  },
  stepIndexPill: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepIndexText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  stepText: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
    lineHeight: 18,
  },
  cautionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
  },
  cautionText: {
    flex: 1,
    fontSize: 11,
    color: '#92400E',
    fontWeight: '500',
    lineHeight: 16,
  },
  cautionBold: {
    fontWeight: '800',
  },
  doneBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
