'use client';

import { format } from 'date-fns';
import { DATE_FORMAT } from '../../constants';
import { LOG_LEVEL_COLORS } from './types';
import type { LogEvent } from '@log-monitor/types';

interface LogEntryProps {
  log: LogEvent;
}

export function LogEntry({ log }: LogEntryProps) {
  const { level, timestamp, service, message, metadata } = log;
  const formattedTime = format(new Date(timestamp), DATE_FORMAT.TIME_WITH_MS);

  return (
    <div className="mb-2">
      <div className="flex items-center gap-2">
        <span className={`font-medium ${LOG_LEVEL_COLORS[level]}`}>
          [{level}]
        </span>
        <span className="text-muted-foreground">{formattedTime}</span>
        <span className="font-medium">{service}</span>
      </div>
      <div className="ml-4">{message}</div>
      {metadata && (
        <div className="ml-4 text-xs text-muted-foreground">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 