import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import Svg, {
  Circle,
  Defs,
  RadialGradient,
  LinearGradient as SvgLinearGradient,
  Stop,
  Path,
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

// User-provided authentic Earth texture base64
const EARTH_TEXTURE_BASE64 =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAAAAAAD/2wBDACYaHSEdGCYhHyErKCYtOV8+OTQ0OXVTWEVfinmRj4h5hYOYq9u6mKLPpIOFvv/Bz+Lp9fj1lLf////u/9vw9ez/2wBDASgrKzkyOXA+PnDsnYWd7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Oz/wAARCAE5AfQDASIAAhEBAxEB/8QAGgAAAwEBAQEAAAAAAAAAAAAAAgMEAQAFBv/EADoQAAIBAwIFAwIFAgUFAQADAAECEQADIRIxBCJBUWETcYEykRRCUqGxI8EFYnLR8DOCkuHxQxVTY//EABgBAQEBAQEAAAAAAAAAAAAAAAABAgME/8QAIBEBAQEAAwEBAAMBAQAAAAAAAAERAiExEkETUXEYERL/2gA+qm9KA1dC/Tb9I+9dRV1VH//Z';

/**
 * 4-Point Concave Curved Diamond Star (matches the 4 curved corners in CSS)
 */
function CurvedCornerStar({
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
  const opacity = useSharedValue(0.1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, {
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
 * Authentic 3D Earth Globe Component
 * Adapted from the user's styled-components Earth Card with:
 * - 30s infinite horizontal planetary rotation
 * - 7 twinkling 4-point curved diamond stars
 * - Atmospheric cyan glow (#c3f4ff) & 3D spherical shadow depth
 */
export default function GlobeGraphic({ size = 160 }: GlobeGraphicProps) {
  const scrollOffset = useSharedValue(0);

  // Each repeating texture block width
  const textureWidth = size * 2.2;

  useEffect(() => {
    // 30s continuous linear rotation matching @keyframes earthRotate
    scrollOffset.value = withRepeat(
      withTiming(-textureWidth, {
        duration: 30000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [textureWidth, scrollOffset]);

  const animatedTextureStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: scrollOffset.value }],
  }));

  const scaleRatio = size / 250;

  return (
    <View style={[styles.outerWrapper, { width: size + 70 * scaleRatio, height: size + 50 * scaleRatio }]}>
      {/* 7 Curved Corner Twinkling Stars positioned matching #star-1 to #star-7 */}
      <CurvedCornerStar x={10 * scaleRatio} y={20 * scaleRatio} duration={3000} starSize={10 * scaleRatio} />
      <CurvedCornerStar x={0 * scaleRatio} y={55 * scaleRatio} duration={2000} starSize={12 * scaleRatio} />
      <CurvedCornerStar x={(size + 40) * scaleRatio} y={40 * scaleRatio} duration={4000} starSize={11 * scaleRatio} />
      <CurvedCornerStar x={(size + 20) * scaleRatio} y={(size + 20) * scaleRatio} duration={3000} starSize={9 * scaleRatio} />
      <CurvedCornerStar x={25 * scaleRatio} y={(size + 25) * scaleRatio} duration={1500} starSize={12 * scaleRatio} />
      <CurvedCornerStar x={(size + 15) * scaleRatio} y={5 * scaleRatio} duration={4000} starSize={10 * scaleRatio} />
      <CurvedCornerStar x={(size + 35) * scaleRatio} y={90 * scaleRatio} duration={2000} starSize={11 * scaleRatio} />

      {/* Atmospheric Outer Cyan Glow Halo */}
      <View
        style={[
          styles.glowHalo,
          {
            width: size + 16,
            height: size + 16,
            borderRadius: (size + 16) / 2,
          },
        ]}
      />

      {/* Spherical Earth Globe with Inset Shadows */}
      <View
        style={[
          styles.sphereContainer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        {/* Animated Rotating Earth Texture Map */}
        <Animated.View style={[styles.textureRow, animatedTextureStyle]}>
          <Image
            source={{ uri: EARTH_TEXTURE_BASE64 }}
            style={{ width: textureWidth, height: size }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
          <Image
            source={{ uri: EARTH_TEXTURE_BASE64 }}
            style={{ width: textureWidth, height: size }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        </Animated.View>

        {/* 3D Atmospheric Depth & Shading Overlay (Replicating exact CSS inset box-shadows) */}
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <Defs>
            {/* Primary Spherical Lighting: Bright top-left atmosphere -> deep space darkness */}
            <RadialGradient id="earthLighting" cx="32%" cy="28%" r="68%">
              <Stop offset="0%" stopColor="#c3f4ff" stopOpacity="0.45" />
              <Stop offset="25%" stopColor="#38bdf8" stopOpacity="0.15" />
              <Stop offset="65%" stopColor="#000000" stopOpacity="0.55" />
              <Stop offset="92%" stopColor="#000000" stopOpacity="0.88" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0.95" />
            </RadialGradient>

            {/* Inset Cyan Atmospheric Rim Glow (-5px 0px 8px #c3f4ff inset) */}
            <SvgLinearGradient id="cyanAtmosphereRim" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#c3f4ff" stopOpacity="0.8" />
              <Stop offset="35%" stopColor="#38bdf8" stopOpacity="0.25" />
              <Stop offset="70%" stopColor="#000000" stopOpacity="0.6" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0.95" />
            </SvgLinearGradient>
          </Defs>

          {/* Deep 3D Sphere Shading */}
          <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#earthLighting)" />

          {/* Glowing Atmospheric Limb Ring */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 1}
            fill="none"
            stroke="url(#cyanAtmosphereRim)"
            strokeWidth={2}
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowHalo: {
    position: 'absolute',
    backgroundColor: '#c3f4ff',
    opacity: 0.22,
    shadowColor: '#38bdf8',
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 12,
  },
  sphereContainer: {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
    shadowColor: '#c3f4ff',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 14,
  },
  textureRow: {
    flexDirection: 'row',
    height: '100%',
  },
});
