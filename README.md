# Real-time Log Monitor

A distributed system for real-time log monitoring, processing, and alerting. This project demonstrates modern distributed systems concepts, real-time processing, and full-stack development.

## Features

- **Log Generator (Producer)**: Emits log events in JSON format at random intervals into Kafka topics
- **Log Processor (Consumer)**: Processes logs, maintains sliding windows of metrics, and triggers alerts
- **Dashboard**: Real-time visualization of log statistics and alerts
- **Storage**: PostgreSQL for persistent storage and Redis for real-time metrics

## Tech Stack

- **Backend**: Node.js, TypeScript
- **Message Queue**: Apache Kafka
- **Database**: PostgreSQL with Drizzle ORM
- **Caching**: Redis
- **Frontend**: Next.js, React, Tailwind CSS
- **Containerization**: Docker Compose
- **Package Manager**: pnpm workspaces

## Project Structure

```
.
├── apps/
│   ├── dashboard/         # Next.js dashboard application
│   ├── log-consumer/      # Kafka consumer service
│   └── log-producer/      # Kafka producer service
├── packages/
│   ├── config/           # Shared configuration
│   ├── database/         # Database models and migrations
│   ├── types/            # Shared TypeScript types
│   └── utils/            # Shared utilities
└── docker/               # Docker Compose configuration
```

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development environment:
   ```bash
   docker-compose up -d
   pnpm dev
   ```

3. Access the dashboard at http://localhost:3000

## Development

- Run all services: `pnpm dev`
- Run specific service: `pnpm --filter <service-name> dev`
- Build all services: `pnpm build`
- Run tests: `pnpm test`

## License

MIT