# Log Producer

A service that generates and produces log events to Kafka for monitoring and analysis.

## Overview

The Log Producer is part of the Log Monitor system. It generates sample log events and publishes them to Kafka, which are then consumed by the Log Consumer and displayed in the Dashboard.

## Features

- Generates realistic log events with varying:
  - Log levels (DEBUG, INFO, WARN, ERROR, FATAL)
  - Services (auth, payment, user, order)
  - Timestamps and metadata
- Configurable delay between events
- Graceful shutdown handling
- Type-safe implementation

## Prerequisites

- Node.js 18+
- Kafka broker (default: localhost:9092)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| KAFKA_BROKER | Kafka broker address | localhost:9092 |

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Run in development
pnpm dev

# Run in production
pnpm start
```

## Architecture

The service is built with a clean, modular architecture:

- `LogProducerService`: Handles Kafka connection and message production
- `LogGeneratorService`: Generates log events with random variations
- Constants are defined in `constants/` directory for type safety

## Testing

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage
```

## Type Safety

The service uses TypeScript with strict type checking:

- Log levels and services are defined as const objects
- All configurations are readonly
- Dependencies are injected for better testability

## Error Handling

- Graceful shutdown on SIGTERM/SIGINT
- Error logging for failed message production
- Continues running on non-fatal errors

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License

MIT 