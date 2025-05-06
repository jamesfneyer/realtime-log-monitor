import { alerts, type DbClient } from '@log-monitor/database';
import { LogEvent, AlertType, AlertSeverity } from '@log-monitor/types';
import nodeNotifier from 'node-notifier';
import { desc } from 'drizzle-orm';

interface GetAlertsOptions {
  limit: number;
  offset: number;
}

interface AlertRecord {
  id: string;
  timestamp: Date;
  type: AlertType;
  message: string;
  severity: AlertSeverity;
  metadata: Record<string, unknown>;
}

export class AlertService {
  constructor(
    private readonly db: DbClient,
    private readonly notifier: typeof nodeNotifier
  ) {}

  async getAlerts(options: GetAlertsOptions) {
    const result = await this.db
      .select({
        id: alerts.id,
        timestamp: alerts.timestamp,
        type: alerts.type,
        message: alerts.message,
        severity: alerts.severity,
        metadata: alerts.metadata,
      })
      .from(alerts)
      .orderBy(desc(alerts.timestamp))
      .limit(options.limit)
      .offset(options.offset);

    return result.map(alert => ({
      ...alert,
      timestamp: alert.timestamp.toISOString(),
      metadata: alert.metadata || {},
    }));
  }

  async checkAndTriggerAlerts(logEvent: LogEvent, stats: Record<string, { errorCount: number }>) {
    const serviceStats = stats[logEvent.service];
    if (!serviceStats) return;

    // Check for error rate threshold
    if (serviceStats.errorCount > 10) {
      await this.createAlert({
        type: 'ERROR_RATE',
        message: `High error rate detected: ${serviceStats.errorCount} errors in the last minute`,
        severity: 'HIGH',
        timestamp: new Date(),
      });
    }
  }

  private async createAlert(alert: {
    type: AlertType;
    message: string;
    severity: AlertSeverity;
    timestamp: Date;
  }) {
    await this.db.insert(alerts).values(alert);
    
    // Show desktop notification
    this.notifier.notify({
      title: `Alert: ${alert.type}`,
      message: alert.message,
      sound: true,
      wait: true,
    });
  }
} 