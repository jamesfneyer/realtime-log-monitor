import type { Redis } from 'ioredis';
import { LogEvent } from '@log-monitor/types';
import { serviceStats } from '@log-monitor/database';
import { MONITORING_CONFIG } from '../config';
import { DbClient } from '../lib/db';

export interface ServiceStats {
  readonly errorRate: number;
  readonly totalLogs: number;
  readonly errorLogs: number;
}

interface ServiceStatsUpdate {
  readonly service: string;
  readonly totalLogs: number;
  readonly errorCount: number;
  readonly errorRate: number;
  readonly lastUpdated: Date;
}

const calculateErrorRate = (totalLogs: number, errorLogs: number): number => 
  totalLogs > 0 ? errorLogs / totalLogs : 0;

const isErrorLog = (log: LogEvent): boolean => 
  log.level === 'ERROR' || log.level === 'FATAL';

const createServiceKey = (service: string): string => 
  `service:${service}`;

export class StatsService {
  constructor(
    private readonly db: DbClient, 
    private readonly redis: Redis
  ) {}

  async updateStats(logEvent: LogEvent): Promise<ServiceStats> {
    const key = createServiceKey(logEvent.service);
    const now = Date.now();
    
    await this.addLogToRedis(key, now, logEvent);
    await this.cleanOldLogs(key, now);
    
    const stats = await this.calculateStats(key);
    await this.updateDatabase(logEvent.service, stats);
    
    return stats;
  }

  private async addLogToRedis(key: string, timestamp: number, logEvent: LogEvent): Promise<void> {
    await this.redis.zadd(key, timestamp, JSON.stringify(logEvent));
  }

  private async cleanOldLogs(key: string, now: number): Promise<void> {
    await this.redis.zremrangebyscore(key, 0, now - MONITORING_CONFIG.windowSize);
  }

  private async calculateStats(key: string): Promise<ServiceStats> {
    const windowLogs = await this.redis.zrange(key, 0, -1);
    const totalLogs = windowLogs.length;
    const errorLogs = windowLogs
      .map(log => JSON.parse(log) as LogEvent)
      .filter(isErrorLog)
      .length;
    
    return {
      errorRate: calculateErrorRate(totalLogs, errorLogs),
      totalLogs,
      errorLogs
    };
  }

  private async updateDatabase(service: string, stats: ServiceStats): Promise<void> {
    const update: ServiceStatsUpdate = {
      service,
      totalLogs: stats.totalLogs,
      errorCount: stats.errorLogs,
      errorRate: stats.errorRate,
      lastUpdated: new Date()
    };

    await this.db.insert(serviceStats)
      .values(update)
      .onConflictDoUpdate({
        target: serviceStats.service,
        set: update
      });
  }

  async getStats(): Promise<Record<string, ServiceStats>> {
    const stats = await this.db.select().from(serviceStats).execute();
    
    return stats.reduce((acc, stat) => ({
      ...acc,
      [stat.service]: {
        errorRate: stat.errorRate,
        totalLogs: stat.totalLogs,
        errorLogs: stat.errorCount
      }
    }), {} as Record<string, ServiceStats>);
  }

  async cleanup(): Promise<void> {
    await this.redis.quit();
  }
} 