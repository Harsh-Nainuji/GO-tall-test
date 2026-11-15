import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Ellipse,
  Line,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  RadialGradient,
  Path,
  G,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface GlobeGraphicProps {
  size?: number;
}

/**
 * 4-Point Concave Curved Diamond Star
 */
function TwinklingStar({
  x,
  y,
  duration,
  starSize = 10,
}: {
  x: number;
  y: number;
  duration: number;
  starSize?: number;
}) {
  const opacity = useSharedValue(0.15);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.95, {
        duration: duration / 2,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [duration, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const r = starSize / 2;

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x,
          top: y,
          zIndex: 10,
        },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      <Svg width={starSize} height={starSize} viewBox={`-${r} -${r} ${starSize} ${starSize}`}>
        <Path
          d={`M 0,-${r} Q 0,0 ${r},0 Q 0,0 0,${r} Q 0,0 -${r},0 Q 0,0 0,-${r} Z`}
          fill="#FFFFFF"
        />
      </Svg>
    </Animated.View>
  );
}

/**
 * Authentic Vibrant 3D Spinning Earth Globe
 * Features:
 * - Continuous horizontal planetary rotation across polar axis
 * - Vibrant oceanic blue gradient and continental landmasses
 * - Atmospheric cyan breathing glow & glossy specular glass highlight
 * - 7 sparkling concave diamond stars in surrounding space
 */
