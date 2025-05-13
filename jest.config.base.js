module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    transform: { '^.+\\.ts$': 'ts-jest' },
    coverageDirectory: './coverage',
    collectCoverageFrom: ['**/src/**/*.{ts,js}', '!**/node_modules/**'],
    // Add any other global config here
};