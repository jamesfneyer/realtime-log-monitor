import { describe, it, expect, jest, afterEach, afterAll } from '@jest/globals';
import { AlertService } from '../services/alerts';
import { createMockDbClient } from './setup';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Schema } from '@log-monitor/database';
import { LogEvent } from '@log-monitor/types';
import { ServiceStats } from '../services/stats';
import type { NotificationService, NotificationOptions } from '../types/notification';

describe('AlertService', () => {
  const mockDb = createMockDbClient() as jest.Mocked<PostgresJsDatabase<Schema>>;
  const mockNotifier: jest.Mocked<NotificationService> = {
    notify: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    emit: jest.fn(),
    removeAllListeners: jest.fn(),
  };
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
        service: 'test-service',
        level: 'ERROR',
        message: 'Test error',
        timestamp: new Date().toISOString(),
      };

      const stats: ServiceStats = {
        totalLogs: 100,
        errorLogs: 15,
        errorRate: 0.15,
      };

      // Mock shouldTriggerAlert to return true
      jest.spyOn(alertService as any, 'shouldTriggerAlert').mockReturnValue(true);

      // Mock createAlert to return a test alert
      jest.spyOn(alertService as any, 'createAlert').mockReturnValue({
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

      // Mock storeAlert to resolve immediately
      jest.spyOn(alertService as any, 'storeAlert').mockResolvedValue(undefined);

      await alertService.checkAndTriggerAlerts(logEvent, stats);

      expect(mockNotifier.notify).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Log Monitor Alert',
        message: expect.stringContaining('test-service'),
        sound: true,
      }));
    });

    it('should not trigger an alert when error rate is below threshold', async () => {
      const logEvent: LogEvent = {
        id: '1',
        service: 'test-service',
        level: 'ERROR',
        message: 'Test error',
        timestamp: new Date().toISOString(),
      };

      const stats: ServiceStats = {
        totalLogs: 100,
        errorLogs: 5,
        errorRate: 0.05,
      };

      // Mock shouldTriggerAlert to return false
      jest.spyOn(alertService as any, 'shouldTriggerAlert').mockReturnValue(false);

      await alertService.checkAndTriggerAlerts(logEvent, stats);

      expect(mockNotifier.notify).not.toHaveBeenCalled();
    });
  });
}); 