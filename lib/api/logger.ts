// Simple logger for API debugging
const isDevelopment = process.env.NODE_ENV === 'development';

export const apiLogger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[API]', ...args);
    }
  },
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error('[API Error]', ...args);
    }
  },
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn('[API Warning]', ...args);
    }
  },
};


