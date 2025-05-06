import { z } from 'zod';
import { SASLOptions } from 'kafkajs';

export const LogLevel = z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL']);
export type LogLevel = z.infer<typeof LogLevel>;

export const AlertType = z.enum(['ERROR_RATE', 'PATTERN_DETECTED']);
export type AlertType = z.infer<typeof AlertType>;

export const AlertSeverity = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export type AlertSeverity = z.infer<typeof AlertSeverity>;

export const LogEvent = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  level: LogLevel,
  service: z.string(),
  message: z.string(),
  metadata: z.record(z.unknown()).optional(),
  traceId: z.string().optional(),
  spanId: z.string().optional(),
});

export type LogEvent = z.infer<typeof LogEvent>;

export const AlertThreshold = z.object({
  level: LogLevel,
  rate: z.number().min(0).max(1),
  windowMinutes: z.number().min(1),
});

export type AlertThreshold = z.infer<typeof AlertThreshold>;

export const Alert = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  type: AlertType,
  message: z.string(),
  severity: AlertSeverity,
  metadata: z.record(z.unknown()).optional(),
});

export type Alert = z.infer<typeof Alert>;

export const ServiceStats = z.object({
  service: z.string(),
  totalLogs: z.number(),
  errorCount: z.number(),
  errorRate: z.number(),
  lastUpdated: z.string().datetime(),
});

export type ServiceStats = z.infer<typeof ServiceStats>;

export const KafkaConfig = z.object({
  brokers: z.array(z.string()),
  clientId: z.string(),
  groupId: z.string().optional(),
  ssl: z.boolean().optional(),
  sasl: z.custom<SASLOptions>().optional(),
});

export type KafkaConfig = z.infer<typeof KafkaConfig>; 