export const REFRESH_INTERVAL_MS = {
  LOGS: 1000,
  ALERTS: 5000,
  STATS: 5000,
} as const;

export const DATE_FORMAT = {
  TIME: 'HH:mm:ss',
  TIME_WITH_MS: 'HH:mm:ss.SSS',
} as const;

export const MAX_LOGS = 100;
export const ERROR_RATE_THRESHOLD = 0.05;

export const SKELETON_ITEMS = 3; 