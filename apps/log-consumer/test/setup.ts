import { jest } from '@jest/globals';

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