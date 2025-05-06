import { useEffect, useState, useRef } from 'react';
import { LogEvent } from '@log-monitor/types';
import { REFRESH_INTERVAL_MS, MAX_LOGS } from '../../constants';

interface UseLogsResult {
  logs: LogEvent[];
  isLoading: boolean;
  error: Error | null;
}

export function useLogs(): UseLogsResult {
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const seenLogIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;

    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/logs');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const { data } = await response.json();
        if (!isMounted) return;

        // Filter out logs we've already seen
        const newLogs = data.filter((log: LogEvent) => !seenLogIds.current.has(log.id));
        newLogs.forEach((log: LogEvent) => seenLogIds.current.add(log.id));

        setLogs(prevLogs => [...newLogs, ...prevLogs].slice(0, MAX_LOGS));
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err : new Error('Failed to fetch logs'));
        console.error('Error fetching logs:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, REFRESH_INTERVAL_MS.LOGS);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return { logs, isLoading, error };
} 