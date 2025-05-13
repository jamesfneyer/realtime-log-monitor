import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { PgTable } from 'drizzle-orm/pg-core';
import { jest } from '@jest/globals';

export function createMockDbClient(): jest.Mocked<PostgresJsDatabase> {
  const mockValues = jest.fn().mockResolvedValue([{ id: '1' }] as never);
  const mockWhere = jest.fn().mockResolvedValue([] as never);
  const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
  const mockInsert = jest.fn().mockReturnValue({ values: mockValues });
  const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });

  return {
    _: { schema: undefined, tableNamesMap: {} },
    $with: jest.fn(),
    with: jest.fn(),
    select: mockSelect,
    insert: mockInsert,
    update: jest.fn(),
    delete: jest.fn(),
    transaction: jest.fn(),
    query: jest.fn(),
    execute: jest.fn(),
  } as unknown as jest.Mocked<PostgresJsDatabase>;
} 