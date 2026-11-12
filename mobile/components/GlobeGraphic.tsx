import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
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
  ClipPath,
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
 * Authentic 3D Spinning Glass Planet Globe
 * Features continuous horizontal planetary rotation across its polar axis,
 * stylized continents, atmospheric cyan glow, and fixed specular glass reflection.
 */
export default function GlobeGraphic({ size = 110 }: GlobeGraphicProps) {
  const spin = useSharedValue(0);
  const pulse = useSharedValue(1);

  // Continental cluster width for seamless infinite loop
  const loopWidth = size * 1.8;

  useEffect(() => {
    // Continuous planetary rotation around Y-axis
    spin.value = withRepeat(
      withTiming(-loopWidth, {
        duration: 10000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Subtle atmospheric breathing aura
    pulse.value = withRepeat(
      withTiming(1.08, {
        duration: 3000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [loopWidth]);

  const animatedContinentsStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: spin.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const radius = (size - 10) / 2;
  const center = size / 2;

  // Simplified elegant continent silhouettes for both hemisphere passes
  const renderContinents = (offsetX: number) => (
    <G x={offsetX}>
      {/* Eurasia & Africa Silhouette */}
      <Path
        d={`M ${center - 25} ${center - 28} 
            Q ${center - 10} ${center - 38} ${center + 15} ${center - 25} 
            Q ${center + 28} ${center - 15} ${center + 20} ${center - 4} 
            Q ${center + 12} ${center + 6} ${center + 8} ${center + 22} 
            Q ${center - 5} ${center + 26} ${center - 12} ${center + 14} 
            Q ${center - 24} ${center + 8} ${center - 28} ${center - 12} Z`}
        fill="#38BDF8"
        fillOpacity={0.45}
      />
      {/* Americas Silhouette */}
      <Path
        d={`M ${center + 45} ${center - 32} 
            Q ${center + 60} ${center - 22} ${center + 54} ${center - 8} 
            Q ${center + 48} ${center + 5} ${center + 52} ${center + 24} 
            Q ${center + 42} ${center + 26} ${center + 38} ${center + 10} 
            Q ${center + 35} ${center - 12} ${center + 45} ${center - 32} Z`}
        fill="#0284C7"
        fillOpacity={0.4}
      />
      {/* India & South Asian Hotspot */}
      <Path
        d={`M ${center + 6} ${center - 6} 
            Q ${center + 12} ${center + 2} ${center + 7} ${center + 12} 
            Q ${center + 2} ${center + 6} ${center + 6} ${center - 6} Z`}
        fill="#00D2FF"
        fillOpacity={0.8}
      />
      {/* Australia / Oceania Cluster */}
      <Ellipse
        cx={center + 28}
        cy={center + 18}
        rx={7}
        ry={5}
        fill="#38BDF8"
        fillOpacity={0.5}
      />
      {/* Illuminated Genetic Population Nodes */}
      <Circle cx={center + 7} cy={center + 4} r={3} fill="#FFFFFF" />
      <Circle cx={center + 7} cy={center + 4} r={4.5} fill="#38BDF8" fillOpacity={0.6} />
      <Circle cx={center - 10} cy={center - 12} r={2.5} fill="#BAE6FD" />
      <Circle cx={center + 48} cy={center - 15} r={2.5} fill="#BAE6FD" />
      <Circle cx={center + 28} cy={center + 18} r={2.2} fill="#BAE6FD" />

      {/* Rotating Longitudinal Curved Meridians */}
      <Path
        d={`M ${center} ${center - radius} Q ${center + 18} ${center} ${center} ${center + radius}`}
        stroke="#38BDF8"
        strokeWidth={1}
        strokeOpacity={0.4}
        fill="none"
      />
      <Path
        d={`M ${center} ${center - radius} Q ${center - 18} ${center} ${center} ${center + radius}`}
        stroke="#38BDF8"
        strokeWidth={1}
        strokeOpacity={0.4}
        fill="none"
      />
      <Path
        d={`M ${center + 36} ${center - radius * 0.85} Q ${center + 52} ${center} ${center + 36} ${center + radius * 0.85}`}
        stroke="#38BDF8"
        strokeWidth={0.8}
        strokeOpacity={0.3}
        fill="none"
      />
      <Path
        d={`M ${center - 36} ${center - radius * 0.85} Q ${center - 20} ${center} ${center - 36} ${center + radius * 0.85}`}
        stroke="#38BDF8"
        strokeWidth={0.8}
        strokeOpacity={0.3}
        fill="none"
      />
    </G>
  );

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Ambient Cyan Atmosphere Glow Halo */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glowHalo,
          animatedGlowStyle,
          {
            width: size * 0.95,
            height: size * 0.95,
            borderRadius: (size * 0.95) / 2,
          },
        ]}
      />

      <View style={[styles.globeSphereMask, { width: size, height: size, borderRadius: size / 2 }]}>
        {/* Base Planet Ocean Sphere Gradient */}
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="oceanGrad" cx="35%" cy="30%" r="65%">
              <Stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.85" />
              <Stop offset="45%" stopColor="#BAE6FD" stopOpacity="0.5" />
              <Stop offset="80%" stopColor="#0284C7" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#0369A1" stopOpacity="0.4" />
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
              <Stop offset="0%" stopColor="#38BDF8" stopOpacity="0.95" />
              <Stop offset="50%" stopColor="#0284C7" stopOpacity="0.6" />
              <Stop offset="100%" stopColor="#818CF8" stopOpacity="0.8" />
            </SvgLinearGradient>

            {/* Specular glass reflection on top left */}
            <RadialGradient id="specularGlow" cx="28%" cy="22%" r="40%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <Stop offset="60%" stopColor="#BAE6FD" stopOpacity="0.15" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Fixed Latitude Rings (Parallels) */}
          <Ellipse
            cx={center}
            cy={center}
            rx={radius}
            ry={radius * 0.28}
            stroke="#0284C7"
            strokeWidth={1.2}
            strokeOpacity={0.45}
            fill="none"
          />
          <Ellipse
            cx={center}
            cy={center - radius * 0.45}
            rx={radius * 0.88}
            ry={radius * 0.2}
            stroke="#38BDF8"
            strokeWidth={1}
            strokeOpacity={0.35}
            fill="none"
          />
          <Ellipse
            cx={center}
            cy={center + radius * 0.45}
            rx={radius * 0.88}
            ry={radius * 0.2}
            stroke="#38BDF8"
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
            stroke="#0284C7"
            strokeWidth={1.3}
            strokeOpacity={0.6}
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
            strokeWidth={2}
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
    backgroundColor: 'rgba(56, 189, 248, 0.22)',
    shadowColor: '#00D2FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 22,
    elevation: 8,
  },
  globeSphereMask: {
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
  },
});
