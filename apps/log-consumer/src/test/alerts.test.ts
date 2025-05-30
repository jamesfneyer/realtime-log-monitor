import { describe, it, expect, jest, afterEach, afterAll } from '@jest/globals';
import { AlertService } from '../services/alerts';
import { createMockDbClient } from './setup';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Schema } from '@log-monitor/database';
import { LogEvent } from '@log-monitor/types';
import { ServiceStats } from '../services/stats';
import { NodeNotifier } from 'node-notifier';

describe('AlertService', () => {
  const mockDb = createMockDbClient() as jest.Mocked<PostgresJsDatabase<Schema>>;
  const mockNotifier = {
    notify: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    emit: jest.fn(),
    removeAllListeners: jest.fn(),
  } as unknown as NodeNotifier;
  const alertService = new AlertService(mockDb, mockNotifier);

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('checkAndTriggerAlerts', () => {
    it('should trigger an alert when error rate exceeds threshold', async () => {
      const logEvent: LogEvent = {
        id: '1',
        service: 'testService',
        level: 'ERROR',
        message: 'Test error',
        timestamp: new Date().toISOString(),
      };

      const stats: ServiceStats = {
        totalLogs: 100,
        errorLogs: 15,
        errorRate: 0.15,
      };

      const serviceErrorCounts = {
        testService: { errorCount: 15 },
      };

      // Mock createAlert to return a test alert
      const createAlertSpy = jest.spyOn(alertService as any, 'createAlert').mockResolvedValue({
        id: 'test-alert-id',
        timestamp: new Date().toISOString(),
        type: 'ERROR_RATE',
        message: 'High error rate detected for test-service: 15.00% in last 10 minutes',
        severity: 'HIGH',
        metadata: {
          service: logEvent.service,
          errorRate: stats.errorRate,
          totalLogs: stats.totalLogs,
          errorLogs: stats.errorLogs,
        },
      });

      await alertService.checkAndTriggerAlerts(logEvent, serviceErrorCounts);

      expect(createAlertSpy).toHaveBeenCalledWith(expect.objectContaining({
        type: 'ERROR_RATE',
        message: expect.stringContaining('High error rate detected'),
        severity: 'HIGH',
      }));
    });

    it('should not trigger an alert when error rate is below threshold', async () => {
      const logEvent: LogEvent = {
        id: '1',
        service: 'testService',
        level: 'ERROR',
        message: 'Test error',
        timestamp: new Date().toISOString(),
      };

      const serviceErrorCounts = {
        testService: { errorCount: 9 },
      };

      await alertService.checkAndTriggerAlerts(logEvent, serviceErrorCounts);

      expect(mockNotifier.notify).not.toHaveBeenCalled();
    });
  });
}); 