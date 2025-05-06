import { jest } from '@jest/globals';

const mockNotify = jest.fn().mockImplementation((options) => {
  return Promise.resolve();
});

const mockNotifier = {
  notify: mockNotify,
  on: jest.fn(),
  once: jest.fn(),
  emit: jest.fn(),
  removeAllListeners: jest.fn(),
};

// Mock the entire module
jest.mock('node-notifier', () => {
  return {
    __esModule: true,
    default: mockNotifier,
  };
});

export { mockNotifier as notifier, mockNotify }; 