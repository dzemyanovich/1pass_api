export default {
  clearMocks: true,
  modulePathIgnorePatterns: [
    'jest',
    'lambda/dist',
  ],
  moduleNameMapper: {
    '\\.(scss|svg|jpg|jpeg|png)$': '<rootDir>/jest/unit/emptyMock.js',
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/lambda/node_modules/',
  ],
};
