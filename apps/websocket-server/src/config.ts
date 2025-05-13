import { config } from 'dotenv';
import { resolve } from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Redis from 'ioredis';

// Load environment variables from the root .env file
config({ path: resolve(process.cwd(), '../../.env') });

interface ServerConfig {
    port: number;
    dashboardUrl: string;
    redisUrl: string;
}  

export const serverConfig: ServerConfig = {
    port: Number(process.env.PORT) || 3001,
    dashboardUrl: process.env.DASHBOARD_URL || 'http://localhost:3000',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379'
};

export const httpServer = createServer();

export const ioServer = new Server(httpServer, {
    cors: {
      origin: serverConfig.dashboardUrl,
      methods: ['GET', 'POST']
    }
});

// Create Redis client with lazyConnect option to prevent auto-connection
export const redisClient = new Redis(serverConfig.redisUrl, {
    lazyConnect: true,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});
