import { createDbClient as createDbClientImpl, Schema } from '@log-monitor/database';
import { logs, alerts, serviceStats } from '@log-monitor/database';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { InferInsertModel } from 'drizzle-orm';

/**
 * Database client type for the application.
 * This is the main interface for database operations.
 */
export type DbClient = PostgresJsDatabase<Schema>;

/**
 * Type definitions for database tables.
 * These types are used for type-safe database operations.
 */
export type LogsTable = typeof logs;
export type AlertsTable = typeof alerts;
export type ServiceStatsTable = typeof serviceStats;

/**
 * Type definitions for insert operations.
 * These types ensure type safety when inserting records.
 */
export type LogInsert = InferInsertModel<LogsTable>;
export type AlertInsert = InferInsertModel<AlertsTable>;
export type ServiceStatsInsert = InferInsertModel<ServiceStatsTable>;

/**
 * Collection of all database tables.
 * Used for type-safe table references in queries.
 */
export const dbTables = {
  logs,
  alerts,
  serviceStats,
} as const;

/**
 * Creates a new database client instance.
 * This is the main entry point for database operations.
 * 
 * @returns A configured database client
 */
export function createDbClient(): DbClient {
  return createDbClientImpl();
} 