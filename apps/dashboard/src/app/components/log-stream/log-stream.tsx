'use client';

import { useEffect, useState, useRef } from 'react';
import { SKELETON_ITEMS } from '../../constants';
import { useLogs } from './use-logs';
import { LogEntry } from './log-entry';

export function LogStream() {
  const { logs, isLoading, error } = useLogs();
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  if (error) {
    return (
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Live Log Stream</h3>
        <div className="text-red-500">
          Error loading logs: {error.message}
        </div>
      </div>
    );
  }

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
          onClick={() => setAutoScroll(prev => !prev)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Auto-scroll: {autoScroll ? 'On' : 'Off'}
        </button>
      </div>
      <div
        ref={logContainerRef}
        className="h-[400px] overflow-y-auto font-mono text-sm bg-card rounded-lg p-4"
      >
        {logs.length === 0 ? (
          <div className="text-muted-foreground text-center py-4">
            No logs available
          </div>
        ) : (
          logs.map(log => <LogEntry key={log.id} log={log} />)
        )}
      </div>
    </div>
  );
} 