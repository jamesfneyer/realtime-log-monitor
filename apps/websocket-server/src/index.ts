import { Server as SocketIOServer, Socket } from 'socket.io';
import { LogEvent } from '@log-monitor/types';
import { httpServer, ioServer, redisClient } from './config';
import { Server as HttpServer } from 'http';
import { serverConfig } from './config';
import Redis from 'ioredis';

class WebSocketServer {
  private io: SocketIOServer;
  private redisClient: Redis;
  private httpServer: HttpServer;
  private subscriber: Redis | null = null;
  private isShuttingDown = false;

  constructor(io: SocketIOServer, redisClient: Redis, httpServer: HttpServer) {
    this.io = io;
    this.redisClient = redisClient;
    this.httpServer = httpServer;

    this.setupSocketHandlers();
    this.setupRedisErrorHandling();
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log('Client connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  private setupRedisErrorHandling(): void {
    this.redisClient.on('error', (error) => {
      if (!this.isShuttingDown) {
        console.error('Redis client error:', error);
      }
    });

    this.redisClient.on('connect', () => {
      console.log('Redis client connected');
    });

    this.redisClient.on('ready', () => {
      console.log('Redis client ready');
    });
  }

  private async setupRedisSubscriber(): Promise<void> {
    try {
      this.subscriber = this.redisClient.duplicate();
      
      this.subscriber.on('error', (error) => {
        if (!this.isShuttingDown) {
          console.error('Redis subscriber error:', error);
        }
      });

      await this.subscriber.subscribe('logs:new', (_err, message) => {
        try {
          const log: LogEvent = JSON.parse(message as string);
          this.io.emit('log:new', log);
        } catch (error) {
          console.error('Error parsing log message:', error);
        }
      });
    } catch (error) {
      console.error('Failed to setup Redis subscriber:', error);
      throw error;
    }
  }

  public async start(): Promise<void> {
    try {
      if (this.redisClient.status === 'ready') {
        console.log('Redis client already connected');
      } else {
        await this.redisClient.connect();
      }

      await this.setupRedisSubscriber();

      this.httpServer.listen(serverConfig.port, () => {
        console.log(`WebSocket server running on port ${serverConfig.port}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      await this.stop();
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    this.isShuttingDown = true;
    
    try {
      if (this.subscriber) {
        await this.subscriber.quit();
      }
      await this.redisClient.quit();
      this.httpServer.close();
    } catch (error) {
      console.error('Error during shutdown:', error);
    }
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  const server = new WebSocketServer(ioServer, redisClient, httpServer);
  await server.stop();
  process.exit(0);
});

// Start the server
const server = new WebSocketServer(ioServer, redisClient, httpServer);
server.start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
}); 