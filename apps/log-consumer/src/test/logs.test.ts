import { describe, it, expect, jest, afterEach, afterAll } from '@jest/globals';
import { LogService } from '../services/logs';
import { createMockDbClient } from './setup';
import { dbTables } from '../lib/db';
import { LogEvent } from '@log-monitor/types';
import { eq, desc } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Schema } from '@log-monitor/database';

type MockLog = {
  id: string;
  service: string;
  level: string;
  message: string;
  timestamp: Date;
  metadata: Record<string, unknown>;
  traceId: string | null;
  spanId: string | null;
};

describe('LogService', () => {
  const mockDb = createMockDbClient() as jest.Mocked<PostgresJsDatabase<Schema>>;
  const logService = new LogService(mockDb);

  afterEach(async () => {
    jest.clearAllMocks();
    // Wait for any pending promises to resolve
    await new Promise(resolve => setImmediate(resolve));
  });

  afterAll(async () => {
    // Wait for any pending promises to resolve
    await new Promise(resolve => setImmediate(resolve));
  });

  describe('storeLog', () => {
    it('should store a log event successfully', async () => {
      const logEvent: LogEvent = {
        id: '1',
        service: 'test-service',
        level: 'ERROR',
        message: 'Test error',
        timestamp: new Date().toISOString(),
      };

      const result = await logService.storeLog(logEvent);

      expect(result.isLeft).toBe(false);
      expect(mockDb.insert).toHaveBeenCalledWith(dbTables.logs);
      expect(mockDb.insert(dbTables.logs).values).toHaveBeenCalledWith(expect.objectContaining({
        ...logEvent,
        timestamp: expect.any(Date),
        metadata: {},
        traceId: null,
        spanId: null,
      }));
    });

    it('should return an error for invalid timestamp', async () => {
      const logEvent: LogEvent = {
        id: '1',
        service: 'test-service',
        level: 'ERROR',
        message: 'Test error',
        timestamp: 'invalid-date',
      };

      const result = await logService.storeLog(logEvent);

      expect(result.isLeft).toBe(true);
      expect(result.value).toEqual({
        code: 'INVALID_TIMESTAMP',
        message: 'Invalid timestamp format',
      });
    });

    it('should return an error for database failures', async () => {
      const logEvent: LogEvent = {
        id: '1',
        service: 'test-service',
        level: 'ERROR',
        message: 'Test error',
        timestamp: new Date().toISOString(),
      };

      const mockError = new Error('Database error');
      jest.spyOn(mockDb.insert(dbTables.logs), 'values').mockRejectedValueOnce(mockError);

      const result = await logService.storeLog(logEvent);

      expect(result.isLeft).toBe(true);
      expect(result.value).toEqual({
        code: 'DATABASE_ERROR',
        message: 'Database error',
      });
    });
  });

  describe('getLogsByService', () => {
    it('should return logs for a service', async () => {
      const mockLogs: MockLog[] = [{
        id: '1',
        service: 'test-service',
        level: 'ERROR',
        message: 'Test error',
        timestamp: new Date(),
        metadata: {},
        traceId: null,
        spanId: null,
      }];

      const mockExecute = jest.fn().mockImplementation(() => Promise.resolve(mockLogs));
      const mockOffset = jest.fn().mockReturnValue({ execute: mockExecute });
      const mockLimit = jest.fn().mockReturnValue({ offset: mockOffset });
      const mockOrderBy = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockWhere = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });

      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await logService.getLogsByService('test-service');

      expect(result).toEqual([{
        id: mockLogs[0].id,
        service: mockLogs[0].service,
        level: mockLogs[0].level,
        message: mockLogs[0].message,
        timestamp: mockLogs[0].timestamp.toISOString(),
        metadata: mockLogs[0].metadata,
        traceId: undefined,
        spanId: undefined,
      }]);

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalledWith(dbTables.logs);
      expect(mockWhere).toHaveBeenCalledWith(expect.any(Object));
      expect(mockOrderBy).toHaveBeenCalledWith(expect.any(Object));
    });
  });
}); 