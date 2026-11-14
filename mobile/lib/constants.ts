/**
 * Centralized non-magic constants across the GoTall application
 */

export const APP_CONSTANTS = {
  // Water Tracker
  DEFAULT_WATER_GOAL_ML: 2500, // standard clinical hydration goal in ml
  WATER_QUICK_CHIPS_ML: [150, 250, 500] as const,

  // Sleep Tracker
  SLEEP_GOAL_HOURS: 9.0, // pediatric & adolescent target sleep in hours
  SLEEP_STREAK_MIN_HOURS: 7.5, // minimum sleep to count toward daily streak
  SLEEP_GOAL_MINUTES: 540,

  // AI Growth Advisor
  AI_DAILY_QUESTIONS_LIMIT: 5, // max custom questions per 24-hour window
  AI_WINDOW_DURATION_MS: 24 * 60 * 60 * 1000, // 24-hour rolling window from first question

  // UI Debounce & Timing
  SEARCH_DEBOUNCE_MS: 300, // live search input debounce
  TIMEZONE: 'Asia/Kolkata', // application local calendar date timezone

  // Storage Keys
  STORAGE_KEY_SLEEP_STATE: 'gotall_sleep_tracker_state_v1',
  STORAGE_KEY_WATER_STATE: 'gotall_water_tracker_state_v1',
  STORAGE_KEY_AUTH_SESSION: 'gotall_supabase_auth_session',
} as const;

export const DEFAULT_WATER_GOAL_ML = APP_CONSTANTS.DEFAULT_WATER_GOAL_ML;
export const WATER_QUICK_CHIPS_ML = APP_CONSTANTS.WATER_QUICK_CHIPS_ML;
export const SLEEP_GOAL_HOURS = APP_CONSTANTS.SLEEP_GOAL_HOURS;
export const SLEEP_STREAK_MIN_HOURS = APP_CONSTANTS.SLEEP_STREAK_MIN_HOURS;
export const SLEEP_GOAL_MINUTES = APP_CONSTANTS.SLEEP_GOAL_MINUTES;
export const AI_DAILY_QUESTIONS_LIMIT = APP_CONSTANTS.AI_DAILY_QUESTIONS_LIMIT;
export const AI_WINDOW_DURATION_MS = APP_CONSTANTS.AI_WINDOW_DURATION_MS;
export const TIMEZONE = APP_CONSTANTS.TIMEZONE;
