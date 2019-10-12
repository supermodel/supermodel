const os = require('os');
const cpuCount = os.cpus().length;

module.exports = {
  maxWorkers: Math.max(cpuCount / 4, 2),
  roots: ['<rootDir>/packages'],
  cacheDirectory: '<rootDir>/.cache/jest',
  clearMocks: true,
  collectCoverage: false,
  collectCoverageFrom: ['packages/*/src/**/*.{js,ts}'],
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  moduleFileExtensions: ['js', 'json', 'ts', 'yaml', 'yml'],
  moduleNameMapper: {
    '^@supermodel/([^/]+)': '<rootDir>/packages/$1/src',
    '^fixtures/(.+)': '<rootDir>/fixtures/$1',
  },
  notify: false,
  notifyMode: 'success-change',
  testEnvironment: 'node',
  testMatch: ['**/*\\.test.(js|ts)'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.ya?ml$': './scripts/jest-yaml-transform',
  },
};
