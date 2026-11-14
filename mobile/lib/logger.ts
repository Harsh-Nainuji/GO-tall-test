/**
 * Safe logger utility that is a no-op in production
 */

const isDev = __DEV__;

export const logger = {
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    if (isDev) {
      console.error(...args);
    }
  },
  info: (...args: any[]) => {
    if (isDev) {
      console.info(...args);
    }
  },
};

export function logError(message: string, error?: any) {
  if (isDev) {
    console.error(`[GoTall] ${message}`, error);
  }
}

export function logWarn(message: string, data?: any) {
  if (isDev) {
    console.warn(`[GoTall] ${message}`, data);
  }
}
