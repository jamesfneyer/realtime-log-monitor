import { LogProducerService, LogProducerConfig } from './services/log-producer.service';
import { LogGeneratorService, LogGeneratorConfig } from './services/log-generator.service';
import { LogLevel } from '@log-monitor/types';

const services = ['auth-service', 'payment-service', 'user-service', 'order-service'] as const;
const logLevels: readonly LogLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];

const producerConfig: LogProducerConfig = {
  kafkaConfig: {
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    clientId: 'log-producer',
  },
  services,
  logLevels,
  minDelayMs: 100,
  maxDelayMs: 1000,
};

const generatorConfig: LogGeneratorConfig = {
  services,
  logLevels,
};

const logGenerator = new LogGeneratorService(generatorConfig);
const logProducer = new LogProducerService(producerConfig, logGenerator);

async function main() {
  try {
    await logProducer.start();
  } catch (error) {
    console.error('Error in log producer:', error);
    await logProducer.stop();
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Shutting down...');
  await logProducer.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT. Shutting down...');
  await logProducer.stop();
  process.exit(0);
});

main(); 