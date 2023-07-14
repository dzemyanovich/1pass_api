export default {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/index.tsx",
  ],
  coverageDirectory: "coverage",
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 50,
      functions: 70,
      lines: 70,
    },
  },
  modulePathIgnorePatterns: [ 'jest' ],
  moduleNameMapper: {
    '\\.(scss|svg|jpg|jpeg|png)$': '<rootDir>/jest/unit/emptyMock.js',
  },
  preset: "ts-jest",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  transformIgnorePatterns: [
    "<rootDir>/node_modules/",
  ],
};
