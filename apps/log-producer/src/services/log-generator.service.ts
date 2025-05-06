import { v4 as uuidv4 } from 'uuid';
import { LogEvent, LogLevel } from '@log-monitor/types';

export interface LogGeneratorConfig {
  readonly services: readonly string[];
  readonly logLevels: readonly LogLevel[];
}

export class LogGeneratorService implements LogGenerator {
  constructor(private readonly config: LogGeneratorConfig) {}

  async generateLogEvent(): Promise<LogEvent> {
    const level = this.getRandomElement(this.config.logLevels);
    const service = this.getRandomElement(this.config.services);
    
    return {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      level,
      service,
      message: `Sample log message from ${service} with level ${level}`,
      metadata: {
        requestId: uuidv4(),
        userId: Math.floor(Math.random() * 1000),
      },
    };
  }

  private getRandomElement<T>(array: readonly T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
} 