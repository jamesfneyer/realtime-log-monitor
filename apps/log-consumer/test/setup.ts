import { afterAll, afterEach, jest } from '@jest/globals';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Mock Redis
jest.mock('ioredis', () => require('ioredis-mock'));

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Clean up after all tests
afterAll(() => {
  jest.restoreAllMocks();
}); 