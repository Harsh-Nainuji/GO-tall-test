/**
 * GoTall Design System — Apple-Inspired Visual Tokens & Typography
 * All colors, radiuses, shadows, and text metrics must be imported from here.
 */

export const colors = {
  // Brand & Action
  blue600: '#2563EB', // primary Electric Blue CTA, active tabs, rings
  blue500: '#3B82F6', // active state highlight
  blue400: '#60A5FA', // secondary blue for gradient terminations
  blue100: '#DBEAFE', // soft blue badges
  blue50: '#EFF6FF',  // selected pill background

  // Metric Status & Rings
  green600: '#16A34A', // stretches ring, done checks, plate active
  green500: '#10B981', // growth emerald
  purple600: '#9333EA', // sleep ring, bedtime metrics
  purple500: '#8B5CF6', // somatotropin violet
  orange500: '#F97316', // nutrition ring, macro counts
  amber600: '#D97706',  // streak chip, warnings
  amber500: '#F59E0B',  // nutrition amber
  rose600: '#E11D48',   // error, delete, critical limits

  // Slate Neutral Typography
  slate900: '#0F172A', // primary text (high contrast)
  slate700: '#334155', // headings
  slate600: '#475569', // secondary text
  slate400: '#94A3B8', // muted text, units
  slate200: '#E2E8F0', // 1px clean hairline border / dividers
  slate100: '#F1F5F9', // light pill backgrounds
  slate50: '#F8FAFC',  // soft card / canvas

  // Surfaces & Cards (Apple-inspired minimalism)
  cardBackground: '#FFFFFF',
  cardBorder: '#E2E8F0',
  cardShadow: '#0F172A',
  glassBackground: 'rgba(255, 255, 255, 0.95)',
  glassBorder: 'rgba(226, 232, 240, 0.85)',
  glassShadow: '#0F172A',

  // Ambient Lighting
  ambientGlowStart: 'transparent',
  ambientGlowMid: 'rgba(239, 246, 255, 0.25)',
  ambientGlowEnd: 'rgba(191, 219, 254, 0.45)',

  // Canvas Gradients
  canvasGradient: ['#FFFFFF', '#F8FAFC', '#F0F7FF'] as const,
  glowButtonGradient: ['#38BDF8', '#2563EB'] as const,
  primaryRingGradient: ['#38BDF8', '#2563EB'] as const,
} as const;

export const gradients = {
  canvas: ['#FFFFFF', '#F8FAFC', '#F0F7FF'] as const,
  ambientBottom: ['transparent', 'rgba(239, 246, 255, 0.25)', 'rgba(191, 219, 254, 0.45)'] as const,
  glowButton: ['#38BDF8', '#2563EB'] as const,
  ringBlue: ['#60A5FA', '#2563EB'] as const,
  ringSleep: ['#38BDF8', '#8B5CF6'] as const,
  ringNutrition: ['#FBBF24', '#F97316'] as const,
  ringStretches: ['#34D399', '#10B981'] as const,
} as const;

export const radii = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 9999,
} as const;

export const shadows = {
  subtle: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  button: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
} as const;

export const typography = {
  displayMetric: {
    fontSize: 38,
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums' as const],
    color: colors.slate900,
    letterSpacing: -1.0,
  },
  headlineNumber: {
    fontSize: 32,
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums' as const],
    color: colors.slate900,
    letterSpacing: -0.5,
  },
  screenHeadline: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: colors.slate900,
    letterSpacing: -0.5,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.slate900,
    letterSpacing: -0.2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.slate900,
  },
  body: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: colors.slate600,
    lineHeight: 18,
  },
  bodyMedium: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.slate600,
    lineHeight: 18,
  },
  labelStrong: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.slate900,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: colors.slate400,
    letterSpacing: 0.3,
  },
  microTag: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: colors.slate600,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
} as const;
