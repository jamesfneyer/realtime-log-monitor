import { afterAll, jest } from '@jest/globals';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { PgTable } from 'drizzle-orm/pg-core';
import { Schema } from '@log-monitor/database';

type MockInsertFunction = <TTable extends PgTable>(table: TTable) => {
  values: (values: unknown) => {
    returning: () => Promise<{ id: string }[]>;
    onConflictDoUpdate: () => Promise<{ id: string }[]>;
  };
};

type MockSelectFunction = <TFrom extends PgTable>(source: TFrom) => {
  from: (table: TFrom) => {
    where: (condition: unknown) => {
      execute: () => Promise<unknown[]>;
    };
  };
};

export function createMockDbClient(): PostgresJsDatabase<Schema> {
  const mockReturning = jest.fn<() => Promise<{ id: string }[]>>().mockResolvedValue([{ id: '1' }]);
  const mockOnConflictDoUpdate = jest.fn<() => Promise<{ id: string }[]>>().mockResolvedValue([{ id: '1' }]);
  const mockValues = jest.fn().mockReturnValue({
    returning: mockReturning,
    onConflictDoUpdate: mockOnConflictDoUpdate,
  });

  const mockInsert = jest.fn().mockReturnValue({
    values: mockValues,
  }) as unknown as MockInsertFunction;

  const mockExecute = jest.fn().mockImplementation(() => {
    const mockLogs = [{
      id: '1',
      service: 'test-service',
      level: 'ERROR',
      message: 'Test error',
      timestamp: new Date(),
      metadata: {},
      traceId: null,
      spanId: null,
    }];
    return Promise.resolve(mockLogs);
  });

  const mockWhere = jest.fn().mockReturnValue({
    execute: mockExecute,
  });

  const mockFrom = jest.fn().mockReturnValue({
    where: mockWhere,
  });

  const mockSelect = jest.fn().mockReturnValue({
    from: mockFrom,
  }) as unknown as MockSelectFunction;

  const mockQuery = jest.fn<() => Promise<unknown[]>>().mockResolvedValue([]);

  const mockTransaction = jest.fn().mockImplementation(async (callback) => {
    if (typeof callback === 'function') {
      const result = await callback();
      return Array.isArray(result) ? result : [result];
    }
    return [];
  });

  const mockDelete = jest.fn().mockReturnValue({
    where: jest.fn().mockReturnValue({
      execute: jest.fn<() => Promise<unknown[]>>().mockResolvedValue([]),
    }),
  });

  // Add a close method to properly clean up
  const close = jest.fn<() => Promise<void>>().mockResolvedValue();

  return {
    insert: mockInsert,
    select: mockSelect,
    query: mockQuery,
    transaction: mockTransaction,
    delete: mockDelete,
    close,
  } as unknown as PostgresJsDatabase<Schema>;
}

// Add global teardown
afterAll(async () => {
  // Wait for any pending promises to resolve
  await new Promise(resolve => setTimeout(resolve, 100));
}); 