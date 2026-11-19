import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Circle, Rect, G, Text as SvgText } from 'react-native-svg';

interface MotivationalPatternWallpaperProps {
  opacity?: number;
}

/**
 * Motivational Line-Art Fitness & Spine Pattern Wallpaper (WhatsApp-inspired)
 * Subtle line-art illustrations + motivational quotes:
 * - Vertebral spine alignment & posture arcs
 * - Pull-up bars & dumbbells
 * - Crescent moons & circadian stars
 * - Water droplets & protein hexagons
 * - Centimeter measurement ruler marks
 * - Prominent motivational typography: "REACH HIGHER", "STAND TALL", "ALIGN YOUR SPINE", "DECOMPRESS & GROW", "POSTURE IS POWER"
 */
export default function MotivationalPatternWallpaper({
  opacity = 0.075,
}: MotivationalPatternWallpaperProps) {
  return (
    <View style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 360 640">
        <G stroke="#2563EB" strokeWidth="0.9" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* Tile 1: Vertebral Column & Spine alignment (Top Left) */}
          <Path d="M 40 30 Q 38 45 42 60 Q 38 75 40 90" />
          <Circle cx="40" cy="35" r="3" />
          <Circle cx="41" cy="50" r="3.2" />
          <Circle cx="39" cy="65" r="3.2" />
          <Circle cx="40" cy="80" r="3" />

          {/* Tile 2: Crescent Moon & Sleep Stars (Top Right) */}
          <Path d="M 300 45 A 12 12 0 1 0 312 57 A 9 9 0 0 1 300 45 Z" />
          <Path d="M 324 38 L 326 42 L 330 44 L 326 46 L 324 50 L 322 46 L 318 44 L 322 42 Z" strokeWidth="0.6" />
          <Circle cx="285" cy="70" r="1" fill="#2563EB" />

          {/* Tile 3: Pull-up Bar & Traction Figure (Upper Mid Right) */}
          <Path d="M 230 110 L 290 110" strokeWidth="1.2" />
          <Circle cx="260" cy="120" r="4" />
          <Path d="M 260 124 L 260 142 M 255 128 L 245 112 M 265 128 L 275 112 M 260 142 L 253 160 M 260 142 L 267 160" />

          {/* Motivational Quote 1: REACH HIGHER */}
          <SvgText
            x="130"
            y="140"
            fill="#2563EB"
            fontSize="10"
            fontWeight="800"
            letterSpacing="3"
            stroke="none"
            opacity="0.45"
            transform="rotate(-12, 130, 140)"
          >
            REACH HIGHER
          </SvgText>

          {/* Tile 4: Water Droplet (Left Mid) */}
          <Path d="M 50 180 C 50 170 60 155 60 155 C 60 155 70 170 70 180 A 10 10 0 0 1 50 180 Z" />

          {/* Tile 5: Dumbbell Silhouette (Center Mid) */}
          <Rect x="155" y="200" width="4" height="18" rx="1" />
          <Rect x="151" y="203" width="3" height="12" rx="0.5" />
          <Rect x="160" y="208" width="40" height="2" rx="0.5" />
          <Rect x="201" y="200" width="4" height="18" rx="1" />
          <Rect x="206" y="203" width="3" height="12" rx="0.5" />

          {/* Tile 6: Biometric Height Ruler Centimeter Ticks (Right Mid) */}
          <Path d="M 320 220 L 320 270 M 320 225 L 312 225 M 320 235 L 315 235 M 320 245 L 310 245 M 320 255 L 315 255 M 320 265 L 312 265" />

          {/* Motivational Quote 2: ALIGN YOUR SPINE */}
          <SvgText
            x="30"
            y="265"
            fill="#2563EB"
            fontSize="9"
            fontWeight="800"
            letterSpacing="2.5"
            stroke="none"
            opacity="0.45"
            transform="rotate(-6, 30, 265)"
          >
            ALIGN YOUR SPINE
          </SvgText>

          {/* Tile 7: Nutrient Hexagon Matrix (Lower Left) */}
          <Path d="M 45 330 L 55 324 L 65 330 L 65 342 L 55 348 L 45 342 Z" />
          <Path d="M 65 342 L 75 336 L 85 342 L 85 354 L 75 360 L 65 354 Z" />

          {/* Motivational Quote 3: STAND TALL */}
          <SvgText
            x="190"
            y="335"
            fill="#2563EB"
            fontSize="11"
            fontWeight="900"
            letterSpacing="3.5"
            stroke="none"
            opacity="0.45"
            transform="rotate(8, 190, 335)"
          >
            STAND TALL
          </SvgText>

          {/* Tile 8: Yoga Decompression Silhouette (Lower Center) */}
          <Circle cx="180" cy="380" r="3.5" />
          <Path d="M 180 384 L 180 400 L 168 406 M 180 400 L 192 406 M 180 390 L 166 385 M 180 390 L 194 385" />

          {/* Tile 9: Ascending Trajectory Arrow (Lower Right) */}
          <Path d="M 280 430 L 310 395 M 310 395 L 298 396 M 310 395 L 308 407" />

          {/* Motivational Quote 4: DECOMPRESS & GROW */}
          <SvgText
            x="40"
            y="435"
            fill="#2563EB"
            fontSize="10"
            fontWeight="800"
            letterSpacing="3"
            stroke="none"
            opacity="0.55"
            transform="rotate(-10, 40, 435)"
          >
            DECOMPRESS & GROW
          </SvgText>

          {/* Tile 10: Vertebral Posture Reset & Arc (Bottom Left) */}
          <Path d="M 40 480 Q 55 510 40 540" />
          <Circle cx="42" cy="495" r="2.5" />
          <Circle cx="48" cy="510" r="2.8" />
          <Circle cx="42" cy="525" r="2.5" />

          {/* Tile 11: Circadian Bedtime Clock Arc (Bottom Right) */}
          <Circle cx="290" cy="530" r="12" />
          <Path d="M 290 522 L 290 530 L 296 534" />

          {/* Motivational Quote 5: POSTURE IS POWER (Lower prominent in the blue) */}
          <SvgText
            x="150"
            y="515"
            fill="#2563EB"
            fontSize="11"
            fontWeight="900"
            letterSpacing="3.5"
            stroke="none"
            opacity="0.6"
            transform="rotate(6, 150, 515)"
          >
            POSTURE IS POWER
          </SvgText>

          {/* Motivational Quote 6: DISC HYDRATION */}
          <SvgText
            x="70"
            y="600"
            fill="#2563EB"
            fontSize="10"
            fontWeight="800"
            letterSpacing="3"
            stroke="none"
            opacity="0.65"
          >
            DISC HYDRATION • GROW DAILY
          </SvgText>

          {/* Subtle Ambient Dots */}
          <Circle cx="120" cy="80" r="1" fill="#2563EB" />
          <Circle cx="210" cy="50" r="1.2" fill="#2563EB" />
          <Circle cx="110" cy="270" r="1.5" fill="#2563EB" />
          <Circle cx="230" cy="320" r="1" fill="#2563EB" />
          <Circle cx="130" cy="470" r="1.2" fill="#2563EB" />
          <Circle cx="240" cy="490" r="1" fill="#2563EB" />
        </G>
      </Svg>
    </View>
  );
}
