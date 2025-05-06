import { LogEvent } from '@log-monitor/types';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  DEBUG: 'text-gray-500',
  INFO: 'text-blue-500',
  WARN: 'text-yellow-500',
  ERROR: 'text-red-500',
  FATAL: 'text-red-700',
};

export interface UseLogsResult {
  logs: LogEvent[];
  isLoading: boolean;
}

export interface LogEntryProps {
  log: LogEvent;
} 