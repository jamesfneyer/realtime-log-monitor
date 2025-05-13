/**
 * Database package for the log monitoring system.
 * Provides database schema definitions, client creation, and configuration.
 */

import { sql, desc as drizzleDesc } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { Schema } from './client';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Create a wrapper function for desc
export const desc = drizzleDesc;

// Debug logging
console.log('Database package - desc:', desc);
console.log('Database package - sql:', sql);

export * from './schema';
export * from './config';
export * from './types';
export type { Schema };

// Re-export commonly used types
export type { InferModel } from 'drizzle-orm';
export type { PostgresJsDatabase };

export type DbClient = PostgresJsDatabase<Schema>;

// Re-export SQL helpers
export { sql };

let dbConnection: postgres.Sql | null = null;

export function createDbClient() {
  if (!dbConnection) {
    dbConnection = postgres(process.env.DATABASE_URL!, {
      max: 20,
      idle_timeout: 30,
      connect_timeout: 2,
    });
  }
  return drizzle(dbConnection, { schema });
}

export async function closeDbConnection() {
  if (dbConnection) {
    await dbConnection.end();
    dbConnection = null;
  }
} 