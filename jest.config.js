export default {
    testEnvironment: 'node',
    moduleFileExtensions: ['js', 'json'],
    transform: {},
    testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
};