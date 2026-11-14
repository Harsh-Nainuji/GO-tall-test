/**
 * GoTall Design System — Color Tokens & Typography
 * All colors and text metrics must be imported from here.
 */

export const colors = {
  // Brand & Action
  blue600: '#2563EB', // primary CTA, active tabs, rings
  blue500: '#3B82F6', // active state highlight
  blue50: '#EFF6FF',  // selected pill background

  // Metric Status & Rings
  green600: '#16A34A', // stretches ring, done checks, plate active
  purple600: '#9333EA', // sleep ring, bedtime metrics
  orange500: '#F97316', // nutrition ring, macro counts
  amber600: '#D97706',  // streak chip, warnings
  rose600: '#E11D48',   // error, delete, critical limits

  // Slate Neutral Typography
  slate900: '#0F172A', // primary text
  slate600: '#475569', // secondary text
  slate400: '#94A3B8', // muted text, units
  slate200: '#E2E8F0', // light border / dividers
  slate100: '#F1F5F9', // light pill backgrounds

  // Glass Surfaces
  glassBackground: 'rgba(255, 255, 255, 0.40)',
  glassBorder: 'rgba(255, 255, 255, 0.80)',
  glassShadow: '#1E3A8A',

  // Canvas Gradient: top-left -> bottom-right
  canvasGradient: ['#F8FAFC', '#EFF6FF', '#EEF2FF'] as const,
  glowButtonGradient: ['#38BDF8', '#2563EB'] as const,
} as const;

export const gradients = {
  canvas: ['#F8FAFC', '#EFF6FF', '#EEF2FF'] as const,
  glowButton: ['#38BDF8', '#2563EB'] as const,
} as const;

export const typography = {
  headlineNumber: {
    fontSize: 42,
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums' as const],
    color: colors.slate900,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.slate900,
  },
  body: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.slate600,
    lineHeight: 20,
  },
  muted: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.slate400,
  },
} as const;
