import { KafkaConfig } from '@log-monitor/types';

export const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
} as const;

export const KAFKA_CONFIG: KafkaConfig = {
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  clientId: 'log-consumer',
  groupId: 'log-consumer-group',
} as const;

export const MONITORING_CONFIG = {
  windowSize: 10 * 60 * 1000, // 10 minutes in milliseconds
  errorRateThreshold: 0.05, // 5%
  minimumLogsForAlert: 10,
  highErrorRateThreshold: 0.1, // 10%
} as const; 