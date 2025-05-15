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

function StatSkeleton() {
  return (
    <div className="bg-gray-800 rounded-xl p-6 flex flex-col gap-2 shadow-md animate-pulse">
      <div className="flex justify-between items-center mb-1">
        <span className="h-5 w-32 bg-gray-700 rounded" />
        <span className="h-4 w-16 bg-gray-700 rounded" />
      </div>
      <div className="flex flex-wrap gap-6 items-center">
        <span className="h-4 w-24 bg-gray-700 rounded" />
        <span className="h-4 w-20 bg-gray-700 rounded" />
        <span className="h-4 w-28 bg-gray-700 rounded" />
      </div>
    </div>
  );
}

function StatEntry({ stat }: { stat: ServiceStatsType }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 flex flex-col gap-2 shadow-md">
      <div className="flex justify-between items-center mb-1">
        <span className="text-lg font-semibold text-white">{stat.service}</span>
        <span className="text-sm text-gray-400">{format(new Date(stat.lastUpdated), DATE_FORMAT.TIME)}</span>
      </div>
      <div className="flex flex-wrap gap-6 items-center">
        <span className="text-base text-gray-200"><span className="font-medium">Total Logs:</span> {stat.totalLogs}</span>
        <span className="text-base text-gray-200"><span className="font-medium">Errors:</span> {stat.errorCount}</span>
        <span className={`text-base font-bold ${stat.errorRate > ERROR_RATE_THRESHOLD ? 'text-red-400' : 'text-gray-200'}`}>Error Rate: {(stat.errorRate * 100).toFixed(1)}%</span>
      </div>
    </div>
  );
}

export function ServiceStats() {
  const { stats, isLoading, error } = useServiceStats();

  if (isLoading) {
    return (
      <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Service Statistics</h2>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Service Statistics</h2>
        <div className="text-red-400">Error: {error}</div>
      </section>
    );
  }

  return (
    <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">Service Statistics</h2>
      <div className="flex flex-col gap-4">
        {stats.map((stat) => (
          <StatEntry key={stat.service} stat={stat} />
        ))}
      </div>
    </section>
  );
} 