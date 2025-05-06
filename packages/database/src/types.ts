import { LogLevel } from '@log-monitor/types';

export interface Log {
  id: string;
  timestamp: Date;
  level: LogLevel;
  service: string;
  message: string;
  metadata: Record<string, unknown>;
  traceId?: string;
  spanId?: string;
} 