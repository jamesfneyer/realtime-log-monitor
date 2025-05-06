/**
 * Database configuration settings.
 * Centralizes all database-related configuration in one place.
 */
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from the root .env file
config({ path: resolve(process.cwd(), '../../.env') });

/**
 * Database configuration object.
 * All database connection settings are defined here and can be overridden by environment variables.
 */
export const dbConfig = {
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
} as const;

/**
 * Type for the database configuration.
 * Ensures type safety when accessing configuration values.
 */
export type DbConfig = typeof dbConfig; 