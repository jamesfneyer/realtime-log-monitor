import { pgTable, uuid, text, timestamp, jsonb, integer, doublePrecision } from 'drizzle-orm/pg-core';
import { LogLevel, AlertType, AlertSeverity } from '@log-monitor/types';

const logLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'] as const;
const alertTypes = ['ERROR_RATE', 'PATTERN_DETECTED'] as const;
const alertSeverities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

export const logs = pgTable('logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  timestamp: timestamp('timestamp').notNull(),
  level: text('level', { enum: logLevels }).notNull(),
  service: text('service').notNull(),
  message: text('message').notNull(),
  metadata: jsonb('metadata'),
  traceId: text('trace_id'),
  spanId: text('span_id'),
});

export const alerts = pgTable('alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  timestamp: timestamp('timestamp').notNull(),
  type: text('type', { enum: alertTypes }).notNull(),
  message: text('message').notNull(),
  severity: text('severity', { enum: alertSeverities }).notNull(),
  metadata: jsonb('metadata'),
});

export const serviceStats = pgTable('service_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  service: text('service').notNull().unique(),
  totalLogs: integer('total_logs').notNull().default(0),
  errorCount: integer('error_count').notNull().default(0),
  errorRate: doublePrecision('error_rate').notNull().default(0),
  lastUpdated: timestamp('last_updated').notNull(),
}); 