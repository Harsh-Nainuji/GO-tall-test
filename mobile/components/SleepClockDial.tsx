import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, {
  Circle,
  Path,
  Defs,
  LinearGradient,
  Stop,
  G,
  Line,
  Text as SvgText,
} from 'react-native-svg';
import { Moon, Sunrise, Bell, Sparkles, CheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const DIAL_SIZE = 240;
const RADIUS = 85;
const STROKE_WIDTH = 22;
const CENTER = DIAL_SIZE / 2;

interface SleepClockDialProps {
  hours?: number; // e.g. 8.5
  bedtime?: string; // e.g. "10:30 PM" or "23:00"
  wakeupTime?: string; // e.g. "07:00 AM" or "07:30"
  targetHours?: number; // default 8.0
  onPressBedtime?: () => void;
  onPressWakeup?: () => void;
  is24Hour?: boolean;
}

export default function SleepClockDial({
  hours = 8.5,
  bedtime = '10:30 PM',
  wakeupTime = '07:00 AM',
  targetHours = 8.0,
  onPressBedtime,
  onPressWakeup,
  is24Hour = false,
}: SleepClockDialProps) {
  const hPart = Math.floor(hours);
  const mPart = Math.round((hours - hPart) * 60);

  // Circular arc calculation (mapped to 12-hour or 24-hour cycle)
  // Max arc = 12 hours (full 360 circle) or 8h = 240 degrees
  const angleDegrees = Math.min(360, (hours / 12) * 360);
  const circumference = 2 * Math.PI * RADIUS;
  const strokeDashoffset = circumference - (angleDegrees / 360) * circumference;

  const isGoalReached = hours >= targetHours;

  // Clock hour ticks (12 hour markers around inside of dial)
  const hourTicks = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i * 30 * Math.PI) / 180 - Math.PI / 2;
    const innerR = RADIUS - 18;
    const outerR = RADIUS - 12;
    return {
      x1: CENTER + innerR * Math.cos(angle),
      y1: CENTER + innerR * Math.sin(angle),
      x2: CENTER + outerR * Math.cos(angle),
      y2: CENTER + outerR * Math.sin(angle),
      hour: i === 0 ? 12 : i,
    };
  });

  return (
    <View style={styles.container}>
      {/* Dial Top Title / Target Badge */}
      <View style={styles.targetStatusBadge}>
        {isGoalReached ? (
          <>
            <CheckCircle2 size={13} color="#A855F7" />
            <Text style={styles.targetStatusText}>
              8.0h Peak hGH Growth Target Reached ✓
            </Text>
          </>
        ) : (
          <>
            <Sparkles size={13} color="#CBD5E1" />
            <Text style={styles.targetStatusTextMuted}>
              {(targetHours - hours).toFixed(1)}h remaining to reach 8.0h peak
            </Text>
          </>
        )}
      </View>

      {/* Main Circular Clock Face Dial (Image 2 style) */}
      <View style={styles.dialWrapper}>
        <Svg width={DIAL_SIZE} height={DIAL_SIZE}>
          <Defs>
            {/* Violet/Lavender Sleep Arc Gradient matching #B28EF0 */}
            <LinearGradient id="sleepArcGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#C084FC" />
              <Stop offset="70%" stopColor="#B28EF0" />
              <Stop offset="100%" stopColor="#9333EA" />
            </LinearGradient>

            <LinearGradient id="dialBgGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#1E1638" />
              <Stop offset="100%" stopColor="#130D24" />
            </LinearGradient>
          </Defs>

          {/* Clock Dial Inner Face Circle */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS + STROKE_WIDTH / 2 + 6}
            fill="url(#dialBgGrad)"
          />

          {/* Background Track Ring */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke="#2B214C"
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />

          {/* Clock Face Hour Tick Marks */}
          <G opacity={0.6}>
            {hourTicks.map((t, idx) => (
              <Line
                key={idx}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke="#6B5C99"
                strokeWidth={idx % 3 === 0 ? 2 : 1}
              />
            ))}
          </G>

          {/* Active Sleep Interval Arc */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke="url(#sleepArcGrad)"
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
          />
        </Svg>

        {/* Center Big Numbers: e.g. 08 hr 30 min */}
        <View style={styles.dialCenterContent} pointerEvents="none">
          <View style={styles.timeDigitsRow}>
            <Text style={styles.hourDigits}>
              {String(hPart).padStart(2, '0')}
            </Text>
            <Text style={styles.hrUnit}>hr</Text>
          </View>
          <Text style={styles.minDigits}>
            {String(mPart).padStart(2, '0')} min
          </Text>
          <Text style={styles.cycleLabel}>Slow-Wave Cycle</Text>
        </View>

        {/* Start Moon Handle Indicator */}
        <View style={styles.startHandlePin}>
          <Moon size={11} color="#FFFFFF" />
        </View>

        {/* End Bell Handle Indicator */}
        <View style={styles.endHandlePin}>
          <Bell size={11} color="#FFFFFF" />
        </View>
      </View>

      {/* Bottom Dual Tiles: Bedtime & Wake Up (Interactive) */}
      <View style={styles.tilesRow}>
        {/* Bedtime Tile */}
        <TouchableOpacity
          style={styles.tileCard}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            onPressBedtime?.();
          }}
          activeOpacity={0.8}
        >
          <View style={styles.tileIconCircleMoon}>
            <Moon size={14} color="#C084FC" />
          </View>
          <Text style={styles.tileLabel}>Bedtime</Text>
          <Text style={styles.tileTime}>{bedtime}</Text>
        </TouchableOpacity>

        {/* Wake Up Tile */}
        <TouchableOpacity
          style={[styles.tileCard, styles.tileCardActive]}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            onPressWakeup?.();
          }}
          activeOpacity={0.8}
        >
          <View style={styles.tileIconCircleSun}>
            <Sunrise size={14} color="#F59E0B" />
          </View>
          <Text style={styles.tileLabel}>Wake Up</Text>
          <Text style={styles.tileTime}>{wakeupTime}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  targetStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#1E1638',
    borderWidth: 1,
    borderColor: 'rgba(178, 142, 240, 0.3)',
    marginBottom: 14,
  },
  targetStatusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D8B4FE',
  },
  targetStatusTextMuted: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  dialWrapper: {
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 4,
  },
  dialCenterContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeDigitsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  hourDigits: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  hrUnit: {
    fontSize: 18,
    fontWeight: '700',
    color: '#C084FC',
  },
  minDigits: {
    fontSize: 18,
    fontWeight: '800',
    color: '#E2E8F0',
    marginTop: -4,
    fontVariant: ['tabular-nums'],
  },
  cycleLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8175A8',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  startHandlePin: {
    position: 'absolute',
    top: 24,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#9333EA',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  endHandlePin: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F59E0B',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  tilesRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    paddingHorizontal: 8,
    marginTop: 18,
  },
  tileCard: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#1E1638',
    borderWidth: 1.5,
    borderColor: '#2D2350',
    alignItems: 'center',
    gap: 4,
  },
  tileCardActive: {
    borderColor: '#B28EF0',
    backgroundColor: '#271D47',
    shadowColor: '#B28EF0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  tileIconCircleMoon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  tileIconCircleSun: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  tileLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tileTime: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
});
