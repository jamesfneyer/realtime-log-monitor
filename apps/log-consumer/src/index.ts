import { Kafka } from 'kafkajs';
import Redis from 'ioredis';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { LogEvent } from '@log-monitor/types';
import { KAFKA_CONFIG, REDIS_CONFIG } from './config';
import { StatsService } from './services/stats';
import { AlertService } from './services/alerts';
import { LogService } from './services/logs';
import { createDbClient } from '@log-monitor/database';
import nodeNotifier from 'node-notifier';

class LogConsumer {
  private readonly kafka;
  private readonly consumer;
  private readonly statsService;
  private readonly alertService;
  private readonly logService;
  private readonly app;
  private server: ReturnType<typeof this.app.listen> | null = null;

  constructor() {
    this.kafka = new Kafka(KAFKA_CONFIG);
    this.consumer = this.kafka.consumer({ groupId: KAFKA_CONFIG.groupId || 'log-consumer-group' });
    const db = createDbClient();
    const redis = new Redis(REDIS_CONFIG);
    this.statsService = new StatsService(db, redis);
    this.alertService = new AlertService(db, nodeNotifier);
    this.logService = new LogService(db);

    // Set up Express app
    this.app = express();
    this.app.use(cors());
    this.app.use(express.json());

    // API routes
    this.app.get('/api/logs', async (req: Request, res: Response) => {
      try {
        const { service, level, startTime, endTime, page = '1', limit = '10' } = req.query;
        
        // Convert page to offset
        const pageNum = Math.max(1, parseInt(page as string, 10));
        const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10)));
        const offset = (pageNum - 1) * limitNum;

        const logs = await this.logService.getLogs({
          service: service as string | undefined,
          level: level as LogEvent['level'] | undefined,
          startTime: startTime ? new Date(startTime as string) : undefined,
          endTime: endTime ? new Date(endTime as string) : undefined,
          limit: limitNum,
          offset,
        });

        // Get total count for pagination
        const total = logs.length; // This is a simplification - in production you'd want a separate count query

        // Transform to match dashboard's expected format
        const response = {
          data: logs,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
            hasNextPage: pageNum < Math.ceil(total / limitNum)
          }
        };
        res.json(response);
      } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
      }
    });

    this.app.get('/api/stats', async (req: Request, res: Response) => {
      try {
        const stats = await this.statsService.getStats();
        // Transform to match dashboard's expected format
        const response = Object.entries(stats).map(([service, stat]) => ({
          service,
          ...stat,
          lastUpdated: new Date()
        }));
        res.json(response);
      } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
      }
    });

    this.app.get('/api/alerts', async (req: Request, res: Response) => {
      try {
        const { page = '1', limit = '10' } = req.query;
        
        // Convert page to offset
        const pageNum = Math.max(1, parseInt(page as string, 10));
        const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10)));
        const offset = (pageNum - 1) * limitNum;

        const alerts = await this.alertService.getAlerts({
          limit: limitNum,
          offset,
        });

        // Get total count for pagination
        const total = alerts.length; // This is a simplification - in production you'd want a separate count query

        // Transform to match dashboard's expected format
        const response = {
          data: alerts,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
            hasNextPage: pageNum < Math.ceil(total / limitNum)
          }
        };
        res.json(response);
      } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ error: 'Failed to fetch alerts' });
      }
    });
  }

  private async processMessage(message: { value: Buffer | null }): Promise<void> {
    if (!message.value) return;
    
    const logEvent = JSON.parse(message.value.toString()) as LogEvent;
    
    await Promise.all([
      this.logService.storeLog(logEvent),
      this.statsService.updateStats(logEvent).then(stats => {
        const statsRecord: Record<string, { errorCount: number }> = {};
        for (const [service, count] of Object.entries(stats)) {
          statsRecord[service] = { errorCount: count };
        }
        return this.alertService.checkAndTriggerAlerts(logEvent, statsRecord);
      }),
    ]);
  }

  async start(): Promise<void> {
    try {
      // Start Kafka consumer
      await this.consumer.connect();
      await this.consumer.subscribe({ topic: 'logs', fromBeginning: false });
      
      await this.consumer.run({
        eachMessage: async ({ message }) => this.processMessage(message),
      });

      // Start web server
      const port = process.env.PORT || 3001;
      this.server = this.app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      }).on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') {
          console.error(`Port ${port} is already in use. Please try a different port or kill the process using this port.`);
          console.error('You can find the process using: lsof -i :' + port);
          console.error('And kill it using: kill -9 <PID>');
          process.exit(1);
        } else {
          console.error('Error starting server:', error);
          process.exit(1);
        }
      });
    } catch (error) {
      console.error('Error in log consumer:', error);
      await this.cleanup();
      process.exit(1);
    }
  }

  async cleanup(): Promise<void> {
    await Promise.all([
      this.consumer.disconnect(),
      this.statsService.cleanup(),
      new Promise<void>((resolve) => {
        if (this.server) {
          this.server.close(() => resolve());
        } else {
          resolve();
        }
      }),
    ]);
  }
}

// Start the consumer
const consumer = new LogConsumer();
consumer.start().catch((error) => {
  console.error('Failed to start consumer:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Shutting down...');
  await consumer.cleanup();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT. Shutting down...');
  await consumer.cleanup();
  process.exit(0);
}); 