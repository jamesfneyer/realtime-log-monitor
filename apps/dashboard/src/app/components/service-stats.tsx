'use client';

import { useEffect, useState } from 'react';
import { ServiceStats as ServiceStatsType } from '@log-monitor/types';
import { format } from 'date-fns';
import { REFRESH_INTERVAL_MS, DATE_FORMAT, ERROR_RATE_THRESHOLD, SKELETON_ITEMS } from '../constants';
import { api } from '../lib/api';

interface UseServiceStatsResult {
  stats: ServiceStatsType[];
  isLoading: boolean;
  error?: string;
}

function useServiceStats(): UseServiceStatsResult {
  const [stats, setStats] = useState<ServiceStatsType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.stats.get();
        setStats(data);
        setError(undefined);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, REFRESH_INTERVAL_MS.STATS);

    return () => clearInterval(interval);
  }, []);

  return { stats, isLoading, error };
}

function StatEntry({ stat }: { stat: ServiceStatsType }) {
  return (
    <div className="p-3 bg-card rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">{stat.service}</span>
        <span className="text-sm text-muted-foreground">
          {format(new Date(stat.lastUpdated), DATE_FORMAT.TIME)}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">Total Logs:</span>
          <span className="ml-2">{stat.totalLogs}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Errors:</span>
          <span className="ml-2">{stat.errorCount}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Error Rate:</span>
          <span className={`ml-2 ${stat.errorRate > ERROR_RATE_THRESHOLD ? 'text-destructive' : ''}`}>
            {(stat.errorRate * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export function ServiceStats() {
  const { stats, isLoading, error } = useServiceStats();

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Service Statistics</h3>
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

  if (error) {
    return (
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Service Statistics</h3>
        <div className="text-destructive">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Service Statistics</h3>
      <div className="space-y-4">
        {stats.map((stat) => (
          <StatEntry key={stat.service} stat={stat} />
        ))}
      </div>
    </div>
  );
} 