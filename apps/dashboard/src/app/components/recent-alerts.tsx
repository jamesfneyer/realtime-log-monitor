'use client';

import { useEffect, useState } from 'react';
import { Alert } from '@log-monitor/types';
import { format } from 'date-fns';
import { REFRESH_INTERVAL_MS, DATE_FORMAT, SKELETON_ITEMS } from '../constants';

const severityColors = {
  LOW: 'text-blue-500',
  MEDIUM: 'text-yellow-500',
  HIGH: 'text-orange-500',
  CRITICAL: 'text-red-500',
} as const;

interface UseAlertsResult {
  alerts: Alert[];
  isLoading: boolean;
}

function useAlerts(): UseAlertsResult {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch('/api/alerts');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAlerts(data.data);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, REFRESH_INTERVAL_MS.ALERTS);

    return () => clearInterval(interval);
  }, []);

  return { alerts, isLoading };
}

function AlertEntry({ alert }: { alert: Alert }) {
  return (
    <div className="p-3 bg-card rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <span className={`font-medium ${severityColors[alert.severity]}`}>
          {alert.severity}
        </span>
        <span className="text-sm text-muted-foreground">
          {format(new Date(alert.timestamp), DATE_FORMAT.TIME)}
        </span>
      </div>
      <p className="text-sm">{alert.message}</p>
      {alert.metadata && (
        <div className="mt-2 text-xs text-muted-foreground">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(alert.metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export function RecentAlerts() {
  const { alerts, isLoading } = useAlerts();

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Recent Alerts</h3>
        <div className="animate-pulse space-y-4">
          {Array.from({ length: SKELETON_ITEMS }).map((_, i) => (
            <div
              key={i}
              className={`h-4 bg-gray-200 rounded w-${i === 0 ? '3/4' : i === 1 ? '1/2' : '2/3'}`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Recent Alerts</h3>
      <div className="space-y-4">
        {alerts.map((alert) => (
          <AlertEntry key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  );
} 