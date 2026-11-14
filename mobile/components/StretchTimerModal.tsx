// ✓ Modal rules applied — GlassCard, ScrollView, 85% maxHeight, SlideInDown
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Film,
  FileImage,
  Activity,
  Layers,
} from 'lucide-react-native';
import BottomSheet from './ui/BottomSheet';
import CircularProgressRingGlass from './CircularProgressRingGlass';
import { useAppStore, StretchExercise } from '../lib/store';
import { colors } from '../lib/theme';
import { haptics } from '../lib/animations';
import { useVideoPlayer, VideoView } from 'expo-video';

function ExerciseVideoPlayer({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <VideoView
      style={styles.mediaPlayer}
      player={player}
      nativeControls={false}
      contentFit="cover"
    />
  );
}

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

  useEffect(() => {
    if (exercise) {
      const dur = exercise.durationSeconds || 60;
      setTimeLeft(dur);
      setIsRunning(false);
      setIsCompleted(completedStretches.includes(Number(exercise.id)));
    }
  }, [exercise, completedStretches]);

  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            haptics.success();
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
    haptics.ctaPress();
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    haptics.selection();
    setIsRunning(false);
    setTimeLeft(totalDuration);
  };

  const handleManualComplete = () => {
    haptics.success();
    setIsRunning(false);
    setTimeLeft(0);
    setIsCompleted(true);
    markStretchComplete(Number(exercise.id));
  };

  const isVideo = exercise.media_type === 'video' && !!exercise.media_url;
  const isImageOrGif = (exercise.media_type === 'image' || exercise.media_type === 'gif') && !!exercise.media_url;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={exercise.title}
      subtitle={`${exercise.category} • ${exercise.targetZone}`}
      footer={
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            haptics.selection();
            onClose();
          }}
          style={styles.doneBtn}
          accessibilityLabel="Save and close exercise"
          accessibilityRole="button"
        >
          <Text style={styles.doneBtnText}>
            {isCompleted ? 'Done ✓ Save progress' : 'Close stretch'}
          </Text>
        </TouchableOpacity>
      }
    >
      <View style={styles.bodyContainer}>
        {/* MEDIA VIEWER */}
        <View style={styles.mediaContainer}>
          {isVideo ? (
            <ExerciseVideoPlayer uri={exercise.media_url!} />
          ) : isImageOrGif ? (
            <Image
              source={{ uri: exercise.media_url! }}
              style={styles.mediaPlayer}
              contentFit="cover"
              transition={300}
              cachePolicy="memory-disk"
              accessibilityRole="image"
              accessibilityLabel={`Form guide for ${exercise.title}`}
            />
          ) : (
            <LinearGradient
              colors={['#1E293B', '#0F172A']}
              style={styles.fallbackMedia}
            >
              <View style={styles.fallbackCenterContent}>
                <View style={styles.fallbackIconWrap}>
                  <Activity size={28} color="#38BDF8" />
                </View>
                <Text style={styles.fallbackTitle}>Follow the exercise form</Text>
              </View>
            </LinearGradient>
          )}

          <View style={styles.mediaOverlayBadge}>
            {isVideo ? (
              <>
                <Film size={11} color="#FFFFFF" />
                <Text style={styles.mediaOverlayText}>Video Guide</Text>
              </>
            ) : isImageOrGif ? (
              <>
                <FileImage size={11} color="#FFFFFF" />
                <Text style={styles.mediaOverlayText}>Photo Form</Text>
              </>
            ) : (
              <>
                <Layers size={11} color="#FFFFFF" />
                <Text style={styles.mediaOverlayText}>Form Guide</Text>
              </>
            )}
          </View>
        </View>

        {/* TIMER SECTION */}
        <View style={styles.timerCard}>
          <View style={styles.timerGaugeWrap}>
            <CircularProgressRingGlass
              size={130}
              strokeWidth={10}
              percentage={progressPct}
              color={isCompleted ? colors.green600 : isRunning ? colors.blue600 : colors.blue500}
              gradientSecondary={isCompleted ? '#34D399' : '#38BDF8'}
              valueText={formatTime(timeLeft)}
              unitText={isCompleted ? 'Done!' : isRunning ? 'Remaining' : 'Ready'}
              label={isCompleted ? 'Goal hit' : `${totalDuration}s goal`}
            />
          </View>

          {/* Controls */}
          <View style={styles.controlsRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleResetTimer}
              style={styles.iconCircleBtn}
              accessibilityLabel="Reset timer"
              accessibilityRole="button"
            >
              <RotateCcw size={16} color={colors.slate600} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleToggleTimer}
              style={[
                styles.primaryTimerBtn,
                isRunning ? styles.btnRunning : styles.btnPaused,
              ]}
              accessibilityLabel={isRunning ? 'Pause timer' : 'Start timer'}
              accessibilityRole="button"
            >
              {isRunning ? (
                <>
                  <Pause size={16} color="#FFFFFF" />
                  <Text style={styles.primaryTimerBtnText}>Pause</Text>
                </>
              ) : (
                <>
                  <Play size={16} color="#FFFFFF" />
                  <Text style={styles.primaryTimerBtnText}>
                    {timeLeft === totalDuration ? 'Start timer' : 'Resume'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleManualComplete}
              style={[
                styles.iconCircleBtn,
                isCompleted && styles.iconCircleBtnDone,
              ]}
              accessibilityLabel="Mark done"
              accessibilityRole="button"
            >
              <CheckCircle2
                size={18}
                color={isCompleted ? '#FFFFFF' : colors.slate600}
              />
            </TouchableOpacity>
          </View>

          {isCompleted && (
            <View style={styles.completeBanner}>
              <Sparkles size={14} color="#059669" />
              <Text style={styles.completeBannerText}>
                Your stretch is done ✓
              </Text>
            </View>
          )}
        </View>

        {/* CLINICAL NOTE */}
        {exercise.clinicalBenefit ? (
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <ShieldCheck size={16} color={colors.blue600} />
              <Text style={styles.infoCardTitle}>Clinical note</Text>
            </View>
            <Text style={styles.infoCardBody}>{exercise.clinicalBenefit}</Text>
          </View>
        ) : null}

        {/* STEPS */}
        <View style={styles.stepsSection}>
          <Text style={styles.stepsSectionTitle}>
            How to do it ({exercise.instructions.length} steps)
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

        {/* CAUTION */}
        {exercise.contraindications && (
          <View style={styles.cautionCard}>
            <ShieldAlert size={15} color={colors.amber600} />
            <Text style={styles.cautionText}>
              <Text style={styles.cautionBold}>Caution: </Text>
              {exercise.contraindications}
            </Text>
          </View>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  bodyContainer: {
    gap: 16,
  },
  mediaContainer: {
    width: '100%',
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  mediaPlayer: {
    width: '100%',
    height: '100%',
  },
  fallbackMedia: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackCenterContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  fallbackIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  fallbackTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  videoLinkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.blue600,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginTop: 8,
  },
  videoLinkText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  mediaOverlayBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  mediaOverlayText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  timerCard: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.70)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
  },
  timerGaugeWrap: {
    marginVertical: 4,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 12,
    width: '100%',
  },
  iconCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleBtnDone: {
    backgroundColor: colors.green600,
  },
  primaryTimerBtn: {
    flex: 1,
    maxWidth: 180,
    height: 44,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnRunning: {
    backgroundColor: colors.amber600,
  },
  btnPaused: {
    backgroundColor: colors.blue600,
  },
  primaryTimerBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  completeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
  },
  completeBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  infoCard: {
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.70)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate900,
  },
  infoCardBody: {
    fontSize: 12,
    color: colors.slate600,
    lineHeight: 18,
  },
  stepsSection: {
    gap: 8,
  },
  stepsSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.slate900,
  },
  stepsList: {
    gap: 8,
  },
  stepItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.60)',
    padding: 10,
    borderRadius: 14,
  },
  stepIndexPill: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.blue50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndexText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.blue600,
  },
  stepText: {
    flex: 1,
    fontSize: 12,
    color: colors.slate600,
    lineHeight: 18,
  },
  cautionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  cautionText: {
    flex: 1,
    fontSize: 11,
    color: colors.amber600,
    lineHeight: 16,
  },
  cautionBold: {
    fontWeight: '700',
  },
  doneBtn: {
    height: 48,
    backgroundColor: colors.blue600,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
