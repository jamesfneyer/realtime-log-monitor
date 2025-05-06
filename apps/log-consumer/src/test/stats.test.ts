import { describe, it, expect, jest, afterEach, beforeEach } from '@jest/globals';
import { StatsService } from '../services/stats';
import { createMockDbClient } from './setup';
import { LogEvent } from '@log-monitor/types';
import { serviceStats } from '@log-monitor/database';
import RedisMock from 'ioredis-mock';
import type { Redis as RedisType } from 'ioredis';

describe('StatsService', () => {
  const mockDb = createMockDbClient();
  let mockRedis: RedisType;
  let statsService: StatsService;

  beforeEach(() => {
    mockRedis = new RedisMock() as unknown as RedisType;
    Object.defineProperty(mockRedis, 'status', {
      get: () => 'ready'
    });
    statsService = new StatsService(mockDb, mockRedis);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockRedis.disconnect();
  });

  describe('updateStats', () => {
    it('should update stats for a log event', async () => {
      const logEvent: LogEvent = {
        id: '1',
        service: 'test-service',
        level: 'ERROR',
        message: 'Test error',
        timestamp: new Date().toISOString(),
      };

      // Mock Redis responses
      jest.spyOn(mockRedis, 'zadd').mockResolvedValue('1');
      jest.spyOn(mockRedis, 'zremrangebyscore').mockResolvedValue(1);
      jest.spyOn(mockRedis, 'zrange').mockResolvedValue([JSON.stringify(logEvent)]);

      const result = await statsService.updateStats(logEvent);

      expect(result).toEqual({
        errorRate: 1,
        totalLogs: 1,
        errorLogs: 1,
      });

      expect(mockDb.insert).toHaveBeenCalledWith(serviceStats);
      expect(mockDb.insert(serviceStats).values).toHaveBeenCalledWith({
        service: 'test-service',
        totalLogs: 1,
        errorCount: 1,
        errorRate: 1,
        lastUpdated: expect.any(Date),
      });
    });
  });

  describe('cleanup', () => {
    it('should cleanup Redis connection', async () => {
      const quitSpy = jest.spyOn(mockRedis, 'quit').mockResolvedValue('OK');

      await statsService.cleanup();

      expect(quitSpy).toHaveBeenCalled();
    });
  });
}); 