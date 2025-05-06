'use client';

import { useEffect, useState, useRef } from 'react';
import { LogEvent, LogLevel } from '@log-monitor/types';
import { format } from 'date-fns';
import { REFRESH_INTERVAL_MS, DATE_FORMAT, MAX_LOGS, SKELETON_ITEMS } from '../constants';

const levelColors = {
  DEBUG: 'text-gray-500',
  INFO: 'text-blue-500',
  WARN: 'text-yellow-500',
  ERROR: 'text-red-500',
  FATAL: 'text-red-700',
} as const;

interface UseLogsResult {
  logs: LogEvent[];
  isLoading: boolean;
}

function useLogs(): UseLogsResult {
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const seenLogIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/logs');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Filter out logs we've already seen
        const newLogs = data.data.filter((log: LogEvent) => !seenLogIds.current.has(log.id));
        
        // Add new log IDs to our set
        newLogs.forEach((log: LogEvent) => seenLogIds.current.add(log.id));
        
        // Update logs, keeping only the most recent MAX_LOGS
        setLogs((prevLogs) => {
          const allLogs = [...newLogs, ...prevLogs];
          return allLogs.slice(0, MAX_LOGS);
        });
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, REFRESH_INTERVAL_MS.LOGS);

    return () => clearInterval(interval);
  }, []);

  return { logs, isLoading };
}

function LogEntry({ log }: { log: LogEvent }) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-2">
        <span className={`font-medium ${levelColors[log.level]}`}>
          [{log.level}]
        </span>
        <span className="text-muted-foreground">
          {format(new Date(log.timestamp), DATE_FORMAT.TIME_WITH_MS)}
        </span>
        <span className="font-medium">{log.service}</span>
      </div>
      <div className="ml-4">{log.message}</div>
      {log.metadata && (
        <div className="ml-4 text-xs text-muted-foreground">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(log.metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export function LogStream() {
  const { logs, isLoading } = useLogs();
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Live Log Stream</h3>
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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Live Log Stream</h3>
        <button
          onClick={() => setAutoScroll((prev) => !prev)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Auto-scroll: {autoScroll ? 'On' : 'Off'}
        </button>
      </div>
      <div
        ref={logContainerRef}
        className="h-[400px] overflow-y-auto font-mono text-sm bg-card rounded-lg p-4"
      >
        {logs.map((log) => (
          <LogEntry key={log.id} log={log} />
        ))}
      </div>
    </div>
  );
} 