/**
 * Database package for the log monitoring system.
 * Provides database schema definitions, client creation, and configuration.
 */

import { sql, count } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { Schema } from './client';

export * from './schema';
export * from './config';
export * from './types';
export { createDbClient } from './client';
export type { Schema };

// Re-export commonly used types
export type { InferModel } from 'drizzle-orm';
export type { PostgresJsDatabase };

export type DbClient = PostgresJsDatabase<Schema>;

export { sql, count }; 