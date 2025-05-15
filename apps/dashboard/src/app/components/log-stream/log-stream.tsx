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
      <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Live Log Stream</h2>
        <div className="text-red-400">Error loading logs: {error.message}</div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Live Log Stream</h2>
        <div className="flex flex-col gap-4">
          {Array.from({ length: SKELETON_ITEMS }).map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-6 flex flex-col gap-2 shadow-md animate-pulse h-16" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Live Log Stream</h2>
        <button
          onClick={() => setAutoScroll(prev => !prev)}
          className="text-sm text-gray-300 hover:text-white"
        >
          Auto-scroll: {autoScroll ? 'On' : 'Off'}
        </button>
      </div>
      <div
        ref={logContainerRef}
        className="h-[400px] overflow-y-auto font-mono text-sm bg-gray-800 rounded-xl p-4 shadow-md"
      >
        {logs.length === 0 ? (
          <div className="text-gray-400 text-center py-4">
            No logs available
          </div>
        ) : (
          logs.map(log => <LogEntry key={log.id} log={log} />)
        )}
      </div>
    </section>
  );
} 