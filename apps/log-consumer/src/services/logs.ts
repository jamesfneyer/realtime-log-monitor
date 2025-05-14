import { LogEvent } from '@log-monitor/types';
import { DbClient, dbTables, LogInsert } from '../lib/db';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

type LogError = {
  readonly code: 'INVALID_TIMESTAMP' | 'DATABASE_ERROR';
  readonly message: string;
};

type Either<L, R> = { isLeft: true; value: L } | { isLeft: false; value: R };

const left = <L, R>(value: L): Either<L, R> => ({ isLeft: true, value });
const right = <L, R>(value: R): Either<L, R> => ({ isLeft: false, value });

interface GetLogsOptions {
  service?: string;
  level?: LogEvent['level'];
  startTime?: Date;
  endTime?: Date;
  limit: number;
  offset: number;
}

export class LogService {
  constructor(private readonly db: DbClient) {}

  private convertTimestamp(timestamp: string): Either<LogError, Date> {
    const date = new Date(timestamp);
    return isNaN(date.getTime())
      ? left<LogError, Date>({ code: 'INVALID_TIMESTAMP', message: 'Invalid timestamp format' })
      : right<LogError, Date>(date);
  }

  async storeLog(logEvent: LogEvent): Promise<Either<LogError, void>> {
    const timestampResult = this.convertTimestamp(logEvent.timestamp);
    if (timestampResult.isLeft) {
      return timestampResult as Either<LogError, void>;
    }

    const logRecord: LogInsert = {
      ...logEvent,
      timestamp: timestampResult.value,
      metadata: logEvent.metadata || ({} as Record<string, unknown>),
      traceId: logEvent.traceId || null,
      spanId: logEvent.spanId || null,
    };

    try {
      await this.db.insert(dbTables.logs).values(logRecord);
      return right<LogError, void>(undefined);
    } catch (error) {
      return left<LogError, void>({
        code: 'DATABASE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown database error',
      });
    }
  }

  async getLogs(options: GetLogsOptions): Promise<LogEvent[]> {
    const conditions = [];

    if (options.service) {
      conditions.push(eq(dbTables.logs.service, options.service));
    }

    if (options.level) {
      conditions.push(eq(dbTables.logs.level, options.level));
    }

    if (options.startTime) {
      conditions.push(gte(dbTables.logs.timestamp, options.startTime));
    }

    if (options.endTime) {
      conditions.push(lte(dbTables.logs.timestamp, options.endTime));
    }

    const query = this.db
      .select()
      .from(dbTables.logs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(dbTables.logs.timestamp))
      .limit(options.limit)
      .offset(options.offset);

    const results = await query.execute();

    if (!results || !Array.isArray(results)) {
      return [];
    }

    return results.map(log => ({
      id: log.id,
      timestamp: log.timestamp.toISOString(),
      level: log.level,
      message: log.message,
      service: log.service,
      metadata: log.metadata as Record<string, unknown> | undefined,
      traceId: log.traceId || undefined,
      spanId: log.spanId || undefined,
    }));
  }

  async getLogsByService(service: string): Promise<LogEvent[]> {
    return this.getLogs({ service, limit: 100, offset: 0 });
  }
} 