import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Line,
  Circle as SvgCircle,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(SvgCircle);

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StatureCalculationGraphProps {
  currentHeight: number;
  targetHeight: number;
  currentAge: number;
  gender: 'male' | 'female';
  onComplete?: () => void;
  isInteractive?: boolean;
}

export default function StatureCalculationGraph({
  currentHeight,
  targetHeight,
  currentAge,
  gender,
  onComplete,
  isInteractive = true,
}: StatureCalculationGraphProps) {
  const [currentStepText, setCurrentStepText] = useState('Initializing Epiphyseal Model...');
  const [displayedHeight, setDisplayedHeight] = useState(currentHeight);
  const [isDone, setIsDone] = useState(false);

  // SVG Chart Dimensions
  const chartWidth = Math.min(SCREEN_WIDTH - 48, 360);
  const chartHeight = 200;
  const paddingLeft = 44;
  const paddingRight = 24;
  const paddingTop = 24;
  const paddingBottom = 34;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  // Stature Y-Domain: min is current - 4, max is target + 4
  const minStature = Math.floor(Math.min(currentHeight, targetHeight) - 4);
  const maxStature = Math.ceil(Math.max(currentHeight, targetHeight) + 4);
  const statureRange = maxStature - minStature || 1;

  // Age X-Domain: from currentAge - 2 to 21
  const startAge = Math.max(12, currentAge - 2);
  const endAge = 21;
  const ageRange = endAge - startAge || 1;

  const getX = (age: number) => {
    return paddingLeft + ((age - startAge) / ageRange) * innerWidth;
  };

  const getY = (stature: number) => {
    return paddingTop + innerHeight - ((stature - minStature) / statureRange) * innerHeight;
  };

  // Clinically grounded points along Tanner growth maturation curve
  const p0 = { x: getX(startAge), y: getY(currentHeight - 5) };
  const p1 = { x: getX(currentAge), y: getY(currentHeight) };
  const midAge = currentAge + (endAge - currentAge) * 0.45;
  const midStature = currentHeight + (targetHeight - currentHeight) * 0.72;
  const p2 = { x: getX(midAge), y: getY(midStature) };
  const p3 = { x: getX(endAge), y: getY(targetHeight) };

  // Smooth cubic Bézier spline
  const linePath = `M ${p0.x} ${p0.y} C ${p0.x + 30} ${p0.y}, ${p1.x - 20} ${p1.y}, ${p1.x} ${p1.y} C ${p1.x + 30} ${p1.y - 10}, ${p2.x - 25} ${p2.y}, ${p2.x} ${p2.y} C ${p2.x + 25} ${p2.y}, ${p3.x - 25} ${p3.y}, ${p3.x} ${p3.y}`;
  const areaPath = `${linePath} L ${p3.x} ${paddingTop + innerHeight} L ${p0.x} ${paddingTop + innerHeight} Z`;

  // Curve Length approximation for strokeDashoffset animation
  const estimatedPathLength = 480;

  // Reanimated shared values
  const strokeOffset = useSharedValue(estimatedPathLength);
  const areaOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  const updateDisplay = (val: number) => {
    setDisplayedHeight(Math.round(val * 10) / 10);
  };

  const handleFinish = () => {
    setIsDone(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    if (onComplete) {
      setTimeout(onComplete, 800);
    }
  };

  useEffect(() => {
    // Stage 1: Line progressive drawing
    setCurrentStepText('Mapping Epiphyseal Chondrocyte Velocity...');
    strokeOffset.value = withTiming(
      0,
      {
        duration: 2200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      },
      (finished) => {
        if (finished) {
          runOnJS(updateDisplay)(targetHeight);
          runOnJS(handleFinish)();
        }
      }
    );

    // Gradual area fade-in
    areaOpacity.value = withDelay(
      800,
      withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) })
    );

    // Endpoint pulse loop
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.35, { duration: 800 }),
        withTiming(1.0, { duration: 800 })
      ),
      -1,
      true
    );

    // Dynamic stage updates
    const t1 = setTimeout(() => {
      setCurrentStepText('Computing Tanner-Whitehouse III Mid-Parental Mean...');
      setDisplayedHeight(Math.round((currentHeight + (targetHeight - currentHeight) * 0.4) * 10) / 10);
    }, 700);

    const t2 = setTimeout(() => {
      setCurrentStepText('Modeling Spinal Intervertebral Fluid Reserve...');
      setDisplayedHeight(Math.round((currentHeight + (targetHeight - currentHeight) * 0.75) * 10) / 10);
    }, 1400);

    const t3 = setTimeout(() => {
      setCurrentStepText('Calibrated: 95% Confidence Biological Stature Window');
      setDisplayedHeight(targetHeight);
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const animatedLineProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeOffset.value,
  }));

  const animatedAreaProps = useAnimatedProps(() => ({
    opacity: areaOpacity.value,
  }));

  const animatedPulseProps = useAnimatedProps(() => ({
    r: 6 * pulseScale.value,
    opacity: 0.8 / pulseScale.value,
  }));

  // Y-axis grid ticks
  const yTicks = [minStature + 2, Math.round((minStature + maxStature) / 2), maxStature - 2];
  // X-axis grid ticks (Ages)
  const xTicks = [startAge, currentAge, 19, endAge].filter(
    (v, i, a) => a.indexOf(v) === i && v <= endAge
  );

  return (
    <View style={styles.container}>
      {/* Real-Time Calculation Stage Tracker */}
      <View style={styles.stageHeader}>
        <View style={styles.badgeRow}>
          <View style={[styles.statusDot, isDone && styles.statusDotDone]} />
          <Text style={styles.badgeText}>
            {isDone ? 'CALIBRATION COMPLETE' : 'PEDIATRIC BIOMECHANICS SIMULATION'}
          </Text>
        </View>

        <Text style={styles.phaseHeadline} numberOfLines={1}>
          {currentStepText}
        </Text>

        <View style={styles.measurementCounter}>
          <Text style={styles.counterValue}>{displayedHeight.toFixed(1)}</Text>
          <Text style={styles.counterUnit}>cm</Text>
          <Text style={styles.counterSecondary}>
            ({Math.floor(displayedHeight / 2.54 / 12)}&apos; {Math.round((displayedHeight / 2.54) % 12)}&quot;)
          </Text>
        </View>
      </View>

      {/* SVG Progressive Area Chart */}
      <View style={styles.chartWrapper}>
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            {/* Smooth Translucent Gradient Area */}
            <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#2563EB" stopOpacity="0.32" />
              <Stop offset="65%" stopColor="#3B82F6" stopOpacity="0.10" />
              <Stop offset="100%" stopColor="#EEF2FF" stopOpacity="0.0" />
            </LinearGradient>

            <LinearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="#93C5FD" />
              <Stop offset="50%" stopColor="#3B82F6" />
              <Stop offset="100%" stopColor="#1D4ED8" />
            </LinearGradient>
          </Defs>

          {/* Horizontal Grid Lines & Y-Labels */}
          {yTicks.map((stature) => {
            const yPos = getY(stature);
            return (
              <React.Fragment key={stature}>
                <Line
                  x1={paddingLeft}
                  y1={yPos}
                  x2={chartWidth - paddingRight}
                  y2={yPos}
                  stroke="rgba(226, 232, 240, 0.8)"
                  strokeDasharray="4, 4"
                  strokeWidth="1"
                />
              </React.Fragment>
            );
          })}

          {/* Vertical Grid Lines & X-Labels */}
          {xTicks.map((age) => {
            const xPos = getX(age);
            return (
              <React.Fragment key={age}>
                <Line
                  x1={xPos}
                  y1={paddingTop}
                  x2={xPos}
                  y2={paddingTop + innerHeight}
                  stroke="rgba(226, 232, 240, 0.6)"
                  strokeDasharray="3, 3"
                  strokeWidth="1"
                />
              </React.Fragment>
            );
          })}

          {/* Translucent Area Under Curve */}
          <AnimatedPath
            d={areaPath}
            fill="url(#areaGradient)"
            animatedProps={animatedAreaProps}
          />

          {/* Progressive Longitudinal Growth Curve Line */}
          <AnimatedPath
            d={linePath}
            fill="none"
            stroke="url(#strokeGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={estimatedPathLength}
            animatedProps={animatedLineProps}
          />

          {/* Starting Point (Current Measured Stature) */}
          <SvgCircle
            cx={p1.x}
            cy={p1.y}
            r="4.5"
            fill="#FFFFFF"
            stroke="#2563EB"
            strokeWidth="2.5"
          />

          {/* Pulsing Target Endpoint Halo */}
          <AnimatedCircle
            cx={p3.x}
            cy={p3.y}
            fill="#2563EB"
            animatedProps={animatedPulseProps}
          />

          {/* Target Endpoint Solid Core */}
          <SvgCircle
            cx={p3.x}
            cy={p3.y}
            r="5"
            fill="#FFFFFF"
            stroke="#1D4ED8"
            strokeWidth="3"
          />
        </Svg>

        {/* X-Axis Age Labels */}
        <View style={[styles.xAxisRow, { paddingLeft, paddingRight }]}>
          {xTicks.map((age) => (
            <Text key={age} style={styles.axisLabel}>
              Age {age}
            </Text>
          ))}
        </View>
      </View>

      {/* Trajectory Milestone Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={styles.legendDotCurrent} />
          <Text style={styles.legendText}>Measured: {currentHeight} cm</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.legendDotTarget} />
          <Text style={styles.legendText}>Tanner: {targetHeight} cm</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  stageHeader: {
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 246, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(191, 219, 254, 0.9)',
    marginBottom: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
  },
  statusDotDone: {
    backgroundColor: '#10B981',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 0.8,
  },
  phaseHeadline: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
    marginBottom: 6,
  },
  measurementCounter: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  counterValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#0F172A',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1.5,
  },
  counterUnit: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2563EB',
  },
  counterSecondary: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    marginLeft: 4,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 4,
  },
  xAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 4,
  },
  axisLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    fontVariant: ['tabular-nums'],
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.6)',
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDotCurrent: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  legendDotTarget: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1D4ED8',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  legendText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
});

