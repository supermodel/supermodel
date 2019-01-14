module.exports = {
  cacheDirectory: '<rootDir>/.cache/jest',
  clearMocks: true,
  collectCoverage: false,
  collectCoverageFrom: [
    "src/**/*.{js,ts}"
  ],
  globals: {
    "ts-jest": {
      diagnostics: false
    }
  },
  moduleFileExtensions: ["ts", "js", "json"],
  notify: false,
  // notifyMode: 'success-change',
  testEnvironment: "node",
  testMatch: ['**/*\\.test.(js|ts)'],
  transform: {
    "^.+\\.ts$": "ts-jest",
  }
};