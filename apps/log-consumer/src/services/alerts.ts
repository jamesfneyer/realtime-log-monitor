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
    console.log('checkAndTriggerAlerts called with:', { logEvent, stats });
    const serviceStats = stats[logEvent.service];
    if (!serviceStats) {
      console.log('No stats found for service:', logEvent.service);
      return;
    }

    // Check for error rate threshold TODO: make this threshold an env variable
    if (serviceStats.errorCount > 10) {
      console.log('Error count exceeds threshold:', serviceStats.errorCount);
      await this.createAlert({
        type: 'ERROR_RATE',
        message: `High error rate detected: ${serviceStats.errorCount} errors in the last minute`,
        severity: 'HIGH',
        timestamp: new Date(),
      });
    } else {
      console.log('Error count below threshold:', serviceStats.errorCount);
    }
  }

  private async createAlert(alert: {
    type: AlertType;
    message: string;
    severity: AlertSeverity;
    timestamp: Date;
  }) {
    console.log('Creating alert:', alert);
    await this.db.insert(alerts).values(alert);
    
    // Show desktop notification
    console.log('Sending notification with notifier:', this.notifier);
    this.notifier.notify({
      title: `Alert: ${alert.type}`,
      message: alert.message,
      sound: true,
      wait: true,
    });
    console.log('Notification sent');
  }
} 