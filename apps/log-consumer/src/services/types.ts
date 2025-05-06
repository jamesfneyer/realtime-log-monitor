import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Schema } from '@log-monitor/database';

export type DbClient = PostgresJsDatabase<Schema>; 