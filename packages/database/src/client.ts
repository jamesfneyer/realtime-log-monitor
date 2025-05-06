/**
 * Database client creation and management.
 * Provides a factory function to create a new database client with proper configuration.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { dbConfig } from './config';
import { logs, alerts, serviceStats } from './schema';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from the root .env file
config({ path: resolve(process.cwd(), '../../.env') });

/**
 * Schema type for the database.
 * This defines the structure of our database tables.
 */
export type Schema = {
  logs: typeof logs;
  alerts: typeof alerts;
  serviceStats: typeof serviceStats;
};

/**
 * Creates a new database client using the configured connection settings.
 * The client is configured with proper connection pooling and error handling.
 * 
 * @returns A configured drizzle-orm database client
 * @throws Error if database connection fails
 */
export function createDbClient(): PostgresJsDatabase<Schema> {
  const connectionString = process.env.DATABASE_URL || 
    `postgres://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`;


  if (!connectionString) {
    throw new Error('Database connection string is not configured');
  }

  const client = postgres(connectionString, {
    max: 10, // Maximum number of connections
    idle_timeout: 20, // Idle connection timeout in seconds
    connect_timeout: 10, // Connection timeout in seconds
  });

  return drizzle(client, { schema: { logs, alerts, serviceStats } });
} 