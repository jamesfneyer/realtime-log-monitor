import { useEffect, useState, useRef } from 'react';
import { LogEvent } from '@log-monitor/types';
import { MAX_LOGS } from '../../constants';
import { io, Socket } from 'socket.io-client';
import { sql } from '@log-monitor/database';

interface UseLogsResult {
  logs: LogEvent[];
  isLoading: boolean;
  error: Error | null;
  isConnected: boolean;
}

export function useLogs(): UseLogsResult {
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const seenLogIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;

    // Initial fetch of logs
    const fetchInitialLogs = async () => {
      try {
        const response = await fetch('/api/logs');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const { data } = await response.json();
        if (mounted) {
          setLogs(data);
          data.forEach((log: LogEvent) => seenLogIds.current.add(log.id));
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch logs'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Setup WebSocket connection
    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      if (mounted) {
        setIsConnected(true);
        setError(null);
      }
    });

    socket.on('disconnect', () => {
      if (mounted) {
        setIsConnected(false);
      }
    });

    socket.on('connect_error', (err) => {
      if (mounted) {
        setError(new Error(`WebSocket connection error: ${err.message}`));
        setIsConnected(false);
      }
    });

    socket.on('log:new', (newLog: LogEvent) => {
      if (mounted && !seenLogIds.current.has(newLog.id)) {
        seenLogIds.current.add(newLog.id);
        setLogs(prevLogs => [newLog, ...prevLogs].slice(0, MAX_LOGS));
      }
    });

    // Fetch initial logs first, then setup websocket
    fetchInitialLogs();

    return () => {
      mounted = false;
      socket.disconnect();
    };
  }, []);

  return { logs, isLoading, error, isConnected };
} 