export default function GlobeGraphic({ size = 150 }: GlobeGraphicProps) {
  const spin = useSharedValue(0);
  const pulse = useSharedValue(1);

  // Continental cluster width for seamless infinite loop
  const loopWidth = size * 1.8;

  useEffect(() => {
    // 12s smooth planetary rotation around polar axis
    spin.value = withRepeat(
      withTiming(-loopWidth, {
        duration: 12000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Subtle atmospheric breathing aura
    pulse.value = withRepeat(
      withTiming(1.06, {
        duration: 3200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [loopWidth, spin, pulse]);

  const animatedContinentsStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: spin.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const radius = (size - 10) / 2;
  const center = size / 2;
  const scale = size / 110;

  // Continental landmass silhouettes
  const renderContinents = (offsetX: number) => (
    <G x={offsetX}>
      {/* Eurasia & Africa Silhouette */}
      <Path
        d={`M ${center - 25 * scale} ${center - 28 * scale} 
            Q ${center - 10 * scale} ${center - 38 * scale} ${center + 15 * scale} ${center - 25 * scale} 
            Q ${center + 28 * scale} ${center - 15 * scale} ${center + 20 * scale} ${center - 4 * scale} 
            Q ${center + 12 * scale} ${center + 6 * scale} ${center + 8 * scale} ${center + 22 * scale} 
            Q ${center - 5 * scale} ${center + 26 * scale} ${center - 12 * scale} ${center + 14 * scale} 
            Q ${center - 24 * scale} ${center + 8 * scale} ${center - 28 * scale} ${center - 12 * scale} Z`}
        fill="#38BDF8"
        fillOpacity={0.65}
      />
      {/* Americas Silhouette */}
      <Path
        d={`M ${center + 45 * scale} ${center - 32 * scale} 
            Q ${center + 60 * scale} ${center - 22 * scale} ${center + 54 * scale} ${center - 8 * scale} 
            Q ${center + 48 * scale} ${center + 5 * scale} ${center + 52 * scale} ${center + 24 * scale} 
            Q ${center + 42 * scale} ${center + 26 * scale} ${center + 38 * scale} ${center + 10 * scale} 
            Q ${center + 35 * scale} ${center - 12 * scale} ${center + 45 * scale} ${center - 32 * scale} Z`}
        fill="#0284C7"
        fillOpacity={0.6}
      />
      {/* South Asia & India subcontinent */}
      <Path
        d={`M ${center + 6 * scale} ${center - 6 * scale} 
            Q ${center + 14 * scale} ${center + 2 * scale} ${center + 8 * scale} ${center + 14 * scale} 
            Q ${center + 2 * scale} ${center + 8 * scale} ${center + 6 * scale} ${center - 6 * scale} Z`}
        fill="#38BDF8"
        fillOpacity={0.8}
      />
      {/* Australia & Oceania */}
      <Path
        d={`M ${center + 22 * scale} ${center + 16 * scale} 
            Q ${center + 32 * scale} ${center + 14 * scale} ${center + 30 * scale} ${center + 26 * scale} 
            Q ${center + 18 * scale} ${center + 25 * scale} ${center + 22 * scale} ${center + 16 * scale} Z`}
        fill="#0284C7"
        fillOpacity={0.65}
      />
      {/* Meridians (Longitudes) */}
      <Ellipse
        cx={center}
        cy={center}
        rx={radius * 0.38}
        ry={radius}
        stroke="#38BDF8"
        strokeWidth={1}
        strokeOpacity={0.35}
        fill="none"
      />
      <Ellipse
        cx={center}
        cy={center}
        rx={radius * 0.72}
        ry={radius}
        stroke="#38BDF8"
        strokeWidth={1}
        strokeOpacity={0.25}
        fill="none"
      />
    </G>
  );

  return (
    <View style={[styles.container, { width: size + 40, height: size + 20 }]}>
      {/* 7 Orbiting Diamond Stars */}
      <TwinklingStar x={6} y={14} duration={3000} starSize={10} />
      <TwinklingStar x={size + 24} y={22} duration={2000} starSize={11} />
      <TwinklingStar x={12} y={size - 8} duration={4000} starSize={9} />
      <TwinklingStar x={size + 18} y={size - 18} duration={3000} starSize={12} />
      <TwinklingStar x={size / 2 - 10} y={-4} duration={1500} starSize={10} />
      <TwinklingStar x={size + 28} y={size / 2} duration={2400} starSize={11} />
      <TwinklingStar x={-2} y={size / 2 - 12} duration={3500} starSize={8} />

      {/* Ambient Cyan Atmosphere Glow Halo */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glowHalo,
          animatedGlowStyle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />

      {/* Spherical Earth Globe */}
      <View style={[styles.globeSphereMask, { width: size, height: size, borderRadius: size / 2 }]}>
        {/* Base Planet Ocean Sphere Gradient - Vibrant & Luminous */}
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="oceanGrad" cx="35%" cy="30%" r="68%">
              <Stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.95" />
              <Stop offset="30%" stopColor="#38BDF8" stopOpacity="0.8" />
              <Stop offset="70%" stopColor="#0284C7" stopOpacity="0.85" />
              <Stop offset="100%" stopColor="#0369A1" stopOpacity="0.95" />
            </RadialGradient>
          </Defs>
          <Circle cx={center} cy={center} r={radius} fill="url(#oceanGrad)" />
        </Svg>

        {/* CONTINENTS & MERIDIANS HORIZONTAL SPIN CONTAINER */}
        <Animated.View style={[styles.spinTrack, animatedContinentsStyle, { width: loopWidth * 2 }]}>
          <Svg width={loopWidth * 2} height={size}>
            {/* Pass 1 */}
            {renderContinents(0)}
            {/* Pass 2 (Seamless loop repeat) */}
            {renderContinents(loopWidth)}
          </Svg>
        </Animated.View>

        {/* Fixed 3D Spherical Atmosphere, Latitudes & Specular Highlight */}
        <Svg width={size} height={size} style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            {/* Glossy 3D rim border */}
            <SvgLinearGradient id="globeBorder" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.95" />
              <Stop offset="50%" stopColor="#38BDF8" stopOpacity="0.7" />
              <Stop offset="100%" stopColor="#0284C7" stopOpacity="0.9" />
            </SvgLinearGradient>

            {/* Specular glass reflection on top left */}
            <RadialGradient id="specularGlow" cx="28%" cy="22%" r="42%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
              <Stop offset="50%" stopColor="#BAE6FD" stopOpacity="0.2" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Fixed Latitude Rings (Parallels) */}
          <Ellipse
            cx={center}
            cy={center}
            rx={radius}
            ry={radius * 0.28}
            stroke="#BAE6FD"
            strokeWidth={1.2}
            strokeOpacity={0.45}
            fill="none"
          />
          <Ellipse
            cx={center}
            cy={center - radius * 0.45}
            rx={radius * 0.88}
            ry={radius * 0.2}
            stroke="#7DD3FC"
            strokeWidth={1}
            strokeOpacity={0.35}
            fill="none"
          />
          <Ellipse
            cx={center}
            cy={center + radius * 0.45}
            rx={radius * 0.88}
            ry={radius * 0.2}
            stroke="#7DD3FC"
            strokeWidth={1}
            strokeOpacity={0.35}
            fill="none"
          />

          {/* Equator Line */}
          <Line
            x1={center - radius}
            y1={center}
            x2={center + radius}
            y2={center}
            stroke="#BAE6FD"
            strokeWidth={1.4}
            strokeOpacity={0.65}
          />

          {/* Specular Highlight Shell */}
          <Circle cx={center} cy={center} r={radius} fill="url(#specularGlow)" />

          {/* 3D Glass Rim Border */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#globeBorder)"
            strokeWidth={2.5}
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    alignSelf: 'center',
  },
  glowHalo: {
    position: 'absolute',
    backgroundColor: 'rgba(56, 189, 248, 0.28)',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 24,
    elevation: 10,
  },
  globeSphereMask: {
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284C7',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  spinTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
  },
});
