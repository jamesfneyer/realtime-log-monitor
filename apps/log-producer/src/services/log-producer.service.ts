import { Kafka, Producer } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';
import { LogEvent, LogLevel, KafkaConfig } from '@log-monitor/types';

export interface LogProducerConfig {
  readonly kafkaConfig: KafkaConfig;
  readonly services: readonly string[];
  readonly logLevels: readonly LogLevel[];
  readonly minDelayMs: number;
  readonly maxDelayMs: number;
}

export interface LogGenerator {
  generateLogEvent(): Promise<LogEvent>;
}

export class LogProducerService {
  private producer: Producer;
  private isRunning = false;

  constructor(
    private readonly config: LogProducerConfig,
    private readonly logGenerator: LogGenerator,
  ) {
    const kafka = new Kafka(config.kafkaConfig);
    this.producer = kafka.producer();
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Log producer is already running');
    }

    await this.producer.connect();
    this.isRunning = true;

    while (this.isRunning) {
      try {
        const logEvent = await this.logGenerator.generateLogEvent();
        await this.producer.send({
          topic: 'logs',
          messages: [{ value: JSON.stringify(logEvent) }],
        });

        const delay = Math.floor(
          Math.random() * (this.config.maxDelayMs - this.config.minDelayMs) + this.config.minDelayMs
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      } catch (error) {
        console.error('Error producing log:', error);
        // Continue running even if there's an error
      }
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    await this.producer.disconnect();
  }
} 